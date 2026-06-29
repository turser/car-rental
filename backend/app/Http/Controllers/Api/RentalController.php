<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Client;
use App\Models\Insurance;
use App\Models\Rental;
use App\Models\RentalService;
use App\Models\Service;
use App\Models\Tax;
use Carbon\Carbon;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(): JsonResponse
    {
        $rentals = Rental::with(['client', 'car', 'agency'])
            ->where('agency_id', auth()->user()->agency_id)
            ->latest('start_date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rentals,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */

    public function create(): JsonResponse
    {
        $agencyId = auth()->user()->agency_id;

        return response()->json([
            'success' => true,

            'data' => [

                'clients' => Client::query()
                    ->whereHas('rentals', function ($query) use ($agencyId) {
                        $query->where('agency_id', $agencyId);
                    })
                    ->orWhereDoesntHave('rentals')
                    ->select(
                        'id',
                        'full_name',
                        'driving_license',
                        'driving_license_expiration'
                    )
                    ->orderBy('full_name')
                    ->get()
                    ->map(fn($client) => [
                        'id' => $client->id,
                        'nomComplet' => $client->full_name,
                        'numeroPermis' => $client->driving_license,
                        'expirationPermis' => $client->driving_license_expiration,
                    ]),

                'cars' => Car::query()
                    ->where('agency_id', $agencyId)
                    ->where('status', 'available')
                    ->select(
                        'id',
                        'brand',
                        'model',
                        'daily_price',
                        'registration_number'
                    )
                    ->orderBy('brand')
                    ->get()
                    ->map(fn($car) => [
                        'id' => $car->id,
                        'label' => $car->brand . ' ' . $car->model,
                        'plateNumber' => $car->registration_number,
                        'dailyPrice' => $car->daily_price,
                    ]),

                'services' => Service::query()
                    ->select(
                        'id',
                        'name',
                        'price_type',
                        'price'
                    )
                    ->orderBy('name')
                    ->get()
                    ->map(fn($service) => [
                        'id' => $service->id,
                        'serviceName' => $service->name,
                        'priceType' => $service->price_type,
                        'price' => $service->price,
                    ]),
            ]
        ]);
    }
    public function store(Request $request): JsonResponse
    {
        // ============================================================
        // 1. Validate incoming request data
        // ============================================================
        $validated = $request->validate([
            'clientId' => 'required|exists:clients,id',
            'carId' => 'required|exists:cars,id',
            'startDate' => 'required|date',
            'expectedReturnDate' => 'required|date|after:startDate',
            'pricePerDay' => 'nullable|numeric|min:0',
            'paidAmount' => 'nullable|numeric|min:0',
            'services' => 'nullable|array',
            'services.*.serviceId' => 'required|exists:services,id',
            'services.*.quantity' => 'required|integer|min:1',
        ]);

        // ============================================================
        // 2. Prepare helper variables
        // ============================================================

        // Safety date = expected return date + 10 days
        // Ensures all documents remain valid throughout the rental + buffer
        $safetyDate = Carbon::parse($validated['expectedReturnDate'])->addDays(10);

        // Extract the return year to validate tax coverage
        $expectedReturnYear = Carbon::parse($validated['expectedReturnDate'])->year;

        // ============================================================
        // 3. Validate client
        // ============================================================
        $client = Client::findOrFail($validated['clientId']);

        // Driving license must be valid until the safety date
        if (
            $client->driving_license_expiration &&
            $client->driving_license_expiration < $safetyDate
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Driving license will expire too soon for this rental period.',
            ], 422);
        }

        // ============================================================
        // 4. Validate car
        // ============================================================
        $car = Car::findOrFail($validated['carId']);

        // Car must belong to the authenticated user's agency
        if ($car->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This car does not belong to your agency.',
            ], 403);
        }

        // Car must be available for rent
        if ($car->status !== 'available') {
            return response()->json([
                'success' => false,
                'message' => 'Car is not available.',
            ], 422);
        }

        // ============================================================
        // 5. Validate insurance
        // ============================================================

        // Insurance must be valid until the safety date
        $hasValidInsurance = Insurance::where('car_id', $car->id)
            ->where('end_date', '>=', $safetyDate)
            ->exists();

        if (!$hasValidInsurance) {
            return response()->json([
                'success' => false,
                'message' => 'Car insurance will expire before or shortly after the rental ends.',
            ], 422);
        }

        // ============================================================
        // 6. Validate tax
        // ============================================================

        // Tax must be paid for the return year or beyond
        $hasValidTax = Tax::where('car_id', $car->id)
            ->where('year', '>=', $expectedReturnYear)
            ->where('paid', true)
            ->exists();

        if (!$hasValidTax) {
            return response()->json([
                'success' => false,
                'message' => 'Car tax is not paid for the year ' . $expectedReturnYear . '.',
            ], 422);
        }

        // ============================================================
        // 7. Calculate rental days and base price
        // ============================================================

        // Use negotiated price if provided, otherwise fall back to car's default daily price
        $pricePerDay = $validated['pricePerDay'] ?? $car->daily_price;

        // Add +1 to include the start date in the count
        $days = Carbon::parse($validated['startDate'])
            ->diffInDays(Carbon::parse($validated['expectedReturnDate'])) + 1;

        // Base price = number of days × daily price
        $basePrice = $days * $pricePerDay;

        // ============================================================
        // 8. Calculate additional services price
        // ============================================================
        $servicesTotal = 0;
        $servicesData = [];

        if (!empty($validated['services'])) {
            foreach ($validated['services'] as $item) {
                $service = Service::findOrFail($item['serviceId']);

                // Calculate unit price based on service type
                $unitPrice = match ($service->price_type) {
                    'fixed' => $service->price,                 // flat fee regardless of days or km
                    'per_day' => $service->price * $days,         // multiplied by number of rental days
                    'per_km' => $service->price,                 // per km — quantity represents km count
                };

                // Total for this service = unit price × quantity
                $totalServicePrice = $unitPrice * $item['quantity'];

                // Add to overall services total
                $servicesTotal += $totalServicePrice;

                // Prepare data for bulk insert
                $servicesData[] = [
                    'service_id' => $service->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalServicePrice,
                ];
            }
        }

        // Grand total = base price + all services
        $totalPrice = $basePrice + $servicesTotal;

        // ============================================================
        // 9. Persist data inside a transaction (all or nothing)
        // ============================================================
        DB::beginTransaction();

        try {
            // Create the rental record
            $rental = Rental::create([
                'client_id' => $client->id,
                'car_id' => $car->id,
                'agency_id' => auth()->user()->agency_id,
                'start_date' => $validated['startDate'],
                'end_date' => $validated['expectedReturnDate'],
                'price_per_day' => $pricePerDay,
                'total_price' => $totalPrice,
                'paid_amount' => $validated['paidAmount'] ?? 0,
                'status' => 'active',
            ]);

            // Bulk insert all services at once (more efficient than looping creates)
            if (!empty($servicesData)) {
                foreach ($servicesData as &$s) {
                    $s['rental_id'] = $rental->id;
                    $s['created_at'] = now();
                    $s['updated_at'] = now();
                }
                RentalService::create($servicesData);
            }

            // Mark car as rented so it won't appear as available
            $car->update(['status' => 'rented']);

            DB::commit();

            // ============================================================
            // 10. Return success response
            // ============================================================
            return response()->json([
                'success' => true,
                'message' => 'Rental created successfully.',
                'data' => [
                    'rentalId' => $rental->id,
                    'clientId' => $rental->client_id,
                    'carId' => $rental->car_id,
                    'startDate' => $rental->start_date,
                    'expectedReturnDate' => $rental->end_date,
                    'days' => $days,
                    'pricePerDay' => $rental->price_per_day,
                    'basePrice' => $basePrice,
                    'servicesTotal' => $servicesTotal,
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $rental->paid_amount,
                    'status' => $rental->status,
                    'services' => $rental->services()->with('service')->get(),
                ],
            ], 201);

        } catch (\Exception $e) {
            // Roll back everything if any step fails
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Rental creation failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}

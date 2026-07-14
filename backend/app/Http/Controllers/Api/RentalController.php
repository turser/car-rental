<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Client;
use App\Models\Insurance;
use App\Models\Payment;
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
            'startDate' => 'required|date_format:Y-m-d H:i:s',
            'expectedReturnDate' => 'required|date_format:Y-m-d H:i:s|after:startDate',
            'pricePerDay' => 'nullable|numeric|min:0',
            'paidAmount' => 'nullable|numeric|min:0',
            'paymentMethod' => 'required_with:paidAmount|in:cash,card,transfer', 
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
            ->diffInDays(Carbon::parse($validated['expectedReturnDate']));

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
                RentalService::insert($servicesData);
            }
            if (!empty($validated['paidAmount']) && $validated['paidAmount'] > 0) {
                Payment::create([
                    'rental_id' => $rental->id,
                    'amount' => $validated['paidAmount'],
                    'payment_method' => $validated['paymentMethod'] ?? 'cash',
                    'payment_date' => $validated['startDate'],
                ]);
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
    /**
     * Display full rental details with all relations
     */
    public function show(Rental $rental): JsonResponse
    {
        // ============================================================
        // 1. Check rental belongs to the authenticated user's agency
        // ============================================================
        if ($rental->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This rental does not belong to your agency.',
            ], 403);
        }

        // ============================================================
        // 2. Load all relations
        // ============================================================
        $rental->load([
            'client',
            'car.images',
            'agency',
            'services.service',
            'payments',
            'extensions',
        ]);

        // ============================================================
        // 3. Calculate days and prices
        // ============================================================
        $days = Carbon::parse($rental->start_date)
            ->diffInDays($rental->end_date);
        $basePrice = $rental->price_per_day * $days;

        // ============================================================
        // 4. Get last extension end date
        // ============================================================
        $lastExtension = $rental->extensions->sortByDesc('id')->first();
        $finalEndDate = $lastExtension
            ? $lastExtension->new_end_date
            : $rental->end_date;

        // ============================================================
        // 5. Return full rental details
        // ============================================================
        return response()->json([
            'success' => true,
            'data' => [

                // ── Rental info ──
                'rentalId' => $rental->id,
                'status' => $rental->status,
                'startDate' => $rental->start_date,
                'expectedEndDate' => $rental->end_date,
                'finalEndDate' => $finalEndDate,
                'actualReturnDate' => $rental->actual_return_date,
                'days' => $days,

                // ── Agency info ──
                'agency' => [
                    'id' => $rental->agency->id,
                    'name' => $rental->agency->name,
                    'phone' => $rental->agency->phone ?? null,
                    'email' => $rental->agency->email ?? null,
                ],

                // ── Client info ──
                'client' => [
                    'id' => $rental->client->id,
                    'name' => $rental->client->name,
                    'phone' => $rental->client->phone ?? null,
                    'email' => $rental->client->email ?? null,
                    'drivingLicenseExpiration' => $rental->client->driving_license_expiration,
                ],

                // ── Car info ──
                'car' => [
                    'id' => $rental->car->id,
                    'brand' => $rental->car->brand,
                    'model' => $rental->car->model,
                    'registrationNumber' => $rental->car->registration_number,
                    'fuelType' => $rental->car->fuel_type,
                    'mileage' => $rental->car->mileage,
                    'status' => $rental->car->status,


                    'primaryImage' => $rental->car->images
                        ->where('is_primary', true)
                        ->first()?->image_url ?? null,

                    'images' => $rental->car->images->map(fn($img) => [
                        'id' => $img->id,
                        'url' => $img->image_url,
                        'thumbnail' => str_replace('/upload/', '/upload/w_150,h_150,c_fill/', $img->image_url),
                        'isPrimary' => $img->is_primary,
                    ]),
                ],

                // ── Price summary ──
                'priceSummary' => [
                    'pricePerDay' => $rental->price_per_day,
                    'basePrice' => $basePrice,
                    'servicesTotal' => $rental->services->sum('total_price'),
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $rental->paid_amount,
                    'remainingAmount' => max($rental->total_price - $rental->paid_amount, 0),
                    'isFullyPaid' => $rental->paid_amount >= $rental->total_price,
                ],

                // ── Services ──
                'services' => $rental->services->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->service->name,
                    'priceType' => $s->service->price_type,
                    'quantity' => $s->quantity,
                    'unitPrice' => $s->unit_price,
                    'totalPrice' => $s->total_price,
                ]),

                // ── Extensions history ──
                'extensions' => $rental->extensions->map(fn($e) => [
                    'id' => $e->id,
                    'oldEndDate' => $e->old_end_date,
                    'newEndDate' => $e->new_end_date,
                    'createdAt' => $e->created_at,
                ]),

                // ── Payments history ──
                'payments' => $rental->payments->map(fn($p) => [
                    'id' => $p->id,
                    'amount' => $p->amount,
                    'paymentMethod' => $p->payment_method,
                    'paymentDate' => $p->payment_date,
                ]),
            ],
        ]);
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

    public function addPayment(Request $request, Rental $rental): JsonResponse
    {

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'paymentMethod' => 'required|in:cash,card,transfer',
            'paymentDate' => 'required|date',
        ]);

        if ($rental->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This rental does not belong to your agency.',
            ], 403);
        }

        if ($rental->status === 'canceled') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add payment to a canceled rental.',
            ], 422);
        }


        $remainingAmount = $rental->total_price - $rental->paid_amount;

        if ($validated['amount'] > $remainingAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount exceeds remaining balance.',
                'data' => [
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $rental->paid_amount,
                    'remainingAmount' => $remainingAmount,
                ],
            ], 422);
        }

        DB::beginTransaction();

        try {
            $payment = Payment::create([
                'rental_id' => $rental->id,
                'amount' => $validated['amount'],
                'payment_method' => $validated['paymentMethod'],
                'payment_date' => $validated['paymentDate'],
            ]);

            $rental->increment('paid_amount', $validated['amount']);

            DB::commit();
            $rental->refresh();


            return response()->json([
                'success' => true,
                'message' => 'Payment added successfully.',
                'data' => [
                    'paymentId' => $payment->id,
                    'rentalId' => $rental->id,
                    'amount' => $payment->amount,
                    'paymentMethod' => $payment->payment_method,
                    'paymentDate' => $payment->payment_date,
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $rental->paid_amount,
                    'remainingAmount' => $rental->total_price - $rental->paid_amount,
                    'isFullyPaid' => $rental->paid_amount >= $rental->total_price,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Return the car and close the rental
     */
    /**
     * Return the car and close the rental
     */
    public function returnCar(Request $request, Rental $rental): JsonResponse
    {
        // ============================================================
        // 1. Validate incoming request data
        // ============================================================
        $validated = $request->validate([
            'actualReturnDate' => 'required|date_format:Y-m-d H:i:s',
            'finalPayment' => 'nullable|numeric|min:0',
            'paymentMethod' => 'required_with:finalPayment|in:cash,card,transfer',
        ]);

        // ============================================================
        // 2. Check rental belongs to the authenticated user's agency
        // ============================================================
        if ($rental->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This rental does not belong to your agency.',
            ], 403);
        }

        // ============================================================
        // 3. Check rental is active
        // ============================================================
        if ($rental->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Only active rentals can be returned.',
            ], 422);
        }

        // ============================================================
        // 4. Calculate remaining balance
        // ============================================================
        $finalPayment = $validated['finalPayment'] ?? 0;
        $remainingAmount = $rental->total_price - $rental->paid_amount;

        // Check final payment does not exceed remaining balance
        if ($finalPayment > $remainingAmount) {
            return response()->json([
                'success' => false,
                'message' => 'Payment amount exceeds remaining balance.',
                'data' => [
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $rental->paid_amount,
                    'remainingAmount' => $remainingAmount,
                ],
            ], 422);
        }

        // ============================================================
        // 5. Check if fully paid before closing
        // ============================================================
        $newPaidAmount = $rental->paid_amount + $finalPayment;
        $isFullyPaid = $newPaidAmount >= $rental->total_price;

        if (!$isFullyPaid) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot close rental. There is still a remaining balance.',
                'data' => [
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $newPaidAmount,
                    'remainingAmount' => $rental->total_price - $newPaidAmount,
                ],
            ], 422);
        }

        // ============================================================
        // 6. Persist changes inside a transaction
        // ============================================================
        DB::beginTransaction();

        try {
            // Add final payment if provided
            if ($finalPayment > 0) {
                Payment::create([
                    'rental_id' => $rental->id,
                    'amount' => $finalPayment,
                    'payment_method' => $validated['paymentMethod'],
                    'payment_date' => $validated['actualReturnDate'],
                ]);

                $rental->increment('paid_amount', $finalPayment);
            }

            // Close the rental
            $rental->update([
                'status' => 'completed',
                'actual_return_date' => $validated['actualReturnDate'],
            ]);

            // Mark car as available again
            $rental->car->update(['status' => 'available']);

            DB::commit();

            $rental->refresh();

            // ============================================================
            // 7. Return success response
            // ============================================================
            return response()->json([
                'success' => true,
                'message' => 'Car returned successfully. Rental is now completed.',
                'data' => [
                    'rentalId' => $rental->id,
                    'actualReturnDate' => $rental->actual_return_date,
                    'totalPrice' => $rental->total_price,
                    'paidAmount' => $rental->paid_amount,
                    'remainingAmount' => 0,
                    'isFullyPaid' => true,
                    'status' => $rental->status,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to return car.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel a rental
     */
    public function cancel(Rental $rental): JsonResponse
    {
        // ============================================================
        // 1. Check rental belongs to the authenticated user's agency
        // ============================================================
        if ($rental->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This rental does not belong to your agency.',
            ], 403);
        }

        // ============================================================
        // 2. Check rental is active (only active rentals can be canceled)
        // ============================================================
        if ($rental->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Only active rentals can be canceled.',
            ], 422);
        }

        // ============================================================
        // 3. Check if rental has payments (cannot cancel if paid)
        // ============================================================
        if ($rental->paid_amount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel a rental that has payments. Please refund first.',
                'data' => [
                    'paidAmount' => $rental->paid_amount,
                ],
            ], 422);
        }

        // ============================================================
        // 4. Persist changes inside a transaction
        // ============================================================
        DB::beginTransaction();

        try {
            // Cancel the rental
            $rental->update([
                'status' => 'canceled',
            ]);

            // Mark car as available again
            $rental->car->update([
                'status' => 'available',
            ]);

            DB::commit();

            // ============================================================
            // 5. Return success response
            // ============================================================
            return response()->json([
                'success' => true,
                'message' => 'Rental canceled successfully.',
                'data' => [
                    'rentalId' => $rental->id,
                    'status' => $rental->status,
                    'carStatus' => $rental->car->fresh()->status,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel rental.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarSale;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarSaleController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    // ============================================================
// CarSaleController — index()
// Show only sold cars with full sale information
// ============================================================
    public function index(): JsonResponse
    {
        $sales = CarSale::with(['car.images'])
            ->whereHas(
                'car',
                fn($q) =>
                $q->where('agency_id', auth()->user()->agency_id)
            )
            ->latest('sale_date')
            ->paginate(10)
            ->map(fn($sale) => [
                'saleId' => $sale->id,
                'saleDate' => $sale->sale_date,
                'salePrice' => $sale->sale_price,
                'buyerName' => $sale->buyer_name,

                // Car summary only
                'car' => [
                    'id' => $sale->car->id,
                    'brand' => $sale->car->brand,
                    'model' => $sale->car->model,
                    'plateNumber' => $sale->car->registration_number,
                    'image' => $sale->car->images
                        ->where('is_primary', true)
                        ->first()?->image_path ?? null,
                ],

                // Profit summary
                'profit' => $sale->sale_price - ($sale->car->purchase_price ?? 0),
            ]);

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request): JsonResponse
    {
        if (auth()->user()->role == 'employee' || auth()->user()->role == 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'carId' => 'required|exists:cars,id',
            'saleDate' => 'required|date',
            'salePrice' => 'required|numeric|min:0',
            'buyerName' => 'nullable|string|max:255',
            'buyerContact' => 'nullable|string|max:255',
        ]);

        $car = Car::findOrFail($validated['carId']);

        if ($car->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This car does not belong to your agency.',
            ], 403);
        }

        if ($car->status === 'sold') {
            return response()->json([
                'success' => false,
                'message' => 'This car has already been sold.',
            ], 422);
        }

        $hasActiveRental = $car->rentals()
            ->where('status', 'active')
            ->exists();

        if ($hasActiveRental) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot sell a car that has an active rental.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $sale = CarSale::create([
                'car_id' => $car->id,
                'sale_date' => $validated['saleDate'],
                'sale_price' => $validated['salePrice'],
                'buyer_name' => $validated['buyerName'] ?? null,
                'buyer_contact' => $validated['buyerContact'] ?? null,
            ]);

            $car->update(['status' => 'sold']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Car sold successfully.',
                'data' => [
                    'saleId' => $sale->id,
                    'carId' => $car->id,
                    'brand' => $car->brand,
                    'model' => $car->model,
                    'plateNumber' => $car->registration_number,
                    'saleDate' => $sale->sale_date,
                    'salePrice' => $sale->sale_price,
                    'buyerName' => $sale->buyer_name,
                    'buyerContact' => $sale->buyer_contact,
                    'carStatus' => $car->fresh()->status, // ✅ sold
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to sell car.',
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
    public function show($id): JsonResponse
    {
        // ============================================================
        // 1. Use with() like index() instead of load()
        // ============================================================
        $carSale = CarSale::with([
            'car.images',
            'car.insurances',
            'car.maintenances',
            'car.taxes',
        ])
            ->whereHas(
                'car',
                fn($q) =>         // ✅ same as index()
                $q->where('agency_id', auth()->user()->agency_id)
            )
            ->where('id', $id)
            ->first();

        // ============================================================
        // 2. Check sale exists and belongs to agency
        // ============================================================
        

        // ============================================================
        // 3. Return full sale details
        // ============================================================
        return response()->json([
            'success' => true,
            'data' => [
                'saleId' => $carSale->id,
                'saleDate' => $carSale->sale_date,
                'salePrice' => $carSale->sale_price,
                'buyerName' => $carSale->buyer_name,
                'buyerContact' => $carSale->buyer_contact,

                'financial' => [
                    'purchasePrice' => $carSale->car->purchase_price,
                    'salePrice' => $carSale->sale_price,
                    'profit' => $carSale->sale_price - ($carSale->car->purchase_price ?? 0),
                ],

                'car' => [
                    'id' => $carSale->car->id,
                    'brand' => $carSale->car->brand,
                    'model' => $carSale->car->model,
                    'plateNumber' => $carSale->car->registration_number,
                    'purchaseDate' => $carSale->car->purchase_date,
                    'purchasePrice' => $carSale->car->purchase_price,
                    'mileage' => $carSale->car->mileage,
                    'fuelType' => $carSale->car->fuel_type,
                    'status' => $carSale->car->status,

                    'primaryImage' => $carSale->car->images
                        ->where('is_primary', true)
                        ->first()?->image_path ?? null,

                    'images' => $carSale->car->images->map(fn($img) => [
                        'id' => $img->id,
                        'url' => $img->image_path,
                        'isPrimary' => $img->is_primary,
                    ]),

                    'insurance' => $carSale->car->insurances
                        ->sortByDesc('end_date')
                        ->first()
                        ? [
                            'endDate' => $carSale->car->insurances->sortByDesc('end_date')->first()->end_date,
                            'isValid' => $carSale->car->insurances->sortByDesc('end_date')->first()->end_date >= today(),
                        ] : null,

                    'tax' => $carSale->car->taxes
                        ->sortByDesc('year')
                        ->first()
                        ? [
                            'year' => $carSale->car->taxes->sortByDesc('year')->first()->year,
                            'paid' => $carSale->car->taxes->sortByDesc('year')->first()->paid,
                            'isValid' => $carSale->car->taxes->sortByDesc('year')->first()->year >= now()->year,
                        ] : null,

                    'maintenances' => $carSale->car->maintenances->map(fn($m) => [
                        'id' => $m->id,
                        'type' => $m->type,
                        'cost' => $m->cost,
                        'date' => $m->date,
                        'status' => $m->status,
                    ]),
                ],
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
}

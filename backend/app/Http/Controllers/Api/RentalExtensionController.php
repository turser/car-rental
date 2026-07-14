<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use App\Models\Rental;
use App\Models\RentalExtension;
use App\Models\Tax;
use Carbon\Carbon;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentalExtensionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, Rental $rental): JsonResponse
    {
        $validated = $request->validate([
            'newEndDate' => 'required|date_format:Y-m-d H:i:s|after:' . $rental->end_date,
            'extendServices' => 'boolean',
        ]);

        if ($rental->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This rental does not belong to your agency.',
            ], 403);
        }

        if ($rental->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Only active rentals can be extended.',
            ], 422);
        }

        $safetyDate = Carbon::parse($validated['newEndDate'])->addDays(10);
        $expectedReturnYear = Carbon::parse($validated['newEndDate'])->year;

        $hasValidInsurance = Insurance::where('car_id', $rental->car_id)
            ->where('end_date', '>=', $safetyDate)
            ->exists();

        if (!$hasValidInsurance) {
            return response()->json([
                'success' => false,
                'message' => 'Car insurance will expire before the new return date.',
            ], 422);
        }

        $hasValidTax = Tax::where('car_id', $rental->car_id)
            ->where('year', '>=', $expectedReturnYear)
            ->where('paid', true)
            ->exists();

        if (!$hasValidTax) {
            return response()->json([
                'success' => false,
                'message' => 'Car tax is not paid for the year ' . $expectedReturnYear . '.',
            ], 422);
        }

        $client = $rental->client;

        if (
            $client->driving_license_expiration &&
            $client->driving_license_expiration < $safetyDate
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Client driving license will expire before the new return date.',
            ], 422);
        }

        // ============================================================
        // ✅ Determine old_end_date:
        // If rental has extensions → old_end_date = last extension's new_end_date
        // If rental has no extensions → old_end_date = rental's original end_date
        // ============================================================
        $lastExtension = $rental->extensions()->latest()->first();

        $oldEndDate = $lastExtension
            ? $lastExtension->new_end_date   // ✅ last extension end date
            : $rental->end_date;             // ✅ original rental end date

        $extendServices = $validated['extendServices'] ?? false;

        $newDays = Carbon::parse($rental->start_date)
            ->diffInDays(Carbon::parse($validated['newEndDate'])) + 1;
        $newBasePrice = $newDays * $rental->price_per_day;
        $servicesTotal = 0;

        foreach ($rental->services()->with('service')->get() as $rentalService) {
            if ($extendServices && $rentalService->service->price_type === 'per_day') {
                $newUnitPrice = $rentalService->service->price * $newDays;
                $newTotalPrice = $newUnitPrice * $rentalService->quantity;

                $rentalService->update([
                    'unit_price' => $newUnitPrice,
                    'total_price' => $newTotalPrice,
                ]);

                $servicesTotal += $newTotalPrice;
            } else {
                $servicesTotal += $rentalService->total_price;
            }
        }

        $newTotalPrice = $newBasePrice + $servicesTotal;

        DB::beginTransaction();

        try {
            RentalExtension::create([
                'rental_id' => $rental->id,
                'old_end_date' => $oldEndDate,  // ✅ correct old date
                'new_end_date' => $validated['newEndDate'],
            ]);

            $rental->update([
                'end_date' => $validated['newEndDate'],
                'total_price' => $newTotalPrice,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Rental extended successfully.',
                'data' => [
                    'rentalId' => $rental->id,
                    'oldEndDate' => $oldEndDate,
                    'newEndDate' => $rental->end_date,
                    'newDays' => $newDays,
                    'pricePerDay' => $rental->price_per_day,
                    'newBasePrice' => $newBasePrice,
                    'servicesTotal' => $servicesTotal,
                    'servicesExtended' => $extendServices,
                    'newTotalPrice' => $rental->total_price,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to extend rental.',
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

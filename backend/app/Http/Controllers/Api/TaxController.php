<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $taxes = Tax::with('car')
            ->latest()
            ->get()
            ->map(function ($tax) {

                return [
                    'id' => $tax->id,
                    'carId' => $tax->car_id,
                    'année' => $tax->year,
                    'montant' => $tax->amount,
                    'date_d_échéance' => $tax->due_date,
                    'payé' => (bool) $tax->paid,

                    'car' => [
                        'CarId' => $tax->car->id,
                        'brand' => $tax->car->brand,
                        'model' => $tax->car->model,
                        'plateNumber' => $tax->car->registration_number,
                    ]
                ];
            });

        return response()->json($taxes);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'carId' => 'required|exists:cars,id',
            'année' => 'required|integer|min:2000|max:' . now()->year + 1,
            'montant' => 'required|numeric|min:0',
            'datedéchéance' => 'required|date',
            'payé' => 'boolean',
        ]);

        $exists = Tax::where('car_id', $validated['carId'])
            ->where('year', $validated['année'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'A tax record already exists for this car in the given year.',
            ], 422);
        }

        $tax = Tax::create([
            'car_id' => $validated['carId'],
            'year' => $validated['année'],
            'amount' => $validated['montant'],
            'due_date' => $validated['datedéchéance'],
            'paid' => $validated['payé']
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tax created successfully.',
        ], 201);
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

    public function update(Request $request, Tax $tax): JsonResponse
    {
        $validated = $request->validate(
            [
                'carId' => 'sometimes|exists:cars,id',
                'année' => 'sometimes|integer|min:2000|max:' . now()->year + 1,
                'montant' => 'sometimes|numeric|min:0',
                'date_d_échéance' => 'sometimes|date',
                'payé' => 'sometimes|boolean',
            ],

        );

        $carId = $validated['carId'] ?? $tax->car_id;
        $year = $validated['année'] ?? $tax->year;

        $duplicate = Tax::where('car_id', $carId)
            ->where('year', $year)
            ->where('id', '!=', $tax->id)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'A tax record already exists for this car in the given year.',
            ], 422);
        }

        // Map French fields → database columns
        $tax->update([
            'car_id' => $carId,
            'year' => $year,
            'amount' => $validated['montant'] ?? $tax->amount,
            'due_date' => $validated['date_d_échéance'] ?? $tax->due_date,
            'paid' => $validated['payé'] ?? $tax->paid,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tax updated successfully.',
            
        ]);
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

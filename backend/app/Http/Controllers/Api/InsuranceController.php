<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insurance;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $insurances = Insurance::with('car')->latest()->get();

        return response()->json($insurances);
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
            'insuranceCompany' => 'required|string|max:255',
            'contractNumber' => 'required|string|max:255',
            'coverageStartDate' => 'required|date',
            'coverageEndDate' => 'required|date|after:coverageStartDate',
            'insurancePrice' => 'required|numeric|min:0',
        ]);


       

        $insurance = Insurance::create([
            'car_id' => $validated['carId'],
            'company' => $validated['insuranceCompany'],
            'contract_number' => $validated['contractNumber'],
            'start_date' => $validated['coverageStartDate'],
            'end_date' => $validated['coverageEndDate'],
            'price' => $validated['insurancePrice'],
        ]);

        return response()->json([
            'message' => 'Insurance created successfully',
            
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
    public function update(Request $request, Insurance $insurance)
    {
        $validated = $request->validate([
            'insuranceCompany' => 'sometimes|string|max:255',
            'contractNumber' => 'sometimes|string|max:255',
            'coverageStartDate' => 'sometimes|date',
            'coverageEndDate' => 'sometimes|date',
            'insurancePrice' => 'sometimes|numeric|min:0',
        ]);

        $insurance->update([
            'company' => $validated['insuranceCompany']
                ?? $insurance->company,

            'contract_number' => $validated['contractNumber']
                ?? $insurance->contract_number,

            'start_date' => $validated['coverageStartDate']
                ?? $insurance->start_date,

            'end_date' => $validated['coverageEndDate']
                ?? $insurance->end_date,

            'price' => $validated['insurancePrice']
                ?? $insurance->price,
        ]);

        return response()->json([
            'message' => 'Insurance updated successfully',
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

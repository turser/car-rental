<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
         $cars = Car::with([
            'images',
            'insurances',
            'maintenances',
            'taxes'
         ])
         ->where(
            'agency_id',
            auth()->user()->agency_id
        )->get();

        return response()->json($cars);
    }

    /**
     * Store a newly created resource in storage.\
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }   
        $validated = $request->validate([
            'brand' => 'required',
            'model' => 'required',
            'registration_number' => 'required|unique:cars',
            'purchase_date' => 'required|date',
            'purchase_price' => 'nullable|numeric',
            'mileage' => 'required|integer',
            'daily_price' => 'required|numeric',
            'fuel_type' => 'required',
        ]); 

        $validated['agency_id'] = auth()->user()->agency_id;

        $validated['status'] = 'available';

        $car = Car::create($validated);

        return response()->json($car->id, 201);
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

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
            'plateNumber' => 'required|unique:cars,registration_number',
            'purchaseDate' => 'required|date',
            'purchasePrice' => 'nullable|numeric',
            'mileage' => 'required|integer',
            'dailyPrice' => 'required|numeric',
            'fuelType' => 'required',

            'primaryImage' => 'required|image',
            'images.*' => 'image'
        ]);
        $car = Car::create([
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'registration_number' => $validated['plateNumber'],
            'purchase_date' => $validated['purchaseDate'],
            'purchase_price' => $validated['purchasePrice'] ?? null,
            'mileage' => $validated['mileage'],
            'daily_price' => $validated['dailyPrice'],
            'fuel_type' => $validated['fuelType'],
            'agency_id' => auth()->user()->agency_id,
            'status' => 'available'
        ]);

        $primaryPath = $request
            ->file('primaryImage')
            ->store('cars', 'public');

        $car->images()->create([
            'image_path' => $primaryPath,
            'is_primary' => true
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('cars', 'public');
                $car->images()->create([
                    'image_path' => $path,
                    'is_primary' => false
                ]);
            }
        }
        return response()->json([
            'message' => 'Car created',
            'car' => $car->load('images')
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Car $car)
    {
        // Same agency check
        if ($car->agency_id != auth()->user()->agency_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $car->load([
            'images',
            'insurances',
            'maintenances',
            'taxes',
            'rentals'
        ]);

        return response()->json($car);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Car $car)
    {
        
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

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() : JsonResponse
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
    public function store(Request $request): JsonResponse
{
    // ============================================================
    // 1. Check admin role
    // ============================================================
    if (auth()->user()->role !== 'admin') {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized',
        ], 403);
    }

    // ============================================================
    // 2. Validate request
    // ============================================================
    $validated = $request->validate([
        'brand'          => 'required|string',
        'model'          => 'required|string',
        'plateNumber'    => 'required|unique:cars,registration_number',
        'purchaseDate'   => 'required|date',
        'purchasePrice'  => 'nullable|numeric',
        'mileage'        => 'required|integer',
        'dailyPrice'     => 'required|numeric',
        'fuelType'       => 'required|string',
        'primaryImage'   => 'required|image|mimes:jpeg,png,jpg|max:2048',
        'images.*'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // ============================================================
    // 3. Create car
    // ============================================================
    $car = Car::create([
        'brand'               => $validated['brand'],
        'model'               => $validated['model'],
        'registration_number' => $validated['plateNumber'],
        'purchase_date'       => $validated['purchaseDate'],
        'purchase_price'      => $validated['purchasePrice'] ?? null,
        'mileage'             => $validated['mileage'],
        'daily_price'         => $validated['dailyPrice'],
        'fuel_type'           => $validated['fuelType'],
        'agency_id'           => auth()->user()->agency_id,
        'status'              => 'available',
    ]);

    // ============================================================
    // 4. ✅ Upload primary image to Cloudinary
    // ============================================================
    $primaryUploaded = Cloudinary::upload(
        $request->file('primaryImage')->getRealPath(),
        ['folder' => 'cars']
    );


    $car->images()->create([
        'image_path'       => $primaryUploaded->getSecurePath(), // ✅ Cloudinary URL
        'image_public_id' => $primaryUploaded->getPublicId(),   // ✅ for delete later
        'is_primary'      => true,
    ]);

    // ============================================================
    // 5. ✅ Upload additional images to Cloudinary
    // ============================================================
    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $image) {
            $uploaded = Cloudinary::upload(
                $image->getRealPath(),
                ['folder' => 'cars']
            );

            $car->images()->create([
                'image_path'       => $uploaded->getSecurePath(), // ✅ Cloudinary URL
                'image_public_id' => $uploaded->getPublicId(),   // ✅ for delete later
                'is_primary'      => false,
            ]);
        }
    }

    // ============================================================
    // 6. Return response
    // ============================================================
    return response()->json([
        'success' => true,
        'message' => 'Car created successfully.',
        'data'    => $car->load('images'),
    ], 201);
}

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Car $car) : JsonResponse
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

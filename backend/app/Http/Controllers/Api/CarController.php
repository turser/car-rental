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
    public function index(): JsonResponse
    {
        $cars = Car::with([
            'images',
            'insurances',
            'maintenances',
            'taxes',
        ])
            ->where('agency_id', auth()->user()->agency_id)
            ->where('status', '!=', 'sold') // ✅ exclude sold cars
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cars,
        ]);
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
        if (auth()->user()->role == 'employee') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // ============================================================
        // 2. Validate request
        // ============================================================
        $validated = $request->validate([
            'brand' => 'required|string',
            'model' => 'required|string',
            'plateNumber' => 'required|unique:cars,registration_number',
            'purchaseDate' => 'required|date',
            'purchasePrice' => 'nullable|numeric',
            'mileage' => 'required|integer',
            'dailyPrice' => 'required|numeric',
            'fuelType' => 'required|string',
            'primaryImage' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // ============================================================
        // 3. Create car
        // ============================================================
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
            'status' => 'available',
        ]);

        // ============================================================
        // 4. ✅ Upload primary image to Cloudinary
        // ============================================================
        $primaryUploaded = Cloudinary::upload(
            $request->file('primaryImage')->getRealPath(),
            ['folder' => 'cars']
        );


        $car->images()->create([
            'image_path' => $primaryUploaded->getSecurePath(), // ✅ Cloudinary URL
            'image_public_id' => $primaryUploaded->getPublicId(),   // ✅ for delete later
            'is_primary' => true,
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
                    'image_path' => $uploaded->getSecurePath(), // ✅ Cloudinary URL
                    'image_public_id' => $uploaded->getPublicId(),   // ✅ for delete later
                    'is_primary' => false,
                ]);
            }
        }

        // ============================================================
        // 6. Return response
        // ============================================================
        return response()->json([
            'success' => true,
            'message' => 'Car created successfully.',
            'data' => $car->load('images'),
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Car $car): JsonResponse
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
            'rentals',
            'agency'
            
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

    public function update(Request $request, Car $car): JsonResponse
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
        // 2. Check car belongs to the authenticated user's agency
        // ============================================================
        if ($car->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This car does not belong to your agency.',
            ], 403);
        }

        // ============================================================
        // 3. Validate request
        // ============================================================
        $validated = $request->validate([
            'brand' => 'sometimes|required|string',
            'model' => 'sometimes|required|string',
            'plateNumber' => 'sometimes|required|unique:cars,registration_number,' . $car->id,
            'purchaseDate' => 'sometimes|required|date',
            'purchasePrice' => 'nullable|numeric',
            'mileage' => 'sometimes|required|integer',
            'dailyPrice' => 'sometimes|required|numeric',
            'fuelType' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:available,rented,maintenance',
            'primaryImage' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        // ============================================================
        // 4. Update car base fields
        // ============================================================
        $car->update([
            'brand' => $validated['brand'] ?? $car->brand,
            'model' => $validated['model'] ?? $car->model,
            'registration_number' => $validated['plateNumber'] ?? $car->registration_number,
            'purchase_date' => $validated['purchaseDate'] ?? $car->purchase_date,
            'purchase_price' => $validated['purchasePrice'] ?? $car->purchase_price,
            'mileage' => $validated['mileage'] ?? $car->mileage,
            'daily_price' => $validated['dailyPrice'] ?? $car->daily_price,
            'fuel_type' => $validated['fuelType'] ?? $car->fuel_type,
            'status' => $validated['status'] ?? $car->status,
        ]);

        // ============================================================
        // 5. Replace primary image if a new one was uploaded
        // ============================================================
        if ($request->hasFile('primaryImage')) {
            $oldPrimary = $car->images()->where('is_primary', true)->first();

            if ($oldPrimary) {
                Cloudinary::destroy($oldPrimary->image_public_id);
                $oldPrimary->delete();
            }

            $primaryUploaded = Cloudinary::upload(
                $request->file('primaryImage')->getRealPath(),
                ['folder' => 'cars']
            );

            $car->images()->create([
                'image_path' => $primaryUploaded->getSecurePath(),
                'image_public_id' => $primaryUploaded->getPublicId(),
                'is_primary' => true,
            ]);
        }

        // ============================================================
        // 6. Append additional images if provided
        // ============================================================
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $uploaded = Cloudinary::upload(
                    $image->getRealPath(),
                    ['folder' => 'cars']
                );

                $car->images()->create([
                    'image_path' => $uploaded->getSecurePath(),
                    'image_public_id' => $uploaded->getPublicId(),
                    'is_primary' => false,
                ]);
            }
        }

        // ============================================================
        // 7. Return response
        // ============================================================
        return response()->json([
            'success' => true,
            'message' => 'Car updated successfully.',
            'data' => $car->fresh()->load('images'),
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

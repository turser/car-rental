<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentalService;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    public function index(): JsonResponse
    {
        $Service = Service::latest()->get()->map(function ($service) {
            return [
                'id' => $service->id,
                'serviceName' => $service->name,
                'priceType' => $service->price_type,
                'price' => $service->price,
            ];
        });

        return response()->json($Service);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'serviceName' => 'required|string|max:255',
            'priceType' => 'required|in:fixed,per_km,per_day',
            'price' => 'required|numeric|min:0',
        ]);

        $service = Service::create([
            'name' => $validated['serviceName'],
            'price_type' => $validated['priceType'],
            'price' => $validated['price'],
        ]);

        return response()->json([
            'message' => 'Service created successfully',
            'serviceId'=> $service->id 
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Service $service) : JsonResponse
    {
        return response()->json([
            'id' => $service->id,
            'serviceName' => $service->name,
            'priceType' => $service->price_type,
            'price' => $service->price
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Service $service) : JsonResponse
    {
        $validated = $request->validate([
            'serviceName' => 'sometimes|string|max:255',
            'priceType' => 'sometimes|in:fixed,per_km,per_day',
            'price' => 'sometimes|numeric|min:0',
        ]);

        $service->update([
            'name' => $validated['serviceName'] ?? $service->name,
            'price_type' => $validated['priceType'] ?? $service->price_type,
            'price' => $validated['price'] ?? $service->price,
        ]);

        return response()->json(['message' => 'Service updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
   /**
 * Delete a service — only if not used in any rental
 */
public function destroy(Service $service): JsonResponse
{
    // ============================================================
    // 1. Check if service is used in any rental
    // ============================================================
    $isUsed = RentalService::where('service_id', $service->id)->exists();

    if ($isUsed) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot delete this service because it is used in one or more rentals.',
            'data'    => [
                'rentalsCount' => RentalService::where('service_id', $service->id)->count(),
            ],
        ], 422);
    }

    // ============================================================
    // 2. Delete service
    // ============================================================
    $service->delete();

    return response()->json([
        'success' => true,
        'message' => 'Service deleted successfully.',
    ]);
}
}

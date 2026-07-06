<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index() : JsonResponse
{
    $Maintenance = Maintenance::with('car')
        ->latest()
        ->get()
        ->map(function ($maintenance) {

            return [
                'id' => $maintenance->id,
                'carId' => $maintenance->car_id,
                'maintenanceType' => $maintenance->type,
                'maintenanceDate' => $maintenance->date,
                'kilométrage' => $maintenance->mileage,
                'cost' => $maintenance->cost,
                'nextMaintenanceDate' => $maintenance->next_maintenance_date,
            ];
        });

        return response()->json($Maintenance) ; 
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
        'carId'             => 'required|exists:cars,id',
        'maintenanceType'   => 'required|string',
        'maintenanceCost'   => 'required|numeric|min:0',
        'maintenanceDate'   => 'required|date',
        'currentMileage'    => 'required|integer|min:0',
        'nextDueMileage'    => 'nullable|integer|min:0|gt:currentMileage',
    ]);

    try {
        $maintenance = DB::transaction(function () use ($validated) {
            $maintenance = Maintenance::create([
                'car_id'             => $validated['carId'],
                'type'               => $validated['maintenanceType'],
                'cost'               => $validated['maintenanceCost'],
                'date'               => $validated['maintenanceDate'],
                'mileage'            => $validated['currentMileage'],
                'next_due_mileage'   => $validated['nextDueMileage'] ?? null,
                'status'             => 'in_progress',
            ]);

            $maintenance->car()->update([
                'status' => 'maintenance',
            ]);

            return $maintenance;
        });

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record created successfully.',
            'data'    => $maintenance->load('car'),
        ], 201);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create maintenance record.',
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

    /**
 * Mark maintenance as completed
 */
public function complete(Maintenance $maintenance): JsonResponse
{
    if ($maintenance->status === 'completed') {
        return response()->json([
            'success' => false,
            'message' => 'This maintenance record is already completed.',
        ], 422);
    }

    try {
        $maintenance = DB::transaction(function () use ($maintenance) {
            $maintenance->update([
                'status' => 'completed',
            ]);

            $hasOtherActiveMaintenance = $maintenance->car
                ->maintenances()
                ->where('id', '!=', $maintenance->id)
                ->whereIn('status', ['pending', 'in_progress'])
                ->exists();

            if (!$hasOtherActiveMaintenance) {
                $maintenance->car->update([
                    'status' => 'available',
                ]);
            }

            return $maintenance;
        });

        return response()->json([
            'success' => true,
            'message' => 'Maintenance marked as completed successfully.',
            'data'    => $maintenance->fresh()->load('car'),
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to complete maintenance record.',
            "e"=>$e
        ], 500);
    }
}
}

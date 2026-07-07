<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    /**
 * Generate rental invoice data as JSON for frontend
 */
public function generate(Rental $rental): JsonResponse
{
    // ============================================================
    // 1. Check rental belongs to the authenticated user's agency
    // ============================================================
    if ($rental->agency_id !== auth()->user()->agency_id) {
        return response()->json([
            'success' => false,
            'message' => 'This rental does not belong to your agency.',
        ], 403);
    }

    // ============================================================
    // 2. Load all required relations
    // ============================================================
    $rental->load([
        'client',
        'car',
        'agency',
        'services.service',
        'payments',
        'extensions',
    ]);

    // ============================================================
    // 3. Calculate rental days
    // ============================================================
    $days      = \Carbon\Carbon::parse($rental->start_date)
                    ->diffInDays($rental->end_date) + 1;
    $basePrice = $rental->price_per_day * $days;

    // ============================================================
    // 4. Return invoice data as JSON
    // ============================================================
    return response()->json([
        'success' => true,
        'data'    => [

            // Invoice meta
            'invoiceNumber' => 'INV-' . str_pad($rental->id, 6, '0', STR_PAD_LEFT),
            'invoiceDate'   => now()->format('Y-m-d'),

            // Agency info
            'agency' => [
                'name'    => $rental->agency->name,
                'ville'    => $rental->agency->city,
                'address' => $rental->agency->address ?? null,
                'phone'   => $rental->agency->phone   ?? null,
            ],

            // Client info
            'client' => [
                'id'    => $rental->client->id,
                'name'  => $rental->client->full_name,
                'phone' => $rental->client->phone ?? null,
                'email' => $rental->client->email ?? null,
            ],

            // Car info
            'car' => [
                'id'          => $rental->car->id,
                'brand'       => $rental->car->brand,
                'model'       => $rental->car->model,
                'plateNumber' => $rental->car->registration_number,
            ],

            // Rental period
            'rental' => [
                'id'               => $rental->id,
                'startDate'        => $rental->start_date,
                'expectedEndDate'  => $rental->end_date,
                'actualReturnDate' => $rental->actual_return_date,
                'days'             => $days,
                'pricePerDay'      => $rental->price_per_day,
                'status'           => $rental->status,
            ],

            // Extensions history
            'extensions' => $rental->extensions->map(fn($e) => [
                'id'         => $e->id,
                'oldEndDate' => $e->old_end_date,
                'newEndDate' => $e->new_end_date,
            ]),

            // Services
            'services' => $rental->services->map(fn($s) => [
                'id'         => $s->id,
                'name'       => $s->service->name,
                'priceType'  => $s->service->price_type,
                'quantity'   => $s->quantity,
                'unitPrice'  => $s->unit_price,
                'totalPrice' => $s->total_price,
            ]),

            // Payments history
            'payments' => $rental->payments->map(fn($p) => [
                'id'            => $p->id,
                'amount'        => $p->amount,
                'paymentMethod' => $p->payment_method,
                'paymentDate'   => $p->payment_date,
            ]),

            // Price summary
            'summary' => [
                'basePrice'      => $basePrice,
                'servicesTotal'  => $rental->services->sum('total_price'),
                'totalPrice'     => $rental->total_price,
                'paidAmount'     => $rental->paid_amount,
                'remainingAmount'=> max($rental->total_price - $rental->paid_amount, 0),
                'isFullyPaid'    => $rental->paid_amount >= $rental->total_price,
            ],
        ],
    ]);
}

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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

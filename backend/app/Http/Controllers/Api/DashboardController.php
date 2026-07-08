<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

    private function getRentalsPerDay(int $agencyId, Carbon $start, Carbon $end): array
    {
        // Get rentals count grouped by day
        $data = Rental::where('agency_id', $agencyId)
            ->whereBetween('start_date', [$start, $end])
            ->selectRaw('DATE(start_date) as day, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->mapWithKeys(fn($r) => [$r->day => $r->count])
            ->toArray();

        // ✅ Fill missing days with 0
        // so frontend gets a complete dataset for the chart
        $period = new \DatePeriod(
            $start,
            new \DateInterval('P1D'),
            $end->copy()->addDay()
        );

        $result = [];
        foreach ($period as $date) {
            $day = $date->format('Y-m-d');
            $result[$day] = $data[$day] ?? 0; // 0 if no rentals that day
        }

        return $result;
    }

    private function getPaymentsPerDay($rentalIds, Carbon $start, Carbon $end): array
    {
        // Get payments total grouped by day
        $data = Payment::whereIn('rental_id', $rentalIds)
            ->whereBetween('payment_date', [$start, $end])
            ->selectRaw('DATE(payment_date) as day, SUM(amount) as total')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->mapWithKeys(fn($p) => [$p->day => $p->total])
            ->toArray();

        // ✅ Fill missing days with 0
        $period = new \DatePeriod(
            $start,
            new \DateInterval('P1D'),
            $end->copy()->addDay()
        );

        $result = [];
        foreach ($period as $date) {
            $day = $date->format('Y-m-d');
            $result[$day] = $data[$day] ?? 0; // 0 if no payments that day
        }

        return $result;
    }
    public function index(Request $request): JsonResponse
    {
        

        $agencyId = auth()->user()->agency_id;
        $period = $request->input('period', 'monthly');
        $date = $request->input('date')
            ? Carbon::parse($request->input('date'))
            : Carbon::now();

        // Validate only if provided
        if ($request->hasAny(['period', 'date'])) {
            $request->validate([
                'period' => 'sometimes|in:daily,monthly,yearly',
                'date' => 'sometimes|date',
            ]);
        }

        [$startDate, $endDate] = match ($period) {
            'daily' => [$date->copy()->startOfDay(), $date->copy()->endOfDay()],
            'monthly' => [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()],
            'yearly' => [$date->copy()->startOfYear(), $date->copy()->endOfYear()],
        };


        // ============================================================
        // 2. Base rental query
        // ============================================================
        $rentalsQuery = Rental::where('agency_id', $agencyId)
            ->whereBetween('start_date', [$startDate, $endDate]);

        $rentalIds = (clone $rentalsQuery)->pluck('id');

        // ============================================================
        // 3. General statistics
        // ============================================================
        $generalStats = [
            'rentals' => [
                'total' => (clone $rentalsQuery)->count(),
                'active' => (clone $rentalsQuery)->where('status', 'active')->count(),
                'completed' => (clone $rentalsQuery)->where('status', 'completed')->count(),
                'canceled' => (clone $rentalsQuery)->where('status', 'canceled')->count(),
            ],
            'cars' => [
                'total' => Car::where('agency_id', $agencyId)->count(),
                'available' => Car::where('agency_id', $agencyId)->where('status', 'available')->count(),
                'rented' => Car::where('agency_id', $agencyId)->where('status', 'rented')->count(),
                'maintenance' => Car::where('agency_id', $agencyId)->where('status', 'maintenance')->count(),
            ],
            'clients' => [
                'total' => Client::count(),
                'newInPeriod' => Client::whereHas(
                    'rentals',
                    fn($q) =>
                    $q->where('agency_id', $agencyId)
                        ->whereBetween('start_date', [$startDate, $endDate])
                )->count(),
            ],
        ];

        // ============================================================
        // 4. Financial statistics
        // ============================================================
        $financialStats = [
            'totalRevenue' => (clone $rentalsQuery)->sum('total_price'),
            'totalCollected' => Payment::whereIn('rental_id', $rentalIds)
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->sum('amount'),
            'totalRemaining' => (clone $rentalsQuery)
                ->selectRaw('SUM(total_price - paid_amount) as remaining')
                ->value('remaining') ?? 0,
            'servicesRevenue' => \App\Models\RentalService::whereIn('rental_id', $rentalIds)
                ->sum('total_price'),
            'byPaymentMethod' => Payment::whereIn('rental_id', $rentalIds)
                ->whereBetween('payment_date', [$startDate, $endDate])
                ->selectRaw('payment_method, SUM(amount) as total')
                ->groupBy('payment_method')
                ->get()
                ->mapWithKeys(fn($p) => [$p->payment_method => $p->total]),
        ];

        // ============================================================
        // 5. Charts data
        // ============================================================
        $chartsData = match ($period) {
            'daily' => [
                'rentals' => $this->getRentalsPerHour($agencyId, $date),
                'payments' => $this->getPaymentsPerHour($rentalIds, $date),
            ],
            'monthly' => [
                'rentals' => $this->getRentalsPerDay($agencyId, $startDate, $endDate),
                'payments' => $this->getPaymentsPerDay($rentalIds, $startDate, $endDate),
            ],
            'yearly' => [
                'rentals' => $this->getRentalsPerMonth($agencyId, $date),
                'payments' => $this->getPaymentsPerMonth($rentalIds, $date),
            ],
        };

        // ============================================================
        // 6. Latest 5 active rentals
        // ============================================================
        $latestRentals = Rental::with(['client', 'car'])
            ->where('agency_id', $agencyId)
            ->where('status', 'active')
            ->latest('start_date')
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'client' => $r->client->name,
                'car' => $r->car->brand . ' ' . $r->car->model,
                'startDate' => $r->start_date,
                'endDate' => $r->end_date,
                'totalPrice' => $r->total_price,
                'paidAmount' => $r->paid_amount,
                'remaining' => $r->total_price - $r->paid_amount,
            ]);

        // ============================================================
        // 7. ✅ Alerts — تنبيهات عاجلة
        // ============================================================
        $alerts = [
            // كراءات تنتهي اليوم
            'rentalsEndingToday' => Rental::where('agency_id', $agencyId)
                ->where('status', 'active')
                ->whereDate('end_date', today())
                ->count(),

            // كراءات تنتهي خلال 3 أيام
            'rentalsEndingSoon' => Rental::where('agency_id', $agencyId)
                ->where('status', 'active')
                ->whereBetween('end_date', [today(), today()->addDays(3)])
                ->count(),

            // كراءات غير مسددة بالكامل
            'unpaidRentals' => Rental::where('agency_id', $agencyId)
                ->where('status', 'active')
                ->whereRaw('paid_amount < total_price')
                ->count(),

            // تأمينات تنتهي خلال 30 يوم
            'insuranceExpiringSoon' => \App\Models\Insurance::whereHas(
                'car',
                fn($q) =>
                $q->where('agency_id', $agencyId)
            )
                ->whereBetween('end_date', [today(), today()->addDays(30)])
                ->count(),

            // ضرائب غير مدفوعة للسنة الحالية
            'taxExpiringSoon' => \App\Models\Tax::whereHas(
                'car',
                fn($q) =>
                $q->where('agency_id', $agencyId)
            )
                ->where('year', now()->year)
                ->where('paid', false)
                ->count(),

            // سيارات في الصيانة أكثر من 7 أيام
            'longMaintenance' => \App\Models\Maintenance::whereHas(
                'car',
                fn($q) =>
                $q->where('agency_id', $agencyId)
            )
                ->where('status', 'in_progress')
                ->where('date', '<=', today()->subDays(7))
                ->count(),
        ];

        // ============================================================
        // 8. Return full dashboard data
        // ============================================================
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'from' => $startDate->toDateString(),
                'to' => $endDate->toDateString(),
                'general' => $generalStats,
                'financial' => $financialStats,
                'charts' => $chartsData,
                'latestRentals' => $latestRentals,
                'alerts' => $alerts,  // ✅
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

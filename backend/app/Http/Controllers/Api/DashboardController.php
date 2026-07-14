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

    private function getRentalsPerHour(int $agencyId, Carbon $date): array
    {
        $data = Rental::where('agency_id', $agencyId)
            ->whereDate('start_date', $date)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->mapWithKeys(fn($r) => [(int) $r->hour => $r->count])
            ->toArray();

        $result = [];

        for ($hour = 0; $hour < 24; $hour++) {
            $result[sprintf('%02d:00', $hour)] = $data[$hour] ?? 0;
        }

        return $result;
    }

    private function getPaymentsPerHour($rentalIds, Carbon $date): array
    {
        $data = Payment::whereIn('rental_id', $rentalIds)
            ->whereDate('payment_date', $date)
            ->selectRaw('HOUR(created_at) as hour, SUM(amount) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->mapWithKeys(fn($p) => [(int) $p->hour => $p->total])
            ->toArray();

        $result = [];

        for ($hour = 0; $hour < 24; $hour++) {
            $result[sprintf('%02d:00', $hour)] = $data[$hour] ?? 0;
        }

        return $result;
    }

    private function getRentalsPerMonth(int $agencyId, Carbon $date): array
    {
        $data = Rental::where('agency_id', $agencyId)
            ->whereYear('start_date', $date->year)
            ->selectRaw('MONTH(start_date) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(fn($r) => [(int) $r->month => $r->count])
            ->toArray();

        $months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];

        $result = [];

        foreach ($months as $index => $month) {
            $result[$month] = $data[$index + 1] ?? 0;
        }

        return $result;
    }

    private function getPaymentsPerMonth($rentalIds, Carbon $date): array
    {
        $data = Payment::whereIn('rental_id', $rentalIds)
            ->whereYear('payment_date', $date->year)
            ->selectRaw('MONTH(payment_date) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(fn($p) => [(int) $p->month => $p->total])
            ->toArray();

        $months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];

        $result = [];

        foreach ($months as $index => $month) {
            $result[$month] = $data[$index + 1] ?? 0;
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
                'total' => Car::where('agency_id', $agencyId)
                    ->where('status', '!=', 'sold')
                    ->count(),
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
    /**
     * Get all available cars for a specific period
     */
    /**
     * Get all available cars for a specific period with filters
     */
    public function availableCars(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'startDate' => 'required|date',
            'endDate' => 'required|date|after:startDate',

            // ✅ Filters
            'brand' => 'nullable|string',
            'fuelType' => 'nullable|in:essence,diesel,electric,hybrid',
            'minPrice' => 'nullable|numeric|min:0',
            'maxPrice' => 'nullable|numeric|min:0',
            'maxMileage' => 'nullable|integer|min:0',
        ]);

        $agencyId = auth()->user()->agency_id;
        $startDate = $validated['startDate'];
        $endDate = $validated['endDate'];

        $cars = Car::where('agency_id', $agencyId)
            ->where('status', 'available')

            // ============================================================
            // ✅ Filters
            // ============================================================
            ->when(
                $request->brand,
                fn($q) =>
                $q->where('brand', 'like', '%' . $request->brand . '%')
            )
            ->when(
                $request->fuelType,
                fn($q) =>
                $q->where('fuel_type', $request->fuelType)
            )
            ->when(
                $request->minPrice,
                fn($q) =>
                $q->where('daily_price', '>=', $request->minPrice)
            )
            ->when(
                $request->maxPrice,
                fn($q) =>
                $q->where('daily_price', '<=', $request->maxPrice)
            )
            ->when(
                $request->maxMileage,
                fn($q) =>
                $q->where('mileage', '<=', $request->maxMileage)
            )

            // ============================================================
            // Exclude cars with overlapping active rentals
            // ============================================================
            ->whereDoesntHave('rentals', function ($q) use ($startDate, $endDate) {
                $q->where('status', 'active')
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q2) use ($startDate, $endDate) {
                                $q2->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    });
            })

            ->with([
                'insurances' => fn($q) => $q->latest('end_date')->limit(1),
                'taxes' => fn($q) => $q->latest('due_date')->limit(1),
                'images' => fn($q) => $q->where('is_primary', true),
            ])
            ->get()
            ->map(function ($car) use ($startDate, $endDate) {
                $insurance = $car->insurances->first();
                $tax = $car->taxes->first();
                $days = Carbon::parse($startDate)->diffInDays($endDate);

                return [
                    'id' => $car->id,
                    'brand' => $car->brand,
                    'model' => $car->model,
                    'registrationNumber' => $car->registration_number,
                    'dailyPrice' => $car->daily_price,
                    'estimatedTotal' => $car->daily_price * $days, // ✅ السعر الإجمالي المتوقع
                    'fuelType' => $car->fuel_type,
                    'mileage' => $car->mileage,
                    'status' => $car->status,
                    'image' => $car->images->first()?->image_url ?? null,

                    'insurance' => $insurance ? [
                        'endDate' => $insurance->end_date,
                        'isValid' => $insurance->end_date >= today(),
                    ] : null,

                    'tax' => $tax ? [
                        'year' => $tax->year,
                        'isValid' => $tax->year >= now()->year && $tax->paid,
                    ] : null,
                ];
            });

        // ============================================================
        // ✅ Get available brands for filter dropdown
        // ============================================================
        $availableBrands = Car::where('agency_id', $agencyId)
            ->where('status', 'available')
            ->distinct()
            ->pluck('brand');

        // ============================================================
        // ✅ Get price range for filter slider
        // ============================================================
        $priceRange = Car::where('agency_id', $agencyId)
            ->where('status', 'available')
            ->selectRaw('MIN(daily_price) as min, MAX(daily_price) as max')
            ->first();

        return response()->json([
            'success' => true,
            'period' => [
                'startDate' => $startDate,
                'endDate' => $endDate,
                'days' => Carbon::parse($startDate)->diffInDays($endDate),
            ],
            'filters' => [
                'availableBrands' => $availableBrands,  // ✅ للـ dropdown
                'priceRange' => [                   // ✅ للـ slider
                    'min' => $priceRange->min,
                    'max' => $priceRange->max,
                ],
            ],
            'totalCars' => $cars->count(),
            'data' => $cars,
        ]);
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

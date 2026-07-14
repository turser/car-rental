<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RentalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $agencyId = 2;

        $cars = Car::where('agency_id', $agencyId)->get();

        $clients = Client::all();

        if ($cars->isEmpty() || $clients->isEmpty()) {
            $this->command->error('Cars or Clients not found.');
            return;
        }

        foreach ($cars as $index => $car) {

            $client = $clients[$index % $clients->count()];

            $startDate = Carbon::create(2026, rand(1, 6), rand(1, 20));

            $days = rand(5, 20);

            $endDate = (clone $startDate)->addDays($days);

            $status = rand(0, 100) <= 80
                ? 'completed'
                : 'active';

            $actualReturnDate = $status === 'completed'
                ? (clone $endDate)
                : null;

            $totalPrice = $days * $car->daily_price;

            $paidAmount = $status === 'completed'
                ? $totalPrice
                : round($totalPrice * 0.5);

            $rental = Rental::create([
                'client_id' => $client->id,
                'car_id' => $car->id,
                'agency_id' => $agencyId,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'actual_return_date' => $actualReturnDate,
                'price_per_day' => $car->daily_price,
                'total_price' => $totalPrice,
                'paid_amount' => $paidAmount,
                'status' => $status,
            ]);

            Payment::create([
                'rental_id' => $rental->id,
                'amount' => $paidAmount,
                'payment_method' => collect([
                    'cash',
                    'card',
                    'transfer'
                ])->random(),
                'payment_date' => $startDate,
            ]);

            if ($status === 'active') {
                $car->update([
                    'status' => 'rented'
                ]);
            } else {
                $car->update([
                    'status' => 'available'
                ]);
            }
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Rental;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RentalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         Rental::create([
            'client_id' => 1,
            'car_id' => 1,
            'agency_id' => 1,

            'start_date' => '2026-05-01',
            'end_date' => '2026-05-05',
            'actual_return_date' => '2026-05-05',

            'price_per_day' => 300,

            'total_price' => 1500,
            'paid_amount' => 1000,

            'status' => 'completed',
        ]);

        Rental::create([
            'client_id' => 2,
            'car_id' => 2,
            'agency_id' => 1,

            'start_date' => '2026-05-10',
            'end_date' => '2026-05-15',
            'actual_return_date' => null,

            'price_per_day' => 450,

            'total_price' => 2250,
            'paid_amount' => 1500,

            'status' => 'active',
        ]);

        Rental::create([
            'client_id' => 3,
            'car_id' => 3,
            'agency_id' => 2,

            'start_date' => '2026-04-01',
            'end_date' => '2026-04-03',
            'actual_return_date' => '2026-04-05',

            'price_per_day' => 400,

            'total_price' => 1600,
            'paid_amount' => 1600,

            'status' => 'completed',
        ]);
    }
}

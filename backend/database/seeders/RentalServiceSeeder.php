<?php

namespace Database\Seeders;

use App\Models\RentalService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RentalServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RentalService::create([
            'rental_id' => 1,
            'service_id' => 1,
            'quantity' => 1,
            'unit_price' => 100,
            'total_price' => 100
        ]);

        RentalService::create([
            'rental_id' => 2,
            'service_id' => 2,
            'quantity' => 5,
            'unit_price' => 20,
            'total_price' => 100
        ]);

    }
}

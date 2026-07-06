<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Service::create([
            'name' => 'Car Delivery',
            'price_type' => 'fixed',
            'price' => 100
        ]);

        Service::create([
            'name' => 'Airport Return',
            'price_type' => 'per_km',
            'price' => 3
        ]);
    }
}

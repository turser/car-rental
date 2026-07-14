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
            'name' => 'Chauffeur Service',
            'price' => 250.00,
            'price_type' => 'per_day'
        ]);

        Service::create([
            'name' => 'GPS Navigation System',
            'price' => 30.00,
            'price_type' => 'per_day'
        ]);

        Service::create([
            'name' => 'Baby Car Seat',
            'price' => 150.00,
            'price_type' => 'fixed'
        ]);

        Service::create([
            'name' => 'Airport Delivery & Pickup',
            'price' => 200.00,
            'price_type' => 'fixed'
        ]);

       

        Service::create([
            'name' => 'Extra Mileage Pack',
            'price' => 2.50,
            'price_type' => 'per_km'
        ]);
    }
}

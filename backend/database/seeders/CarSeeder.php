<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Car::create([
            'brand' => 'Dacia',
            'model' => 'Logan',
            'registration_number' => '12345-A-1',
            'purchase_date' => '2023-01-10',
            'purchase_price' => 180000,
            'mileage' => 15000,
            'daily_price' => 300,
            'status' => 'available',
            'fuel_type' => 'diesel',
            'agency_id' => 1
        ]);

        Car::create([
            'brand' => 'Renault',
            'model' => 'Clio 5',
            'registration_number' => '67890-B-50',
            'purchase_date' => '2022-06-15',
            'purchase_price' => 230000,
            'mileage' => 90000,
            'daily_price' => 300,
            'status' => 'available',
            'fuel_type' => 'petrol',
            'agency_id' => 1
        ]);

        Car::create([
            'brand' => 'Peugeot',
            'model' => '208',
            'registration_number' => '54321-A-45',
            'purchase_date' => '2021-03-20',
            'purchase_price' => 200000,
            'mileage' => 120000,
            'daily_price' => 300,
            'status' => 'maintenance',
            'fuel_type' => 'diesel',
            'agency_id' => 2
        ]);
        Car::create([
            'brand' => 'Dacia',
            'model' => 'Logan',
            'registration_number' => '12144-A-50',
            'purchase_date' => '2023-01-10',
            'purchase_price' => 180000,
            'mileage' => 15000,
            'daily_price' => 300,
            'status' => 'available',
            'fuel_type' => 'diesel',
            'agency_id' => 2
        ]);
    }
}

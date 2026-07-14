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
        // 1. Dacia Logan
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
    'agency_id' => 2
]);

// 2. Renault Clio 5
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
    'agency_id' => 2
]);

// 3. Peugeot 208
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

// 4. Dacia Sandero Stepway
Car::create([
    'brand' => 'Dacia',
    'model' => 'Sandero Stepway',
    'registration_number' => '12144-A-50',
    'purchase_date' => '2023-05-12',
    'purchase_price' => 195000,
    'mileage' => 45000,
    'daily_price' => 320,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 5. Volkswagen Golf 8
Car::create([
    'brand' => 'Volkswagen',
    'model' => 'Golf 8',
    'registration_number' => '99887-B-1',
    'purchase_date' => '2024-02-10',
    'purchase_price' => 380000,
    'mileage' => 25000,
    'daily_price' => 550,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 6. Hyundai i20
Car::create([
    'brand' => 'Hyundai',
    'model' => 'i20',
    'registration_number' => '44556-D-26',
    'purchase_date' => '2023-08-22',
    'purchase_price' => 190000,
    'mileage' => 35000,
    'daily_price' => 300,
    'status' => 'available',
    'fuel_type' => 'petrol',
    'agency_id' => 2
]);

// 7. Citroën C3
Car::create([
    'brand' => 'Citroën',
    'model' => 'C3',
    'registration_number' => '33221-H-6',
    'purchase_date' => '2022-11-05',
    'purchase_price' => 185000,
    'mileage' => 78000,
    'daily_price' => 280,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 8. Fiat 500
Car::create([
    'brand' => 'Fiat',
    'model' => '500',
    'registration_number' => '77665-F-40',
    'purchase_date' => '2023-04-18',
    'purchase_price' => 170000,
    'mileage' => 22000,
    'daily_price' => 300,
    'status' => 'available',
    'fuel_type' => 'petrol',
    'agency_id' => 2
]);

// 9. Dacia Duster
Car::create([
    'brand' => 'Dacia',
    'model' => 'Duster',
    'registration_number' => '88221-G-50',
    'purchase_date' => '2022-09-30',
    'purchase_price' => 240000,
    'mileage' => 95000,
    'daily_price' => 450,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 10. Toyota Yaris
Car::create([
    'brand' => 'Toyota',
    'model' => 'Yaris',
    'registration_number' => '55443-A-15',
    'purchase_date' => '2023-07-14',
    'purchase_price' => 210000,
    'mileage' => 31000,
    'daily_price' => 350,
    'status' => 'available',
    'fuel_type' => 'petrol',
    'agency_id' => 2
]);

// 11. Peugeot 3008
Car::create([
    'brand' => 'Peugeot',
    'model' => '3008',
    'registration_number' => '90901-B-8',
    'purchase_date' => '2023-10-05',
    'purchase_price' => 360000,
    'mileage' => 42000,
    'daily_price' => 650,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 12. Renault Megane 4
Car::create([
    'brand' => 'Renault',
    'model' => 'Megane 4',
    'registration_number' => '11223-D-50',
    'purchase_date' => '2022-03-25',
    'purchase_price' => 250000,
    'mileage' => 85000,
    'daily_price' => 400,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 13. Kia Picanto
Car::create([
    'brand' => 'Kia',
    'model' => 'Picanto',
    'registration_number' => '33442-G-6',
    'purchase_date' => '2024-01-15',
    'purchase_price' => 160000,
    'mileage' => 12000,
    'daily_price' => 250,
    'status' => 'available',
    'fuel_type' => 'petrol',
    'agency_id' => 2
]);

// 14. Volkswagen T-Roc
Car::create([
    'brand' => 'Volkswagen',
    'model' => 'T-Roc',
    'registration_number' => '77112-H-1',
    'purchase_date' => '2024-05-20',
    'purchase_price' => 390000,
    'mileage' => 18000,
    'daily_price' => 600,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);

// 15. Ford Fiesta
Car::create([
    'brand' => 'Ford',
    'model' => 'Fiesta',
    'registration_number' => '66554-F-15',
    'purchase_date' => '2022-12-01',
    'purchase_price' => 190000,
    'mileage' => 64000,
    'daily_price' => 300,
    'status' => 'available',
    'fuel_type' => 'diesel',
    'agency_id' => 2
]);
    }

}

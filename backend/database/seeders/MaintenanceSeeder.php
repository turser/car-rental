<?php

namespace Database\Seeders;

use App\Models\Maintenance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MaintenanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Maintenance::create([
            'car_id' => 2,
            'type' => 'filter',
            'cost' => 400,
            'date' => '2026-03-15',
            'mileage' => 30000,
            'next_due_mileage' => 40000
        ]);
    }
}

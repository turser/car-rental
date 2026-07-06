<?php

namespace Database\Seeders;

use App\Models\Insurance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InsuranceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Insurance::create([
            'car_id' => 1,
            'company' => 'Wafa Assurance',
            'price' => 3500,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31'
        ]);

        Insurance::create([
            'car_id' => 2,
            'company' => 'Sanlam',
            'price' => 4200,
            'start_date' => '2026-02-01',
            'end_date' => '2027-01-31'
        ]);
    }
}

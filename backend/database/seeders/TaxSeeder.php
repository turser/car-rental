<?php

namespace Database\Seeders;

use App\Models\Tax;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Tax::create([
            'car_id' => 1,
            'year' => 2026,
            'amount' => 2500,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        Tax::create([
            'car_id' => 2,
            'year' => 2026,
            'amount' => 3200,
            'due_date' => '2026-02-28',
            'paid' => false
        ]);
    }
}

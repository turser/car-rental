<?php

namespace Database\Seeders;

use App\Models\Payment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Payment::create([
            'rental_id' => 1,
            'amount' => 1000,
            'payment_method' => 'cash',
            'payment_date' => '2026-05-01'
        ]);
    }
}

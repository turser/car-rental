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
        // 1. Dacia Logan
        Insurance::create([
            'car_id' => 1,
            'company' => 'Wafa Assurance',
            'price' => 3500,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31'
        ]);

        // 2. Renault Clio 5
        Insurance::create([
            'car_id' => 2,
            'company' => 'Sanlam',
            'price' => 4200,
            'start_date' => '2026-02-01',
            'end_date' => '2027-01-31'
        ]);

        // 3. Peugeot 208
        Insurance::create([
            'car_id' => 3,
            'company' => 'AXA Assurance Maroc',
            'price' => 3800,
            'start_date' => '2025-11-15',
            'end_date' => '2026-11-14'
        ]);

        // 4. Dacia Sandero Stepway
        Insurance::create([
            'car_id' => 4,
            'company' => 'RMA Watanya',
            'price' => 3600,
            'start_date' => '2026-05-12',
            'end_date' => '2027-05-11'
        ]);

        // 5. Volkswagen Golf 8
        Insurance::create([
            'car_id' => 5,
            'company' => 'AtlantaSanad',
            'price' => 5500,
            'start_date' => '2026-02-10',
            'end_date' => '2027-02-09'
        ]);

        // 6. Hyundai i20
        Insurance::create([
            'car_id' => 6,
            'company' => 'Wafa Assurance',
            'price' => 3700,
            'start_date' => '2025-08-22',
            'end_date' => '2026-08-21'
        ]);

        // 7. Citroën C3
        Insurance::create([
            'car_id' => 7,
            'company' => 'MAMDA',
            'price' => 3400,
            'start_date' => '2025-11-05',
            'end_date' => '2026-11-04'
        ]);

        // 8. Fiat 500
        Insurance::create([
            'car_id' => 8,
            'company' => 'Sanlam',
            'price' => 3300,
            'start_date' => '2026-04-18',
            'end_date' => '2027-04-17'
        ]);

        // 9. Dacia Duster
        Insurance::create([
            'car_id' => 9,
            'company' => 'AXA Assurance Maroc',
            'price' => 4500,
            'start_date' => '2025-09-30',
            'end_date' => '2026-09-29'
        ]);

        // 10. Toyota Yaris
        Insurance::create([
            'car_id' => 10,
            'company' => 'RMA Watanya',
            'price' => 3900,
            'start_date' => '2025-07-14',
            'end_date' => '2026-07-13'
        ]);

        // 11. Peugeot 3008
        Insurance::create([
            'car_id' => 11,
            'company' => 'AtlantaSanad',
            'price' => 5800,
            'start_date' => '2025-10-05',
            'end_date' => '2026-10-04'
        ]);

        // 12. Renault Megane 4
        Insurance::create([
            'car_id' => 12,
            'company' => 'Wafa Assurance',
            'price' => 4100,
            'start_date' => '2026-03-25',
            'end_date' => '2027-03-24'
        ]);

        // 13. Kia Picanto
        Insurance::create([
            'car_id' => 13,
            'company' => 'MAMDA',
            'price' => 3100,
            'start_date' => '2026-01-15',
            'end_date' => '2027-01-14'
        ]);

        // 14. Volkswagen T-Roc
        Insurance::create([
            'car_id' => 14,
            'company' => 'AXA Assurance Maroc',
            'price' => 5600,
            'start_date' => '2026-05-20',
            'end_date' => '2027-05-19'
        ]);

        // 15. Ford Fiesta
        Insurance::create([
            'car_id' => 15,
            'company' => 'Sanlam',
            'price' => 3600,
            'start_date' => '2025-12-01',
            'end_date' => '2026-11-30'
        ]);
    }
}

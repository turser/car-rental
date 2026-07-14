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
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 2. Renault Clio 5 (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 2,
            'year' => 2025,
            'amount' => 350,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 3. Peugeot 208 (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 3,
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 4. Dacia Sandero Stepway (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 4,
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 5. Volkswagen Golf 8 (Diesel 8HP - 1500 DHS)
        Tax::create([
            'car_id' => 5,
            'year' => 2025,
            'amount' => 1500,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 6. Hyundai i20 (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 6,
            'year' => 2025,
            'amount' => 350,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 7. Citroën C3 (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 7,
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => false
        ]);

        // 8. Fiat 500 (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 8,
            'year' => 2025,
            'amount' => 350,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 9. Dacia Duster (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 9,
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 10. Toyota Yaris (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 10,
            'year' => 2025,
            'amount' => 350,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 11. Peugeot 3008 (Diesel 8HP - 1500 DHS)
        Tax::create([
            'car_id' => 11,
            'year' => 2025,
            'amount' => 1500,
            'due_date' => '2025-01-31',
            'paid' => false
        ]);

        // 12. Renault Megane 4 (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 12,
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 13. Kia Picanto (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 13,
            'year' => 2025,
            'amount' => 350,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 14. Volkswagen T-Roc (Diesel 8HP - 1500 DHS)
        Tax::create([
            'car_id' => 14,
            'year' => 2025,
            'amount' => 1500,
            'due_date' => '2025-01-31',
            'paid' => true
        ]);

        // 15. Ford Fiesta (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 15,
            'year' => 2025,
            'amount' => 700,
            'due_date' => '2025-01-31',
            'paid' => false
        ]);




        Tax::create([
            'car_id' => 1,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 2. Renault Clio 5 (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 2,
            'year' => 2026,
            'amount' => 350,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 3. Peugeot 208 (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 3,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 4. Dacia Sandero Stepway (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 4,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 5. Volkswagen Golf 8 (Diesel 8HP - 1500 DHS)
        Tax::create([
            'car_id' => 5,
            'year' => 2026,
            'amount' => 1500,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 6. Hyundai i20 (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 6,
            'year' => 2026,
            'amount' => 350,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 7. Citroën C3 (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 7,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 8. Fiat 500 (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 8,
            'year' => 2026,
            'amount' => 350,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 9. Dacia Duster (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 9,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 10. Toyota Yaris (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 10,
            'year' => 2026,
            'amount' => 350,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 11. Peugeot 3008 (Diesel 8HP - 1500 DHS)
        Tax::create([
            'car_id' => 11,
            'year' => 2026,
            'amount' => 1500,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 12. Renault Megane 4 (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 12,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 13. Kia Picanto (Petrol - 350 DHS)
        Tax::create([
            'car_id' => 13,
            'year' => 2026,
            'amount' => 350,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 14. Volkswagen T-Roc (Diesel 8HP - 1500 DHS)
        Tax::create([
            'car_id' => 14,
            'year' => 2026,
            'amount' => 1500,
            'due_date' => '2026-01-31',
            'paid' => true
        ]);

        // 15. Ford Fiesta (Diesel - 700 DHS)
        Tax::create([
            'car_id' => 15,
            'year' => 2026,
            'amount' => 700,
            'due_date' => '2026-01-31',
            'paid' => false
        ]);
    }
}

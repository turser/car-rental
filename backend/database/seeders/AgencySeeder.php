<?php

namespace Database\Seeders;

use App\Models\Agency;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AgencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Agency::create([
            'name' => 'ZoomDrive',
            'city' => 'Nador',
            'address' => 'Centre Ville',
            'phone' => '0656864521'
        ]);

        Agency::create([
            'name' => 'ZoomDrive',
            'city' => 'Nador',
            'address' => 'Rue Mohamed 6 Driouch',
            'phone' => '0702554663'
        ]);
    }
}

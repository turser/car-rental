<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Client::create([
            'full_name' => 'Ahmed Benali',
            'cin' => 'AB123456',
            'driving_license' => 'D123456',
            'driving_license_expiration' => '2030-05-10',
            'phone' => '0612345678',
            'email' => 'ahmed@example.com',
            'address' => 'Nador, Morocco'
        ]);

        Client::create([
            'full_name' => 'Sara El Idrissi',
            'cin' => 'CD789012',
            'driving_license' => 'D789012',
            'driving_license_expiration' => '2029-08-15',
            'phone' => '0623456789',
            'email' => 'sara@example.com',
            'address' => 'Driouch, Morocco'
        ]);

        Client::create([
            'full_name' => 'Youssef Alaoui',
            'cin' => 'EF345678',
            'driving_license' => 'D345678',
            'driving_license_expiration' => '2028-11-20',
            'phone' => '0634567890',
            'email' => 'youssef@example.com',
            'address' => 'Nador, Morocco'
        ]);
    }
}

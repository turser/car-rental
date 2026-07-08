<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        $this->call([
            AgencySeeder::class,
            UserSeeder::class,
            //CarSeeder::class,
            ClientSeeder::class,
            //RentalSeeder::class,
            ServiceSeeder::class,
            //RentalServiceSeeder::class,
            //PaymentSeeder::class,
            //InsuranceSeeder::class,
            //MaintenanceSeeder::class,
            //TaxSeeder::class,
            //CarImageSeeder::class,
        ]);
    }
}

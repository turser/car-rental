<?php

namespace Database\Seeders;

use App\Models\User;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'yasser elkaddouri',
            'email' => 'elkaddouri@test.com',
            'password' => Hash::make('elkaddouri-2020'),
            'role' => 'admin',
            'agency_id' => 1
        ]);

        User::create([
            'name' => 'hamza bouzekoura',
            'email' => 'bouzekoura@test.com',
            'password' => Hash::make('bouzekoura-2020'),
            'role' => 'admin',
            'agency_id' => 1
        ]);
    }
}

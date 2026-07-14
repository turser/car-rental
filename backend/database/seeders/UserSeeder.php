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
            'role' => 'owner',
            'agency_id' => 1
        ]);

        User::create([
            'name' => 'hamza bouzekoura',
            'email' => 'bouzekoura@test.com',
            'password' => Hash::make('bouzekoura-2020'),
            'role' => 'owner',
            'agency_id' => 2
        ]);

         User::create([
            'name' => 'yasser elkaddouri',
            'email' => 'elkaddouri2020@test.com',
            'password' => Hash::make('elkaddouri-2020'),
            'role' => 'admin',
            'agency_id' => 2
        ]);
        User::create([
            'name' => 'amin kanafi',
            'email' => 'kanafi@test.com',
            'password' => Hash::make('kanafi-2020'),
            'role' => 'employee',
            'agency_id' => 2
        ]);
    }
}

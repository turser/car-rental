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
            'driving_license' => '12/123456',
            'driving_license_expiration' => '2030-05-10',
            'phone' => '0612345678',
            'email' => 'ahmed@example.com',
            'address' => 'Nador, Morocco'
        ]);

        Client::create([
            'full_name' => 'Sara El Idrissi',
            'cin' => 'CD789012',
            'driving_license' => '44/789012',
            'driving_license_expiration' => '2029-08-15',
            'phone' => '0623456789',
            'email' => 'sara@example.com',
            'address' => 'Driouch, Morocco'
        ]);

        Client::create([
            'full_name' => 'Youssef Alaoui',
            'cin' => 'EF345678',
            'driving_license' => '12/345678',
            'driving_license_expiration' => '2028-11-20',
            'phone' => '0634567890',
            'email' => 'youssef@example.com',
            'address' => 'Nador, Morocco'
        ]);

        Client::create([
            'full_name' => 'Rachid benammr',
            'cin' => 'S5078',
            'driving_license' => '22/335678',
            'driving_license_expiration' => '2028-11-20',
            'phone' => '0634599890',
            'email' => 'rachid@example.com',
            'address' => 'Nador, Morocco'
        ]);

        Client::create([
            'full_name' => 'Amine El Oudghiri',
            'cin' => 'CD3452',
            'driving_license' => '15/987654',
            'driving_license_expiration' => '2029-05-14',
            'phone' => '0661234567',
            'email' => 'amine.oudghiri@example.com',
            'address' => 'Fes, Morocco'
        ]);

        Client::create([
            'full_name' => 'Sara Alami',
            'cin' => 'BE8901',
            'driving_license' => '01/112233',
            'driving_license_expiration' => '2030-01-10',
            'phone' => '0662345678',
            'email' => 'sara.alami@example.com',
            'address' => 'Casablanca, Morocco'
        ]);

        Client::create([
            'full_name' => 'Youssef Tazi',
            'cin' => 'AA4567',
            'driving_license' => '10/445566',
            'driving_license_expiration' => '2027-08-22',
            'phone' => '0663456789',
            'email' => 'youssef.tazi@example.com',
            'address' => 'Rabat, Morocco'
        ]);

        Client::create([
            'full_name' => 'Layla Jabbar',
            'cin' => 'EE1234',
            'driving_license' => '08/778899',
            'driving_license_expiration' => '2031-12-05',
            'phone' => '0664567890',
            'email' => 'layla.jabbar@example.com',
            'address' => 'Marrakech, Morocco'
        ]);

        Client::create([
            'full_name' => 'Mohamed Amin El Baqqali',
            'cin' => 'K55432',
            'driving_license' => '40/123098',
            'driving_license_expiration' => '2029-03-18',
            'phone' => '0665678901',
            'email' => 'amin.baqqali@example.com',
            'address' => 'Tangier, Morocco'
        ]);

        Client::create([
            'full_name' => 'Fatima Zahra Idrissi',
            'cin' => 'F67890',
            'driving_license' => '25/556677',
            'driving_license_expiration' => '2028-09-30',
            'phone' => '0666789012',
            'email' => 'fz.idrissi@example.com',
            'address' => 'Oujda, Morocco'
        ]);

        Client::create([
            'full_name' => 'Yassine Benjelloun',
            'cin' => 'D98765',
            'driving_license' => '18/889900',
            'driving_license_expiration' => '2032-04-11',
            'phone' => '0667890123',
            'email' => 'yassine.benjelloun@example.com',
            'address' => 'Meknes, Morocco'
        ]);

        Client::create([
            'full_name' => 'Meriem Chaoui',
            'cin' => 'JC1122',
            'driving_license' => '30/223344',
            'driving_license_expiration' => '2029-10-25',
            'phone' => '0668901234',
            'email' => 'meriem.chaoui@example.com',
            'address' => 'Agadir, Morocco'
        ]);

        Client::create([
            'full_name' => 'Othmane El Fassi',
            'cin' => 'L33445',
            'driving_license' => '35/667788',
            'driving_license_expiration' => '2030-07-19',
            'phone' => '0669012345',
            'email' => 'othmane.fassi@example.com',
            'address' => 'Tetouan, Morocco'
        ]);

        Client::create([
            'full_name' => 'Salma Marzouk',
            'cin' => 'S12998',
            'driving_license' => '22/998877',
            'driving_license_expiration' => '2028-02-14',
            'phone' => '0671234567',
            'email' => 'salma.marzouk@example.com',
            'address' => 'Nador, Morocco'
        ]);

        Client::create([
            'full_name' => 'Hamza Mansouri',
            'cin' => 'SH4567',
            'driving_license' => '50/443322',
            'driving_license_expiration' => '2031-11-09',
            'phone' => '0672345678',
            'email' => 'hamza.mansouri@example.com',
            'address' => 'Laayoune, Morocco'
        ]);

        Client::create([
            'full_name' => 'Nadia Sabri',
            'cin' => 'G99881',
            'driving_license' => '12/115599',
            'driving_license_expiration' => '2029-12-01',
            'phone' => '0673456789',
            'email' => 'nadia.sabri@example.com',
            'address' => 'Kenitra, Morocco'
        ]);
    }
}

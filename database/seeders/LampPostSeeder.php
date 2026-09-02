<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class LampPostSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $lampPosts = [];

        for ($i = 1; $i <= 150; $i++) {
            $lampPosts[] = [
                'code_tiang' => 'PJU-' . strtoupper($faker->lexify('BTC-???')) . '-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'type' => $faker->randomElement(['pju', 'traffic_light']),
                'lat' => $faker->latitude(-3.45, -3.44),
                'lng' => $faker->longitude(116.00, 116.01),
                'alamat' => $faker->streetAddress,
                'kecamatan' => $faker->randomElement(['Batulicin', 'Simpang Empat']),
                'kelurahan' => $faker->randomElement(['Gunung Tinggi', 'Kampung Baru', 'Batulicin']),
                'status_lampu' => $faker->randomElement(['active', 'broken', 'maintenance']),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('lamp_posts')->insert($lampPosts);
    }
}

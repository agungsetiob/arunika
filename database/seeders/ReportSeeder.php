<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $reports = [];

        for ($i = 1; $i <= 30; $i++) {
            $reports[] = [
                'user_id' => $faker->numberBetween(1, 3), // asumsi ada user id 1-5
                'lamp_post_id' => $faker->numberBetween(1, 30),
                'type' => $faker->randomElement(['pju', 'traffic_light']),
                'damage_category' => $faker->randomElement([
                    'mati_total', 'redup', 'tiang_miring_roboh', 'kabel_menjuntai', 'lampu_kedip'
                ]),
                'description' => $faker->sentence,
                'lat' => $faker->latitude(-3.45, -3.44),
                'lng' => $faker->longitude(116.00, 116.01),
                'alamat_lengkap' => $faker->address,
                'status' => $faker->randomElement(['pending', 'verified', 'in_progress', 'completed', 'rejected']),
                'priority' => $faker->randomElement(['low', 'medium', 'high', 'emergency']),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('reports')->insert($reports);
    }
}

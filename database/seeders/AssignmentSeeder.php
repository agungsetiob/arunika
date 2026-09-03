<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class AssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $assignments = [];

        for ($i = 1; $i <= 70; $i++) {
            $assignments[] = [
                'report_id' => $i, // asumsi report id 1-130
                'petugas_id' => $faker->numberBetween(3, 7), // sesuai permintaan
                'status' => $faker->randomElement(['assigned', 'accepted', 'on_site', 'completed']),
                'assigned_at' => now(),
                'completed_at' => $faker->optional()->dateTimeThisYear,
                'petugas_notes' => $faker->optional()->sentence,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('assignments')->insert($assignments);
    }
}

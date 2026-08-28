<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssignmentsSeeder extends Seeder
{
    public function run(): void
    {
        $assignments = [
            [
                'report_id' => 1,
                'petugas_id' => 2, // ID petugas yang ada
                'status' => 'assigned',
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'report_id' => 2,
                'petugas_id' => 2,
                'status' => 'accepted',
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'report_id' => 3,
                'petugas_id' => 2,
                'status' => 'on_site',
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('assignments')->insert($assignments);
    }
}

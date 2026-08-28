<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportsSeeder extends Seeder
{
    public function run(): void
    {
        $reports = [
            [
                'user_id' => 1, // misalnya pelapor dengan id 1
                'lamp_post_id' => 1, // referensi ke lamp post PJU-BTC-001
                'type' => 'pju',
                'damage_category' => 'mati_total',
                'description' => 'Lampu jalan mati total di lokasi ini.',
                'lat' => -3.447600,
                'lng' => 116.002300,
                'alamat_lengkap' => 'Jl. Raya Batulicin No.1',
                'status' => 'pending',
                'priority' => 'high',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'lamp_post_id' => 2,
                'type' => 'pju',
                'damage_category' => 'kabel_menjuntai',
                'description' => 'Kabel menjuntai berbahaya di sekitar tiang.',
                'lat' => -3.448150,
                'lng' => 116.003150,
                'alamat_lengkap' => 'Jl. Raya Batulicin No.10',
                'status' => 'verified',
                'priority' => 'emergency',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'lamp_post_id' => 3,
                'type' => 'traffic_light',
                'damage_category' => 'lampu_kedip',
                'description' => 'Lampu merah berkedip terus menerus.',
                'lat' => -3.450250,
                'lng' => 116.005550,
                'alamat_lengkap' => 'Simpang Empat Lampu Merah',
                'status' => 'in_progress',
                'priority' => 'medium',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('reports')->insert($reports);
    }
}

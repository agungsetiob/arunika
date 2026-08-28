<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LampPostSeeder extends Seeder
{
    public function run(): void
    {
        $lampPosts = [
            [
                'code_tiang' => 'PJU-BTC-001',
                'type' => 'pju',
                'lat' => -3.447515, // Koordinat contoh (Batulicin/Tanah Bumbu area)
                'lng' => 116.002235,
                'alamat' => 'Jl. Raya Batulicin No.1',
                'kecamatan' => 'Batulicin',
                'kelurahan' => 'Batulicin',
                'status_lampu' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code_tiang' => 'PJU-BTC-002',
                'type' => 'pju',
                'lat' => -3.448100,
                'lng' => 116.003100,
                'alamat' => 'Jl. Raya Batulicin No.10',
                'kecamatan' => 'Batulicin',
                'kelurahan' => 'Gunung Tinggi',
                'status_lampu' => 'broken',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code_tiang' => 'TL-SMP-001',
                'type' => 'traffic_light',
                'lat' => -3.450200,
                'lng' => 116.005500,
                'alamat' => 'Simpang Empat Lampu Merah',
                'kecamatan' => 'Simpang Empat',
                'kelurahan' => 'Kampung Baru',
                'status_lampu' => 'maintenance',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('lamp_posts')->insert($lampPosts);
    }
}
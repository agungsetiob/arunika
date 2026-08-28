<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $petugasRole = Role::firstOrCreate(['name' => 'petugas']);
        $wargaRole = Role::firstOrCreate(['name' => 'warga']);

        // 2. Buat User Admin Dinas
        $admin = User::firstOrCreate([
            'email' => 'admin@silampu.com'
        ], [
            'name' => 'Admin Dinas PUPR',
            'phone' => '081100000001',
            'nik' => '1234567890123451',
            'password' => Hash::make('password123'), 
        ]);
        $admin->assignRole($adminRole);

        // 3. Buat User Petugas Lapangan
        $petugas = User::firstOrCreate([
            'email' => 'petugas@silampu.com'
        ], [
            'name' => 'Petugas Reaksi Cepat',
            'phone' => '081100000002',
            'nik' => '1234567890123456',
            'password' => Hash::make('password123'),
        ]);
        $petugas->assignRole($petugasRole);

        // 4. Buat User Warga (Pelapor)
        $warga = User::firstOrCreate([
            'email' => 'warga@silampu.com'
        ], [
            'name' => 'Budi Warga',
            'phone' => '081100000003',
            'nik' => '6543210987654321',
            'password' => Hash::make('password123'),
        ]);
        $warga->assignRole($wargaRole);
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Roles
        $adminRole   = Role::firstOrCreate(['name' => 'admin']);
        $petugasRole = Role::firstOrCreate(['name' => 'petugas']);
        $wargaRole   = Role::firstOrCreate(['name' => 'warga']);

        // Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@silampu.com'],
            [
                'name' => 'Admin Dinas',
                'phone' => '081100000001',
                'nik' => '1234567890123451',
                'is_active' => true,
                'password' => Hash::make('password123'),
            ]
        );
        $admin->assignRole($adminRole);

        // Petugas default
        $petugas = User::updateOrCreate(
            ['email' => 'petugas@silampu.com'],
            [
                'name' => 'Petugas Reaksi Cepat',
                'phone' => '081100000002',
                'nik' => '1234567890123456',
                'is_active' => true,
                'password' => Hash::make('password123'),
            ]
        );
        $petugas->assignRole($petugasRole);

        // Warga default
        $warga = User::updateOrCreate(
            ['email' => 'warga@silampu.com'],
            [
                'name' => 'Budi Warga',
                'phone' => '081100000003',
                'nik' => '6543210987654321',
                'is_active' => true,
                'password' => Hash::make('password123'),
            ]
        );
        $warga->assignRole($wargaRole);

        // 7 Petugas tambahan
        for ($i = 1; $i <= 7; $i++) {
            $nik = $faker->unique()->numerify('###############' ); // 15 digits
            $phone = $faker->unique()->numerify('0811########');
            $user = User::create([
                'name' => "Petugas {$i}",
                'email' => "petugas{$i}@silampu.com",
                'phone' => $phone,
                'nik' => $nik,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ]);
            $user->assignRole($petugasRole);
        }

        // 30 Warga tambahan
        for ($i = 1; $i <= 30; $i++) {
            $nik = $faker->unique()->numerify('################' ); // 16 digits
            $phone = $faker->unique()->numerify('0811########');
            $user = User::create([
                'name' => "Warga {$i}",
                'email' => "warga{$i}@silampu.com",
                'phone' => $phone,
                'nik' => $nik,
                'is_active' => true,
                'password' => Hash::make('password123'),
            ]);
            $user->assignRole($wargaRole);
        }
    }
}

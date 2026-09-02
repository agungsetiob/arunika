<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function searchPetugas(?string $search)
    {
        return User::role('petugas')
            ->where('is_active', true)
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->get(['id', 'name', 'phone']);
    }

    public function getActivePetugasList()
    {
        return User::role('petugas')
            ->select('id', 'name', 'phone')
            ->where('is_active', true)
            ->get();
    }
}
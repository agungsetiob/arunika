<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function getFilteredWithReportCounts(array $filters, int $perPage = 10)
    {
        $roleFilter = $filters['role'] ?? null;
        $search = $filters['search'] ?? null;

        return User::with('roles')
            ->when($roleFilter, function ($query) use ($roleFilter) {
                $query->role($roleFilter);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->withCount([
                'reports as accepted_reports_count' => function ($query) {
                    $query->whereIn('status', ['verified', 'in_progress', 'completed']);
                },
                'reports as rejected_reports_count' => function ($query) {
                    $query->where('status', 'rejected');
                }
            ])
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data)
    {
        return User::create($data);
    }

    public function update(User $user, array $data)
    {
        $user->update($data);
        return $user->fresh();
    }

    public function findById(int $id)
    {
        return User::findOrFail($id);
    }

    public function searchPetugas(?string $search)
    {
        return User::role('petugas')
            ->where('is_active', true)
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->get(['id', 'name', 'phone']);
    }

    public function findByPhone(string $phone)
    {
        return User::where('phone', $phone)->first();
    }

    // public function getActivePetugasList()
    // {
    //     return User::role('petugas')
    //         ->select('id', 'name', 'phone')
    //         ->where('is_active', true)
    //         ->get();
    // }

}
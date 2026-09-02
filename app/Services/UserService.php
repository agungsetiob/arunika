<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Exception;

class UserService
{
    protected $repository;

    public function __construct(UserRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function createUser(array $data)
    {
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = true;

        $user = $this->repository->create($data);

        $user->assignRole($data['role']);

        return $user;
    }

    public function updateUser(User $user, array $data)
    {
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        return $this->repository->update($user, $data);
    }

    public function toggleUserStatus(int $userId, int $authUserId)
    {
        if ($userId === $authUserId) {
            throw new Exception('Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $user = $this->repository->findById($userId);
        
        $this->repository->update($user, [
            'is_active' => !$user->is_active
        ]);

        return $user; // Return the updated user instance
    }
}
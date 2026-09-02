<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthService
{
    protected $userRepo;

    public function __construct(UserRepositoryInterface $userRepo)
    {
        $this->userRepo = $userRepo;
    }

    public function registerWarga(array $data): array
    {
        $data['password'] = Hash::make($data['password']);
        $data['is_active'] = true; 
        
        $user = $this->userRepo->create($data);
        $user->assignRole('warga');
        
        $token = $user->createToken('mobile-app')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $token
        ];
    }

    public function login(array $credentials): array
    {
        $user = $this->userRepo->findByPhone($credentials['phone']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['Nomor HP atau password salah.'],
            ]);
        }

        if (!$user->is_active) {
            throw new Exception('Akun Anda telah dinonaktifkan.', 403);
        }

        if (!empty($credentials['fcm_token'])) {
            $this->userRepo->update($user, ['fcm_token' => $credentials['fcm_token']]);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return [
            'user'  => $user,
            'token' => $token,
            'role'  => $user->roles->first()->name ?? 'warga'
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function updateFcmToken(User $user, string $fcmToken): void
    {
        $this->userRepo->update($user, ['fcm_token' => $fcmToken]);
    }
}
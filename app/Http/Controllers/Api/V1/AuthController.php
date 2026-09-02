<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterApiRequest;
use App\Http\Requests\Api\LoginApiRequest;
use App\Http\Requests\Api\UpdateFcmTokenApiRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Exception;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterApiRequest $request)
    {
        $result = $this->authService->registerWarga($request->validated());

        return response()->json([
            'message' => 'Registrasi berhasil',
            'data'    => $result['user'],
            'token'   => $result['token']
        ], 201);
    }

    public function login(LoginApiRequest $request)
    {
        try {
            $result = $this->authService->login($request->validated());

            return response()->json([
                'message' => 'Login berhasil',
                'data'    => $result['user'],
                'role'    => $result['role'],
                'token'   => $result['token']
            ]);
            
        } catch (Exception $e) {
            if ($e->getCode() === 403) {
                return response()->json(['message' => $e->getMessage()], 403);
            }
            throw $e; // Biarkan ValidationException atau error lain ditangani Laravel
        }
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()->load('roles')
        ]);
    }

    public function updateFcmToken(UpdateFcmTokenApiRequest $request)
    {
        $this->authService->updateFcmToken($request->user(), $request->fcm_token);

        return response()->json([
            'message' => 'FCM Token berhasil diperbarui'
        ]);
    }
}
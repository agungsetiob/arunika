<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AssignmentController;
use App\Http\Controllers\Api\V1\LampPostController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Auth Warga & Petugas
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/fcm-token', [AuthController::class, 'updateFcmToken']);
        Route::put('/profile', [ProfileController::class, 'update']);

        // Warga: Laporan
        Route::get('/reports/me', [ReportController::class, 'myReports']);
        Route::post('/reports', [ReportController::class, 'store']);
        Route::get('/reports/{id}', [ReportController::class, 'show']);
        Route::get('/lamp-posts/nearby', [LampPostController::class, 'nearby']);

        Route::middleware(['role:admin'])->prefix('admin')->group(function () {
            Route::get('/reports', [AdminController::class, 'getPendingReports']);
            Route::get('/petugas', [AdminController::class, 'getPetugasList']);
            Route::post('/reports/{id}/verify', [AdminController::class, 'verifyReport']);
            Route::post('/reports/{id}/reject', [AdminController::class, 'rejectReport']);
            Route::post('/assignments', [AdminController::class, 'assignPetugas']);
        });

        Route::middleware('role:petugas')->prefix('petugas')->group(function () {
            Route::get('/assignments', [AssignmentController::class, 'index']);
            Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
            Route::post('/assignments/{id}/update-status', [AssignmentController::class, 'updateStatus']);
        });
    });
});
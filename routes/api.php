<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AssignmentController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\LampPostController;
use App\Http\Controllers\Api\V1\NotificationController;
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
        Route::post('/fcm-token', [AuthController::class, 'updateFcmToken']);
        Route::put('/profile', [ProfileController::class, 'update']);

        // Warga: Laporan
        Route::get('/reports/me', [ReportController::class, 'myReports']);
        Route::post('/reports', [ReportController::class, 'store']);
        Route::get('/reports/{id}', [ReportController::class, 'show']);
        Route::get('/lamp-posts/nearby', [LampPostController::class, 'nearby']);

        Route::middleware(['role:admin'])->prefix('admin')->group(function () {
            Route::get('/dashboard-stats', [DashboardController::class, 'index']);
            Route::get('/reports', [AdminController::class, 'getPendingReports']);
            Route::get('/petugas', [AdminController::class, 'getPetugasList']);
            Route::post('/reports/{id}/verify', [AdminController::class, 'verifyReport']);
            Route::post('/reports/{id}/reject', [AdminController::class, 'rejectReport']);
            Route::post('/assignments', [AdminController::class, 'assignPetugas']);
            Route::get('/reports/{id}', function ($id) {
                $report = \App\Models\Report::with(['user', 'media', 'assignment.petugas'])->findOrFail($id);
                return response()->json(['status' => 'success', 'data' => $report]);
            });
        });

        Route::middleware('role:petugas')->prefix('petugas')->group(function () {
            Route::get('/assignments', [AssignmentController::class, 'index']);
            Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
            Route::post('/assignments/{id}/update-status', [AssignmentController::class, 'updateStatus']);
        });

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        });
    });
});

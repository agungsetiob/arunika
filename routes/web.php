<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LampPostController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

// 2. Tambahkan fallback route 'dashboard' untuk menangani redirect bawaan Breeze
Route::get('/dashboard', function () {
    return redirect()->route('admin.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:admin|super_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Reports Management
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::post('/reports/{report}/verify', [ReportController::class, 'verify'])->name('reports.verify');
    Route::post('/reports/{report}/assign', [ReportController::class, 'assign'])->name('reports.assign');
    Route::post('/reports/{report}/reject', [ReportController::class, 'reject'])->name('reports.reject');

    Route::get('/admin/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/admin/lamp-posts/export', [LampPostController::class, 'export'])->name('lamp-posts.export');

    // Master Lamp Posts
    Route::resource('lamp-posts', LampPostController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';

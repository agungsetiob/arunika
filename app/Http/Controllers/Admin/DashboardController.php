<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Ambil data statistik laporan
        $stats = [
            'total' => Report::count(),
            'pending' => Report::where('status', 'pending')->count(),
            'in_progress' => Report::whereIn('status', ['verified', 'in_progress'])->count(),
            'completed' => Report::where('status', 'completed')->count(),
        ];

        // 2. Ambil semua data koordinat laporan untuk ditaruh di peta
        $reports = Report::select('id', 'damage_category', 'status', 'lat', 'lng', 'alamat_lengkap')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'mapReports' => $reports
        ]);
    }
}
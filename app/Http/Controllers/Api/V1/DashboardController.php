<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\LampPost;

class DashboardController extends Controller
{
    public function index()
    {
        $reports = [
            'total' => Report::count(),
            'pending' => Report::whereIn('status', ['pending', 'verified'])->count(),
            'in_progress' => Report::whereIn('status', ['assigned', 'in_progress'])->count(),
            'completed' => Report::where('status', 'completed')->count(),
        ];

        $assets = [
            'total' => LampPost::count(),
            'active' => LampPost::where('status_lampu', 'active')->count(),
            'broken' => LampPost::where('status_lampu', 'broken')->count(),
            'maintenance' => LampPost::where('status_lampu', 'maintenance')->count(),
        ];

        $recent_reports = Report::with(['user:id,name', 'lampPost:id,code_tiang'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // TAMBAHKAN KEMBALI DATA PETA SEBARAN
        $mapReports = Report::select('id', 'damage_category', 'status', 'lat', 'lng', 'alamat_lengkap')
            ->where('status', 'pending')
            ->orWhere('status', 'verified')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'reports' => $reports,
                'assets' => $assets,
                'recent_reports' => $recent_reports,
                'mapReports' => $mapReports
            ]
        ]);
    }
}
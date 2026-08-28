<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = Report::with(['user', 'lampPost'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports
        ]);
    }

    public function show(Report $report)
    {
        $report->load(['user', 'lampPost', 'media', 'histories.changedBy', 'assignment.petugas']);
        
        // Ambil daftar petugas untuk dropdown assignment
        $petugas = User::role('petugas')->get(['id', 'name']);
        
        return Inertia::render('Admin/Reports/Show', [
            'report' => $report,
            'petugas' => $petugas
        ]);
    }

    public function verify(Request $request, Report $report)
    {
        $report->update(['status' => 'verified']);
        
        $report->histories()->create([
            'changed_by' => $request->user()->id,
            'from_status' => 'pending',
            'to_status' => 'verified',
            'notes' => 'Laporan dinyatakan valid dan diverifikasi oleh Admin.'
        ]);

        return back();
    }

    public function reject(Request $request, Report $report)
    {
        $request->validate(['notes' => 'required|string|max:255']);

        $report->update(['status' => 'rejected']);
        
        $report->histories()->create([
            'changed_by' => $request->user()->id,
            'from_status' => 'pending',
            'to_status' => 'rejected',
            'notes' => $request->notes
        ]);

        return back();
    }

    public function assign(Request $request, Report $report)
    {
        $request->validate(['petugas_id' => 'required|exists:users,id']);

        // Update status laporan
        $report->update(['status' => 'in_progress']);
        
        // Buat record assignment
        $report->assignment()->create([
            'petugas_id' => $request->petugas_id,
            'status' => 'assigned'
        ]);

        // Catat riwayat
        $report->histories()->create([
            'changed_by' => $request->user()->id,
            'from_status' => 'verified',
            'to_status' => 'in_progress',
            'notes' => 'Laporan diteruskan ke petugas lapangan.'
        ]);

        // (Opsional nanti) Trigger Push Notification FCM ke aplikasi petugas di sini

        return back();
    }
}
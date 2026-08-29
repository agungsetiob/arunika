<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getPendingReports(Request $request)
    {
        // Parameter status=pending,verified dari frontend
        $statuses = explode(',', $request->query('status', 'pending'));
        
        $reports = Report::with(['media', 'lampPost'])
            ->whereIn('status', $statuses)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(9);

        return response()->json($reports);
    }

    public function getPetugasList()
    {
        // Pastikan package Spatie Permission sudah terinstall di Laravel
        $petugas = User::role('petugas')->select('id', 'name', 'phone')->get();
        
        return response()->json(['data' => $petugas]);
    }

    // Fungsi untuk Verifikasi Laporan
    public function verifyReport(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $report = Report::findOrFail($id);
            $report->update(['status' => 'verified']);
            
            $report->histories()->create([
                'changed_by' => $request->user()->id,
                'from_status' => 'pending',
                'to_status' => 'verified',
                'notes' => 'Laporan dinyatakan valid dan diverifikasi oleh Admin (via Mobile).'
            ]);

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Laporan berhasil diverifikasi.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Fungsi untuk Menolak Laporan
    public function rejectReport(Request $request, $id)
    {
        $request->validate(['notes' => 'required|string|max:255']);

        DB::beginTransaction();
        try {
            $report = Report::findOrFail($id);
            $report->update(['status' => 'rejected']);
            
            $report->histories()->create([
                'changed_by' => $request->user()->id,
                'from_status' => 'pending',
                'to_status' => 'rejected',
                'notes' => $request->notes
            ]);

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Laporan berhasil ditolak.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Mengeksekusi penugasan (Assign)
    public function assignPetugas(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
            'user_id' => 'required|exists:users,id', // Dari mobile kita kirim user_id untuk petugas
        ]);

        DB::beginTransaction();
        try {
            $report = Report::findOrFail($validated['report_id']);
            $oldStatus = $report->status; // Simpan status lama untuk history
            
            // 1. Update status laporan (Sesuai alur Web CMS)
            $report->update(['status' => 'in_progress']);

            // 2. Buat record assignment
            $report->assignment()->create([
                'petugas_id' => $validated['user_id'],
                'status' => 'assigned'
            ]);

            // 3. Catat riwayat (Sesuai alur Web CMS)
            $report->histories()->create([
                'changed_by' => $request->user()->id,
                'from_status' => $oldStatus,
                'to_status' => 'in_progress',
                'notes' => 'Laporan diteruskan ke petugas lapangan (via Mobile).'
            ]);

            DB::commit();

            /* --- COMMENT SEMENTARA UNTUK FCM ---
            // (Opsional nanti) Trigger Push Notification FCM ke aplikasi petugas di sini
            ------------------------------------------------ */

            return response()->json([
                'status' => 'success',
                'message' => 'Tugas berhasil diberikan kepada petugas.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memberikan tugas: ' . $e->getMessage()
            ], 500);
        }
    }
}
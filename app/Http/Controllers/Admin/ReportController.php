<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $query = Report::with(['user', 'lampPost'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('alamat_lengkap', 'like', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->paginate(10)->withQueryString();

        return inertia('Admin/Reports/Index', [
            'reports' => $reports,
            'filters' => $request->only(['search', 'status'])
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
        // 1. Tambahkan validasi priority
        $validated = $request->validate([
            'petugas_id' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high,emergency',
        ]);

        DB::beginTransaction();
        try {
            // 2. Update status DAN priority laporan
            $report->update([
                'status' => 'in_progress',
                'priority' => $validated['priority']
            ]);
            
            // Buat record assignment
            $report->assignment()->create([
                'petugas_id' => $validated['petugas_id'],
                'status' => 'assigned'
            ]);

            // Catat riwayat beserta info prioritasnya
            $report->histories()->create([
                'changed_by' => $request->user()->id,
                'from_status' => 'verified',
                'to_status' => 'in_progress',
                'notes' => 'Laporan diteruskan ke petugas lapangan. Prioritas: ' . strtoupper($validated['priority'])
            ]);

            DB::commit();

            // ==========================================
            // KIRIM FCM NOTIFICATION KE PETUGAS
            // ==========================================
            $petugas = User::find($validated['petugas_id']);

            if ($petugas && $petugas->fcm_token) {
                try {
                    $messaging = Firebase::messaging();

                    $message = CloudMessage::new()
                        ->withToken($petugas->fcm_token)
                        ->withNotification(Notification::create(
                            '🚨 Tugas Baru! (' . strtoupper($validated['priority']) . ')', // Tambahkan info prioritas di Judul Notif
                            'Tugas perbaikan ' . strtoupper($report->type) . ' di ' . $report->alamat_lengkap . '.'
                        ));

                    $messaging->send($message);
                } catch (\Exception $e) {
                    Log::error('Gagal mengirim FCM Assign Web: ' . $e->getMessage());
                }
            }

            $petugas->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\Assignment',
                'data' => [
                    'title' => 'Tugas Baru (' . strtoupper($validated['priority']) . ')',
                    'body' => 'Ada tugas perbaikan di ' . $report->alamat_lengkap,
                    'type' => 'assignment'
                ],
            ]);

            return redirect()->back()->with('success', 'Petugas berhasil ditugaskan dengan prioritas ' . strtoupper($validated['priority']) . '.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menugaskan petugas: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $query = Report::with(['user', 'lampPost'])->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('alamat_lengkap', 'like', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->get();
        $fileName = 'Laporan_Arunika_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID Tiket', 'Tanggal', 'Nama Pelapor', 'Telepon', 'Jenis', 'Kategori', 'Status', 'Alamat Lengkap'];

        $callback = function() use($reports, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($reports as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->created_at->format('Y-m-d H:i'),
                    $row->user->name,
                    $row->user->phone,
                    $row->type == 'pju' ? 'PJU' : 'Traffic Light',
                    str_replace('_', ' ', strtoupper($row->damage_category)),
                    strtoupper($row->status),
                    $row->alamat_lengkap
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Facades\DB;

class AssignmentController extends Controller
{
    /**
     * Menampilkan daftar tugas (Assignment) milik Petugas yang sedang login.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');

        $assignments = Assignment::where('petugas_id', $request->user()->id)
            ->with(['report.lampPost', 'report.user:id,name,phone'])
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(9);

        return response()->json($assignments);
    }

    /**
     * Menampilkan detail satu tugas spesifik.
     */
    public function show(Request $request, $id)
    {
        $assignment = Assignment::with(['report.media', 'report.lampPost', 'report.user:id,name,phone'])
            ->where('petugas_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $assignment
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $assignment = Assignment::where('petugas_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:accepted,on_site,completed',
            'petugas_notes' => 'nullable|string',
            'photo_after' => 'required_if:status,completed|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $newStatus = $validated['status'];

            // 1. Update data Assignment
            $assignment->status = $newStatus;
            if (isset($validated['petugas_notes'])) {
                $assignment->petugas_notes = $validated['petugas_notes'];
            }
            if ($newStatus === 'completed') {
                $assignment->completed_at = now();
            }
            $assignment->save();

            // 2. Handle jika tugas dinyatakan Selesai (Completed)
            if ($newStatus === 'completed') {
                $report = $assignment->report;

                // Update status laporan utama
                $report->update(['status' => 'completed']);

                // Catat history laporan
                $report->histories()->create([
                    'changed_by' => $request->user()->id,
                    'from_status' => 'in_progress',
                    'to_status' => 'completed',
                    'notes' => 'Pengerjaan selesai. ' . ($validated['petugas_notes'] ?? '')
                ]);

                // Upload Foto "After" (Bukti pengerjaan selesai)
                if ($request->hasFile('photo_after')) {
                    $path = $request->file('photo_after')->store('reports', 'public');

                    $report->media()->create([
                        'file_path' => $path,
                        'type' => 'after'
                    ]);
                }

                // ==========================================
                // 3. KIRIM FCM NOTIFICATION KE WARGA (PELAPOR)
                // ==========================================
                $warga = $report->user; // Ambil data warga dari relasi laporan

                if ($warga && $warga->fcm_token) {
                    try {
                        $messaging = Firebase::messaging();

                        $message = CloudMessage::withTarget('token', $warga->fcm_token)
                            ->withNotification(Notification::create(
                                '✅ Laporan Selesai Diperbaiki!',
                                'Laporan ' . strtoupper($report->type) . ' di ' . $report->alamat_lengkap . ' telah selesai ditangani. Terima kasih atas laporan Anda!'
                            ));

                        $messaging->send($message);
                    } catch (\Exception $e) {
                        // Log error FCM tapi JANGAN gagalkan transaksi DB
                        \Log::error('FCM Error (Petugas ke Warga): ' . $e->getMessage());
                    }
                }
                // ==========================================

                $warga->notifications()->create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\ReportCompleted', // Penanda tipe notifikasi
                    'data' => [
                        'title' => '✅ Laporan Selesai Diperbaiki!',
                        'body' => 'Laporan ' . strtoupper($report->type) . ' di ' . $report->alamat_lengkap . ' telah selesai ditangani. Terima kasih atas laporan Anda!',
                        'type' => 'completed' // Ini untuk ikon di React Native nanti
                    ],
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Status pengerjaan berhasil diupdate.',
                'data' => $assignment->fresh(['report.media'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengupdate status: ' . $e->getMessage()
            ], 500);
        }
    }
}
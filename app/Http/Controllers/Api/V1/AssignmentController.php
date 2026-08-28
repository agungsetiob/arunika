<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssignmentController extends Controller
{
    /**
     * Menampilkan daftar tugas (Assignment) milik Petugas yang sedang login.
     */
    public function index(Request $request)
    {
        $status = $request->query('status'); // Bisa filter by status (assigned, completed)

        $assignments = Assignment::where('petugas_id', $request->user()->id)
            ->with(['report.lampPost', 'report.user:id,name,phone']) // Ambil relasi penting
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $assignments
        ]);
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

    /**
     * Update status pekerjaan oleh Petugas di lapangan.
     */
    public function updateStatus(Request $request, $id)
    {
        $assignment = Assignment::where('petugas_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:accepted,on_site,completed',
            'petugas_notes' => 'nullable|string', // Catatan misal: "Ganti bohlam LED 40W"
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
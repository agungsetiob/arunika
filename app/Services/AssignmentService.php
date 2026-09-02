<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Report;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;

class AssignmentService
{
    public function updateAssignmentStatus(Assignment $assignment, array $data, $photoAfter, int $petugasId)
    {
        DB::beginTransaction();
        try {
            $newStatus = $data['status'];

            // 1. Update data Assignment
            $assignment->status = $newStatus;
            if (isset($data['petugas_notes'])) {
                $assignment->petugas_notes = $data['petugas_notes'];
            }
            if ($newStatus === 'completed') {
                $assignment->completed_at = now();
            }
            $assignment->save();

            // 2. Handle jika tugas dinyatakan Selesai (Completed)
            if ($newStatus === 'completed') {
                $report = $assignment->report;

                $report->update(['status' => 'completed']);

                $report->histories()->create([
                    'changed_by'  => $petugasId,
                    'from_status' => 'in_progress',
                    'to_status'   => 'completed',
                    'notes'       => 'Pengerjaan selesai. ' . ($data['petugas_notes'] ?? '')
                ]);

                // Upload Foto "After"
                if ($photoAfter) {
                    $path = $photoAfter->store('reports', 'public');
                    $report->media()->create([
                        'file_path' => $path,
                        'type'      => 'after'
                    ]);
                }

                // Kirim notifikasi ke pelapor
                $this->notifyWargaOnCompletion($report);
            }

            DB::commit();

            return $assignment->fresh(['report.media']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function notifyWargaOnCompletion(Report $report)
    {
        $warga = $report->user;

        if (!$warga) return;

        // 1. Kirim FCM Notification
        if ($warga->fcm_token) {
            try {
                $messaging = Firebase::messaging();
                $message = CloudMessage::new()
                    ->withToken($warga->fcm_token)
                    ->withNotification(Notification::create(
                        '✅ Laporan Selesai Diperbaiki!',
                        'Laporan ' . strtoupper($report->type) . ' di ' . $report->alamat_lengkap . ' telah selesai ditangani. Terima kasih atas laporan Anda!'
                    ));

                $messaging->send($message);
            } catch (\Exception $e) {
                Log::error('FCM Error (Petugas ke Warga): ' . $e->getMessage());
            }
        }

        // 2. Simpan DB Notification
        try {
            $warga->notifications()->create([
                'id'   => Str::uuid(),
                'type' => 'App\Notifications\ReportCompleted',
                'data' => [
                    'title' => '✅ Laporan Selesai Diperbaiki!',
                    'body'  => 'Laporan ' . strtoupper($report->type) . ' di ' . $report->alamat_lengkap . ' telah selesai ditangani. Terima kasih atas laporan Anda!',
                    'type'  => 'completed'
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('DB Notification Error (Petugas ke Warga): ' . $e->getMessage());
        }
    }
}
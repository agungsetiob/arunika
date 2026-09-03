<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use App\Repositories\Contracts\ReportRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportService
{
    protected $repository;

    public function __construct(ReportRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function verifyReport(Report $report, int $adminId, string $customNotes = 'Laporan dinyatakan valid dan diverifikasi oleh Admin.')
    {
        $report->update(['status' => 'verified']);
        $report->histories()->create([
            'changed_by'  => $adminId,
            'from_status' => 'pending',
            'to_status'   => 'verified',
            'notes'       => $customNotes
        ]);
    }

    public function rejectReport(Report $report, string $notes, int $adminId)
    {
        $report->update(['status' => 'rejected']);
        $report->histories()->create([
            'changed_by'  => $adminId,
            'from_status' => 'pending',
            'to_status'   => 'rejected',
            'notes'       => $notes
        ]);
    }

    public function assignPetugas(Report $report, array $data, int $adminId, string $context = '')
    {
        DB::beginTransaction();
        try {
            $oldStatus = $report->status;

            $report->update([
                'status'   => 'in_progress',
                'priority' => $data['priority']
            ]);

            $report->assignment()->create([
                'petugas_id' => $data['user_id'] ?? $data['petugas_id'],
                'status'     => 'assigned'
            ]);

            $noteText = 'Laporan diteruskan ke petugas lapangan' . ($context ? " ($context)" : '') . '. Prioritas: ' . strtoupper($data['priority']);

            $report->histories()->create([
                'changed_by'  => $adminId,
                'from_status' => $oldStatus,
                'to_status'   => 'in_progress',
                'notes'       => $noteText
            ]);

            DB::commit();

            $this->sendAssignmentNotification($data['user_id'] ?? $data['petugas_id'], $report, $data['priority']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function sendAssignmentNotification(int $petugasId, Report $report, string $priority)
    {
        $petugas = User::find($petugasId);
        if (!$petugas) return;

        $assignment = $report->assignment()->create([
            'petugas_id' => $petugas->id,
            'status' => 'assigned'
        ]);

        // 1. Send FCM Web Notification
        if ($petugas->fcm_token) {
            try {
                $messaging = Firebase::messaging();
                $message = CloudMessage::new()
                    ->withToken($petugas->fcm_token)
                    ->withNotification(Notification::create(
                        '🚨 Tugas Baru! (' . strtoupper($priority) . ')',
                        'Tugas perbaikan ' . strtoupper($report->type) . ' di ' . $report->alamat_lengkap . '.'
                    ));

                $messaging->send($message);
            } catch (\Exception $e) {
                Log::error('Gagal mengirim FCM Assign Web: ' . $e->getMessage());
            }
        }

        // 2. Save DB Notification
        $petugas->notifications()->create([
            'id'   => Str::uuid(),
            'type' => 'App\Notifications\Assignment',
            'data' => [
                'title' => 'Tugas Baru (' . strtoupper($priority) . ')',
                'body'  => 'Ada tugas perbaikan di ' . $report->alamat_lengkap,
                'type'  => 'assignment',
                'assignment_id' => $assignment->id,
                'report_id'     => $report->id,
            ],
        ]);
    }

    public function exportCsv(array $filters): StreamedResponse
    {
        $reports = $this->repository->getFiltered($filters, false);
        $fileName = 'Laporan_Arunika_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID Tiket', 'Tanggal', 'Nama Pelapor', 'Telepon', 'Jenis', 'Kategori', 'Status', 'Alamat Lengkap'];

        $callback = function () use ($reports, $columns) {
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

    public function createCitizenReport(array $data, array $photos, int $userId)
    {
        DB::beginTransaction();
        try {
            $report = Report::create([
                'user_id'         => $userId,
                'type'            => $data['type'],
                'damage_category' => $data['damage_category'],
                'lat'             => $data['lat'],
                'lng'             => $data['lng'],
                'alamat_lengkap'  => $data['alamat_lengkap'],
                'description'     => $data['description'] ?? null,
                'status'          => 'pending',
            ]);

            // Handle Upload Foto
            foreach ($photos as $photo) {
                $path = $photo->store('reports', 'public');
                $report->media()->create([
                    'file_path' => $path,
                    'type'      => 'before'
                ]);
            }

            // Catat History
            $report->histories()->create([
                'changed_by'  => $userId,
                'from_status' => null,
                'to_status'   => 'pending',
                'notes'       => 'Laporan dibuat oleh warga.'
            ]);

            DB::commit();

            // Panggil fungsi notifikasi
            $this->notifyAdminsOnNewReport($report);

            return $report;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function notifyAdminsOnNewReport(Report $report)
    {
        $admins = User::role('admin')->get();
        $adminTokens = $admins->whereNotNull('fcm_token')->pluck('fcm_token')->toArray();

        // 1. FCM Multicast
        if (!empty($adminTokens)) {
            try {
                $messaging = Firebase::messaging();
                $message = CloudMessage::new()
                    ->withNotification(Notification::create(
                        '🚨 Laporan Baru Masuk!',
                        'Ada kerusakan ' . str_replace('_', ' ', $report->damage_category) . ' di area ' . $report->alamat_lengkap
                    ));

                $messaging->sendMulticast($message, $adminTokens);
            } catch (\Exception $e) {
                Log::error('Gagal mengirim FCM Multicast ke Admin: ' . $e->getMessage());
            }
        }

        // 2. Database Notification
        foreach ($admins as $admin) {
            $admin->notifications()->create([
                'id'   => \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\NewReport',
                'data' => [
                    'title' => 'Laporan Baru Masuk!',
                    'body'  => 'Kerusakan ' . str_replace('_', ' ', $report->damage_category) . ' di ' . $report->alamat_lengkap,
                    'type'  => 'alert',
                    'report_id' => $report->id
                ],
            ]);
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Assignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class KpiController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil semua user dengan role 'petugas' beserta jumlah tugasnya
        $petugasData = User::role('petugas')
            ->withCount(['assignments as total_tasks'])
            ->withCount(['assignments as completed_tasks' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->get()
            ->map(function ($petugas) {
                // 2. Hitung Rata-rata Waktu Penyelesaian (SLA)
                $completedAssignments = Assignment::where('petugas_id', $petugas->id)
                    ->where('status', 'completed')
                    ->whereNotNull('completed_at')
                    ->whereNotNull('assigned_at')
                    ->get();

                $totalMinutes = 0;
                $count = $completedAssignments->count();

                foreach ($completedAssignments as $task) {
                    $assigned = Carbon::parse($task->assigned_at);
                    $completed = Carbon::parse($task->completed_at);
                    $totalMinutes += $assigned->diffInMinutes($completed);
                }

                // Rata-rata dalam menit
                $petugas->avg_completion_minutes = $count > 0 ? round($totalMinutes / $count) : 0;

                // Format ke Jam dan Menit untuk UI (Misal: 1j 30m)
                $hours = floor($petugas->avg_completion_minutes / 60);
                $minutes = $petugas->avg_completion_minutes % 60;
                $petugas->avg_time_formatted = $count > 0 ? "{$hours}j {$minutes}m" : '-';
                
                // Hitung Persentase Keberhasilan (Completion Rate)
                $petugas->completion_rate = $petugas->total_tasks > 0 
                    ? round(($petugas->completed_tasks / $petugas->total_tasks) * 100) 
                    : 0;

                return $petugas;
            })
            // Urutkan dari yang paling banyak menyelesaikan tugas (Ranking 1 di atas)
            ->sortByDesc('completed_tasks')
            ->values();

        // 3. Hitung Rekapitulasi Global untuk Summary Cards
        $totalPetugas = $petugasData->count();
        $totalCompletedAll = $petugasData->sum('completed_tasks');
        $avgGlobalMinutes = $petugasData->where('completed_tasks', '>', 0)->avg('avg_completion_minutes') ?? 0;
        
        $gHours = floor($avgGlobalMinutes / 60);
        $gMins = round($avgGlobalMinutes % 60);

        return Inertia::render('Admin/KPI/Index', [
            'petugasData' => $petugasData,
            'summary' => [
                'total_petugas' => $totalPetugas,
                'total_completed' => $totalCompletedAll,
                'avg_response_time' => "{$gHours}j {$gMins}m",
            ]
        ]);
    }
}
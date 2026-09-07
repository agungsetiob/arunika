<?php

namespace App\Services;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use Carbon\Carbon;

class KpiService
{
    protected $userRepo;
    protected $assignmentRepo;

    public function __construct(UserRepositoryInterface $userRepo, AssignmentRepositoryInterface $assignmentRepo)
    {
        $this->userRepo = $userRepo;
        $this->assignmentRepo = $assignmentRepo;
    }

    public function getKpiDashboardData(): array
    {
        $petugasList = $this->userRepo->getPetugasWithTaskCounts();

        $petugasData = $petugasList->map(function ($petugas) {
            $completedAssignments = $this->assignmentRepo->getCompletedAssignmentsByPetugas($petugas->id);

            $totalMinutes = 0;
            $validTasks = 0;

            foreach ($completedAssignments as $task) {
                $timeStart = $task->assigned_at ?? $task->created_at; 
                
                if (!$timeStart || !$task->completed_at) continue;

                $assigned = Carbon::parse($timeStart);
                $completed = Carbon::parse($task->completed_at);

                if ($completed->isBefore($assigned)) {
                    continue; 
                }

                $totalMinutes += $assigned->diffInMinutes($completed);
                $validTasks++;
            }

            $petugas->avg_completion_minutes = $validTasks > 0 ? (int) round($totalMinutes / $validTasks) : 0;

            $hours = (int) floor($petugas->avg_completion_minutes / 60);
            $minutes = $petugas->avg_completion_minutes % 60;
            $petugas->avg_time_formatted = $validTasks > 0 ? "{$hours}j {$minutes}m" : '-';
            
            $petugas->completion_rate = $petugas->total_tasks > 0 
                ? (int) round(($petugas->completed_tasks / $petugas->total_tasks) * 100) 
                : 0;

            return $petugas;
        })
        ->sortByDesc('completed_tasks')
        ->values();

        $totalPetugas = $petugasData->count();
        $totalCompletedAll = $petugasData->sum('completed_tasks');
        $avgGlobalMinutes = $petugasData->where('completed_tasks', '>', 0)->avg('avg_completion_minutes') ?? 0;
        
        $gHours = (int) floor($avgGlobalMinutes / 60);
        $gMins = (int) round($avgGlobalMinutes % 60);

        return [
            'petugasData' => $petugasData,
            'summary' => [
                'total_petugas'     => $totalPetugas,
                'total_completed'   => $totalCompletedAll,
                'avg_response_time' => "{$gHours}j {$gMins}m",
            ]
        ];
    }
}
<?php

namespace App\Repositories;

use App\Models\Report;
use App\Repositories\Contracts\ReportRepositoryInterface;

class ReportRepository implements ReportRepositoryInterface
{
    public function getFiltered(array $filters, bool $paginate = true)
    {
        $query = Report::with(['user', 'lampPost'])->orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('alamat_lengkap', 'like', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $paginate ? $query->paginate(10)->withQueryString() : $query->get();
    }

    public function loadDetails(Report $report)
    {
        return $report->load(['user', 'lampPost', 'media', 'histories.changedBy', 'assignment.petugas']);
    }

    public function findById(int $id)
    {
        return Report::findOrFail($id);
    }

    public function getByStatuses(array $statuses, int $perPage = 9)
    {
        return Report::with(['media', 'lampPost'])
            ->whereIn('status', $statuses)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function findDuplicateByLocation(float $lat, float $lng, int $radius = 20)
    {
        return Report::select('*')
            ->selectRaw(
                '( 6371000 * acos( cos( radians(?) ) *
                  cos( radians( lat ) )
                  * cos( radians( lng ) - radians(?)
                  ) + sin( radians(?) ) *
                  sin( radians( lat ) ) )
                ) AS distance',
                [$lat, $lng, $lat]
            )
            ->whereIn('status', ['pending', 'verified', 'in_progress'])
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->first();
    }

    public function getUserReports(int $userId, int $perPage = 9)
    {
        return Report::where('user_id', $userId)
            ->with(['media' => function ($q) {
                $q->where('type', 'before');
            }])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function getUserReportById(int $userId, int $reportId)
    {
        return Report::where('user_id', $userId)
            ->with([
                'media',
                'lampPost',
                'histories' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                }
            ])
            ->findOrFail($reportId);
    }
}
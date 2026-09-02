<?php

namespace App\Repositories;

use App\Models\Assignment;
use App\Repositories\Contracts\AssignmentRepositoryInterface;

class AssignmentRepository implements AssignmentRepositoryInterface
{
    public function getPetugasAssignments(int $petugasId, ?string $status, int $perPage = 9)
    {
        return Assignment::where('petugas_id', $petugasId)
            ->with(['report.lampPost', 'report.user:id,name,phone'])
            ->when($status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    public function getPetugasAssignmentById(int $petugasId, int $assignmentId)
    {
        return Assignment::with(['report.media', 'report.lampPost', 'report.user:id,name,phone'])
            ->where('petugas_id', $petugasId)
            ->findOrFail($assignmentId);
    }
}
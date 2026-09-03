<?php

namespace App\Repositories\Contracts;

interface AssignmentRepositoryInterface
{
    public function getPetugasAssignments(int $petugasId, ?string $status, int $perPage = 9);
    public function getPetugasAssignmentById(int $petugasId, int $assignmentId);
}
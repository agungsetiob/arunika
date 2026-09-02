<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateAssignmentStatusApiRequest;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Services\AssignmentService;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    protected $repository;
    protected $service;

    public function __construct(AssignmentRepositoryInterface $repository, AssignmentService $service)
    {
        $this->repository = $repository;
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $assignments = $this->repository->getPetugasAssignments(
            $request->user()->id, 
            $request->query('status')
        );

        return response()->json($assignments);
    }

    public function show(Request $request, $id)
    {
        try {
            $assignment = $this->repository->getPetugasAssignmentById($request->user()->id, $id);

            return response()->json([
                'status' => 'success',
                'data'   => $assignment
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tugas tidak ditemukan.'
            ], 404);
        }
    }

    public function updateStatus(UpdateAssignmentStatusApiRequest $request, $id)
    {
        try {
            $assignment = $this->repository->getPetugasAssignmentById($request->user()->id, $id);
            $validated = $request->validated();

            $updatedAssignment = $this->service->updateAssignmentStatus(
                $assignment,
                $validated,
                $request->file('photo_after'),
                $request->user()->id
            );

            return response()->json([
                'status'  => 'success',
                'message' => 'Status pengerjaan berhasil diupdate.',
                'data'    => $updatedAssignment
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tugas tidak ditemukan.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal mengupdate status: ' . $e->getMessage()
            ], 500);
        }
    }
}
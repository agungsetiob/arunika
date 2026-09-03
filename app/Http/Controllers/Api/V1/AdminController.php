<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RejectReportApiRequest;
use App\Http\Requests\Api\AssignPetugasApiRequest;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Repositories\UserRepository;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    protected $reportRepo;
    protected $userRepo;
    protected $reportService;

    public function __construct(
        ReportRepositoryInterface $reportRepo, 
        UserRepository $userRepo, 
        ReportService $reportService
    ) {
        $this->reportRepo = $reportRepo;
        $this->userRepo = $userRepo;
        $this->reportService = $reportService;
    }

    public function getPendingReports(Request $request)
    {
        $statuses = explode(',', $request->query('status', 'pending'));
        $reports = $this->reportRepo->getByStatuses($statuses, 9);

        return response()->json($reports);
    }

    public function getPetugasList(Request $request)
    {
        $petugas = $this->userRepo->searchPetugas($request->query('search'));

        return response()->json(['data' => $petugas]);
    }

    public function verifyReport(Request $request, $id)
    {
        try {
            $report = $this->reportRepo->findById($id);
            
            // Pass custom note khusus API mobile
            $this->reportService->verifyReport($report, $request->user()->id, 'Laporan dinyatakan valid dan diverifikasi oleh Admin (via Mobile).');
            
            return response()->json(['status' => 'success', 'message' => 'Laporan berhasil diverifikasi.']);
        } catch (\Exception $e) {
            Log::error('API Verify Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }

    public function rejectReport(RejectReportApiRequest $request, $id)
    {
        try {
            $report = $this->reportRepo->findById($id);
            $this->reportService->rejectReport($report, $request->notes, $request->user()->id);
            
            return response()->json(['status' => 'success', 'message' => 'Laporan berhasil ditolak.']);
        } catch (\Exception $e) {
            Log::error('API Reject Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Terjadi kesalahan sistem.'], 500);
        }
    }

    public function assignPetugas(AssignPetugasApiRequest $request)
    {
        try {
            $validated = $request->validated();
            $report = $this->reportRepo->findById($validated['report_id']);
            
            $this->reportService->assignPetugas($report, $validated, $request->user()->id, 'via Mobile');
            
            return response()->json([
                'status' => 'success',
                'message' => 'Tugas dengan prioritas ' . strtoupper($validated['priority']) . ' berhasil diberikan kepada petugas.'
            ]);
        } catch (\Exception $e) {
            Log::error('API Assign Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memberikan tugas.'
            ], 500);
        }
    }
}
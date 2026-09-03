<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreReportApiRequest;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected $reportRepo;
    protected $reportService;

    public function __construct(
        ReportRepositoryInterface $reportRepo, 
        ReportService $reportService
    ) {
        $this->reportRepo = $reportRepo;
        $this->reportService = $reportService;
    }

    public function store(StoreReportApiRequest $request)
    {
        try {
            $validated = $request->validated();
            
            // 1. Cek Duplikasi (Radius 20m)
            $duplicate = $this->reportRepo->findDuplicateByLocation($validated['lat'], $validated['lng']);
            if ($duplicate) {
                return response()->json([
                    'status' => 'conflict',
                    'message' => 'Lampu di area ini sudah dilaporkan dan sedang dalam penanganan.',
                    'existing_report_id' => $duplicate->id
                ], 409);
            }

            // 2. Buat Laporan via Service
            $report = $this->reportService->createCitizenReport(
                $validated, 
                $request->file('photos'), 
                $request->user()->id
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Laporan berhasil dikirim.',
                'data' => $report->load('media')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim laporan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function myReports(Request $request)
    {
        $reports = $this->reportRepo->getUserReports($request->user()->id);
        return response()->json($reports);
    }

    public function show(Request $request, $id)
    {
        try {
            $report = $this->reportRepo->getUserReportById($request->user()->id, $id);
            
            return response()->json([
                'status' => 'success',
                'data' => $report
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Laporan tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }
    }

    public function publicMapData()
    {
        // Ambil 30 laporan terakhir agar peta tidak terlalu berat/lag di HP
        $reports = \App\Models\Report::select('id', 'type', 'damage_category', 'alamat_lengkap', 'status', 'lat', 'lng', 'created_at')
            // Kita sembunyikan laporan yang 'rejected' (ditolak)
            ->whereIn('status', ['pending', 'verified', 'in_progress', 'completed'])
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reports
        ]);
    }
}
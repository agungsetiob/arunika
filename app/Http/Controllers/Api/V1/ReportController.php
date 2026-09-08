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
                'message' => 'Laporan tidak ditemukan atau Anda tidak memiliki akses laporan tersebut.'
            ], 404);
        }
    }

    public function publicMapData()
    {
        $reports = \App\Models\Report::select('id', 'type', 'damage_category', 'alamat_lengkap', 'status', 'lat', 'lng', 'created_at')
            ->with(['assignment' => function ($query) {
                $query->select('id', 'report_id');
            }])
            ->whereIn('status', ['pending', 'verified', 'in_progress', 'completed'])
            ->latest()
            ->limit(30)
            ->get()
            ->map(function ($report) {
                $report->assignment_id = $report->assignment ? $report->assignment->id : null;
                
                unset($report->assignment);
                
                return $report;
            });

        return response()->json([
            'status' => 'success',
            'data' => $reports
        ]);
    }

    public function leaderboard()
    {
        $topWarga = \App\Models\User::select('users.id', 'users.name')
            ->join('reports', 'users.id', '=', 'reports.user_id')
            ->whereIn('reports.status', ['verified', 'in_progress', 'completed'])
            ->selectRaw("SUM(CASE 
                WHEN reports.priority = 'emergency' THEN 5
                WHEN reports.priority = 'high' THEN 3
                WHEN reports.priority = 'medium' THEN 2
                WHEN reports.priority = 'low' THEN 1
                ELSE 0 
            END) as total_score")
            ->selectRaw("COUNT(reports.id) as reports_count")
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_score')
            ->take(10)
            ->get()
            ->map(function ($user, $index) {                
                return [
                    'rank'          => $index + 1,
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'reports_count' => $user->reports_count,
                    'total_score'   => (int) $user->total_score,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data'   => $topWarga
        ]);
    }
}
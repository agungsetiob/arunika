<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Http\Requests\RejectReportRequest;
use App\Http\Requests\AssignReportRequest;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Repositories\UserRepository;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
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

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);
        $reports = $this->reportRepo->getFiltered($filters, true);

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'filters' => $filters
        ]);
    }

    public function show(Request $request, Report $report)
    {
        $this->reportRepo->loadDetails($report);
        
        $petugas = $this->userRepo->searchPetugas($request->search);
        
        return Inertia::render('Admin/Reports/Show', [
            'report'  => $report,
            'petugas' => $petugas,
            'filters' => $request->only(['search']),
        ]);
    }

    public function verify(Request $request, Report $report)
    {
        $this->reportService->verifyReport($report, $request->user()->id);
        return back()->with('success', 'Laporan berhasil diverifikasi.');
    }

    public function reject(RejectReportRequest $request, Report $report)
    {
        $this->reportService->rejectReport($report, $request->notes, $request->user()->id);
        return back()->with('success', 'Laporan berhasil ditolak.');
    }

    public function assign(AssignReportRequest $request, Report $report)
    {
        try {
            $this->reportService->assignPetugas($report, $request->validated(), $request->user()->id);
            return redirect()->back()->with('success', 'Petugas berhasil ditugaskan dengan prioritas ' . strtoupper($request->priority) . '.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menugaskan petugas: ' . $e->getMessage());
        }
    }

    public function export(Request $request)
    {
        $filters = $request->only(['search', 'status']);
        return $this->reportService->exportCsv($filters);
    }
}
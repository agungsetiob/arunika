<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\KpiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KpiController extends Controller
{
    protected $kpiService;

    public function __construct(KpiService $kpiService)
    {
        $this->kpiService = $kpiService;
    }

    public function index(Request $request)
    {
        $kpiData = $this->kpiService->getKpiDashboardData();

        return Inertia::render('Admin/KPI/Index', [
            'petugasData' => $kpiData['petugasData'],
            'summary'     => $kpiData['summary']
        ]);
    }
}
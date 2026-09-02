<?php

namespace App\Repositories\Contracts;

use App\Models\Report;

interface ReportRepositoryInterface
{
    public function getFiltered(array $filters, bool $paginate = true);
    public function loadDetails(Report $report);
    public function findById(int $id);
    public function getByStatuses(array $statuses, int $perPage = 9);
    public function findDuplicateByLocation(float $lat, float $lng, int $radius = 20);
    public function getUserReports(int $userId, int $perPage = 9);
    public function getUserReportById(int $userId, int $reportId);
}
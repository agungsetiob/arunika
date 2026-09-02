<?php

namespace App\Services;

use App\Repositories\Contracts\LampPostRepositoryInterface;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LampPostService
{
    protected $repository;

    public function __construct(LampPostRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function exportCsv(array $filters): StreamedResponse
    {
        $lampPosts = $this->repository->getFiltered($filters, false);
        $fileName = 'Master_Lampu_Arunika_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Kode Lampu', 'Jenis', 'Status', 'Kecamatan', 'Kelurahan', 'Alamat', 'Latitude', 'Longitude'];

        $callback = function() use ($lampPosts, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            
            foreach ($lampPosts as $row) {
                fputcsv($file, [
                    $row->code_tiang,
                    $row->type == 'pju' ? 'PJU' : 'Traffic Light',
                    strtoupper($row->status_lampu),
                    $row->kecamatan,
                    $row->kelurahan,
                    $row->alamat,
                    $row->lat,
                    $row->lng
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
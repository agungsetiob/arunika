<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LampPost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LampPostController extends Controller
{
    public function index(Request $request)
    {
        $query = LampPost::orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code_tiang', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%")
                  ->orWhere('kecamatan', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_lampu')) {
            $query->where('status_lampu', $request->status_lampu);
        }

        $lampPosts = $query->paginate(10)->withQueryString();

        return inertia('Admin/LampPosts/Index', [
            'lampPosts' => $lampPosts,
            'filters' => $request->only(['search', 'status_lampu'])
        ]);
    }

    public function export(Request $request)
    {
        $query = LampPost::orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code_tiang', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status_lampu')) {
            $query->where('status_lampu', $request->status_lampu);
        }

        $lampPosts = $query->get();
        $fileName = 'Master_Lampu_Arunika_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Kode Lampu', 'Jenis', 'Status', 'Kecamatan', 'Kelurahan', 'Alamat', 'Latitude', 'Longitude'];

        $callback = function() use($lampPosts, $columns) {
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

    public function create()
    {
        return Inertia::render('Admin/LampPosts/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code_tiang' => 'required|string|unique:lamp_posts,code_tiang',
            'type' => 'required|in:pju,traffic_light',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'alamat' => 'nullable|string',
            'kecamatan' => 'required|string',
            'kelurahan' => 'nullable|string',
            'status_lampu' => 'required|in:active,broken,maintenance',
        ]);

        LampPost::create($validated);
        return redirect()->route('admin.lamp-posts.index')->with('success', 'Data tiang berhasil ditambahkan.');
    }

    public function edit(LampPost $lampPost)
    {
        return Inertia::render('Admin/LampPosts/Form', ['lampPost' => $lampPost]);
    }

    public function update(Request $request, LampPost $lampPost)
    {
        $validated = $request->validate([
            'code_tiang' => 'required|string|unique:lamp_posts,code_tiang,' . $lampPost->id,
            'type' => 'required|in:pju,traffic_light',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'alamat' => 'nullable|string',
            'kecamatan' => 'required|string',
            'kelurahan' => 'nullable|string',
            'status_lampu' => 'required|in:active,broken,maintenance',
        ]);

        $lampPost->update($validated);
        return redirect()->route('admin.lamp-posts.index')->with('success', 'Data tiang berhasil diperbarui.');
    }

    public function destroy(LampPost $lampPost)
    {
        $lampPost->delete();
        return redirect()->route('admin.lamp-posts.index')->with('success', 'Data tiang berhasil dihapus.');
    }
}
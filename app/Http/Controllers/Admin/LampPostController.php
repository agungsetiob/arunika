<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LampPost;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LampPostController extends Controller
{
    public function index()
    {
        $lampPosts = LampPost::orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Admin/LampPosts/Index', ['lampPosts' => $lampPosts]);
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
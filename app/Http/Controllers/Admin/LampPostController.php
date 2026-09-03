<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LampPost;
use App\Http\Requests\StoreLampPostRequest;
use App\Http\Requests\UpdateLampPostRequest;
use App\Repositories\Contracts\LampPostRepositoryInterface;
use App\Services\LampPostService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LampPostController extends Controller
{
    protected $repository;
    protected $service;

    public function __construct(LampPostRepositoryInterface $repository, LampPostService $service)
    {
        $this->repository = $repository;
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status_lampu']);
        $lampPosts = $this->repository->getFiltered($filters, true);

        return Inertia::render('Admin/LampPosts/Index', [
            'lampPosts' => $lampPosts,
            'filters'   => $filters,
        ]);
    }

    public function export(Request $request)
    {
        $filters = $request->only(['search', 'status_lampu']);
        return $this->service->exportCsv($filters);
    }

    public function create()
    {
        return Inertia::render('Admin/LampPosts/Form');
    }

    public function store(StoreLampPostRequest $request)
    {
        $this->repository->create($request->validated());
        return redirect()->route('admin.lamp-posts.index')
                         ->with('success', 'Data tiang berhasil ditambahkan.');
    }

    public function edit(LampPost $lampPost)
    {
        return Inertia::render('Admin/LampPosts/Form', ['lampPost' => $lampPost]);
    }

    public function update(UpdateLampPostRequest $request, LampPost $lampPost)
    {
        $this->repository->update($lampPost, $request->validated());
        return redirect()->route('admin.lamp-posts.index')
                         ->with('success', 'Data tiang berhasil diperbarui.');
    }

    public function destroy(LampPost $lampPost)
    {
        $this->repository->delete($lampPost);
        return redirect()->route('admin.lamp-posts.index')
                         ->with('success', 'Data tiang berhasil dihapus.');
    }
}
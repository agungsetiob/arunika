<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class UserController extends Controller
{
    protected $repository;
    protected $service;

    public function __construct(UserRepositoryInterface $repository, UserService $service)
    {
        $this->repository = $repository;
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['role', 'search']);
        $users = $this->repository->getFilteredWithReportCounts($filters, 10);

        return Inertia::render('Admin/Users/Index', [
            'users'   => $users,
            'filters' => $filters,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $this->service->createUser($request->validated());
        
        return redirect()->back()->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->service->updateUser($user, $request->validated());
        
        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggleStatus($id)
    {
        try {
            $user = $this->service->toggleUserStatus($id, auth()->id());
            
            $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
            return redirect()->back()->with('success', "Akun {$user->name} berhasil {$statusText}.");
            
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
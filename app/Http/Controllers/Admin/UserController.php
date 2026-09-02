<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $roleFilter = $request->query('role');
        $search = $request->query('search');

        $users = User::with('roles')
            ->when($roleFilter, function ($query) use ($roleFilter) {
                $query->role($roleFilter);
            })
            // Tambahkan blok pencarian ini
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->withCount([
                'reports as accepted_reports_count' => function ($query) {
                    $query->whereIn('status', ['verified', 'in_progress', 'completed']);
                },
                'reports as rejected_reports_count' => function ($query) {
                    $query->where('status', 'rejected');
                }
            ])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'role' => $roleFilter,
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => ['required', 'regex:/^08[0-9]{8,11}$/', 'unique:users,phone'],
            'password' => 'required|string|min:8',
            'role' => 'required|in:petugas,admin',
            'nik' => ['required', 'digits:16', 'unique:users,nik'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
            'nik' => $validated['nik'] ?? null,
        ]);

        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => ['required', 'regex:/^08[0-9]{8,11}$/', 'unique:users,phone,' . $user->id],
            'password' => 'nullable|string|min:8',
            'nik' => ['required', 'digits:16', 'unique:users,nik,' . $user->id],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->nik = $validated['nik'];
        
        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }
        
        $user->save();

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Akun {$user->name} berhasil {$statusText}.");
    }
}
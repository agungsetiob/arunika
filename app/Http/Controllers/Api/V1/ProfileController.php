<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            // Pastikan nomor HP unik, kecuali untuk milik user itu sendiri
            'phone' => 'required|string|max:20|unique:users,phone,' . $user->id,
            'password' => 'nullable|string|min:6',
        ]);

        $user->name = $validated['name'];
        $user->phone = $validated['phone'];

        // Update password hanya jika kolom password diisi
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ]);
    }
}
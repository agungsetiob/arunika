<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mengambil daftar notifikasi milik user yang sedang login
     */
    public function index(Request $request)
    {
        // Ambil notifikasi, urutkan dari yang terbaru, paginasi 20 per halaman
        $notifications = $request->user()->notifications()->paginate(20);
        
        // Hitung jumlah yang belum dibaca (untuk badge lonceng merah)
        $unreadCount = $request->user()->unreadNotifications()->count();

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Tandai satu notifikasi sudah dibaca
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        
        if ($notification) {
            $notification->markAsRead(); // Fitur bawaan Laravel
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Notifikasi ditandai sudah dibaca'
        ]);
    }

    /**
     * Tandai semua notifikasi sudah dibaca sekaligus
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Semua notifikasi ditandai sudah dibaca'
        ]);
    }
}
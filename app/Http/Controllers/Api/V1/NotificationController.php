<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $service;

    public function __construct(NotificationService $service)
    {
        $this->service = $service;
    }

    /**
     * Mengambil daftar notifikasi milik user
     */
    public function index(Request $request)
    {
        $result = $this->service->getUserNotifications($request->user());

        return response()->json([
            'status'       => 'success',
            'data'         => $result['notifications'],
            'unread_count' => $result['unread_count']
        ]);
    }

    /**
     * Tandai satu notifikasi sudah dibaca
     */
    public function markAsRead(Request $request, $id)
    {
        $this->service->markAsRead($request->user(), $id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Notifikasi ditandai sudah dibaca'
        ]);
    }

    /**
     * Tandai semua notifikasi sudah dibaca sekaligus
     */
    public function markAllAsRead(Request $request)
    {
        $this->service->markAllAsRead($request->user());

        return response()->json([
            'status'  => 'success',
            'message' => 'Semua notifikasi ditandai sudah dibaca'
        ]);
    }
}
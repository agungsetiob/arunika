<?php

namespace App\Services;

use App\Models\User;

class NotificationService
{
    public function getUserNotifications(User $user, int $perPage = 20): array
    {
        $notifications = $user->notifications()->paginate($perPage);
        $unreadCount = $user->unreadNotifications()->count();

        return [
            'notifications' => $notifications,
            'unread_count'  => $unreadCount
        ];
    }

    public function markAsRead(User $user, string $notificationId): void
    {
        $notification = $user->notifications()->where('id', $notificationId)->first();
        
        if ($notification) {
            $notification->markAsRead();
        }
    }

    public function markAllAsRead(User $user): void
    {
        // Fitur bawaan Laravel untuk menandai semua notifikasi unread
        $user->unreadNotifications->markAsRead();
    }
}
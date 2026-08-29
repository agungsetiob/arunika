<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmService
{
    /**
     * Mengirim notifikasi menggunakan Expo Push Service
     */
    public function sendToDevice($expoToken, $title, $body, $data = [])
    {
        if (empty($expoToken)) return false;

        if (!str_starts_with($expoToken, 'ExponentPushToken')) {
            Log::warning('Bukan token Expo: ' . $expoToken);
            return false;
        }

        try {
            $response = Http::post('https://exp.host/--/api/v2/push/send', [
                'to' => $expoToken,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Expo Push Error: ' . $e->getMessage());
            return false;
        }
    }
}
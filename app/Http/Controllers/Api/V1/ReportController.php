<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:pju,traffic_light',
            'damage_category' => 'required|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'alamat_lengkap' => 'required|string',
            'description' => 'nullable|string',
            'photos' => 'required|array|min:1|max:3',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:2048', // Max 2MB per foto
        ]);

        $lat = $validated['lat'];
        $lng = $validated['lng'];
        $radius = 20; // 20 meter

        // 1. Cek Duplikasi menggunakan Haversine Formula (Radius 20m)
        $duplicateReport = Report::select('*')
            ->selectRaw(
                '( 6371000 * acos( cos( radians(?) ) *
                  cos( radians( lat ) )
                  * cos( radians( lng ) - radians(?)
                  ) + sin( radians(?) ) *
                  sin( radians( lat ) ) )
                ) AS distance',
                [$lat, $lng, $lat]
            )
            ->whereIn('status', ['pending', 'verified', 'in_progress']) // Hanya cek laporan yang masih aktif
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->first();

        if ($duplicateReport) {
            return response()->json([
                'status' => 'conflict',
                'message' => 'Lampu di area ini sudah dilaporkan dan sedang dalam penanganan.',
                'existing_report_id' => $duplicateReport->id
            ], 409); // 409 Conflict
        }

        // 2. Buat Laporan Baru jika tidak ada duplikat
        DB::beginTransaction();
        try {
            $report = Report::create([
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
                'damage_category' => $validated['damage_category'],
                'lat' => $lat,
                'lng' => $lng,
                'alamat_lengkap' => $validated['alamat_lengkap'],
                'description' => $validated['description'],
                'status' => 'pending',
            ]);

            // 3. Handle Upload Multiple Foto
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    // Simpan ke storage/app/public/reports
                    $path = $photo->store('reports', 'public');

                    $report->media()->create([
                        'file_path' => $path,
                        'type' => 'before'
                    ]);
                }
            }

            // Catat history
            $report->histories()->create([
                'changed_by' => $request->user()->id,
                'from_status' => null,
                'to_status' => 'pending',
                'notes' => 'Laporan dibuat oleh warga.'
            ]);

            DB::commit();

            // ==========================================
            // 4. KIRIM NOTIFIKASI KE SEMUA ADMIN (FCM & DATABASE)
            // ==========================================
            
            // Ambil semua objek User yang rolenya admin
            $admins = User::where('role', 'admin')->get();

            // Saring hanya token-token FCM yang tidak null untuk dikirim via Firebase
            $adminTokens = $admins->whereNotNull('fcm_token')->pluck('fcm_token')->toArray();

            // A. Kirim Push Notification via Firebase Multicast
            if (!empty($adminTokens)) {
                try {
                    $messaging = Firebase::messaging();
                    $message = CloudMessage::new()
                        ->withNotification(Notification::create(
                            '🚨 Laporan Baru Masuk!',
                            'Ada kerusakan ' . str_replace('_', ' ', $report->damage_category) . ' di area ' . $report->alamat_lengkap
                        ));

                    $messaging->sendMulticast($message, $adminTokens);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Gagal mengirim FCM Multicast ke Admin: ' . $e->getMessage());
                }
            }

            // B. Simpan ke Database Notification untuk masing-masing Admin
            // Menggunakan foreach agar setiap admin mendapat riwayat notifikasinya sendiri
            foreach ($admins as $admin) {
                $admin->notifications()->create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\NewReport', 
                    'data' => [
                        'title' => 'Laporan Baru Masuk!',
                        'body' => 'Kerusakan ' . str_replace('_', ' ', $report->damage_category) . ' di ' . $report->alamat_lengkap,
                        'type' => 'alert' // Tipe alert (Warna biru di mobile)
                    ],
                ]);
            }
            // ==========================================

            return response()->json([
                'status' => 'success',
                'message' => 'Laporan berhasil dikirim.',
                'data' => $report->load('media')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim laporan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function myReports(Request $request)
    {
        $reports = Report::where('user_id', $request->user()->id)
            ->with([
                'media' => function ($q) {
                    $q->where('type', 'before');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(9);

        return response()->json($reports);
    }

    public function show(Request $request, $id)
    {
        // Pastikan warga hanya bisa melihat detail laporan miliknya sendiri
        $report = Report::where('user_id', $request->user()->id)
            ->with([
                'media',
                'lampPost',
                'histories' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                }
            ])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $report
        ]);
    }
}
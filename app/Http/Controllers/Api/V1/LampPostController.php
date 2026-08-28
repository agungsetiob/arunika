<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LampPost;
use Illuminate\Http\Request;

class LampPostController extends Controller
{
    public function nearby(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric' // Radius dalam satuan meter
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $radius = $request->radius ?? 500; // Default 500 meter

        // Cari tiang lampu terdekat menggunakan Haversine Formula
        $lampPosts = LampPost::select('*')
            ->selectRaw(
                '( 6371000 * acos( cos( radians(?) ) *
                  cos( radians( lat ) )
                  * cos( radians( lng ) - radians(?)
                  ) + sin( radians(?) ) *
                  sin( radians( lat ) ) )
                ) AS distance', [$lat, $lng, $lat]
            )
            ->having('distance', '<=', $radius)
            ->orderBy('distance')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $lampPosts
        ]);
    }
}
<?php

namespace App\Repositories;

use App\Models\LampPost;
use App\Repositories\Contracts\LampPostRepositoryInterface;

class LampPostRepository implements LampPostRepositoryInterface
{
    public function getFiltered(array $filters, bool $paginate = true)
    {
        $query = LampPost::orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('code_tiang', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%")
                  ->orWhere('kecamatan', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status_lampu'])) {
            $query->where('status_lampu', $filters['status_lampu']);
        }

        return $paginate ? $query->paginate(10)->withQueryString() : $query->get();
    }

    public function create(array $data)
    {
        return LampPost::create($data);
    }

    public function update(LampPost $lampPost, array $data)
    {
        return $lampPost->update($data);
    }

    public function delete(LampPost $lampPost)
    {
        return $lampPost->delete();
    }

    public function getNearby(float $lat, float $lng, float $radius = 500)
    {
        return LampPost::select('*')
            ->selectRaw(
                '( 6371000 * acos( cos( radians(?) ) *
                  cos( radians( lat ) )
                  * cos( radians( lng ) - radians(?)
                  ) + sin( radians(?) ) *
                  sin( radians( lat ) ) )
                ) AS distance', 
                [$lat, $lng, $lat]
            )
            ->having('distance', '<=', $radius)
            ->orderBy('distance')
            ->get();
    }
}
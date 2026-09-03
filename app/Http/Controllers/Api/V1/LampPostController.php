<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\NearbyLampPostApiRequest;
use App\Repositories\Contracts\LampPostRepositoryInterface;

class LampPostController extends Controller
{
    protected $repository;

    public function __construct(LampPostRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function nearby(NearbyLampPostApiRequest $request)
    {
        $validated = $request->validated();

        $lat = $validated['lat'];
        $lng = $validated['lng'];
        $radius = $validated['radius'] ?? 500;

        $lampPosts = $this->repository->getNearby($lat, $lng, $radius);

        return response()->json([
            'status' => 'success',
            'data'   => $lampPosts
        ]);
    }
}
<?php

namespace App\Repositories\Contracts;

use App\Models\LampPost;

interface LampPostRepositoryInterface
{
    public function getFiltered(array $filters, bool $paginate = true);
    public function create(array $data);
    public function update(LampPost $lampPost, array $data);
    public function delete(LampPost $lampPost);
}
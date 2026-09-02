<?php

namespace App\Repositories\Contracts;

use App\Models\User;

interface UserRepositoryInterface
{
    public function getFilteredWithReportCounts(array $filters, int $perPage = 10);
    public function create(array $data);
    public function update(User $user, array $data);
    public function findById(int $id);
}
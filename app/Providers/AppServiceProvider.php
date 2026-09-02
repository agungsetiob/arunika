<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\LampPostRepositoryInterface;
use App\Repositories\LampPostRepository;
use App\Repositories\Contracts\ReportRepositoryInterface;
use App\Repositories\ReportRepository;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\AssignmentRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            LampPostRepositoryInterface::class,
            LampPostRepository::class
        );

        $this->app->bind(
            ReportRepositoryInterface::class,
            ReportRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class
        );

        $this->app->bind(
            AssignmentRepositoryInterface::class,
            AssignmentRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}

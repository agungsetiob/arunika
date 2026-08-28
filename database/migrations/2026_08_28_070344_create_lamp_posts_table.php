<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lamp_posts', function (Blueprint $table) {
            $table->id();
            $table->string('code_tiang')->unique()->index();
            $table->enum('type', ['pju', 'traffic_light'])->default('pju');
            $table->decimal('lat', 10, 8);
            $table->decimal('lng', 11, 8);
            $table->text('alamat')->nullable();
            $table->string('kecamatan')->index();
            $table->string('kelurahan')->nullable();
            $table->enum('status_lampu', ['active', 'broken', 'maintenance'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lat', 'lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lamp_posts');
    }
};
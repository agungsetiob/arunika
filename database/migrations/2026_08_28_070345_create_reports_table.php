<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lamp_post_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['pju', 'traffic_light']);
            $table->enum('damage_category', [
                'mati_total', 
                'redup', 
                'tiang_miring_roboh', 
                'kabel_menjuntai', 
                'lampu_kedip'
            ]);
            $table->text('description')->nullable();
            $table->decimal('lat', 10, 8);
            $table->decimal('lng', 11, 8);
            $table->text('alamat_lengkap');
            $table->enum('status', [
                'pending', 
                'verified', 
                'in_progress', 
                'completed', 
                'rejected'
            ])->default('pending')->index();
            $table->enum('priority', ['low', 'medium', 'high', 'emergency'])->default('medium');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['lat', 'lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
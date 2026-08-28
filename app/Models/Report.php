<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'lamp_post_id',
        'type',
        'damage_category',
        'description',
        'lat',
        'lng',
        'alamat_lengkap',
        'status',
        'priority',
    ];

    // Relasi ke Pembuat Laporan (Warga)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Master Tiang Lampu
    public function lampPost()
    {
        return $this->belongsTo(LampPost::class);
    }

    // Relasi ke Foto Laporan
    public function media()
    {
        return $this->hasMany(ReportMedia::class);
    }

    // Relasi ke Riwayat Perubahan Status
    public function histories()
    {
        return $this->hasMany(ReportHistory::class);
    }

    // Relasi ke Penugasan Petugas
    public function assignment()
    {
        return $this->hasOne(Assignment::class);
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ReportMedia extends Model
{
    protected $fillable = [
        'report_id',
        'file_path',
        'type',
    ];

    // Accessor otomatis untuk mengubah file_path menjadi URL lengkap
    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return $this->file_path ? Storage::disk('public')->url($this->file_path) : null;
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}
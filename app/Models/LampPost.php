<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LampPost extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code_tiang',
        'type',
        'lat',
        'lng',
        'alamat',
        'kecamatan',
        'kelurahan',
        'status_lampu',
    ];

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
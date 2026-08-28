<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportHistory extends Model
{
    protected $fillable = [
        'report_id',
        'changed_by',
        'from_status',
        'to_status',
        'notes',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
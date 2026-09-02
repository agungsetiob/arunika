<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignReportRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'petugas_id' => 'required|exists:users,id',
            'priority'   => 'required|in:low,medium,high,emergency',
        ];
    }
}
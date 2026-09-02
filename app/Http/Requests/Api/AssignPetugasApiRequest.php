<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class AssignPetugasApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'report_id' => 'required|exists:reports,id',
            'user_id'   => 'required|exists:users,id', 
            'priority'  => 'required|in:low,medium,high,emergency',
        ];
    }
}
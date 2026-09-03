<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentStatusApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'status'        => 'required|in:accepted,on_site,completed',
            'petugas_notes' => 'nullable|string',
            'photo_after'   => 'required_if:status,completed|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
}
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFcmTokenApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'fcm_token' => 'required|string',
        ];
    }
}
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class LoginApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'phone'     => 'required|string',
            'password'  => 'required|string',
            'fcm_token' => 'nullable|string',
        ];
    }
}
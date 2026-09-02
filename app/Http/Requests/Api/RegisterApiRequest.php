<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RegisterApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users,email|max:255',
            'phone'    => ['required', 'regex:/^08[0-9]{8,11}$/', 'unique:users,phone'],
            'nik'      => ['required', 'digits:16', 'unique:users,nik'],
            'password' => 'required|string|min:6',
        ];
    }
}
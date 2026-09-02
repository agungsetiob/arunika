<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => ['required', 'regex:/^08[0-9]{8,11}$/', 'unique:users,phone'],
            'password' => 'required|string|min:8',
            'role'     => 'required|in:petugas,admin',
            'nik'      => ['required', 'digits:16', 'unique:users,nik'],
        ];
    }
}
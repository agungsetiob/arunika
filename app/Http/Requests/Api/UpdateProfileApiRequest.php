<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        // $this->user() mengambil user yang sedang login via Sanctum
        $userId = $this->user()->id;

        return [
            'name'     => 'required|string|max:255',
            'phone'    => ['required', 'regex:/^08[0-9]{8,11}$/', 'unique:users,phone,' . $userId],
            'email'    => 'required|email|max:255|unique:users,email,' . $userId,
            'nik'      => ['required', 'digits:16', 'unique:users,nik,' . $userId],
            'password' => 'nullable|string|min:6',
        ];
    }
}
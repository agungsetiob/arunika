<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $this->user->id,
            'phone'    => ['required', 'regex:/^08[0-9]{8,11}$/', 'unique:users,phone,' . $this->user->id],
            'password' => 'nullable|string|min:8',
            'nik'      => ['required', 'digits:16', 'unique:users,nik,' . $this->user->id],
        ];
    }
}
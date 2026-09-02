<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'type'            => 'required|in:pju,traffic_light',
            'damage_category' => 'required|string',
            'lat'             => 'required|numeric',
            'lng'             => 'required|numeric',
            'alamat_lengkap'  => 'required|string',
            'description'     => 'nullable|string',
            'photos'          => 'required|array|min:1|max:3',
            'photos.*'        => 'image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
        ];
    }
}
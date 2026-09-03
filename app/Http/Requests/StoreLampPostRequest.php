<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLampPostRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'code_tiang'   => 'required|string|unique:lamp_posts,code_tiang',
            'type'         => 'required|in:pju,traffic_light',
            'lat'          => 'required|numeric',
            'lng'          => 'required|numeric',
            'alamat'       => 'nullable|string',
            'kecamatan'    => 'required|string',
            'kelurahan'    => 'nullable|string',
            'status_lampu' => 'required|in:active,broken,maintenance',
        ];
    }
}
<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class NearbyLampPostApiRequest extends FormRequest
{
    public function authorize() { return true; }

    public function rules()
    {
        return [
            'lat'    => 'required|numeric',
            'lng'    => 'required|numeric',
            'radius' => 'nullable|numeric' // Radius dalam meter
        ];
    }
}
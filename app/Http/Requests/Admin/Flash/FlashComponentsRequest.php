<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashComponentsRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'flash:serverRow' => 'required|numeric',
            'flash:socialButtons' => 'required|in:true,false',
            'flash:discordBox' => 'required|in:true,false',

            'flash:statsCards' => 'required|numeric',
            'flash:graphs' => 'required|numeric',
        ];
    }
}

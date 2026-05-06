<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashLayoutRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'flash:layout' => 'required|numeric',
            'flash:dashboardLayout' => 'required|numeric',
            'flash:searchComponent' => 'required|numeric',

            'flash:logoPosition' => 'required|numeric',
            'flash:socialPosition' => 'required|numeric',
            'flash:loginLayout' => 'required|numeric',
        ];
    }
}

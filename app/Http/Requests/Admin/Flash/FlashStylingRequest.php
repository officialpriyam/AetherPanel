<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashStylingRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'flash:backgroundImage' => 'nullable|string',
            'flash:backgroundBlur' => 'required|string',
            'flash:backdrop' => 'required|in:true,false',
            'flash:backdropPercentage' => 'required|string',
            'flash:defaultMode' => 'required|string',
            'flash:copyright' => 'nullable|string',
            'flash:radiusInput' => 'required|string',
            'flash:borderInput' => 'required|in:true,false',
            'flash:radiusBox' => 'required|string',
            'flash:flashMessage' => 'required|numeric',
            'flash:pageTitle' => 'required|string',
            'flash:loginBackground' => 'nullable|string',
            'flash:loginGradient' => 'required|in:true,false',
            'flash:effects_snow' => 'required|in:true,false',
            'flash:effects_autumn' => 'required|in:true,false',
            'flash:effects_stars' => 'required|in:true,false',
        ];
    }
}

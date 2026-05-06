<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashSocialRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'flash:social_discord' => 'nullable|string',
            'flash:social_billing' => 'nullable|string',
            'flash:social_status' => 'nullable|string',
            'flash:social_custom' => 'nullable|string',
            'flash:social_custom_icon' => 'nullable|string',
        ];
    }
}

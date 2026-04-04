<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashAnnouncementRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'flash:announcementType' => 'required|string',
            'flash:announcementMessage' => 'nullable|string',
            'flash:announcementCloseable' => 'required|in:true,false',
            'flash:announcementTimeout' => 'required|numeric',
            'flash:announcementIcon' => 'nullable|string',
        ];
    }
}

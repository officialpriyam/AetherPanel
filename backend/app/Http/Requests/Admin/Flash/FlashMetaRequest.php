<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashMetaRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'flash:meta_color' => 'required|string',
            'flash:meta_title' => 'required|string',
            'flash:meta_description' => 'required|string',
            'flash:meta_image' => 'required|string',
            'flash:meta_favicon' => 'required|string',
            'flash:meta_keywords' => 'nullable|string',
            'flash:search_indexing' => 'required|in:true,false',
        ];
    }
}

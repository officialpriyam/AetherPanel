<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashAdvancedRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            // Advanced
            'flash:profileType' => 'required|string',
            'flash:ipFlag' => 'required|in:true,false',
            'flash:lowResourcesAlert' => 'required|in:true,false',
            'flash:knowledge_base_url' => 'nullable|string',

            // Meta
            'flash:meta_color' => 'required|string',
            'flash:meta_title' => 'required|string',
            'flash:meta_description' => 'required|string',
            'flash:meta_image' => 'required|string',
            'flash:meta_favicon' => 'required|string',

            // Mail
            'flash:mail_color' => 'required|string',
            'flash:mail_backgroundColor' => 'required|string',
            'flash:mail_logo' => 'required|string',
            'flash:mail_logoFull' => 'required|in:true,false',
            'flash:mail_mode' => 'required|string',
            'flash:mail_discord' => 'nullable|string',
            'flash:mail_twitter' => 'nullable|string',
            'flash:mail_facebook' => 'nullable|string',
            'flash:mail_instagram' => 'nullable|string',
            'flash:mail_linkedin' => 'nullable|string',
            'flash:mail_youtube' => 'nullable|string',
            'flash:mail_status' => 'nullable|string',
            'flash:mail_billing' => 'nullable|string',
            'flash:mail_support' => 'nullable|string',
        ];
    }
}

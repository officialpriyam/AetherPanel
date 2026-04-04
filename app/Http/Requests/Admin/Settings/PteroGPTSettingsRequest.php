<?php

namespace Pterodactyl\Http\Requests\Admin\Settings;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class PteroGPTSettingsRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'enabled' => 'sometimes|boolean',
            'base_url' => 'required|url|max:255',
            'api_key' => 'sometimes|nullable|string|max:255',
            'model_mode' => 'required|in:fixed,list',
            'model_fixed' => 'required|string|max:100',
            'models_allowed' => 'required|json',
            'ui_mode' => 'required|in:panel,modal',
            'system_prompt' => 'nullable|string|max:8000',
            'language' => 'required|in:en,fr,es,de,it,pt,nl,pl,ru,ja,zh',
            'limit_chat' => 'required|integer|min:1|max:10000',
            'limit_read' => 'required|integer|min:1|max:10000',
            'limit_write' => 'required|integer|min:1|max:10000',
            'limit_command' => 'required|integer|min:1|max:10000',
        ];
    }
}

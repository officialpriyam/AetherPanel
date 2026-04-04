<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashAddonsRequest extends AdminFormRequest
{
    public function rules(): array
    {
        return [
            'flash:addon_plugin_installer_enabled' => 'required|in:true,false',
            'flash:addon_mod_installer_enabled' => 'required|in:true,false',
            'flash:addon_modpack_installer_enabled' => 'required|in:true,false',
            'flash:addon_subdomain_enabled' => 'required|in:true,false',
            'flash:addon_split_enabled' => 'required|in:true,false',
            'flash:addon_pterogpt_enabled' => 'required|in:true,false',
            'flash:addon_version_changer_enabled' => 'required|in:true,false',
            'flash:addon_ticket_system_enabled' => 'required|in:true,false',
            'flash:addon_plugin_installer_eggs' => 'nullable|string',
            'flash:addon_mod_installer_eggs' => 'nullable|string',
            'flash:addon_modpack_installer_eggs' => 'nullable|string',
            'flash:addon_subdomain_eggs' => 'nullable|string',
            'flash:addon_split_eggs' => 'nullable|string',
            'flash:addon_version_changer_eggs' => 'nullable|string',
        ];
    }
}

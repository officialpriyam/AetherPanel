<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class SubdomainRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'subdomain.manage';
    }

    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'subdomain' => ['required', 'string', 'min:2', 'max:32', 'regex:/^[a-z0-9][a-z0-9-]{0,30}[a-z0-9]$/'],
                'domainId' => 'required|integer|min:1',
            ];
        }

        return [];
    }
}

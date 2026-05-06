<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class SplitAccessRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'split.manage';
    }

    public function rules(): array
    {
        return [];
    }
}

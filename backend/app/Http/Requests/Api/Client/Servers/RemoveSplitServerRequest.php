<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class RemoveSplitServerRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'split.manage';
    }

    public function rules(): array
    {
        return [
            'serveruuid' => 'required|string|size:36',
            'split_masteruuid' => 'required|string|size:36',
        ];
    }
}

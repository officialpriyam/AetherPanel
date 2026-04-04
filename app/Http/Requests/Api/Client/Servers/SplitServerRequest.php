<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class SplitServerRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'split.manage';
    }

    public function rules(): array
    {
        return [
            'cpu' => 'required|integer|min:1',
            'ram' => 'required|integer|min:512',
            'disk' => 'required|integer|min:1',
            'swap' => 'required|integer|min:0',
            'name' => 'required|string|min:2|max:191',
            'subuser' => 'sometimes|boolean',
        ];
    }
}

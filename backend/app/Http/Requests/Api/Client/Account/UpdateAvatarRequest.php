<?php

namespace Pterodactyl\Http\Requests\Api\Client\Account;

use Closure;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class UpdateAvatarRequest extends ClientApiRequest
{
    public function rules(): array
    {
        return [
            'avatar_url' => [
                'nullable',
                'string',
                'max:262144',
                function (string $attribute, mixed $value, Closure $fail) {
                    if ($value === null || $value === '') {
                        return;
                    }

                    $normalized = trim((string) $value);
                    $isHttpUrl = filter_var($normalized, FILTER_VALIDATE_URL)
                        && preg_match('#^https?://#i', $normalized);
                    $isDataImage = str_starts_with($normalized, 'data:image/');

                    if (!$isHttpUrl && !$isDataImage) {
                        $fail('Provide an https:// image URL or upload an image file.');
                    }
                },
            ],
        ];
    }
}

<?php

namespace Pterodactyl\Http\Requests\Base;

use Illuminate\Foundation\Http\FormRequest;

class LocaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'locale' => ['required', 'string', 'regex:/^[A-Za-z]{2,4}(?:[-_][A-Za-z]{2,4})?(?:[ ,+][A-Za-z]{2,4}(?:[-_][A-Za-z]{2,4})?)*$/'],
            'namespace' => ['required', 'string', 'regex:/^[\w\/\.-]+(?:[ ,+][\w\/\.-]+)*$/'],
        ];
    }
}

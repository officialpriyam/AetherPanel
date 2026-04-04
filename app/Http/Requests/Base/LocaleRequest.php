<?php

namespace Pterodactyl\Http\Requests\Base;

use Illuminate\Foundation\Http\FormRequest;

class LocaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'locale' => ['required', 'string', 'regex:/^[a-z]{2}(?:[-_][A-Z]{2,4})?$/'],
            'namespace' => ['required', 'string', 'regex:/^[\w\/\.-,]{1,191}$/'],
        ];
    }
}

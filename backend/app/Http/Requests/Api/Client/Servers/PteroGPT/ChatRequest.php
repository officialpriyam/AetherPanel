<?php

namespace Pterodactyl\Http\Requests\Api\Client\Servers\PteroGPT;

use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;

class ChatRequest extends ClientApiRequest
{
    public function permission(): string
    {
        return 'pterogpt.chat';
    }

    public function rules(): array
    {
        return [
            'message' => 'required|string|max:4000',
            'context' => 'sometimes|array',
            'context.console_lines' => 'sometimes|string|max:50000',
            'context.file_path' => 'sometimes|string|max:500',
            'context.file_content' => 'sometimes|string|max:50000',
            'conversation_history' => 'sometimes|array|max:20',
            'conversation_history.*.role' => 'required_with:conversation_history|string|in:user,assistant',
            'conversation_history.*.content' => 'required_with:conversation_history|string|max:4000',
            'model' => 'sometimes|string|max:100',
        ];
    }
}

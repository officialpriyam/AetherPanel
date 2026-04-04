<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Services\PteroGPT\AIService;
use Pterodactyl\Services\PteroGPT\RateLimiter;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\PteroGPT\ChatRequest;

class PteroGPTController extends ClientApiController
{
    public function __construct(
        private AIService $aiService,
        private RateLimiter $rateLimiter,
    ) {
        parent::__construct();
    }

    public function config(Server $server): JsonResponse
    {
        $this->authorize('pterogpt.chat', $server);

        return new JsonResponse([
            'data' => $this->aiService->getConfig(),
        ]);
    }

    public function limits(Server $server): JsonResponse
    {
        $this->authorize('pterogpt.chat', $server);

        return new JsonResponse([
            'data' => $this->rateLimiter->getRemaining($server->id),
        ]);
    }

    public function chat(ChatRequest $request, Server $server): JsonResponse
    {
        $response = $this->aiService->chat(
            server: $server,
            userId: $request->user()->id,
            message: $request->input('message'),
            context: $request->input('context', []),
            conversationHistory: $request->input('conversation_history', []),
            model: $request->input('model'),
            ipAddress: (string) $request->ip(),
        );

        Activity::event('server:pterogpt.chat')
            ->property('message_length', strlen((string) $request->input('message')))
            ->log();

        return new JsonResponse(['data' => $response]);
    }
}

<?php

namespace Pterodactyl\Http\Middleware\Modules;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Services\Modules\ModuleManager;
use Symfony\Component\HttpFoundation\Response;

class RequireModuleApiAccess
{
    private const HEADER_NAME = 'X-AetherPanel-Module-Key';

    public function __construct(private ModuleManager $modules)
    {
    }

    public function handle(Request $request, Closure $next, string $moduleId): Response
    {
        $module = $this->modules->find($moduleId);

        if (!$module || !$module->enabled()) {
            return $this->deny('Module is not enabled.', 404);
        }

        $expectedKeys = $this->modules->apiKeysFor($module->id());
        if (count($expectedKeys) === 0) {
            return $this->deny('Module API access is not configured.', 403);
        }

        $providedKey = trim((string) $request->headers->get(self::HEADER_NAME, ''));
        if ($providedKey === '') {
            return $this->deny('Module API key is missing.', 401);
        }

        foreach ($expectedKeys as $expectedKey) {
            if (hash_equals($expectedKey, $providedKey)) {
                $request->attributes->set('aether.module', $module);
                $request->attributes->set('aether.module.id', $module->id());

                return $next($request);
            }
        }

        return $this->deny('Module API key is invalid.', 403);
    }

    private function deny(string $message, int $status): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $status);
    }
}

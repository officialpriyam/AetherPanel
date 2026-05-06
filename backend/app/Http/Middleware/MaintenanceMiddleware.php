<?php

namespace Pterodactyl\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Contracts\Routing\ResponseFactory;

class MaintenanceMiddleware
{
    /**
     * MaintenanceMiddleware constructor.
     */
    public function __construct(private ResponseFactory $response)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, \Closure $next): mixed
    {
        /** @var \Pterodactyl\Models\Server $server */
        $server = $request->attributes->get('server');
        $node = $server->getRelation('node');

        if ($node->maintenance_mode) {
            return $this->response->json([
                'errors' => [[
                    'code' => 'NodeMaintenanceMode',
                    'status' => '503',
                    'detail' => 'This node is currently in maintenance mode.',
                ]],
            ], 503);
        }

        return $next($request);
    }
}

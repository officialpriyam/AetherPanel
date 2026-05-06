<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\DatabaseHost;
use Pterodactyl\Http\Controllers\Controller;

class DatabaseHostController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'data' => DatabaseHost::query()->get(),
        ]);
    }

    public function show(DatabaseHost $databaseHost): JsonResponse
    {
        return new JsonResponse([
            'data' => $databaseHost->loadMissing(['node', 'databases']),
        ]);
    }
}

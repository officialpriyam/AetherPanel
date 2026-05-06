<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Modules\ModuleManager;

class ModuleController extends Controller
{
    public function __construct(private ModuleManager $modules)
    {
    }

    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'data' => array_values(array_map(
                static fn ($module) => $module->toArray(),
                $this->modules->all()
            )),
        ]);
    }
}

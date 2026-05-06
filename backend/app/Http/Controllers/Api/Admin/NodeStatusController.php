<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Node;
use Pterodactyl\Repositories\Wings\DaemonConfigurationRepository;

class NodeStatusController extends Controller
{
    public function __construct(private DaemonConfigurationRepository $repository)
    {
    }

    public function __invoke(Node $node): JsonResponse
    {
        $status = Cache::remember("aetherpanel:node-status:{$node->id}", now()->addSeconds(20), function () use ($node) {
            try {
                $data = $this->repository->setNode($node)->getSystemInformation();

                return [
                    'online' => true,
                    'status' => 'online',
                    'version' => $data['version'] ?? null,
                    'system' => [
                        'type' => $data['os'] ?? null,
                        'arch' => $data['architecture'] ?? null,
                        'release' => $data['kernel_version'] ?? null,
                        'cpus' => $data['cpu_count'] ?? null,
                    ],
                ];
            } catch (\Throwable) {
                return [
                    'online' => false,
                    'status' => 'offline',
                    'version' => null,
                    'system' => null,
                ];
            }
        });

        return new JsonResponse([
            'data' => $status,
        ]);
    }
}

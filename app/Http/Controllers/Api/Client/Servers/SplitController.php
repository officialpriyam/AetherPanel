<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Throwable;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Allocation;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Services\Subusers\SubuserCreationService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Servers\ServerCreationService;
use Pterodactyl\Services\Servers\ServerDeletionService;
use Pterodactyl\Http\Requests\Api\Client\Servers\SplitAccessRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\SplitServerRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\RemoveSplitServerRequest;

class SplitController extends ClientApiController
{
    public function __construct(
        private ServerCreationService $serverCreationService,
        private ServerDeletionService $serverDeletionService,
        private SubuserCreationService $subuserCreationService,
    ) {
        parent::__construct();
    }

    public function index(SplitAccessRequest $request, Server $server): array
    {
        $masterUuid = $server->split_masteruuid ?: $server->uuid;

        $servers = DB::table('servers')
            ->select(['uuid', 'uuidShort', 'name', 'memory', 'disk', 'cpu', 'swap', 'split_masteruuid', 'split_limit', 'created_at'])
            ->where('uuid', $masterUuid)
            ->orWhere('split_masteruuid', $masterUuid)
            ->orderBy('created_at')
            ->get();

        if ($servers->isEmpty()) {
            $servers = collect([$server]);
        }

        $totalAll = [
            'memory' => 0,
            'disk' => 0,
            'cpu' => 0,
            'swap' => 0,
        ];

        $servers = $servers->map(function ($item) use (&$totalAll, $masterUuid) {
            $item->master = $item->uuid === $masterUuid;

            $totalAll['memory'] += (int) $item->memory;
            $totalAll['disk'] += (int) $item->disk;
            $totalAll['cpu'] += (int) $item->cpu;
            $totalAll['swap'] += (int) $item->swap;

            return $item;
        })->values();

        $master = $servers->firstWhere('uuid', $masterUuid) ?? $server;

        return [
            'success' => true,
            'data' => [
                'splitted' => $masterUuid !== $server->uuid || $servers->count() > 1,
                'split_limit' => (int) ($master->split_limit ?? 0),
                'servers' => $servers,
                'master' => $masterUuid,
                'total' => [
                    'memory' => (int) $server->memory,
                    'disk' => (int) $server->disk,
                    'cpu' => (int) $server->cpu,
                    'swap' => (int) $server->swap,
                ],
                'totalall' => $totalAll,
            ],
        ];
    }

    /**
     * @throws DisplayException
     */
    public function split(SplitServerRequest $request, Server $server): array
    {
        $requestedCpu = (int) $request->input('cpu');
        $requestedMemory = (int) $request->input('ram');
        $requestedDisk = (int) $request->input('disk');
        $requestedSwap = (int) $request->input('swap');

        if ($server->cpu - 1 < $requestedCpu) {
            throw new DisplayException('Not enough available CPU to split this server.');
        }

        if ($server->memory - 512 < $requestedMemory) {
            throw new DisplayException('Not enough available RAM to split this server.');
        }

        if ($server->disk - 1 < $requestedDisk) {
            throw new DisplayException('Not enough available disk to split this server.');
        }

        if ($server->swap < $requestedSwap) {
            throw new DisplayException('Not enough available swap to split this server.');
        }

        $masterUuid = $server->split_masteruuid ?: $server->uuid;
        $splitLimit = max(0, (int) ($server->split_limit ?? 0));

        if ($splitLimit < 1) {
            throw new DisplayException('Splitting is not enabled for this server.');
        }

        $existingChildren = Server::query()
            ->where('split_masteruuid', $masterUuid)
            ->where('uuid', '!=', $masterUuid)
            ->count();

        if ($existingChildren >= $splitLimit) {
            throw new DisplayException('The split server limit has been reached.');
        }

        $allocation = Allocation::query()
            ->where('node_id', $server->node_id)
            ->whereNull('server_id')
            ->inRandomOrder()
            ->first();

        if (!$allocation) {
            throw new DisplayException('No free allocations are available on this node.');
        }

        $environment = [];
        foreach ($server->variables as $variable) {
            $environment[$variable->env_variable] = $variable->server_value ?? $variable->default_value;
        }

        try {
            $splitServer = $this->serverCreationService->handle([
                'name' => trim((string) $request->input('name')),
                'description' => 'Split from: ' . $server->name,
                'owner_id' => $server->owner_id,
                'node_id' => $server->node_id,
                'allocation_id' => $allocation->id,
                'allocation_additional' => [],
                'database_limit' => 0,
                'allocation_limit' => 0,
                'backup_limit' => 0,
                'memory' => $requestedMemory,
                'disk' => $requestedDisk,
                'swap' => $requestedSwap,
                'io' => $server->io,
                'cpu' => $requestedCpu,
                'threads' => $server->threads,
                'nest_id' => $server->nest_id,
                'egg_id' => $server->egg_id,
                'startup' => $server->startup,
                'image' => $server->image,
                'environment' => $environment,
                'start_on_completion' => true,
            ]);
        } catch (Throwable) {
            throw new DisplayException('Failed to create split server. Please try again later.');
        }

        DB::transaction(function () use (
            $server,
            $splitServer,
            $masterUuid,
            $splitLimit,
            $requestedCpu,
            $requestedMemory,
            $requestedDisk,
            $requestedSwap
        ) {
            Server::query()->where('id', $splitServer->id)->update([
                'split_masteruuid' => $masterUuid,
                'split_limit' => $splitLimit,
            ]);

            Server::query()->where('id', $server->id)->update([
                'cpu' => max(0, (int) $server->cpu - $requestedCpu),
                'memory' => max(0, (int) $server->memory - $requestedMemory),
                'disk' => max(0, (int) $server->disk - $requestedDisk),
                'swap' => max(0, (int) $server->swap - $requestedSwap),
                'split_masteruuid' => $masterUuid,
            ]);

            if ($server->uuid === $masterUuid) {
                Server::query()->where('id', $server->id)->update(['split_limit' => $splitLimit]);
            }
        });

        if ($request->boolean('subuser')) {
            $server->load('subusers.user');
            foreach ($server->subusers as $subuser) {
                if (!$subuser->user) {
                    continue;
                }

                try {
                    $this->subuserCreationService->handle($splitServer, $subuser->user->email, $subuser->permissions);
                } catch (Throwable) {
                    // Ignore subuser copy failures so server splitting still succeeds.
                }
            }
        }

        return [
            'success' => true,
            'data' => [
                'uuid' => $splitServer->uuid,
                'uuidShort' => $splitServer->uuidShort,
                'name' => $splitServer->name,
            ],
        ];
    }

    /**
     * @throws DisplayException
     */
    public function delete(RemoveSplitServerRequest $request, Server $server): array
    {
        $masterUuid = (string) $request->input('split_masteruuid');
        $targetUuid = (string) $request->input('serveruuid');

        if ($targetUuid === $masterUuid) {
            throw new DisplayException('The master server cannot be deleted using split removal.');
        }

        $target = Server::query()
            ->where('uuid', $targetUuid)
            ->where('split_masteruuid', $masterUuid)
            ->first();

        if (!$target) {
            throw new DisplayException('Split server not found.');
        }

        $master = Server::query()->where('uuid', $masterUuid)->first();
        if (!$master) {
            throw new DisplayException('Master server not found.');
        }

        $resources = [
            'cpu' => (int) $target->cpu,
            'memory' => (int) $target->memory,
            'disk' => (int) $target->disk,
            'swap' => (int) $target->swap,
        ];

        try {
            $this->serverDeletionService->withForce()->handle($target);
        } catch (Throwable) {
            throw new DisplayException('Failed to delete split server.');
        }

        Server::query()->where('id', $master->id)->update([
            'cpu' => $master->cpu + $resources['cpu'],
            'memory' => $master->memory + $resources['memory'],
            'disk' => $master->disk + $resources['disk'],
            'swap' => $master->swap + $resources['swap'],
        ]);

        return ['success' => true];
    }
}

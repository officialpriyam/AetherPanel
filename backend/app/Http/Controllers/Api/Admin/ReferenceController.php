<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Location;
use Pterodactyl\Models\Allocation;
use Pterodactyl\Models\DatabaseHost;
use Pterodactyl\Http\Controllers\Controller;

class ReferenceController extends Controller
{
    public function locations(): JsonResponse
    {
        return new JsonResponse([
            'data' => [
                'locations' => Location::query()
                    ->select(['id', 'short', 'long'])
                    ->withCount(['nodes', 'servers'])
                    ->orderBy('short')
                    ->get()
                    ->map(fn (Location $location) => [
                        'id' => $location->id,
                        'short' => $location->short,
                        'long' => $location->long,
                        'nodes_count' => (int) ($location->nodes_count ?? 0),
                        'servers_count' => (int) ($location->servers_count ?? 0),
                    ])
                    ->values(),
            ],
        ]);
    }

    public function servers(): JsonResponse
    {
        $locations = Location::query()
            ->select(['id', 'short', 'long'])
            ->orderBy('short')
            ->get()
            ->keyBy('id');

        $nests = Nest::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $nodes = Node::query()
            ->select(['id', 'name', 'location_id'])
            ->orderBy('name')
            ->get();

        $allocations = Allocation::query()
            ->select(['id', 'node_id', 'ip', 'ip_alias', 'port', 'server_id'])
            ->orderBy('node_id')
            ->orderBy('ip')
            ->orderBy('port')
            ->get()
            ->groupBy('node_id');

        return new JsonResponse([
            'data' => [
                'users' => User::query()
                    ->select(['id', 'username', 'email'])
                    ->orderBy('username')
                    ->get()
                    ->map(fn (User $user) => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                    ])
                    ->values(),
                'nodes' => $nodes->map(fn (Node $node) => $this->transformNodeReference(
                    $node,
                    $locations,
                    $allocations->get($node->id) ?? collect()
                ))->values(),
                'nests' => $nests->map(fn (Nest $nest) => [
                    'id' => $nest->id,
                    'name' => $nest->name,
                ])->values(),
                'eggs' => $this->transformEggs($nests),
                'databaseHosts' => DatabaseHost::query()
                    ->select(['id', 'name', 'host', 'port', 'node_id'])
                    ->orderBy('name')
                    ->get()
                    ->map(fn (DatabaseHost $host) => [
                        'id' => $host->id,
                        'name' => $host->name,
                        'host' => $host->host,
                        'port' => $host->port,
                        'node_id' => $host->node_id,
                    ])
                    ->values(),
            ],
        ]);
    }

    public function mounts(): JsonResponse
    {
        $nests = Nest::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return new JsonResponse([
            'data' => [
                'nodes' => Node::query()
                    ->select(['id', 'name'])
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Node $node) => [
                        'id' => $node->id,
                        'name' => $node->name,
                    ])
                    ->values(),
                'nests' => $nests->map(fn (Nest $nest) => [
                    'id' => $nest->id,
                    'name' => $nest->name,
                ])->values(),
                'eggs' => $this->transformEggs($nests),
            ],
        ]);
    }

    public function nests(): JsonResponse
    {
        $nests = Nest::query()
            ->select(['id', 'name'])
            ->withCount('eggs')
            ->orderBy('name')
            ->get();

        return new JsonResponse([
            'data' => [
                'nests' => $nests->map(fn (Nest $nest) => [
                    'id' => $nest->id,
                    'name' => $nest->name,
                    'eggs_count' => (int) ($nest->eggs_count ?? 0),
                ])->values(),
                'eggs' => $this->transformEggs($nests),
            ],
        ]);
    }

    /**
     * @param \Illuminate\Support\Collection<int, \Pterodactyl\Models\Allocation> $allocations
     */
    private function transformNodeReference(Node $node, Collection $locations, Collection $allocations): array
    {
        /** @var \Pterodactyl\Models\Location|null $location */
        $location = $locations->get($node->location_id);

        return [
            'id' => $node->id,
            'name' => $node->name,
            'location_id' => $node->location_id,
            'location' => $location ? [
                'id' => $location->id,
                'short' => $location->short,
                'long' => $location->long,
            ] : null,
            'allocations' => $allocations->map(fn (Allocation $allocation) => [
                'id' => $allocation->id,
                'ip' => $allocation->ip,
                'alias' => $allocation->ip_alias,
                'port' => $allocation->port,
                'assigned' => !is_null($allocation->server_id),
            ])->values(),
        ];
    }

    /**
     * @param \Illuminate\Support\Collection<int, \Pterodactyl\Models\Nest> $nests
     */
    private function transformEggs(Collection $nests): Collection
    {
        $nestLookup = $nests->keyBy('id');

        return Egg::query()
            ->select(['id', 'nest_id', 'name', 'docker_images', 'startup'])
            ->with('variables')
            ->orderBy('name')
            ->get()
            ->map(fn (Egg $egg) => [
                'id' => $egg->id,
                'nest_id' => $egg->nest_id,
                'name' => $egg->name,
                'nest_name' => $nestLookup->get($egg->nest_id)?->name,
                'docker_images' => $egg->docker_images ?? [],
                'docker_image' => collect($egg->docker_images ?? [])->values()->first() ?? '',
                'startup' => $egg->startup,
                'variables' => $egg->variables->map(fn ($variable) => [
                    'id' => $variable->id,
                    'name' => $variable->name,
                    'description' => $variable->description,
                    'env_variable' => $variable->env_variable,
                    'default_value' => $variable->default_value,
                    'user_viewable' => (bool) $variable->user_viewable,
                    'user_editable' => (bool) $variable->user_editable,
                    'rules' => $variable->rules,
                    'required' => (bool) $variable->required,
                    'field_type' => 'text',
                ])->values(),
            ])
            ->values();
    }
}

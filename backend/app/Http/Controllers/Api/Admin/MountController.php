<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Ramsey\Uuid\Uuid;
use Illuminate\Http\Request;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Mount;
use Pterodactyl\Models\Node;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\MountFormRequest;

class MountController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'data' => Mount::query()->orderBy('name')->get(),
        ]);
    }

    public function show(Mount $mount): JsonResponse
    {
        return new JsonResponse([
            'data' => $mount->loadMissing(['eggs', 'nodes', 'servers']),
        ]);
    }

    public function store(MountFormRequest $request): JsonResponse
    {
        $mount = new Mount();
        $mount->fill($request->validated());
        $mount->forceFill(['uuid' => Uuid::uuid4()->toString()]);
        $mount->saveOrFail();

        return new JsonResponse([
            'data' => $mount->loadMissing(['eggs', 'nodes', 'servers']),
        ], JsonResponse::HTTP_CREATED);
    }

    public function update(MountFormRequest $request, Mount $mount): JsonResponse
    {
        $mount->forceFill($request->validated())->save();

        return new JsonResponse([
            'data' => $mount->loadMissing(['eggs', 'nodes', 'servers']),
        ]);
    }

    public function destroy(Mount $mount): JsonResponse
    {
        $mount->eggs()->detach();
        $mount->nodes()->detach();
        $mount->servers()->detach();
        $mount->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    public function attachEggs(Request $request, Mount $mount): JsonResponse
    {
        $data = $request->validate([
            'eggs' => ['required', 'array', 'min:1'],
            'eggs.*' => ['integer', 'exists:eggs,id'],
        ]);

        $mount->eggs()->syncWithoutDetaching($data['eggs']);

        return new JsonResponse([
            'data' => $mount->fresh()->loadMissing(['eggs', 'nodes', 'servers']),
        ]);
    }

    public function attachNodes(Request $request, Mount $mount): JsonResponse
    {
        $data = $request->validate([
            'nodes' => ['required', 'array', 'min:1'],
            'nodes.*' => ['integer', 'exists:nodes,id'],
        ]);

        $mount->nodes()->syncWithoutDetaching($data['nodes']);

        return new JsonResponse([
            'data' => $mount->fresh()->loadMissing(['eggs', 'nodes', 'servers']),
        ]);
    }

    public function detachEgg(Mount $mount, int $eggId): JsonResponse
    {
        Egg::query()->findOrFail($eggId);
        $mount->eggs()->detach($eggId);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    public function detachNode(Mount $mount, int $nodeId): JsonResponse
    {
        Node::query()->findOrFail($nodeId);
        $mount->nodes()->detach($nodeId);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
}

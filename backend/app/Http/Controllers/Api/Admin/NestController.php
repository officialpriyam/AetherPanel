<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Nest;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Nests\NestUpdateService;
use Pterodactyl\Services\Nests\NestCreationService;
use Pterodactyl\Services\Nests\NestDeletionService;
use Pterodactyl\Http\Requests\Admin\Nest\StoreNestFormRequest;

class NestController extends Controller
{
    public function __construct(
        private NestCreationService $creationService,
        private NestDeletionService $deletionService,
        private NestUpdateService $updateService,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'data' => Nest::query()
                ->withCount(['eggs', 'servers'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function show(Nest $nest): JsonResponse
    {
        return new JsonResponse([
            'data' => $this->loadNest($nest),
        ]);
    }

    public function store(StoreNestFormRequest $request): JsonResponse
    {
        $nest = $this->creationService->handle($request->normalize());

        return new JsonResponse([
            'data' => $this->loadNest($nest),
        ], JsonResponse::HTTP_CREATED);
    }

    public function update(StoreNestFormRequest $request, Nest $nest): JsonResponse
    {
        $this->updateService->handle($nest->id, $request->normalize());

        return new JsonResponse([
            'data' => $this->loadNest($nest->fresh()),
        ]);
    }

    public function destroy(Nest $nest): JsonResponse
    {
        $this->deletionService->handle($nest->id);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    private function loadNest(Nest $nest): Nest
    {
        return $nest->loadMissing(['eggs.variables', 'eggs.servers', 'servers'])
            ->loadCount(['eggs', 'servers']);
    }
}

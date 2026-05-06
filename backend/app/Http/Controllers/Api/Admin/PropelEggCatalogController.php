<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Eggs\Sharing\PropelEggCatalogService;
use Pterodactyl\Services\Eggs\Sharing\PropelEggImportService;

class PropelEggCatalogController extends Controller
{
    public function __construct(
        private PropelEggCatalogService $catalog,
        private PropelEggImportService $importer,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'os' => 'required|in:linux,windows',
            'page' => 'sometimes|integer|min:1',
            'query' => 'sometimes|nullable|string|max:191',
        ]);

        return new JsonResponse([
            'data' => $this->catalog->list(
                (string) $data['os'],
                (int) ($data['page'] ?? 1),
                (string) ($data['query'] ?? '')
            ),
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nest_id' => 'required|integer|exists:nests,id',
            'os' => 'required|in:linux,windows',
            'identifiers' => 'required|array|min:1',
            'identifiers.*' => 'required|string|max:191',
        ]);

        $imported = collect($data['identifiers'])
            ->map(fn (string $identifier) => $this->importer->handle($identifier, (string) $data['os'], (int) $data['nest_id']))
            ->map(fn ($egg) => [
                'id' => $egg->id,
                'name' => $egg->name,
                'nest_id' => $egg->nest_id,
            ])
            ->values();

        return new JsonResponse([
            'data' => [
                'imported' => $imported,
            ],
        ], JsonResponse::HTTP_CREATED);
    }
}

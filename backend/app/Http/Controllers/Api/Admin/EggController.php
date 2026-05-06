<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\EggVariable;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Eggs\EggUpdateService;
use Pterodactyl\Services\Eggs\EggDeletionService;
use Pterodactyl\Services\Eggs\EggCreationService;
use Pterodactyl\Http\Requests\Admin\Egg\EggFormRequest;
use Pterodactyl\Http\Requests\Admin\Egg\EggScriptFormRequest;
use Pterodactyl\Services\Eggs\Scripts\InstallScriptService;
use Pterodactyl\Http\Requests\Admin\Egg\EggVariableFormRequest;
use Pterodactyl\Services\Eggs\Variables\VariableUpdateService;
use Pterodactyl\Services\Eggs\Variables\VariableCreationService;
use Pterodactyl\Contracts\Repository\EggVariableRepositoryInterface;

class EggController extends Controller
{
    public function __construct(
        private EggCreationService $creationService,
        private EggDeletionService $deletionService,
        private EggUpdateService $updateService,
        private InstallScriptService $installScriptService,
        private VariableCreationService $variableCreationService,
        private VariableUpdateService $variableUpdateService,
        private EggVariableRepositoryInterface $variableRepository,
    ) {
    }

    public function show(Egg $egg): JsonResponse
    {
        return new JsonResponse([
            'data' => $this->serializeEgg($egg),
        ]);
    }

    public function store(EggFormRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['docker_images'] = $this->normalizeDockerImages($data['docker_images'] ?? null);
        $data['config_from'] = empty($data['config_from']) ? null : $data['config_from'];

        $egg = $this->creationService->handle($data);

        return new JsonResponse([
            'data' => $this->serializeEgg($egg),
        ], JsonResponse::HTTP_CREATED);
    }

    public function update(EggFormRequest $request, Egg $egg): JsonResponse
    {
        $data = $request->validated();
        $data['docker_images'] = $this->normalizeDockerImages($data['docker_images'] ?? null);
        $data['config_from'] = empty($data['config_from']) ? null : $data['config_from'];

        $this->updateService->handle($egg, $data);

        return new JsonResponse([
            'data' => $this->serializeEgg($egg->fresh()),
        ]);
    }

    public function destroy(Egg $egg): JsonResponse
    {
        $this->deletionService->handle($egg->id);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    public function updateScript(EggScriptFormRequest $request, Egg $egg): JsonResponse
    {
        $data = $request->normalize();
        $data['copy_script_from'] = empty($data['copy_script_from']) ? null : $data['copy_script_from'];
        $this->installScriptService->handle($egg, $data);

        return new JsonResponse([
            'data' => $this->serializeEgg($egg->fresh()),
        ]);
    }

    public function storeVariable(EggVariableFormRequest $request, Egg $egg): JsonResponse
    {
        $this->variableCreationService->handle($egg->id, $request->normalize());

        return new JsonResponse([
            'data' => $this->serializeEgg($egg->fresh()),
        ], JsonResponse::HTTP_CREATED);
    }

    public function updateVariable(EggVariableFormRequest $request, Egg $egg, EggVariable $variable): JsonResponse
    {
        abort_unless((int) $variable->egg_id === (int) $egg->id, 404);

        $this->variableUpdateService->handle($variable, $request->normalize());

        return new JsonResponse([
            'data' => $this->serializeEgg($egg->fresh()),
        ]);
    }

    public function destroyVariable(Egg $egg, EggVariable $variable): JsonResponse
    {
        abort_unless((int) $variable->egg_id === (int) $egg->id, 404);

        $this->variableRepository->delete($variable->id);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    private function serializeEgg(Egg $egg): array
    {
        $egg = $egg->loadMissing(['nest', 'servers', 'variables', 'scriptFrom', 'configFrom']);

        return array_merge($egg->toArray(), [
            'docker_images_text' => implode("\n", array_map(
                fn ($key, $value) => $key === $value ? $value : $key . '|' . $value,
                array_keys($egg->docker_images ?? []),
                array_values($egg->docker_images ?? [])
            )),
            'copy_script_options' => Egg::query()
                ->where('nest_id', '=', $egg->nest_id)
                ->whereNull('copy_script_from')
                ->where('id', '!=', $egg->id)
                ->orderBy('name')
                ->get(['id', 'name']),
            'script_dependents' => Egg::query()
                ->where('copy_script_from', '=', $egg->id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    private function normalizeDockerImages(?string $input = null): array
    {
        $data = array_map(static fn (string $value) => trim($value), explode("\n", $input ?? ''));

        $images = [];
        foreach ($data as $value) {
            if ($value === '') {
                continue;
            }

            $parts = explode('|', $value, 2);
            $images[$parts[0]] = empty($parts[1]) ? $parts[0] : $parts[1];
        }

        return $images;
    }
}

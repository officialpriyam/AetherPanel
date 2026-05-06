<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\ApiKey;
use Pterodactyl\Services\Acl\Api\AdminAcl;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Api\KeyCreationService;
use Pterodactyl\Http\Requests\Admin\Api\StoreApplicationApiKeyRequest;

class ApplicationApiKeyController extends Controller
{
    public function __construct(private KeyCreationService $keyCreationService)
    {
    }

    public function __invoke(): JsonResponse
    {
        return new JsonResponse([
            'data' => ApiKey::query()
                ->where('key_type', ApiKey::TYPE_APPLICATION)
                ->with('user')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (ApiKey $key) => $this->serializeKey($key)),
        ]);
    }

    public function show(ApiKey $apiKey): JsonResponse
    {
        abort_unless($apiKey->key_type === ApiKey::TYPE_APPLICATION, 404);

        return new JsonResponse([
            'data' => $this->serializeKey($apiKey->loadMissing('user')),
        ]);
    }

    public function store(StoreApplicationApiKeyRequest $request): JsonResponse
    {
        $key = $this->keyCreationService
            ->setKeyType(ApiKey::TYPE_APPLICATION)
            ->handle([
                'memo' => $request->input('memo'),
                'user_id' => $request->user()->id,
            ], $request->getKeyPermissions());

        return new JsonResponse([
            'data' => array_merge($this->serializeKey($key->loadMissing('user')), [
                'plaintext' => $key->identifier . decrypt($key->token),
            ]),
        ], JsonResponse::HTTP_CREATED);
    }

    public function destroy(ApiKey $apiKey): JsonResponse
    {
        abort_unless($apiKey->key_type === ApiKey::TYPE_APPLICATION, 404);

        $apiKey->delete();

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    private function serializeKey(ApiKey $apiKey): array
    {
        return array_merge($apiKey->toArray(), [
            'permissions' => collect(AdminAcl::getResourceList())->mapWithKeys(function (string $resource) use ($apiKey) {
                return [$resource => (int) data_get($apiKey, 'r_' . $resource, AdminAcl::NONE)];
            })->toArray(),
        ]);
    }
}

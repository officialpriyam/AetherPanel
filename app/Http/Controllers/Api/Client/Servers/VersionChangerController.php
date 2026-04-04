<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\Servers\VersionChangerGetRequest;
use Pterodactyl\Http\Requests\Api\Client\Servers\VersionChangerInstallRequest;
use Pterodactyl\Repositories\Eloquent\ServerVariableRepository;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Repositories\Wings\DaemonPowerRepository;

class VersionChangerController extends ClientApiController
{
    private string $fields = 'id,type,projectVersionId,versionId,buildNumber,experimental,created';

    public function __construct(
        private ServerVariableRepository $variableRepository,
        private DaemonFileRepository $fileRepository,
        private DaemonPowerRepository $powerRepository
    ) {
        parent::__construct();
    }

    private function pickAndSortArrayKeys(array $array, array $keys): array
    {
        $keys = array_filter($keys);
        if (empty($keys)) {
            return $array;
        }

        $result = [];
        foreach ($keys as $key) {
            $key = trim($key);
            if (array_key_exists($key, $array)) {
                $result[$key] = $array[$key];
            }
        }

        return $result;
    }

    public function installed(VersionChangerGetRequest $request, Server $server): array
    {
        try {
            $response = $this->powerRepository->setServer($server)->getHttpClient()->get(
                sprintf('/api/servers/%s/version', $server->uuid)
            );
            $wingData = json_decode($response->getBody()->getContents(), true) ?? [];
            $hash = $wingData['hash'] ?? null;

            if ($hash === null) {
                return ['success' => true, 'build' => null, 'latest' => null];
            }

            $url = env('MCVAPI_URL', 'https://versions.mcjars.app');
            $name = config('app.name', 'Pterodactyl');
            $apiResponse = Http::withUserAgent("Version Changer @ {$name}")
                ->timeout(5)
                ->retry(2, 100, throw: false)
                ->withHeaders([
                    'Authorization' => (string) env('MCVAPI_KEY'),
                    'Origin' => (string) env('APP_URL'),
                ])
                ->post("{$url}/api/v2/build?fields={$this->fields}", [
                    'hash' => [
                        'sha256' => $hash,
                    ],
                ]);

            if (!$apiResponse->ok()) {
                return ['success' => true, 'build' => null, 'latest' => null];
            }

            $payload = json_decode($apiResponse->body(), true) ?? [];

            return [
                'success' => true,
                'build' => $payload['build'] ?? null,
                'latest' => $payload['latest'] ?? null,
            ];
        } catch (\Throwable) {
            return ['success' => true, 'build' => null, 'latest' => null];
        }
    }

    public function install(VersionChangerInstallRequest $request, Server $server): array
    {
        $url = env('MCVAPI_URL', 'https://versions.mcjars.app');
        $name = config('app.name', 'Pterodactyl');
        $data = $request->validated();

        $apiResponse = Http::withUserAgent("Version Changer @ {$name}")
            ->timeout(5)
            ->retry(2, 100, throw: false)
            ->withHeaders([
                'Authorization' => (string) env('MCVAPI_KEY'),
                'Origin' => (string) env('APP_URL'),
            ])
            ->post("{$url}/api/v2/build?fields={$this->fields},installation", [
                'id' => (int) $data['build'],
            ]);

        if (!$apiResponse->ok()) {
            return ['success' => false];
        }

        $payload = json_decode($apiResponse->body(), true) ?? [];
        $build = $payload['build'] ?? [];

        $this->powerRepository->setServer($server)->send('kill');

        if ((bool) $data['delete_files']) {
            $files = $this->fileRepository->setServer($server)->getDirectory('/');
            if (count($files) > 0) {
                $this->fileRepository->setServer($server)->deleteFiles(
                    '/',
                    collect($files)->map(fn ($file) => $file['name'])->toArray()
                );
            }
        }

        $this->fileRepository->setServer($server)->deleteFiles('/', ['libraries']);

        foreach (($build['installation'] ?? []) as $chunk) {
            foreach ($chunk as $step) {
                if (!is_array($step) || empty($step['type'])) {
                    continue;
                }

                switch ($step['type']) {
                    case 'download':
                        $this->fileRepository->setServer($server)->pull((string) ($step['url'] ?? ''), '/', [
                            'filename' => (string) ($step['file'] ?? 'server.jar'),
                            'foreground' => true,
                        ]);
                        break;

                    case 'unzip':
                        $this->fileRepository->setServer($server)->decompressFile(
                            ($step['location'] ?? '.') === '.' ? '/' : (string) $step['location'],
                            (string) ($step['file'] ?? '')
                        );
                        break;

                    case 'remove':
                        $this->fileRepository->setServer($server)->deleteFiles('/', [(string) ($step['location'] ?? '')]);
                        break;
                }
            }
        }

        Activity::event('server:version.install')
            ->property('type', $build['type'] ?? null)
            ->property('version', $build['versionId'] ?? $build['projectVersionId'] ?? null)
            ->property(
                'build',
                ($build['buildNumber'] ?? 1) == 1
                    ? ($build['projectVersionId'] ?? ($build['buildNumber'] ?? 1))
                    : ($build['buildNumber'] ?? 1)
            )
            ->property('deleteFiles', (bool) $data['delete_files'])
            ->log();

        try {
            $variable = $server->variables()->where('env_variable', 'SERVER_JARFILE')->first();
            if ($variable) {
                $this->variableRepository->updateOrCreate(
                    [
                        'server_id' => $server->id,
                        'variable_id' => $variable->id,
                    ],
                    ['variable_value' => 'server.jar']
                );
            }
        } catch (\Throwable) {
            // Intentionally ignored: version installation should still succeed.
        }

        $java = (int) ($payload['version']['java'] ?? 21);
        $availableJavaVersions = [];
        foreach ($server->egg->docker_images as $image) {
            $availableJavaVersions[] = (int) preg_replace('/[^0-9]/', '', explode(':', (string) $image)[1] ?? '');
        }

        if (in_array($java, $availableJavaVersions, true)) {
            $index = array_search($java, $availableJavaVersions, true);
            if ($index !== false) {
                $server->forceFill([
                    'image' => array_values($server->egg->docker_images)[$index],
                ])->save();
            }
        }

        return ['success' => true];
    }

    public function types(VersionChangerGetRequest $request, Server $server): array
    {
        $url = env('MCVAPI_URL', 'https://versions.mcjars.app');
        $name = config('app.name', 'Pterodactyl');
        $types = Cache::remember('minecraftVersionTypes', 300, function () use ($url, $name) {
            $apiKey = env('MCVAPI_KEY');

            if ($apiKey === null) {
                $response = Http::withUserAgent("Version Changer @ {$name}")
                    ->timeout(5)
                    ->retry(2, 100, throw: false)
                    ->get("{$url}/api/v1/types");
            } else {
                $response = Http::withUserAgent("Version Changer @ {$name}")
                    ->timeout(5)
                    ->retry(2, 100, throw: false)
                    ->withHeaders([
                        'Authorization' => (string) $apiKey,
                        'Origin' => (string) env('APP_URL'),
                    ])
                    ->get("{$url}/api/organization/v1/types");
            }

            if (!$response->ok()) {
                return ['success' => false, 'types' => []];
            }

            return json_decode($response->body(), true) ?? ['success' => false, 'types' => []];
        });

        $sortOrder = DB::table('settings')->where('key', 'settings::mcvapi:types')->value('value');
        $picked = $this->pickAndSortArrayKeys($types['types'] ?? [], explode(',', (string) $sortOrder));

        return [
            'success' => true,
            'types' => $picked,
        ];
    }

    public function versions(VersionChangerGetRequest $request, Server $server): array
    {
        $url = env('MCVAPI_URL', 'https://versions.mcjars.app');
        $name = config('app.name', 'Pterodactyl');
        $type = strtoupper((string) $request->route('type'));

        return Cache::remember("minecraftVersionTypeVersions-{$type}", 120, function () use ($url, $name, $type) {
            $response = Http::withUserAgent("Version Changer @ {$name}")
                ->timeout(5)
                ->retry(2, 100, throw: false)
                ->withHeaders([
                    'Authorization' => (string) env('MCVAPI_KEY', ''),
                    'Origin' => (string) env('APP_URL'),
                ])
                ->get("{$url}/api/v2/builds/{$type}?fields={$this->fields}");

            if (!$response->ok()) {
                return ['success' => false, 'builds' => []];
            }

            return json_decode($response->body(), true) ?? ['success' => false, 'builds' => []];
        });
    }

    public function builds(VersionChangerGetRequest $request, Server $server): array
    {
        $url = env('MCVAPI_URL', 'https://versions.mcjars.app');
        $name = config('app.name', 'Pterodactyl');
        $type = strtoupper((string) $request->route('type'));
        $version = (string) $request->route('version');

        return Cache::remember("minecraftVersionTypeBuilds-{$type}-{$version}", 120, function () use ($url, $name, $type, $version) {
            $response = Http::withUserAgent("Version Changer @ {$name}")
                ->timeout(5)
                ->retry(2, 100, throw: false)
                ->withHeaders([
                    'Authorization' => (string) env('MCVAPI_KEY', ''),
                    'Origin' => (string) env('APP_URL'),
                ])
                ->get("{$url}/api/v2/builds/{$type}/{$version}?fields={$this->fields}");

            if (!$response->ok()) {
                return ['success' => false, 'builds' => []];
            }

            return json_decode($response->body(), true) ?? ['success' => false, 'builds' => []];
        });
    }
}

<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Models\BagouLicense;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Repositories\Eloquent\ServerVariableRepository;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Services\Eggs\Sharing\EggUrlBagouImporterService;
use Pterodactyl\Services\Servers\ReinstallServerService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class McModpacksController extends ClientApiController
{
    public function __construct(
        private DaemonFileRepository $fileRepository,
        private ServerRepository $repository,
        private EggUrlBagouImporterService $eggImporter,
        private ServerVariableRepository $variablesRepository,
        private ReinstallServerService $reinstallServerService
    ) {
        parent::__construct();
    }

    public function getModPacks(Request $request): JsonResponse
    {
        $response = Http::acceptJson()->timeout(30)->get(
            'https://api.bagou450.com/api/client/pterodactyl/modpacks/',
            [
                'page' => $request->query('page'),
                'search' => $request->query('search'),
                'id' => $this->getLicense(),
                'type' => $request->query('type'),
                'game_versions' => $request->query('version'),
                'loaders' => $request->query('loader'),
            ]
        );

        if ($response->failed()) {
            throw new BadRequestHttpException('Unable to fetch modpacks right now.');
        }

        return new JsonResponse($response->json());
    }

    public function getMcVersions(): JsonResponse
    {
        $response = Http::acceptJson()->timeout(30)->get(
            'https://api.bagou450.com/api/client/pterodactyl/modpacks/getMcVersions',
            ['id' => $this->getLicense()]
        );

        if ($response->failed()) {
            throw new BadRequestHttpException('Unable to fetch Minecraft versions right now.');
        }

        return new JsonResponse($response->json());
    }

    public function getModpacksDescription(Request $request): JsonResponse
    {
        $modpackId = (string) $request->query('modpackId', '');
        if ($modpackId === '') {
            throw new BadRequestHttpException('The modpackId query parameter is required.');
        }

        $response = Http::acceptJson()->timeout(30)->get(
            'https://api.bagou450.com/api/client/pterodactyl/modpacks/getMcModpacksDescription',
            [
                'modpackId' => $modpackId,
                'id' => $this->getLicense(),
                'type' => $request->query('type'),
            ]
        );

        if ($response->failed()) {
            throw new BadRequestHttpException('Unable to fetch modpack description.');
        }

        return new JsonResponse($response->json());
    }

    public function install(Request $request, Server $server): JsonResponse
    {
        $type = (string) $request->input('type', '');
        if ($type === '') {
            throw new BadRequestHttpException('The type field is required.');
        }

        $license = $this->getLicense();
        $modpack = (array) $request->input('modpack', []);

        if ($type === 'voidswrath') {
            return $this->installVoidswrath($request, $server, $license, $modpack);
        }

        if ($type === 'ftb') {
            $egg = $this->eggImporter->handle('ftb', (string) $server->nest_id);

            $this->repository->update($server->id, [
                'mcversion' => (string) ($modpack['name'] ?? ''),
                'oldegg' => $server->egg_id,
                'egg_id' => $egg->id,
            ]);

            $server = Server::query()->findOrFail($server->id);
            $this->setServerVariable($server, 'MODPACK_ID', (string) ($modpack['id'] ?? ''));
            $this->setServerVariable($server, 'MODPACK_VERSION', (string) ($modpack['versionid'] ?? ''));
            $this->reinstallServerService->handle($server);
            $this->logInstall((string) ($modpack['name'] ?? 'FTB Modpack'));

            return new JsonResponse([], Response::HTTP_NO_CONTENT);
        }

        if ($type === 'technicpack') {
            $egg = $this->eggImporter->handle('technicpack', (string) $server->nest_id);

            $this->repository->update($server->id, [
                'mcversion' => (string) ($modpack['name'] ?? ''),
                'oldegg' => $server->egg_id,
                'egg_id' => $egg->id,
            ]);

            $server = Server::query()->findOrFail($server->id);
            $this->setServerVariable($server, 'DOWNLOAD_URL', (string) ($modpack['downloadlink'] ?? ''));
            $this->reinstallServerService->handle($server);
            $this->logInstall((string) ($modpack['name'] ?? 'Technic Modpack'));

            return new JsonResponse([], Response::HTTP_NO_CONTENT);
        }

        if ($type === 'curseforge' || $type === 'modrinth') {
            $egg = $this->eggImporter->handle('curseforge', (string) $server->nest_id);

            $this->repository->update($server->id, [
                'mcversion' => (string) ($modpack['name'] ?? ''),
                'oldegg' => $server->egg_id,
                'egg_id' => $egg->id,
            ]);

            $modpackId = (string) ($modpack['id'] ?? '');
            if ($modpackId === '') {
                throw new BadRequestHttpException('The selected modpack is invalid.');
            }

            $downloadData = Http::acceptJson()->timeout(30)->get(
                "https://api.bagou450.com/api/client/pterodactyl/modpacks/download?id={$license}&type={$type}&modpackid={$modpackId}"
            )->object();

            if (!$downloadData || ($downloadData->message ?? 'Error') === 'Error') {
                throw new NotFoundHttpException();
            }

            $server = Server::query()->findOrFail($server->id);
            $this->setServerVariable($server, 'DOWNLOAD_URL', (string) ($downloadData->data ?? ''));
            $this->setServerVariable($server, 'MCVERSION', (string) ($downloadData->mcversion ?? ''));
            $this->setServerVariable($server, 'LOADER', (string) ($downloadData->loader ?? ''));
            $this->reinstallServerService->handle($server);
            $this->logInstall((string) ($modpack['name'] ?? ucfirst($type) . ' Modpack'));

            return new JsonResponse([], Response::HTTP_NO_CONTENT);
        }

        throw new BadRequestHttpException('Unsupported modpack type.');
    }

    public function getversionsize(Server $server, Request $request): JsonResponse
    {
        $filename = (string) $request->query('filename', '');
        if ($filename === '') {
            throw new BadRequestHttpException('The filename query parameter is required.');
        }

        $contents = $this->fileRepository
            ->setServer($server)
            ->getDirectory((string) $request->query('directory', '/'));

        $entry = collect($contents)->first(fn (array $item) => ($item['name'] ?? '') === $filename);
        if (!$entry) {
            throw new NotFoundHttpException('File not found on server.');
        }

        return new JsonResponse((int) ($entry['size'] ?? 0));
    }

    private function installVoidswrath(Request $request, Server $server, string $license, array $modpack): JsonResponse
    {
        $step = (int) $request->input('step', 0);

        if ($step === 0) {
            $downloadLink = (string) ($modpack['downloadlink'] ?? '');
            if ($downloadLink === '') {
                throw new BadRequestHttpException('The selected modpack is invalid.');
            }

            $downloadMeta = Http::acceptJson()->timeout(60)->get(
                "https://api.bagou450.com/api/client/pterodactyl/modpacks/download?id={$license}&data={$downloadLink}&type=voidswrath"
            )->json();

            if (!is_array($downloadMeta) || ($downloadMeta['message'] ?? 'Error') !== 'Good') {
                throw new NotFoundHttpException('Unable to fetch this modpack package.');
            }

            $this->fileRepository->setServer($server)->pull((string) $downloadMeta['data'], '/');

            $this->repository->update($server->id, [
                'mcversion' => (string) ($modpack['name'] ?? ''),
                'oldegg' => $server->egg_id,
            ]);

            $this->logInstall((string) ($modpack['name'] ?? 'VoidsWrath Modpack'));

            Server::query()->where('id', $server->id)->update([
                'startup' => 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true $( [ ! -f unix_args.txt ] && printf %s "-jar server.jar" || printf %s "@unix_args.txt" )',
            ]);

            return new JsonResponse((int) ($downloadMeta['size'] ?? 0));
        }

        if ($step === 1) {
            $contents = $this->fileRepository
                ->setServer($server)
                ->getDirectory((string) $request->query('directory', '/'));

            foreach ($contents as $file) {
                $name = (string) ($file['name'] ?? '');
                if ($name === '') {
                    continue;
                }

                if (str_starts_with($name, 'forge') || str_starts_with($name, 'fabric')) {
                    $this->fileRepository
                        ->setServer($server)
                        ->renameFiles('/', [['from' => $name, 'to' => 'server.jar']]);
                }

                if (str_ends_with($name, '.bat') || str_ends_with($name, '.sh')) {
                    $this->fileRepository->setServer($server)->deleteFiles('/', [$name]);
                }
            }

            return new JsonResponse([], Response::HTTP_NO_CONTENT);
        }

        throw new BadRequestHttpException('Invalid installation step.');
    }

    private function getLicense(): string
    {
        $license = BagouLicense::query()->where('addon', '327')->first();

        if (!$license || !$license->enabled || empty($license->license)) {
            throw new BadRequestHttpException('No active modpack license found. Configure it in admin first.');
        }

        return $license->license;
    }

    private function setServerVariable(Server $server, string $envVariable, string $value): void
    {
        $variable = $server->variables()->where('env_variable', $envVariable)->first();
        if (!$variable) {
            return;
        }

        $this->variablesRepository->updateOrCreate(
            [
                'server_id' => $server->id,
                'variable_id' => $variable->id,
            ],
            [
                'variable_value' => $value,
            ]
        );
    }

    private function logInstall(string $name): void
    {
        Activity::event('server:versions.install')
            ->property('name', $name)
            ->log();
    }
}

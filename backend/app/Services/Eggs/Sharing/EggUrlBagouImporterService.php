<?php

namespace Pterodactyl\Services\Eggs\Sharing;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\BagouLicense;
use Pterodactyl\Models\EggVariable;
use Illuminate\Database\ConnectionInterface;
use Ramsey\Uuid\Uuid;
use Pterodactyl\Services\Eggs\EggParserService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class EggUrlBagouImporterService
{
    protected ConnectionInterface $connection;

    protected EggParserService $parser;

    public function __construct(ConnectionInterface $connection, EggParserService $parser)
    {
        $this->connection = $connection;
        $this->parser = $parser;
    }

    public function handle(string $type, string $nest): Egg
    {
        $license = BagouLicense::query()->where('addon', '327')->first();
        if (!$license || !$license->enabled || empty($license->license)) {
            throw new BadRequestHttpException('No active modpack license found. Configure it in admin first.');
        }

        $response = Http::acceptJson()
            ->timeout(30)
            ->get('https://api.bagou450.com/api/client/pterodactyl/modpacks/getEgg', [
                'id' => $license->license,
                'type' => $type,
            ]);

        if ($response->failed()) {
            throw new NotFoundHttpException('Unable to fetch egg definition for this modpack type.');
        }

        $parsed = $response->json();
        if (!is_array($parsed) || empty($parsed['name'])) {
            throw new NotFoundHttpException('Invalid egg payload returned by modpack provider.');
        }

        $existingEgg = Egg::query()->where('name', '=', $parsed['name'])->first();

        if (!$existingEgg) {
            $nestModel = Nest::query()->with('eggs', 'eggs.variables')->findOrFail($nest);

            return $this->connection->transaction(function () use ($nestModel, $parsed) {
                $egg = (new Egg())->forceFill([
                    'uuid' => Uuid::uuid4()->toString(),
                    'nest_id' => $nestModel->id,
                    'author' => Arr::get($parsed, 'author'),
                    'copy_script_from' => null,
                ]);

                $egg = $this->parser->fillFromParsed($egg, $parsed);
                $egg->save();

                foreach ($parsed['variables'] ?? [] as $variable) {
                    EggVariable::query()->forceCreate(array_merge($variable, ['egg_id' => $egg->id]));
                }

                return $egg;
            });
        } else {
            return $this->connection->transaction(function () use ($existingEgg, $parsed) {
                $egg = $existingEgg;
                $egg = $this->parser->fillFromParsed($egg, $parsed);
                $egg->save();
    
                // Update existing variables or create new ones.
                foreach ($parsed['variables'] ?? [] as $variable) {
                    EggVariable::unguarded(function () use ($egg, $variable) {
                        $egg->variables()->updateOrCreate([
                            'env_variable' => $variable['env_variable'],
                        ], Collection::make($variable)->except('egg_id', 'env_variable')->toArray());
                    });
                }
    
                $imported = array_map(fn ($value) => $value['env_variable'], $parsed['variables'] ?? []);
    
                $egg->variables()->whereNotIn('env_variable', $imported)->delete();
    
                return $egg->refresh();
            });
        }
    }
}

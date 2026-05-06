<?php

namespace Pterodactyl\Services\Eggs\Sharing;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\EggVariable;
use Pterodactyl\Models\Nest;
use Pterodactyl\Services\Eggs\EggParserService;
use Ramsey\Uuid\Uuid;

class PropelEggImportService
{
    public function __construct(
        private ConnectionInterface $connection,
        private EggParserService $parser,
        private PropelEggCatalogService $catalog,
    ) {
    }

    public function handle(string $identifier, string $os, int $nestId): Egg
    {
        $parsed = $this->parser->parseArray($this->catalog->download($identifier, $os));
        /** @var Nest $nest */
        $nest = Nest::query()->findOrFail($nestId);

        $existingEgg = Egg::query()
            ->where('nest_id', $nest->id)
            ->where('name', Arr::get($parsed, 'name'))
            ->first();

        if (!$existingEgg) {
            return $this->connection->transaction(function () use ($nest, $parsed) {
                $egg = (new Egg())->forceFill([
                    'uuid' => Uuid::uuid4()->toString(),
                    'nest_id' => $nest->id,
                    'author' => Arr::get($parsed, 'author'),
                    'copy_script_from' => null,
                ]);

                $egg = $this->parser->fillFromParsed($egg, $parsed);
                $egg->save();

                foreach ($parsed['variables'] ?? [] as $variable) {
                    EggVariable::query()->forceCreate(array_merge(
                        Collection::make($variable)->except('field_type')->toArray(),
                        ['egg_id' => $egg->id]
                    ));
                }

                return $egg->refresh();
            });
        }

        return $this->connection->transaction(function () use ($existingEgg, $parsed) {
            $egg = $this->parser->fillFromParsed($existingEgg, $parsed);
            $egg->save();

            foreach ($parsed['variables'] ?? [] as $variable) {
                EggVariable::unguarded(function () use ($egg, $variable) {
                    $egg->variables()->updateOrCreate(
                        ['env_variable' => $variable['env_variable']],
                        Collection::make($variable)->except('egg_id', 'env_variable', 'field_type')->toArray()
                    );
                });
            }

            $imported = array_map(fn ($value) => $value['env_variable'], $parsed['variables'] ?? []);
            $egg->variables()->whereNotIn('env_variable', $imported)->delete();

            return $egg->refresh();
        });
    }
}

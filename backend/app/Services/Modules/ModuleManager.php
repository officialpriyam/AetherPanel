<?php

namespace Pterodactyl\Services\Modules;

use Illuminate\Contracts\Config\Repository as ConfigRepository;

class ModuleManager
{
    /**
     * @var array<string, Module>|null
     */
    private ?array $modules = null;

    public function __construct(private ConfigRepository $config)
    {
    }

    /**
     * @return array<string, Module>
     */
    public function all(): array
    {
        if ($this->modules !== null) {
            return $this->modules;
        }

        $this->modules = [];
        $basePath = (string) $this->config->get('modules.path', base_path('modules'));

        if (!is_dir($basePath)) {
            return $this->modules;
        }

        foreach (scandir($basePath) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $modulePath = $basePath . DIRECTORY_SEPARATOR . $entry;
            $manifestPath = $modulePath . DIRECTORY_SEPARATOR . 'module.php';

            if (!is_dir($modulePath) || !is_file($manifestPath)) {
                continue;
            }

            $manifest = require $manifestPath;
            if (!is_array($manifest)) {
                continue;
            }

            $id = $this->normalizeId((string) ($manifest['id'] ?? $entry));
            if ($id === null) {
                continue;
            }

            $this->modules[$id] = new Module($id, $modulePath, $manifest);
        }

        ksort($this->modules);

        return $this->modules;
    }

    /**
     * @return array<string, Module>
     */
    public function enabled(): array
    {
        if (!$this->config->get('modules.enabled', true)) {
            return [];
        }

        return array_filter(
            $this->all(),
            static fn (Module $module) => $module->enabled()
        );
    }

    public function find(string $id): ?Module
    {
        $id = $this->normalizeId($id);

        return $id === null ? null : ($this->all()[$id] ?? null);
    }

    /**
     * @return string[]
     */
    public function apiKeysFor(string $id): array
    {
        $module = $this->find($id);
        if (!$module) {
            return [];
        }

        $configured = $this->config->get('modules.tokens.' . $module->id(), []);
        if (is_string($configured)) {
            $configured = [$configured];
        }

        return array_values(array_unique(array_filter(array_merge(
            $module->apiKeys(),
            array_map(static fn ($key) => is_string($key) ? trim($key) : '', is_array($configured) ? $configured : [])
        ))));
    }

    /**
     * @return string[]
     */
    public function providers(): array
    {
        $providers = [];

        foreach ($this->enabled() as $module) {
            foreach ($module->providers() as $provider) {
                $providers[] = $provider;
            }
        }

        return array_values(array_unique($providers));
    }

    private function normalizeId(string $id): ?string
    {
        $id = strtolower(trim($id));

        return preg_match('/^[a-z0-9][a-z0-9_-]*$/', $id) === 1 ? $id : null;
    }
}

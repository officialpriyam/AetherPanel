<?php

namespace Pterodactyl\Services\Modules;

class Module
{
    public function __construct(
        private string $id,
        private string $path,
        private array $manifest,
    ) {
    }

    public function id(): string
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->stringValue('name', $this->id);
    }

    public function description(): string
    {
        return $this->stringValue('description', '');
    }

    public function version(): string
    {
        return $this->stringValue('version', '1.0.0');
    }

    public function path(): string
    {
        return $this->path;
    }

    public function enabled(): bool
    {
        return $this->boolValue('enabled', true);
    }

    /**
     * @return string[]
     */
    public function providers(): array
    {
        $providers = $this->manifest['providers'] ?? [];

        if (is_string($providers)) {
            $providers = [$providers];
        }

        return array_values(array_filter($providers, 'is_string'));
    }

    public function apiRoutesPath(): ?string
    {
        $routes = $this->manifest['routes'] ?? null;
        $routePath = null;

        if (is_string($routes)) {
            $routePath = $routes;
        } elseif (is_array($routes) && is_string($routes['api'] ?? null)) {
            $routePath = $routes['api'];
        }

        if ($routePath === null || trim($routePath) === '') {
            return null;
        }

        $resolved = $this->resolvePath($routePath);

        return is_file($resolved) ? $resolved : null;
    }

    /**
     * @return string[]
     */
    public function apiKeys(): array
    {
        $keys = $this->manifest['api_keys'] ?? $this->manifest['api_key'] ?? [];

        if (is_string($keys)) {
            $keys = [$keys];
        }

        return array_values(array_filter(array_map(
            static fn ($key) => is_string($key) ? trim($key) : '',
            is_array($keys) ? $keys : []
        )));
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id(),
            'name' => $this->name(),
            'description' => $this->description(),
            'version' => $this->version(),
            'enabled' => $this->enabled(),
            'has_api_routes' => $this->apiRoutesPath() !== null,
            'providers' => $this->providers(),
        ];
    }

    private function stringValue(string $key, string $fallback): string
    {
        $value = $this->manifest[$key] ?? null;

        return is_scalar($value) && trim((string) $value) !== '' ? trim((string) $value) : $fallback;
    }

    private function boolValue(string $key, bool $fallback): bool
    {
        $value = $this->manifest[$key] ?? $fallback;

        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
    }

    private function resolvePath(string $path): string
    {
        if (str_starts_with($path, DIRECTORY_SEPARATOR) || preg_match('/^[A-Za-z]:[\\\\\\/]/', $path) === 1) {
            return $path;
        }

        return $this->path . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
    }
}

<?php

namespace Pterodactyl\Services\Flash;

use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ThemeVersionService
{
    public function getStatus(): array
    {
        $currentVersion = $this->normalizeVersion((string) config('flash_theme.version', '1.0.0'));
        $repository = (string) config('flash_theme.repository');
        $release = $this->fetchLatestRelease();
        $latestVersion = $this->normalizeVersion((string) Arr::get($release, 'version', ''));

        return [
            'name' => (string) config('flash_theme.name', 'Flash Ptero Theme'),
            'repository' => $repository,
            'current_version' => $currentVersion,
            'latest_version' => $latestVersion ?: null,
            'latest_url' => Arr::get($release, 'url', $repository),
            'published_at' => Arr::get($release, 'published_at'),
            'has_update' => $latestVersion !== '' && version_compare($currentVersion, $latestVersion, '<'),
            'checked' => !empty($release),
        ];
    }

    protected function fetchLatestRelease(): array
    {
        if (!config('flash_theme.version_check_enabled')) {
            return [];
        }

        $cacheKey = (string) config('flash_theme.cache_key', 'flash-theme:release-data');
        $ttl = CarbonImmutable::now()->addMinutes((int) config('flash_theme.cache_minutes', 30));
        $timeout = (int) config('flash_theme.http_timeout', 3);
        $connectTimeout = (int) config('flash_theme.connect_timeout', 2);

        return Cache::remember($cacheKey, $ttl, function () use ($timeout, $connectTimeout) {
            $headers = [
                'Accept' => 'application/vnd.github+json',
                'User-Agent' => config('app.name', 'Pterodactyl') . ' Theme Update Checker',
            ];

            try {
                $releaseResponse = Http::withHeaders($headers)
                    ->connectTimeout($connectTimeout)
                    ->timeout($timeout)
                    ->get((string) config('flash_theme.api_release_url'));

                if ($releaseResponse->successful() && $releaseResponse->json('tag_name')) {
                    return [
                        'version' => $releaseResponse->json('tag_name'),
                        'url' => $releaseResponse->json('html_url'),
                        'published_at' => $releaseResponse->json('published_at'),
                    ];
                }

                $tagsResponse = Http::withHeaders($headers)
                    ->connectTimeout($connectTimeout)
                    ->timeout($timeout)
                    ->get((string) config('flash_theme.api_tags_url'));

                if ($tagsResponse->successful() && is_array($tagsResponse->json()) && !empty($tagsResponse->json()[0]['name'])) {
                    $tag = $tagsResponse->json()[0]['name'];

                    return [
                        'version' => $tag,
                        'url' => rtrim((string) config('flash_theme.repository'), '/') . '/releases/tag/' . $tag,
                        'published_at' => null,
                    ];
                }
            } catch (\Throwable) {
                return [];
            }

            return [];
        });
    }

    protected function normalizeVersion(string $version): string
    {
        return ltrim(trim($version), 'vV');
    }
}

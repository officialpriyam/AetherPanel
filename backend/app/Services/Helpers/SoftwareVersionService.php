<?php

namespace Pterodactyl\Services\Helpers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class SoftwareVersionService
{
    public const VERSION_CACHE_KEY = 'aetherpanel:versioning_data';

    private static array $result;

    public function __construct()
    {
        self::$result = $this->cacheVersionData();
    }

    public function getPanel(): string
    {
        return Arr::get(self::$result, 'panel') ?? 'unknown';
    }

    public function getDaemon(): string
    {
        return Arr::get(self::$result, 'wings') ?? 'unknown';
    }

    public function getDiscord(): string
    {
        return Arr::get(self::$result, 'discord') ?? '';
    }

    public function getDonations(): string
    {
        return Arr::get(self::$result, 'donations') ?? '';
    }

    public function getRepository(): string
    {
        return Arr::get(self::$result, 'repository') ?? (string) config('pterodactyl.cdn.repository', '');
    }

    public function getLatestUrl(): string
    {
        return Arr::get(self::$result, 'latest_url') ?? $this->getRepository();
    }

    public function isLatestPanel(): bool
    {
        $latest = $this->getPanel();
        $current = (string) config('app.version');

        if ($current === '' || $current === 'canary' || $latest === '' || $latest === 'unknown') {
            return true;
        }

        return version_compare(ltrim($current, 'vV'), ltrim($latest, 'vV')) >= 0;
    }

    public function isLatestDaemon(string $version): bool
    {
        $latest = $this->getDaemon();

        if ($version === 'develop' || $latest === '' || $latest === 'unknown') {
            return true;
        }

        return version_compare(ltrim($version, 'vV'), ltrim($latest, 'vV')) >= 0;
    }

    protected function cacheVersionData(): array
    {
        if (!config('pterodactyl.cdn.enabled')) {
            return [];
        }

        return Cache::remember(self::VERSION_CACHE_KEY, CarbonImmutable::now()->addMinutes((int) config('pterodactyl.cdn.cache_time', 30)), function () {
            $headers = [
                'Accept' => 'application/vnd.github+json',
                'User-Agent' => config('app.name', 'AetherPanel') . ' Version Checker',
            ];
            $timeout = (float) config('pterodactyl.guzzle.timeout', 15);
            $connectTimeout = (float) config('pterodactyl.guzzle.connect_timeout', 5);
            $repository = (string) config('pterodactyl.cdn.repository', '');

            try {
                $releaseResponse = Http::withHeaders($headers)
                    ->connectTimeout($connectTimeout)
                    ->timeout($timeout)
                    ->get((string) config('pterodactyl.cdn.api_release_url'));

                if ($releaseResponse->successful() && $releaseResponse->json('tag_name')) {
                    return [
                        'panel' => ltrim((string) $releaseResponse->json('tag_name'), 'vV'),
                        'wings' => (string) config('pterodactyl.cdn.wings_version', ''),
                        'discord' => (string) config('pterodactyl.cdn.discord', ''),
                        'donations' => (string) config('pterodactyl.cdn.donations', ''),
                        'repository' => $repository,
                        'latest_url' => (string) ($releaseResponse->json('html_url') ?: $repository),
                    ];
                }

                $tagsResponse = Http::withHeaders($headers)
                    ->connectTimeout($connectTimeout)
                    ->timeout($timeout)
                    ->get((string) config('pterodactyl.cdn.api_tags_url'));

                if ($tagsResponse->successful() && is_array($tagsResponse->json()) && !empty($tagsResponse->json()[0]['name'])) {
                    $tag = ltrim((string) $tagsResponse->json()[0]['name'], 'vV');

                    return [
                        'panel' => $tag,
                        'wings' => (string) config('pterodactyl.cdn.wings_version', ''),
                        'discord' => (string) config('pterodactyl.cdn.discord', ''),
                        'donations' => (string) config('pterodactyl.cdn.donations', ''),
                        'repository' => $repository,
                        'latest_url' => $repository !== '' ? rtrim($repository, '/') . '/releases/tag/v' . $tag : '',
                    ];
                }
            } catch (\Throwable) {
                return [];
            }

            return [];
        });
    }
}

<?php

namespace Pterodactyl\Services\PteroGPT;

use Illuminate\Support\Facades\Cache;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class RateLimiter
{
    public const ACTION_CHAT = 'chat';
    public const ACTION_READ = 'read';
    public const ACTION_WRITE = 'write';
    public const ACTION_COMMAND = 'command';

    private array $defaultLimits = [
        self::ACTION_CHAT => 50,
        self::ACTION_READ => 100,
        self::ACTION_WRITE => 20,
        self::ACTION_COMMAND => 10,
    ];

    public function __construct(
        private SettingsRepositoryInterface $settings,
    ) {
    }

    public function check(int $serverId, string $actionType): void
    {
        $limit = $this->getLimit($actionType);
        $key = $this->getCacheKey($serverId, $actionType);

        $current = (int) Cache::get($key, 0);

        if ($current >= $limit) {
            throw new DisplayException("Rate limit exceeded for {$actionType}. Please try again later.");
        }
    }

    public function increment(int $serverId, string $actionType): void
    {
        $key = $this->getCacheKey($serverId, $actionType);
        $current = (int) Cache::get($key, 0);

        Cache::put($key, $current + 1, now()->addHour());
    }

    public function getRemaining(int $serverId): array
    {
        $remaining = [];

        foreach (array_keys($this->defaultLimits) as $action) {
            $limit = $this->getLimit($action);
            $key = $this->getCacheKey($serverId, $action);
            $current = (int) Cache::get($key, 0);

            $remaining[$action] = [
                'used' => $current,
                'limit' => $limit,
                'remaining' => max(0, $limit - $current),
            ];
        }

        return $remaining;
    }

    private function getLimit(string $actionType): int
    {
        $settingKey = 'pterogpt::limit_' . $actionType;
        $limit = $this->settings->get($settingKey);

        return $limit !== null ? (int) $limit : $this->defaultLimits[$actionType];
    }

    private function getCacheKey(int $serverId, string $actionType): string
    {
        $hour = now()->format('Y-m-d-H');
        return "pterogpt:limits:{$serverId}:{$actionType}:{$hour}";
    }
}
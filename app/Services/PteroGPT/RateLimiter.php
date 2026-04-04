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

    private array $defaults = [
        self::ACTION_CHAT => 50,
        self::ACTION_READ => 100,
        self::ACTION_WRITE => 20,
        self::ACTION_COMMAND => 10,
    ];

    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    /**
     * @throws DisplayException
     */
    public function check(int $serverId, string $actionType): void
    {
        $limit = $this->getLimit($actionType);
        $key = $this->getCacheKey($serverId, $actionType);

        $current = (int) Cache::get($key, 0);
        if ($current >= $limit) {
            throw new DisplayException('Rate limit reached for AI requests. Please try again later.');
        }
    }

    public function increment(int $serverId, string $actionType): void
    {
        $key = $this->getCacheKey($serverId, $actionType);

        Cache::put($key, ((int) Cache::get($key, 0)) + 1, now()->addHour());
    }

    public function getRemaining(int $serverId): array
    {
        $remaining = [];

        foreach (array_keys($this->defaults) as $actionType) {
            $limit = $this->getLimit($actionType);
            $used = (int) Cache::get($this->getCacheKey($serverId, $actionType), 0);

            $remaining[$actionType] = [
                'used' => $used,
                'limit' => $limit,
                'remaining' => max(0, $limit - $used),
            ];
        }

        return $remaining;
    }

    private function getLimit(string $actionType): int
    {
        $fallback = $this->defaults[$actionType] ?? 10;
        $value = $this->settings->get('pterogpt::limit_' . $actionType, (string) $fallback);

        return max(1, (int) $value);
    }

    private function getCacheKey(int $serverId, string $actionType): string
    {
        return sprintf('pterogpt:limits:%d:%s:%s', $serverId, $actionType, now()->format('Y-m-d-H'));
    }
}

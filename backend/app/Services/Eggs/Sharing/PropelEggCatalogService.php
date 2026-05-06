<?php

namespace Pterodactyl\Services\Eggs\Sharing;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PropelEggCatalogService
{
    private const BASE_URL = 'https://propel-eggs.vercel.app';

    public function list(string $os, int $page = 1, string $query = ''): array
    {
        $os = $this->normalizeOs($os);
        $page = max(1, $page);
        $firstPage = $this->requestHivePage($os, $page);
        $data = Arr::get($firstPage, 'data', []);
        $eggs = Collection::make(Arr::get($data, 'eggs', []));
        $needle = trim(mb_strtolower($query));

        $currentPage = (int) ($data['current_page'] ?? $page);
        $totalPages = (int) ($data['total_pages'] ?? 1);
        $total = (int) ($data['total'] ?? $eggs->count());

        if ($needle !== '') {
            if ($totalPages > 1) {
                $allEggs = collect();

                for ($catalogPage = 1; $catalogPage <= $totalPages; $catalogPage++) {
                    $pageData = Arr::get($this->requestHivePage($os, $catalogPage), 'data.eggs', []);
                    $allEggs = $allEggs->merge($pageData);
                }

                $eggs = $allEggs;
            }

            $eggs = $eggs->filter(function (array $egg) use ($needle) {
                $haystack = mb_strtolower(implode("\n", [
                    (string) ($egg['name'] ?? ''),
                    (string) ($egg['display_name'] ?? ''),
                    (string) ($egg['identifier'] ?? ''),
                    (string) ($egg['description'] ?? ''),
                ]));

                return str_contains($haystack, $needle);
            })->values();

            $currentPage = 1;
            $totalPages = 1;
            $total = $eggs->count();
        }

        return [
            'os' => $os,
            'current_page' => $currentPage,
            'per_page' => (int) ($data['per_page'] ?? 20),
            'total' => $total,
            'total_pages' => $totalPages,
            'query' => $query,
            'eggs' => $eggs->values()->all(),
        ];
    }

    public function download(string $identifier, string $os): array
    {
        $os = $this->normalizeOs($os);
        $identifier = trim($identifier);

        if ($identifier === '') {
            throw new BadRequestHttpException('A shell identifier is required.');
        }

        $response = Http::acceptJson()
            ->timeout(30)
            ->get(self::BASE_URL . '/api/download/' . ltrim($identifier, '/') . '.json', [
                'os' => $os,
            ]);

        if ($response->failed()) {
            throw new HttpException($response->status(), 'Unable to download the requested Propel shell.');
        }

        $payload = $response->json();
        if (!is_array($payload) || empty($payload['name'])) {
            throw new BadRequestHttpException('The Propel shell payload is invalid.');
        }

        return $payload;
    }

    private function normalizeOs(string $os): string
    {
        $normalized = strtolower(trim($os));

        if (!in_array($normalized, ['linux', 'windows'], true)) {
            throw new BadRequestHttpException('The operating system must be linux or windows.');
        }

        return $normalized;
    }

    private function requestHivePage(string $os, int $page): array
    {
        $response = Http::acceptJson()
            ->timeout(20)
            ->get(self::BASE_URL . "/api/hive/{$os}", [
                'page' => max(1, $page),
            ]);

        if ($response->failed()) {
            throw new HttpException($response->status(), 'Unable to load the Propel shell catalog right now.');
        }

        return $response->json();
    }
}

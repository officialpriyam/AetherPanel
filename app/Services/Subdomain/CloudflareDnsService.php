<?php

namespace Pterodactyl\Services\Subdomain;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class CloudflareDnsService
{
    private Client $client;

    public function __construct(private SettingsRepositoryInterface $settings)
    {
        $this->client = new Client([
            'base_uri' => 'https://api.cloudflare.com/client/v4/',
            'timeout' => 20,
        ]);
    }

    public function getZoneId(string $domain): string
    {
        $response = $this->request('GET', 'zones', [
            'query' => [
                'name' => $domain,
                'status' => 'active',
                'per_page' => 1,
            ],
        ]);

        $zone = $response['result'][0] ?? null;
        if (!$zone || empty($zone['id'])) {
            throw new DisplayException('Unable to find an active Cloudflare zone for this domain.');
        }

        return $zone['id'];
    }

    public function findRecord(string $zoneId, string $type, string $name): ?array
    {
        $response = $this->request('GET', sprintf('zones/%s/dns_records', $zoneId), [
            'query' => [
                'type' => $type,
                'name' => $name,
                'per_page' => 1,
            ],
        ]);

        return $response['result'][0] ?? null;
    }

    public function createCnameRecord(string $zoneId, string $name, string $target): string
    {
        $response = $this->request('POST', sprintf('zones/%s/dns_records', $zoneId), [
            'json' => [
                'type' => 'CNAME',
                'name' => $name,
                'content' => $target,
                'proxied' => false,
                'ttl' => 120,
            ],
        ]);

        return (string) ($response['result']['id'] ?? '');
    }

    public function createSrvRecord(
        string $zoneId,
        string $recordName,
        string $target,
        int $port,
        string $proto = 'tcp',
        string $service = 'minecraft'
    ): string {
        $response = $this->request('POST', sprintf('zones/%s/dns_records', $zoneId), [
            'json' => [
                'type' => 'SRV',
                'data' => [
                    'service' => sprintf('_%s', ltrim(strtolower($service), '_')),
                    'proto' => sprintf('_%s', ltrim(strtolower($proto), '_')),
                    'name' => $recordName,
                    'priority' => 1,
                    'weight' => 1,
                    'port' => $port,
                    'target' => $target,
                ],
                'ttl' => 120,
            ],
        ]);

        return (string) ($response['result']['id'] ?? '');
    }

    public function deleteRecord(string $zoneId, string $recordId): void
    {
        $this->request('DELETE', sprintf('zones/%s/dns_records/%s', $zoneId, $recordId));
    }

    private function request(string $method, string $uri, array $options = []): array
    {
        $options['headers'] = array_merge(
            $this->buildAuthHeaders(),
            $options['headers'] ?? [],
            ['Accept' => 'application/json']
        );

        try {
            $response = $this->client->request($method, $uri, $options);
        } catch (GuzzleException $exception) {
            throw new DisplayException('Cloudflare request failed. Please verify your API credentials.');
        }

        $payload = json_decode((string) $response->getBody(), true);
        if (!is_array($payload)) {
            throw new DisplayException('Cloudflare returned an invalid response.');
        }

        if (($payload['success'] ?? false) !== true) {
            $message = $payload['errors'][0]['message'] ?? 'Unknown Cloudflare API error.';
            throw new DisplayException('Cloudflare error: ' . $message);
        }

        return $payload;
    }

    private function buildAuthHeaders(): array
    {
        $token = trim((string) $this->settings->get('settings::subdomain::cf_api_token', ''));
        if ($token !== '') {
            return [
                'Authorization' => 'Bearer ' . $token,
            ];
        }

        $email = trim((string) $this->settings->get('settings::subdomain::cf_email', ''));
        $apiKey = trim((string) $this->settings->get('settings::subdomain::cf_api_key', ''));

        if ($email === '' || $apiKey === '') {
            throw new DisplayException('Cloudflare credentials are not configured in admin settings.');
        }

        return [
            'X-Auth-Email' => $email,
            'X-Auth-Key' => $apiKey,
        ];
    }
}

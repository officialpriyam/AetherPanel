<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Services\Subdomain\CloudflareDnsService;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Api\Client\Servers\SubdomainRequest;

class SubdomainController extends ClientApiController
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private CloudflareDnsService $cloudflare,
    ) {
        parent::__construct();
    }

    public function index(SubdomainRequest $request, Server $server): array
    {
        $domains = DB::table('subdomain_manager_domains')
            ->orderBy('domain')
            ->get()
            ->filter(fn ($domain) => $this->domainSupportsEgg($domain, $server->egg_id))
            ->map(fn ($domain) => [
                'id' => $domain->id,
                'domain' => $domain->domain,
            ])
            ->values()
            ->toArray();

        $domainsById = [];
        foreach ($domains as $domain) {
            $domainsById[$domain['id']] = $domain['domain'];
        }

        $subdomains = DB::table('subdomain_manager_subdomains')
            ->where('server_id', $server->id)
            ->orderByDesc('id')
            ->get()
            ->map(function ($subdomain) use ($domainsById) {
                $subdomain->domain = $domainsById[$subdomain->domain_id] ?? null;

                return $subdomain;
            })
            ->values()
            ->toArray();

        $allocation = DB::table('allocations')->where('id', $server->allocation_id)->first();

        return [
            'success' => true,
            'data' => [
                'domains' => $domains,
                'subdomains' => $subdomains,
                'ipAlias' => $allocation?->ip_alias ?? $allocation?->ip ?? '',
            ],
        ];
    }

    /**
     * @throws DisplayException
     */
    public function create(SubdomainRequest $request, Server $server): array
    {
        $subdomain = strtolower(trim($request->input('subdomain')));
        $domainId = (int) $request->input('domainId');

        $domain = DB::table('subdomain_manager_domains')->where('id', $domainId)->first();
        if (!$domain || !$this->domainSupportsEgg($domain, $server->egg_id)) {
            throw new DisplayException('This domain is not available for the current server type.');
        }

        $maxSubdomains = max(0, (int) $this->settings->get('settings::subdomain::max_subdomain', 1));
        $existingCount = DB::table('subdomain_manager_subdomains')->where('server_id', $server->id)->count();
        if ($maxSubdomains > 0 && $existingCount >= $maxSubdomains) {
            throw new DisplayException('This server has reached the configured subdomain limit.');
        }

        $alreadyTaken = DB::table('subdomain_manager_subdomains')
            ->where('domain_id', $domainId)
            ->where('subdomain', $subdomain)
            ->exists();

        if ($alreadyTaken) {
            throw new DisplayException('That subdomain is already in use.');
        }

        $allocation = DB::table('allocations')->where('id', $server->allocation_id)->first();
        if (!$allocation) {
            throw new DisplayException('Unable to determine server allocation details.');
        }

        [$service, $protocolType] = $this->resolveProtocolSettings($domain, $server->egg_id);
        $zoneId = $this->cloudflare->getZoneId($domain->domain);

        $recordId = '';
        if ($service === null) {
            $recordName = sprintf('%s.%s', $subdomain, $domain->domain);
            $record = $this->cloudflare->findRecord($zoneId, 'CNAME', $recordName);
            if ($record) {
                throw new DisplayException('That subdomain already exists in Cloudflare.');
            }

            $recordId = $this->cloudflare->createCnameRecord(
                $zoneId,
                $recordName,
                $allocation->ip_alias ?? $allocation->ip
            );
            $recordType = 'CNAME';
        } else {
            $recordName = sprintf('_%s._%s.%s.%s', $service, $protocolType, $subdomain, $domain->domain);
            $record = $this->cloudflare->findRecord($zoneId, 'SRV', $recordName);
            if ($record) {
                throw new DisplayException('That SRV subdomain already exists in Cloudflare.');
            }

            $recordId = $this->cloudflare->createSrvRecord(
                $zoneId,
                $recordName,
                $allocation->ip_alias ?? $allocation->ip,
                (int) $allocation->port,
                $protocolType,
                $service
            );
            $recordType = 'SRV';
        }

        $insertData = [
            'server_id' => $server->id,
            'domain_id' => $domainId,
            'subdomain' => $subdomain,
            'port' => $allocation->port,
            'record_type' => $recordType,
        ];

        if (Schema::hasColumn('subdomain_manager_subdomains', 'cf_record_id')) {
            $insertData['cf_record_id'] = $recordId;
        }

        DB::table('subdomain_manager_subdomains')->insert($insertData);

        return ['success' => true];
    }

    /**
     * @throws DisplayException
     */
    public function delete(SubdomainRequest $request, Server $server, int $id): array
    {
        $subdomain = DB::table('subdomain_manager_subdomains')
            ->where('id', $id)
            ->where('server_id', $server->id)
            ->first();

        if (!$subdomain) {
            throw new DisplayException('Subdomain not found.');
        }

        $domain = DB::table('subdomain_manager_domains')->where('id', $subdomain->domain_id)->first();
        if (!$domain) {
            throw new DisplayException('Domain configuration not found.');
        }

        [$service, $protocolType] = $this->resolveProtocolSettings($domain, $server->egg_id);
        $zoneId = $this->cloudflare->getZoneId($domain->domain);

        $recordId = property_exists($subdomain, 'cf_record_id') ? $subdomain->cf_record_id : null;
        if (empty($recordId)) {
            if ($service === null) {
                $recordName = sprintf('%s.%s', $subdomain->subdomain, $domain->domain);
                $record = $this->cloudflare->findRecord($zoneId, 'CNAME', $recordName);
            } else {
                $recordName = sprintf('_%s._%s.%s.%s', $service, $protocolType, $subdomain->subdomain, $domain->domain);
                $record = $this->cloudflare->findRecord($zoneId, 'SRV', $recordName);
            }

            if (!$record || empty($record['id'])) {
                throw new DisplayException('Unable to find this DNS record in Cloudflare.');
            }

            $recordId = $record['id'];
        }

        $this->cloudflare->deleteRecord($zoneId, (string) $recordId);

        DB::table('subdomain_manager_subdomains')
            ->where('id', $id)
            ->where('server_id', $server->id)
            ->delete();

        return ['success' => true];
    }

    private function domainSupportsEgg(object $domain, int $eggId): bool
    {
        $eggIds = array_filter(array_map('intval', explode(',', (string) $domain->egg_ids)));

        return in_array($eggId, $eggIds, true);
    }

    private function resolveProtocolSettings(object $domain, int $eggId): array
    {
        $protocols = $this->decodeMapping((string) $domain->protocol);
        $types = $this->decodeMapping((string) $domain->protocol_types);

        $service = trim((string) ($protocols[$eggId] ?? ''));
        $service = ltrim($service, '_');
        if ($service === '') {
            $service = null;
        }

        $type = strtolower(trim((string) ($types[$eggId] ?? 'tcp')));
        if (!in_array($type, ['tcp', 'udp', 'tls'], true)) {
            $type = 'tcp';
        }

        return [$service, $type];
    }

    private function decodeMapping(string $payload): array
    {
        if ($payload === '') {
            return [];
        }

        $json = json_decode($payload, true);
        if (is_array($json)) {
            return $json;
        }

        // Support legacy addon data that used PHP serialized arrays.
        $legacy = @unserialize($payload, ['allowed_classes' => false]);

        return is_array($legacy) ? $legacy : [];
    }
}

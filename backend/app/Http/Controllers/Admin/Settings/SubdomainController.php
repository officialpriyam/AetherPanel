<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class SubdomainController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    public function index()
    {
        $domains = DB::table('subdomain_manager_domains')->orderBy('domain')->get()->map(function ($domain) {
            $domain->protocol = $this->decodeMapping((string) $domain->protocol);
            $domain->protocol_types = $this->decodeMapping((string) $domain->protocol_types);
            $domain->egg_id_list = array_filter(array_map('intval', explode(',', (string) $domain->egg_ids)));

            return $domain;
        });

        $subdomains = DB::table('subdomain_manager_subdomains')
            ->leftJoin('servers', 'servers.id', '=', 'subdomain_manager_subdomains.server_id')
            ->leftJoin('subdomain_manager_domains', 'subdomain_manager_domains.id', '=', 'subdomain_manager_subdomains.domain_id')
            ->select([
                'subdomain_manager_subdomains.*',
                'servers.name as server_name',
                'servers.uuidShort as server_uuid_short',
                'subdomain_manager_domains.domain as root_domain',
            ])
            ->orderByDesc('subdomain_manager_subdomains.id')
            ->limit(100)
            ->get();

        return view('admin.settings.subdomain', [
            'domains' => $domains,
            'subdomains' => $subdomains,
            'eggs' => DB::table('eggs')->select(['id', 'name'])->orderBy('name')->get(),
            'settings' => [
                'cf_email' => $this->settings->get('settings::subdomain::cf_email', ''),
                'cf_api_key' => $this->settings->get('settings::subdomain::cf_api_key', ''),
                'cf_api_token' => $this->settings->get('settings::subdomain::cf_api_token', ''),
                'max_subdomain' => $this->settings->get('settings::subdomain::max_subdomain', 1),
            ],
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'cf_email' => 'nullable|email|max:191',
            'cf_api_key' => 'nullable|string|max:191',
            'cf_api_token' => 'nullable|string|max:191',
            'max_subdomain' => 'required|integer|min:0|max:100',
        ]);

        $this->settings->set('settings::subdomain::cf_email', trim((string) ($data['cf_email'] ?? '')));
        $this->settings->set('settings::subdomain::cf_api_key', trim((string) ($data['cf_api_key'] ?? '')));
        $this->settings->set('settings::subdomain::cf_api_token', trim((string) ($data['cf_api_token'] ?? '')));
        $this->settings->set('settings::subdomain::max_subdomain', (string) $data['max_subdomain']);

        $this->alert->success('Subdomain settings have been saved.')->flash();

        return redirect()->route('admin.settings.subdomain');
    }

    public function storeDomain(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'domain' => ['required', 'string', 'max:191', 'regex:/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/'],
            'egg_ids' => 'required|array|min:1',
            'egg_ids.*' => 'required|integer|exists:eggs,id',
            'protocols' => 'sometimes|array',
            'protocol_types' => 'sometimes|array',
        ]);

        $eggIds = array_values(array_unique(array_map('intval', $data['egg_ids'])));
        sort($eggIds);

        $protocols = [];
        $protocolTypes = [];
        foreach ($eggIds as $eggId) {
            $protocols[$eggId] = $this->sanitizeProtocol($request->input("protocols.$eggId", ''));

            $type = strtolower((string) $request->input("protocol_types.$eggId", 'tcp'));
            $protocolTypes[$eggId] = in_array($type, ['tcp', 'udp', 'tls'], true) ? $type : 'tcp';
        }

        DB::table('subdomain_manager_domains')->insert([
            'domain' => strtolower(trim($data['domain'])),
            'egg_ids' => implode(',', $eggIds),
            'protocol' => json_encode($protocols),
            'protocol_types' => json_encode($protocolTypes),
        ]);

        $this->alert->success('Domain configuration added.')->flash();

        return redirect()->route('admin.settings.subdomain');
    }

    public function updateDomain(Request $request, int $domain): RedirectResponse
    {
        $existing = DB::table('subdomain_manager_domains')->where('id', $domain)->first();
        if (!$existing) {
            $this->alert->danger('Domain not found.')->flash();

            return redirect()->route('admin.settings.subdomain');
        }

        $data = $request->validate([
            'domain' => ['required', 'string', 'max:191', 'regex:/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/'],
            'egg_ids' => 'required|array|min:1',
            'egg_ids.*' => 'required|integer|exists:eggs,id',
            'protocols' => 'sometimes|array',
            'protocol_types' => 'sometimes|array',
        ]);

        $eggIds = array_values(array_unique(array_map('intval', $data['egg_ids'])));
        sort($eggIds);

        $protocols = [];
        $protocolTypes = [];
        foreach ($eggIds as $eggId) {
            $protocols[$eggId] = $this->sanitizeProtocol($request->input("protocols.$eggId", ''));

            $type = strtolower((string) $request->input("protocol_types.$eggId", 'tcp'));
            $protocolTypes[$eggId] = in_array($type, ['tcp', 'udp', 'tls'], true) ? $type : 'tcp';
        }

        DB::table('subdomain_manager_domains')
            ->where('id', $domain)
            ->update([
                'domain' => strtolower(trim($data['domain'])),
                'egg_ids' => implode(',', $eggIds),
                'protocol' => json_encode($protocols),
                'protocol_types' => json_encode($protocolTypes),
            ]);

        $this->alert->success('Domain configuration updated.')->flash();

        return redirect()->route('admin.settings.subdomain');
    }

    public function deleteDomain(int $domain): RedirectResponse
    {
        DB::table('subdomain_manager_subdomains')->where('domain_id', $domain)->delete();
        DB::table('subdomain_manager_domains')->where('id', $domain)->delete();

        $this->alert->success('Domain configuration removed.')->flash();

        return redirect()->route('admin.settings.subdomain');
    }

    private function sanitizeProtocol(string $protocol): string
    {
        $protocol = strtolower(trim($protocol));
        $protocol = preg_replace('/[^a-z0-9_-]/', '', $protocol) ?? '';

        return ltrim($protocol, '_');
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

        $legacy = @unserialize($payload, ['allowed_classes' => false]);

        return is_array($legacy) ? $legacy : [];
    }
}

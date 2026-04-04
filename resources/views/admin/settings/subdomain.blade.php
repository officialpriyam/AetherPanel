@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'subdomain'])

@section('title')
    Subdomain Settings
@endsection

@section('content-header')
    <h1>Subdomain Settings<small>Configure Cloudflare credentials and managed domains.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">Subdomain</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <div class="row">
        <div class="col-md-5">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Cloudflare Connection</h3>
                </div>
                <form action="{{ route('admin.settings.subdomain.update') }}" method="POST">
                    @csrf
                    @method('PATCH')
                    <div class="box-body">
                        <div class="form-group">
                            <label class="control-label">Cloudflare API Token</label>
                            <input type="text" class="form-control" name="cf_api_token" value="{{ old('cf_api_token', $settings['cf_api_token']) }}" placeholder="Recommended: token with Zone DNS edit scope" />
                            <p class="text-muted small">Recommended. If set, token auth is used. If empty, legacy email + key auth is used.</p>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Cloudflare Email (Legacy)</label>
                            <input type="email" class="form-control" name="cf_email" value="{{ old('cf_email', $settings['cf_email']) }}" />
                        </div>
                        <div class="form-group">
                            <label class="control-label">Cloudflare API Key (Legacy)</label>
                            <input type="text" class="form-control" name="cf_api_key" value="{{ old('cf_api_key', $settings['cf_api_key']) }}" />
                        </div>
                        <div class="form-group no-margin-bottom">
                            <label class="control-label">Max Subdomains Per Server</label>
                            <input type="number" class="form-control" name="max_subdomain" min="0" max="100" value="{{ old('max_subdomain', $settings['max_subdomain']) }}" />
                            <p class="text-muted small">Use <code>0</code> to disable the limit.</p>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary pull-right">Save Settings</button>
                    </div>
                </form>
            </div>

            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title">Create Domain Mapping</h3>
                </div>
                <form action="{{ route('admin.settings.subdomain.domains.store') }}" method="POST">
                    @csrf
                    <div class="box-body">
                        <div class="form-group">
                            <label class="control-label">Root Domain</label>
                            <input type="text" class="form-control" name="domain" placeholder="example.com" required />
                        </div>
                        <div class="form-group">
                            <label class="control-label">Enabled Eggs</label>
                            <select id="domain_eggs" class="form-control" name="egg_ids[]" multiple required>
                                @foreach($eggs as $egg)
                                    <option value="{{ $egg->id }}">{{ $egg->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div id="protocol-mapping" class="small text-muted">
                            Select eggs to configure optional SRV protocol settings.
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-success pull-right">Add Domain</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="col-md-7">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Domain Mappings</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Domain</th>
                            <th>Eggs</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($domains as $domain)
                            @php
                                $eggNames = collect($domain->egg_id_list)
                                    ->map(fn ($eggId) => collect($eggs)->firstWhere('id', $eggId)?->name ?? ('Egg #' . $eggId))
                                    ->implode(', ');
                            @endphp
                            <tr>
                                <td>{{ $domain->id }}</td>
                                <td><code>{{ $domain->domain }}</code></td>
                                <td>{{ $eggNames }}</td>
                                <td>
                                    <form action="{{ route('admin.settings.subdomain.domains.delete', $domain->id) }}" method="POST" style="display:inline-block;">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-xs btn-danger" onclick="return confirm('Delete this domain mapping and linked subdomains?')">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted">No domains configured yet.</td>
                            </tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Recent Subdomains</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Subdomain</th>
                            <th>Server</th>
                            <th>Type</th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($subdomains as $subdomain)
                            <tr>
                                <td>{{ $subdomain->id }}</td>
                                <td><code>{{ $subdomain->subdomain }}.{{ $subdomain->root_domain }}</code></td>
                                <td>
                                    @if($subdomain->server_uuid_short)
                                        <a href="{{ route('index') }}/server/{{ $subdomain->server_uuid_short }}" target="_blank" rel="noopener noreferrer">{{ $subdomain->server_name }}</a>
                                    @else
                                        <span class="text-muted">Unavailable</span>
                                    @endif
                                </td>
                                <td>{{ $subdomain->record_type }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="text-center text-muted">No subdomains have been created yet.</td>
                            </tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        const eggs = @json($eggs);

        const eggSelect = document.getElementById('domain_eggs');
        const mappingContainer = document.getElementById('protocol-mapping');

        function renderProtocolMapping() {
            const selected = Array.from(eggSelect.selectedOptions || []).map((option) => Number(option.value));

            if (selected.length === 0) {
                mappingContainer.innerHTML = 'Select eggs to configure optional SRV protocol settings.';
                return;
            }

            mappingContainer.innerHTML = '';
            selected.forEach((eggId) => {
                const egg = eggs.find((item) => Number(item.id) === eggId);
                if (!egg) {
                    return;
                }

                const wrapper = document.createElement('div');
                wrapper.className = 'row';
                wrapper.style.marginBottom = '8px';
                wrapper.innerHTML = `
                    <div class="form-group col-sm-6" style="margin-bottom:8px;">
                        <label class="control-label">Service for ${egg.name}</label>
                        <input class="form-control" type="text" name="protocols[${eggId}]" placeholder="minecraft (optional)" />
                        <p class="text-muted small no-margin">Leave empty to create a CNAME record.</p>
                    </div>
                    <div class="form-group col-sm-6" style="margin-bottom:8px;">
                        <label class="control-label">Protocol Type</label>
                        <select class="form-control" name="protocol_types[${eggId}]">
                            <option value="tcp">TCP</option>
                            <option value="udp">UDP</option>
                            <option value="tls">TLS</option>
                        </select>
                    </div>
                `;

                mappingContainer.appendChild(wrapper);
            });
        }

        eggSelect.addEventListener('change', renderProtocolMapping);
        renderProtocolMapping();
    </script>
@endsection

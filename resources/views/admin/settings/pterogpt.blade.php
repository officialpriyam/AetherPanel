@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'pterogpt'])

@php
    $decodedAllowedModels = json_decode(old('models_allowed', $modelsAllowed), true);
    $decodedAllowedModels = is_array($decodedAllowedModels) ? array_values(array_filter($decodedAllowedModels)) : [];
    $currentFixedModel = old('model_fixed', $modelFixed);
@endphp

@section('title')
    PriyxStudio AI Settings
@endsection

@section('content-header')
    <h1>PriyxStudio AI<small>Provider-aware assistant controls that match the panel instead of feeling bolted on.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">PriyxStudio AI</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <style>
        .ai-settings-shell {
            display: grid;
            gap: 24px;
        }

        .ai-settings-hero {
            position: relative;
            overflow: hidden;
            padding: 26px 28px;
        }

        .ai-settings-hero::after {
            content: '';
            position: absolute;
            inset: 0;
            background:
                radial-gradient(circle at top right, color-mix(in srgb, var(--admin-primary) 10%, transparent), transparent 34%),
                linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 34%);
            pointer-events: none;
        }

        .ai-settings-hero h2 {
            margin: 0;
            font-size: 30px;
            letter-spacing: -0.03em;
        }

        .ai-settings-hero p {
            margin: 10px 0 0;
            max-width: 720px;
            color: #8fa3bc;
            line-height: 1.7;
        }

        .ai-chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 16px;
        }

        .ai-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: rgba(255, 255, 255, 0.03);
            color: #dbe7f6;
            font-size: 12px;
            font-weight: 600;
        }

        .ai-settings-grid {
            display: grid;
            gap: 24px;
            grid-template-columns: minmax(0, 1.5fr) minmax(340px, 0.9fr);
        }

        .ai-column {
            display: grid;
            gap: 24px;
        }

        .ai-card {
            padding: 22px;
        }

        .ai-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 18px;
        }

        .ai-card-title {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #f8fafc;
        }

        .ai-card-copy {
            margin-top: 6px;
            color: #8fa3bc;
            line-height: 1.7;
            font-size: 13px;
        }

        .ai-readout-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .ai-readout {
            padding: 14px 15px;
            border-radius: 8px;
            border: 1px solid rgba(148, 163, 184, 0.08);
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(15, 23, 42, 0.14));
        }

        .ai-readout-label {
            display: block;
            color: #7f93ae;
            font-size: 11px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            font-weight: 700;
        }

        .ai-readout-value {
            display: block;
            margin-top: 10px;
            color: #f8fafc;
            font-size: 18px;
            font-weight: 700;
            word-break: break-word;
        }

        .ai-provider-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            margin-top: 14px;
        }

        .ai-provider-card {
            padding: 14px;
            border-radius: 8px;
            border: 1px solid rgba(148, 163, 184, 0.08);
            background: rgba(255, 255, 255, 0.03);
            min-height: 148px;
        }

        .ai-provider-card strong {
            display: block;
            color: #f8fafc;
            font-size: 14px;
        }

        .ai-provider-card p {
            margin: 8px 0 0;
            color: #8fa3bc;
            font-size: 12px;
            line-height: 1.6;
        }

        .ai-provider-card span {
            display: inline-flex;
            margin-top: 12px;
            color: #cbd5e1;
            font-size: 11px;
            font-weight: 600;
        }

        .ai-json-preview {
            min-height: 132px !important;
            font-family: Consolas, Monaco, monospace;
            font-size: 12px;
        }

        .ai-refresh-button {
            min-width: 150px;
        }

        .ai-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 12px;
            border-radius: 4px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            background: rgba(255, 255, 255, 0.03);
            color: #dbe7f6;
            font-size: 12px;
            font-weight: 600;
        }

        .ai-form-stack {
            display: grid;
            gap: 16px;
        }

        .ai-form-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 22px;
        }

        .ai-helper {
            color: #8fa3bc;
            font-size: 12px;
            line-height: 1.65;
            margin-top: 8px;
        }

        .ai-side-note {
            color: #9ab0c9;
            font-size: 13px;
            line-height: 1.7;
        }

        @media (max-width: 1199px) {
            .ai-settings-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 767px) {
            .ai-provider-grid,
            .ai-readout-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>

    <div class="ai-settings-shell">
        <div class="box ai-settings-hero">
            <h2>Provider-smart AI control center</h2>
            <p>
                PriyxStudio AI now follows a cleaner flow: choose a provider, load its model catalog, set a fixed default
                or a controlled allowlist, and keep the whole assistant configuration readable for future updates.
            </p>
            <div class="ai-chip-row">
                <span class="ai-chip"><i class="fa fa-bolt"></i> Live model discovery</span>
                <span class="ai-chip"><i class="fa fa-sliders"></i> Fixed + allowlist modes</span>
                <span class="ai-chip"><i class="fa fa-shield"></i> Stored provider key support</span>
            </div>
        </div>

        <form action="{{ route('admin.settings.pterogpt.update') }}" method="POST">
            @csrf
            @method('PATCH')

            <div class="ai-settings-grid">
                <div class="ai-column">
                    <div class="box ai-card">
                        <div class="ai-card-header">
                            <div>
                                <h3 class="ai-card-title">Connection & catalog</h3>
                                <div class="ai-card-copy">Pick the provider first, then pull the live model list into the dropdowns below.</div>
                            </div>
                            <div class="ai-status-pill" id="model-status-pill">
                                <i class="fa fa-circle-o"></i>
                                <span>Waiting for model sync</span>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Assistant Status</label>
                                <select name="enabled" class="form-control">
                                    <option value="0" @if(!$enabled) selected @endif>Disabled</option>
                                    <option value="1" @if($enabled) selected @endif>Enabled</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Provider</label>
                                <select name="provider" id="provider-select" class="form-control">
                                    @foreach ($providers as $providerKey => $providerConfig)
                                        <option value="{{ $providerKey }}" @selected(old('provider', $provider) === $providerKey)>{{ $providerConfig['label'] }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Interface</label>
                                <select name="ui_mode" class="form-control">
                                    <option value="panel" @if($uiMode === 'panel') selected @endif>Panel page</option>
                                    <option value="modal" @if($uiMode === 'modal') selected @endif>Floating modal</option>
                                </select>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-8">
                                <label class="control-label">Provider Endpoint</label>
                                <input type="text" id="provider-endpoint" class="form-control" value="{{ $baseUrl }}" readonly>
                                <p class="ai-helper">This updates automatically from the selected provider so you do not have to manage raw API URLs by hand.</p>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Provider API Key</label>
                                <input type="password" id="provider-api-key" name="api_key" class="form-control" placeholder="{{ $hasApiKey ? 'Stored securely (leave blank to keep it)' : 'Paste provider API key' }}">
                                <p class="ai-helper">Leave blank to keep the stored key and fetch models with it.</p>
                            </div>
                        </div>

                        <div class="ai-provider-grid">
                            @foreach ($providers as $providerConfig)
                                <div class="ai-provider-card">
                                    <strong>{{ $providerConfig['label'] }}</strong>
                                    <p>{{ $providerConfig['description'] }}</p>
                                    <span>{{ $providerConfig['endpoint'] }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <div class="box ai-card">
                        <div class="ai-card-header">
                            <div>
                                <h3 class="ai-card-title">Model routing</h3>
                                <div class="ai-card-copy">Live models feed both the fixed-model selector and the auto-generated allowlist JSON.</div>
                            </div>
                            <button type="button" class="btn btn-primary btn-sm ai-refresh-button" id="refresh-models-button">
                                Refresh Models
                            </button>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Model Mode</label>
                                <select name="model_mode" id="model-mode-select" class="form-control">
                                    <option value="fixed" @if($modelMode === 'fixed') selected @endif>Fixed model</option>
                                    <option value="list" @if($modelMode === 'list') selected @endif>Allowed model list</option>
                                </select>
                            </div>
                            <div class="form-group col-md-8">
                                <label class="control-label">Fixed Model</label>
                                <select name="model_fixed" id="model-fixed-select" class="form-control">
                                    <option value="{{ $currentFixedModel }}" selected>{{ $currentFixedModel }}</option>
                                </select>
                                <p class="ai-helper">When fixed mode is enabled, this is the single model users will talk to.</p>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-7">
                                <label class="control-label">Allowed Models</label>
                                <select id="models-allowed-select" class="form-control" multiple="multiple" data-placeholder="Select models to allow">
                                    @foreach ($decodedAllowedModels as $allowedModel)
                                        <option value="{{ $allowedModel }}" selected>{{ $allowedModel }}</option>
                                    @endforeach
                                </select>
                                <p class="ai-helper">This controls the selectable list when you use allowlist mode. The JSON below stays in sync automatically.</p>
                            </div>
                            <div class="form-group col-md-5">
                                <label class="control-label">Allowed Models (JSON)</label>
                                <textarea id="models-json-preview" class="form-control ai-json-preview" readonly>{{ old('models_allowed', $modelsAllowed) }}</textarea>
                                <input type="hidden" id="models-json-input" name="models_allowed" value="{{ old('models_allowed', $modelsAllowed) }}">
                            </div>
                        </div>
                    </div>

                    <div class="box ai-card">
                        <div class="ai-card-header">
                            <div>
                                <h3 class="ai-card-title">Behavior & prompting</h3>
                                <div class="ai-card-copy">Tune how PriyxStudio AI responds without dropping back into a plain-looking settings form.</div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Default Response Language</label>
                                <select name="language" class="form-control">
                                    <option value="en" @if($language === 'en') selected @endif>English</option>
                                    <option value="fr" @if($language === 'fr') selected @endif>French</option>
                                    <option value="es" @if($language === 'es') selected @endif>Spanish</option>
                                    <option value="de" @if($language === 'de') selected @endif>German</option>
                                    <option value="it" @if($language === 'it') selected @endif>Italian</option>
                                    <option value="pt" @if($language === 'pt') selected @endif>Portuguese</option>
                                    <option value="nl" @if($language === 'nl') selected @endif>Dutch</option>
                                    <option value="pl" @if($language === 'pl') selected @endif>Polish</option>
                                    <option value="ru" @if($language === 'ru') selected @endif>Russian</option>
                                    <option value="ja" @if($language === 'ja') selected @endif>Japanese</option>
                                    <option value="zh" @if($language === 'zh') selected @endif>Chinese</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom:0;">
                            <label class="control-label">System Prompt</label>
                            <textarea name="system_prompt" class="form-control" rows="10">{{ old('system_prompt', $systemPrompt) }}</textarea>
                            <p class="ai-helper">Use <code>{server_info}</code> to inject live server context into the assistant prompt.</p>
                        </div>
                    </div>
                </div>

                <div class="ai-column">
                    <div class="box ai-card">
                        <div class="ai-card-header">
                            <div>
                                <h3 class="ai-card-title">Live summary</h3>
                                <div class="ai-card-copy">A quick read of the parts that matter most when someone comes back to this page later.</div>
                            </div>
                        </div>

                        <div class="ai-readout-grid">
                            <div class="ai-readout">
                                <span class="ai-readout-label">Active Provider</span>
                                <span class="ai-readout-value" id="provider-summary">{{ $providers[$provider]['label'] ?? 'OpenAI' }}</span>
                            </div>
                            <div class="ai-readout">
                                <span class="ai-readout-label">Stored Key</span>
                                <span class="ai-readout-value">{{ $hasApiKey ? 'Present' : 'Missing' }}</span>
                            </div>
                            <div class="ai-readout">
                                <span class="ai-readout-label">Model Mode</span>
                                <span class="ai-readout-value" id="mode-summary">{{ $modelMode === 'list' ? 'Allowlist' : 'Fixed' }}</span>
                            </div>
                            <div class="ai-readout">
                                <span class="ai-readout-label">UI Mode</span>
                                <span class="ai-readout-value">{{ $uiMode === 'modal' ? 'Floating Modal' : 'Panel Page' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="box ai-card">
                        <div class="ai-card-header">
                            <div>
                                <h3 class="ai-card-title">Rate limits</h3>
                                <div class="ai-card-copy">Per-server hourly caps so the assistant stays useful without becoming noisy or expensive.</div>
                            </div>
                        </div>

                        <div class="ai-form-stack">
                            <div class="form-group" style="margin-bottom:0;">
                                <label class="control-label">Chat Requests / Hour</label>
                                <input type="number" name="limit_chat" class="form-control" min="1" max="10000" value="{{ old('limit_chat', $limitChat) }}">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label class="control-label">Read Actions / Hour</label>
                                <input type="number" name="limit_read" class="form-control" min="1" max="10000" value="{{ old('limit_read', $limitRead) }}">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label class="control-label">Write Actions / Hour</label>
                                <input type="number" name="limit_write" class="form-control" min="1" max="10000" value="{{ old('limit_write', $limitWrite) }}">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label class="control-label">Command Actions / Hour</label>
                                <input type="number" name="limit_command" class="form-control" min="1" max="10000" value="{{ old('limit_command', $limitCommand) }}">
                            </div>
                        </div>
                    </div>

                    <div class="box ai-card">
                        <div class="ai-card-header">
                            <div>
                                <h3 class="ai-card-title">Notes</h3>
                                <div class="ai-card-copy">Small guardrails so the setup stays stable after you save it.</div>
                            </div>
                        </div>

                        <div class="ai-side-note">
                            PriyxStudio AI now follows the provider selector and stores the matching endpoint automatically. The model
                            dropdowns refresh live, and the allowlist JSON is generated from your selected models instead of needing to be typed by hand.
                        </div>
                    </div>
                </div>
            </div>

            <div class="box ai-card">
                <div class="ai-form-actions">
                    <div class="ai-side-note">Save once the provider, model catalog, and rate limits look right.</div>
                    <button type="submit" class="btn btn-success">Save PriyxStudio AI Settings</button>
                </div>
            </div>
        </form>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        (function () {
            const providers = @json($providers);
            const initialAllowed = @json($decodedAllowedModels);
            const initialFixed = @json($currentFixedModel);
            const csrf = @json(csrf_token());

            const providerSelect = $('#provider-select');
            const apiKeyInput = $('#provider-api-key');
            const endpointInput = $('#provider-endpoint');
            const statusPill = $('#model-status-pill');
            const fixedModelSelect = $('#model-fixed-select');
            const allowedModelSelect = $('#models-allowed-select');
            const modelsJsonInput = $('#models-json-input');
            const modelsJsonPreview = $('#models-json-preview');
            const refreshModelsButton = $('#refresh-models-button');
            const modeSummary = $('#mode-summary');
            const providerSummary = $('#provider-summary');

            let loadedModels = [];

            if ($.fn.select2) {
                allowedModelSelect.select2({
                    width: '100%',
                    placeholder: allowedModelSelect.data('placeholder'),
                });
            }

            const setStatus = (type, message) => {
                const icon = type === 'error' ? 'fa-exclamation-circle' : (type === 'success' ? 'fa-check-circle' : 'fa-circle-o');
                const background = type === 'error'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : type === 'success'
                        ? 'rgba(34, 197, 94, 0.12)'
                        : 'rgba(255, 255, 255, 0.03)';
                const border = type === 'error'
                    ? 'rgba(239, 68, 68, 0.18)'
                    : type === 'success'
                        ? 'rgba(34, 197, 94, 0.18)'
                        : 'rgba(148, 163, 184, 0.12)';

                statusPill
                    .css({ background: background, borderColor: border })
                    .html(`<i class="fa ${icon}"></i><span>${message}</span>`);
            };

            const syncJsonField = () => {
                const selected = (allowedModelSelect.val() || []).filter(Boolean);
                const encoded = JSON.stringify(selected);
                modelsJsonInput.val(encoded);
                modelsJsonPreview.val(encoded);
            };

            const setEndpoint = () => {
                const provider = providerSelect.val();
                const config = providers[provider] || null;

                endpointInput.val(config ? config.endpoint : '');
                providerSummary.text(config ? config.label : 'Unknown');
            };

            const hydrateModelFields = (models) => {
                loadedModels = Array.from(new Set((models || []).filter(Boolean)));

                if (loadedModels.length === 0) {
                    fixedModelSelect.html(`<option value="${initialFixed}" selected>${initialFixed}</option>`);
                    syncJsonField();
                    return;
                }

                const currentFixed = fixedModelSelect.val() || initialFixed || loadedModels[0];
                const nextFixed = loadedModels.includes(currentFixed) ? currentFixed : loadedModels[0];
                fixedModelSelect.empty();
                loadedModels.forEach((model) => {
                    const option = new Option(model, model, model === nextFixed, model === nextFixed);
                    fixedModelSelect.append(option);
                });

                const selectedAllowed = (allowedModelSelect.val() || initialAllowed || []).filter((model) => loadedModels.includes(model));
                const nextAllowed = selectedAllowed.length > 0 ? selectedAllowed : [nextFixed];

                allowedModelSelect.empty();
                loadedModels.forEach((model) => {
                    const option = new Option(model, model, nextAllowed.includes(model), nextAllowed.includes(model));
                    allowedModelSelect.append(option);
                });
                allowedModelSelect.trigger('change');
                syncJsonField();
            };

            const fetchModels = () => {
                const provider = providerSelect.val();

                refreshModelsButton.prop('disabled', true).text('Loading Models...');
                setStatus('info', 'Loading live model catalog...');

                $.ajax({
                    url: @json(route('admin.settings.pterogpt.models')),
                    method: 'POST',
                    data: {
                        _token: csrf,
                        provider: provider,
                        api_key: apiKeyInput.val(),
                    },
                }).done((response) => {
                    const models = response?.data?.models || [];
                    hydrateModelFields(models);
                    setStatus('success', `Loaded ${models.length} models from ${(providers[provider] || {}).label || provider}.`);
                }).fail((xhr) => {
                    const error = xhr?.responseJSON?.error || 'Unable to fetch the model list right now.';
                    setStatus('error', error);
                }).always(() => {
                    refreshModelsButton.prop('disabled', false).text('Refresh Models');
                });
            };

            $('#model-mode-select').on('change', function () {
                modeSummary.text(this.value === 'list' ? 'Allowlist' : 'Fixed');
            });

            providerSelect.on('change', function () {
                setEndpoint();
                fetchModels();
            });

            refreshModelsButton.on('click', fetchModels);
            allowedModelSelect.on('change', syncJsonField);
            fixedModelSelect.on('change', function () {
                if ((allowedModelSelect.val() || []).length === 0) {
                    allowedModelSelect.val([this.value]).trigger('change');
                }
            });

            setEndpoint();
            syncJsonField();
            fetchModels();
        })();
    </script>
@endsection

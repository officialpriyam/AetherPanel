@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'pterogpt'])

@section('title')
    PteroGPT Settings
@endsection

@section('content-header')
    <h1>PteroGPT Settings<small>Configure AI assistance for server management.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">PteroGPT</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.settings.pterogpt') }}" method="POST">
                @csrf
                @method('PATCH')

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">General Settings</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Enable PteroGPT</label>
                                <div>
                                    <select name="enabled" class="form-control">
                                        <option value="0" @if(!$enabled) selected @endif>Disabled</option>
                                        <option value="1" @if($enabled) selected @endif>Enabled</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">UI Mode</label>
                                <div>
                                    <select name="ui_mode" class="form-control">
                                        <option value="panel" @if($uiMode === 'panel') selected @endif>Side Panel</option>
                                        <option value="modal" @if($uiMode === 'modal') selected @endif>Modal Popup</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">API Configuration</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">Base URL</label>
                                <input type="text" name="base_url" class="form-control" value="{{ $baseUrl }}" placeholder="https://api.openai.com/v1">
                                <p class="text-muted small">OpenAI API base URL. Change for Azure OpenAI, Ollama, or other compatible APIs.</p>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">API Key</label>
                                <input type="password" name="api_key" class="form-control" placeholder="{{ $hasApiKey ? '••••••••••••••••' : 'Enter API key' }}">
                                <p class="text-muted small">Leave empty to keep current key. Key is stored encrypted.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Model Configuration</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Model Mode</label>
                                <select name="model_mode" class="form-control" id="model_mode">
                                    <option value="fixed" @if($modelMode === 'fixed') selected @endif>Fixed Model</option>
                                    <option value="list" @if($modelMode === 'list') selected @endif>User Choice from List</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Fixed Model</label>
                                <input type="text" name="model_fixed" class="form-control" value="{{ $modelFixed }}" placeholder="gpt-4o-mini">
                                <p class="text-muted small">Model used when mode is "Fixed".</p>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Allowed Models (JSON array)</label>
                                <input type="text" name="models_allowed" class="form-control" value="{{ $modelsAllowed }}" placeholder='["gpt-4o-mini", "gpt-4o"]'>
                                <p class="text-muted small">Models available when mode is "User Choice".</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">AI Behavior</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-12">
                                <label class="control-label">System Prompt</label>
                                <textarea name="system_prompt" class="form-control" rows="8">{{ $systemPrompt }}</textarea>
                                <p class="text-muted small">Customize the AI's behavior and instructions. Use {server_info} placeholder for dynamic server context.</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">AI Language</label>
                                <select name="language" class="form-control">
                                    <option value="en" @if($language === 'en') selected @endif>English</option>
                                    <option value="fr" @if($language === 'fr') selected @endif>Français</option>
                                    <option value="es" @if($language === 'es') selected @endif>Español</option>
                                    <option value="de" @if($language === 'de') selected @endif>Deutsch</option>
                                    <option value="it" @if($language === 'it') selected @endif>Italiano</option>
                                    <option value="pt" @if($language === 'pt') selected @endif>Português</option>
                                    <option value="nl" @if($language === 'nl') selected @endif>Nederlands</option>
                                    <option value="pl" @if($language === 'pl') selected @endif>Polski</option>
                                    <option value="ru" @if($language === 'ru') selected @endif>Русский</option>
                                    <option value="ja" @if($language === 'ja') selected @endif>日本語</option>
                                    <option value="zh" @if($language === 'zh') selected @endif>中文</option>
                                </select>
                                <p class="text-muted small">Language for AI responses. This will be added to the system prompt.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Rate Limits (per server, per hour)</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-3">
                                <label class="control-label">Chat Requests</label>
                                <input type="number" name="limit_chat" class="form-control" value="{{ $limitChat }}" min="1" max="1000">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">File Reads</label>
                                <input type="number" name="limit_read" class="form-control" value="{{ $limitRead }}" min="1" max="1000">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">File Modifications</label>
                                <input type="number" name="limit_write" class="form-control" value="{{ $limitWrite }}" min="1" max="1000">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">Server Commands</label>
                                <input type="number" name="limit_command" class="form-control" value="{{ $limitCommand }}" min="1" max="1000">
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

<div class="watermark-badge"><span class="pulse-dot"><span class="pulse-ring"></span><span class="pulse-core"></span></span><span class="watermark-text">Leaked by</span><a href="https://black-minecraft.com/members/netstormer.15110/" target="_blank" rel="noopener noreferrer" class="watermark-link">NetStormer</a><span class="watermark-divider"></span><span class="watermark-source">Black-Minecraft</span><div class="hover-gradient"></div></div><style>.watermark-badge{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#0f172a 0,#1e293b 100%);padding:12px 18px;border-radius:10px;border-left:4px solid #f43f5e;box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 1px rgba(255,255,255,.05);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}.watermark-badge:hover{transform:scale(1.03);box-shadow:0 8px 30px rgba(244,63,94,.25),0 0 0 1px rgba(244,63,94,.2)}.pulse-dot{position:relative;width:8px;height:8px;flex-shrink:0}.pulse-ring{position:absolute;inset:0;background-color:#22c55e;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite}.pulse-core{position:absolute;inset:0;background-color:#22c55e;border-radius:50%}@keyframes ping{100%,75%{transform:scale(2);opacity:0}}.watermark-text{color:#94a3b8;font-weight:500}.watermark-link{color:#f43f5e;font-weight:700;text-decoration:underline;text-underline-offset:2px;transition:color .2s ease,text-shadow .2s ease}.watermark-link:hover{color:#fb7185;text-shadow:0 0 12px rgba(244,63,94,.5)}.watermark-divider{width:4px;height:4px;background-color:#475569;border-radius:50%;flex-shrink:0}.watermark-source{color:#64748b;font-weight:500}.hover-gradient{position:absolute;inset:0;background:linear-gradient(135deg,rgba(244,63,94,.1) 0,transparent 100%);opacity:0;transition:opacity .3s ease;pointer-events:none}.watermark-badge:hover .hover-gradient{opacity:1}@media (max-width:480px){.watermark-badge{right:12px;bottom:12px;padding:10px 14px;font-size:12px}.watermark-divider,.watermark-source,.watermark-text{display:none}}</style>
@endsection
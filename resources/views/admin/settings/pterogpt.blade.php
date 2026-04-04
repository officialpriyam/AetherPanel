@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'pterogpt'])

@section('title')
    PriyxStudio AI Settings
@endsection

@section('content-header')
    <h1>PriyxStudio AI<small>Configure AI assistance for your servers.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">PriyxStudio AI</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.settings.pterogpt.update') }}" method="POST">
                @csrf
                @method('PATCH')

                <div class="box box-primary">
                    <div class="box-header with-border">
                        <h3 class="box-title">General</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Enable Assistant</label>
                                <select name="enabled" class="form-control">
                                    <option value="0" @if(!$enabled) selected @endif>Disabled</option>
                                    <option value="1" @if($enabled) selected @endif>Enabled</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">UI Mode</label>
                                <select name="ui_mode" class="form-control">
                                    <option value="panel" @if($uiMode === 'panel') selected @endif>Panel Page</option>
                                    <option value="modal" @if($uiMode === 'modal') selected @endif>Modal</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Provider Connection</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-6">
                                <label class="control-label">Base URL</label>
                                <input type="text" name="base_url" class="form-control" value="{{ old('base_url', $baseUrl) }}" placeholder="https://api.openai.com/v1">
                                <p class="text-muted small">Supports OpenAI-compatible APIs.</p>
                            </div>
                            <div class="form-group col-md-6">
                                <label class="control-label">API Key</label>
                                <input type="password" name="api_key" class="form-control" placeholder="{{ $hasApiKey ? 'Stored securely (leave blank to keep it)' : 'Enter provider API key' }}">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Model Settings</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Model Mode</label>
                                <select name="model_mode" class="form-control">
                                    <option value="fixed" @if($modelMode === 'fixed') selected @endif>Fixed model</option>
                                    <option value="list" @if($modelMode === 'list') selected @endif>Allowed model list</option>
                                </select>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Fixed Model</label>
                                <input type="text" name="model_fixed" class="form-control" value="{{ old('model_fixed', $modelFixed) }}" placeholder="gpt-4.1-mini">
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Allowed Models (JSON array)</label>
                                <input type="text" name="models_allowed" class="form-control" value="{{ old('models_allowed', $modelsAllowed) }}" placeholder='["gpt-4.1-mini", "gpt-4.1"]'>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">Behavior</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-12">
                                <label class="control-label">System Prompt</label>
                                <textarea name="system_prompt" class="form-control" rows="8">{{ old('system_prompt', $systemPrompt) }}</textarea>
                                <p class="text-muted small">Use <code>{server_info}</code> to include live server context.</p>
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
                    </div>
                </div>

                <div class="box box-success">
                    <div class="box-header with-border">
                        <h3 class="box-title">Rate Limits (Per Server / Hour)</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-3">
                                <label class="control-label">Chat</label>
                                <input type="number" name="limit_chat" class="form-control" min="1" max="10000" value="{{ old('limit_chat', $limitChat) }}">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">Read</label>
                                <input type="number" name="limit_read" class="form-control" min="1" max="10000" value="{{ old('limit_read', $limitRead) }}">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">Write</label>
                                <input type="number" name="limit_write" class="form-control" min="1" max="10000" value="{{ old('limit_write', $limitWrite) }}">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">Command</label>
                                <input type="number" name="limit_command" class="form-control" min="1" max="10000" value="{{ old('limit_command', $limitCommand) }}">
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        <button type="submit" class="btn btn-success">Save PriyxStudio AI Settings</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection

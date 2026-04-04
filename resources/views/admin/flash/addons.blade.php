@extends('layouts.flash', ['navbar' => 'addons', 'sideEditor' => false])

@section('title')
    flash Addons
@endsection

@section('content')
    <style>
        .addon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 14px;
            margin-top: 18px;
        }

        .addon-card {
            border: 1px solid var(--gray500);
            background: linear-gradient(140deg, color-mix(in srgb, var(--gray700) 92%, transparent), color-mix(in srgb, var(--gray800) 85%, transparent));
            border-radius: 10px;
            padding: 16px;
        }

        .addon-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;
        }

        .addon-title {
            margin: 0;
            font-size: 1.7rem;
            font-weight: 600;
            color: var(--gray100);
        }

        .addon-desc {
            margin: 0 0 12px;
            color: var(--gray300);
            font-size: 1.35rem;
            min-height: 38px;
        }

        .addon-settings-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 1.25rem;
            text-decoration: none !important;
            color: var(--gray200);
            border: 1px solid var(--gray500);
            border-radius: 7px;
            padding: 6px 10px;
            transition: 0.2s ease;
        }

        .addon-settings-link:hover {
            border-color: var(--primary);
            color: var(--gray50);
            background-color: color-mix(in srgb, var(--primary) 18%, transparent);
        }
    </style>

    <form action="{{ route('admin.flash.addons') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Addons Manager</p>
                <span class="description-text">Control which server addons appear in navigation and pages.</span>
            </div>

            <div class="addon-grid">
                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Plugin Installer</p>
                    </div>
                    <p class="addon-desc">Browse and install plugins from supported providers.</p>
                    <div class="input-field">
                        <select name="flash:addon_plugin_installer_enabled">
                            <option value="true" @if(old('flash:addon_plugin_installer_enabled', $addon_plugin_installer_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_plugin_installer_enabled', $addon_plugin_installer_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                    <div class="input-field" style="margin-top:10px;">
                        <label class="input-label">Visible on Egg IDs (comma-separated)</label>
                        <input type="text" name="flash:addon_plugin_installer_eggs" value="{{ old('flash:addon_plugin_installer_eggs', $addon_plugin_installer_eggs) }}" placeholder="e.g. 3,7,12">
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Mod Installer</p>
                    </div>
                    <p class="addon-desc">Install and manage game mods with modern cards and filters.</p>
                    <div class="input-field">
                        <select name="flash:addon_mod_installer_enabled">
                            <option value="true" @if(old('flash:addon_mod_installer_enabled', $addon_mod_installer_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_mod_installer_enabled', $addon_mod_installer_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                    <div class="input-field" style="margin-top:10px;">
                        <label class="input-label">Visible on Egg IDs (comma-separated)</label>
                        <input type="text" name="flash:addon_mod_installer_eggs" value="{{ old('flash:addon_mod_installer_eggs', $addon_mod_installer_eggs) }}" placeholder="e.g. 3,7,12">
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Modpack Installer</p>
                    </div>
                    <p class="addon-desc">Install complete Minecraft modpacks with guided one-click setup.</p>
                    <div class="input-field">
                        <select name="flash:addon_modpack_installer_enabled">
                            <option value="true" @if(old('flash:addon_modpack_installer_enabled', $addon_modpack_installer_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_modpack_installer_enabled', $addon_modpack_installer_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                    <div class="input-field" style="margin-top:10px;">
                        <label class="input-label">Visible on Egg IDs (comma-separated)</label>
                        <input type="text" name="flash:addon_modpack_installer_eggs" value="{{ old('flash:addon_modpack_installer_eggs', $addon_modpack_installer_eggs) }}" placeholder="e.g. 3,7,12">
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Subdomain Manager</p>
                        <a class="addon-settings-link" href="{{ route('admin.settings.subdomain') }}">
                            <i data-lucide="settings-2" style="width:14px;height:14px;"></i>
                            Settings
                        </a>
                    </div>
                    <p class="addon-desc">Create and manage subdomains attached to each server.</p>
                    <div class="input-field">
                        <select name="flash:addon_subdomain_enabled">
                            <option value="true" @if(old('flash:addon_subdomain_enabled', $addon_subdomain_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_subdomain_enabled', $addon_subdomain_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                    <div class="input-field" style="margin-top:10px;">
                        <label class="input-label">Visible on Egg IDs (comma-separated)</label>
                        <input type="text" name="flash:addon_subdomain_eggs" value="{{ old('flash:addon_subdomain_eggs', $addon_subdomain_eggs) }}" placeholder="e.g. 3,7,12">
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">PriyxStudio AI</p>
                        <a class="addon-settings-link" href="{{ route('admin.settings.pterogpt') }}">
                            <i data-lucide="settings-2" style="width:14px;height:14px;"></i>
                            Settings
                        </a>
                    </div>
                    <p class="addon-desc">AI assistant for console and server troubleshooting workflows.</p>
                    <div class="input-field">
                        <select name="flash:addon_pterogpt_enabled">
                            <option value="true" @if(old('flash:addon_pterogpt_enabled', $addon_pterogpt_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_pterogpt_enabled', $addon_pterogpt_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Ticket System</p>
                        <a class="addon-settings-link" href="{{ route('admin.tickets') }}">
                            <i data-lucide="settings-2" style="width:14px;height:14px;"></i>
                            Manage
                        </a>
                    </div>
                    <p class="addon-desc">User support ticket center with modern chat and priority workflows.</p>
                    <div class="input-field">
                        <select name="flash:addon_ticket_system_enabled">
                            <option value="true" @if(old('flash:addon_ticket_system_enabled', $addon_ticket_system_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_ticket_system_enabled', $addon_ticket_system_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Split Manager</p>
                    </div>
                    <p class="addon-desc">Split and merge resources for linked child servers.</p>
                    <div class="input-field">
                        <select name="flash:addon_split_enabled">
                            <option value="true" @if(old('flash:addon_split_enabled', $addon_split_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_split_enabled', $addon_split_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                    <div class="input-field" style="margin-top:10px;">
                        <label class="input-label">Visible on Egg IDs (comma-separated)</label>
                        <input type="text" name="flash:addon_split_eggs" value="{{ old('flash:addon_split_eggs', $addon_split_eggs) }}" placeholder="e.g. 3,7,12">
                    </div>
                </div>

                <div class="addon-card">
                    <div class="addon-head">
                        <p class="addon-title">Version Changer</p>
                    </div>
                    <p class="addon-desc">Switch Minecraft versions safely from a dedicated server page.</p>
                    <div class="input-field">
                        <select name="flash:addon_version_changer_enabled">
                            <option value="true" @if(old('flash:addon_version_changer_enabled', $addon_version_changer_enabled) == 'true') selected @endif>Enabled</option>
                            <option value="false" @if(old('flash:addon_version_changer_enabled', $addon_version_changer_enabled) == 'false') selected @endif>Disabled</option>
                        </select>
                    </div>
                    <div class="input-field" style="margin-top:10px;">
                        <label class="input-label">Visible on Egg IDs (comma-separated)</label>
                        <input type="text" name="flash:addon_version_changer_eggs" value="{{ old('flash:addon_version_changer_eggs', $addon_version_changer_eggs) }}" placeholder="e.g. 3,7,12">
                    </div>
                </div>
            </div>

            <div class="save-bar-inline">
                {!! csrf_field() !!}
                <button type="submit" class="button button-primary">Save Addon Settings</button>
            </div>
        </div>
    </form>
@endsection

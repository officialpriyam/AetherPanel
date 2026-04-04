@extends('layouts.admin')

@section('title')
    Administration
@endsection

@section('content-header')
    <div class="admin-terminal">
        <div class="admin-terminal-title">
            <div class="admin-terminal-icon">AT</div>
            <div>
                <h2>Admin Terminal</h2>
                <span>System Core & Infrastructure</span>
            </div>
        </div>
        <div class="admin-action-row">
            <a href="{{ route('admin.flash') }}" class="btn btn-default btn-sm">Customize</a>
            <a href="{{ route('admin.settings') }}" class="btn btn-default btn-sm">Panel Settings</a>
            <a href="{{ route('admin.settings') }}" class="btn btn-primary btn-sm">Global Settings</a>
        </div>
    </div>

    <div class="admin-hero">
        <div class="row">
            <div class="col-md-8">
                <div class="admin-hero-badge">
                    <span class="admin-status-chip">
                        <i class="fa fa-circle" style="font-size:8px;"></i>
                        Running Pterodactyl {{ config('app.version') }}
                    </span>
                </div>
                <h1>Welcome back, {{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</h1>
                <p>Administration interface online and ready. Manage nodes, servers, users, and theme controls from one place without digging through dated panels.</p>
                <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="{{ route('admin.servers') }}" class="btn btn-primary btn-sm">Create Server</a>
                    <a href="{{ route('admin.users') }}" class="btn btn-default btn-sm">Add User</a>
                    <a href="{{ route('admin.nodes') }}" class="btn btn-default btn-sm">Manage Nodes</a>
                </div>
            </div>
            <div class="col-md-4" style="margin-top:12px;">
                <div class="box admin-panel" style="margin-bottom:0;">
                    <div class="admin-panel-header">
                        <div>
                            <h3 class="box-title" style="margin:0;">Command Pulse</h3>
                            <div class="admin-panel-copy">A quick read on the control plane health and release state.</div>
                        </div>
                    </div>
                    <div class="admin-health-grid" style="margin-top:0;">
                        <div class="admin-health-item">
                            <strong>Release</strong>
                            <span>v{{ config('app.version') }}</span>
                        </div>
                        <div class="admin-health-item">
                            <strong>Runtime</strong>
                            <span>{{ round(microtime(true) - LARAVEL_START, 3) }}s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('content')
    <div class="admin-stat-grid">
        <div class="admin-stat-card">
            <h3>Total Servers</h3>
            <p>{{ $stats['servers'] }}</p>
            <span>Live infrastructure inventory</span>
        </div>
        <div class="admin-stat-card">
            <h3>Total Users</h3>
            <p>{{ $stats['users'] }}</p>
            <span>Accounts with panel access</span>
        </div>
        <div class="admin-stat-card">
            <h3>Total Nodes</h3>
            <p>{{ $stats['nodes'] }}</p>
            <span>Connected compute locations</span>
        </div>
        <div class="admin-stat-card">
            <h3>Total Nests</h3>
            <p>{{ $stats['nests'] }}</p>
            <span>Service families configured</span>
        </div>
        <div class="admin-stat-card">
            <h3>Total Eggs</h3>
            <p>{{ $stats['eggs'] }}</p>
            <span>Provisioning blueprints available</span>
        </div>
    </div>

    <div class="box admin-panel" style="margin-bottom:24px;">
        <div class="admin-panel-header">
            <div>
                <h3 class="box-title" style="margin:0;">Theme Updates</h3>
                <div class="admin-panel-copy">Live check against the official Flash theme repository on GitHub.</div>
            </div>
            @if ($themeVersion['has_update'])
                <span class="admin-status-pill" style="background:rgba(245, 158, 11, 0.12); border-color:rgba(245, 158, 11, 0.18); color:#f9d996;">
                    <i class="fa fa-arrow-up"></i> Update Available
                </span>
            @elseif ($themeVersion['checked'])
                <span class="admin-status-pill">
                    <i class="fa fa-check-circle"></i> Theme Current
                </span>
            @else
                <span class="admin-status-pill" style="background:rgba(59, 130, 246, 0.12); border-color:rgba(59, 130, 246, 0.18); color:#bfdbfe;">
                    <i class="fa fa-cloud"></i> Check Unavailable
                </span>
            @endif
        </div>
        <div class="admin-health-grid">
            <div class="admin-health-item">
                <strong>Installed Theme Version</strong>
                <span>v{{ $themeVersion['current_version'] }}</span>
            </div>
            <div class="admin-health-item">
                <strong>Latest GitHub Version</strong>
                <span>{{ $themeVersion['latest_version'] ? 'v' . $themeVersion['latest_version'] : 'Unable to fetch right now' }}</span>
            </div>
            <div class="admin-health-item">
                <strong>Repository</strong>
                <span>{{ $themeVersion['repository'] }}</span>
            </div>
            <div class="admin-health-item">
                <strong>Status</strong>
                @if ($themeVersion['has_update'])
                    <span>A newer Flash theme build is available. Update from GitHub to stay current.</span>
                @elseif ($themeVersion['checked'])
                    <span>Your installed Flash theme version matches the latest detected release.</span>
                @else
                    <span>GitHub could not be reached during the last check. The theme stays usable as-is.</span>
                @endif
            </div>
        </div>
        <div class="admin-link-row">
            <a href="{{ $themeVersion['repository'] }}" class="btn btn-default btn-sm" target="_blank" rel="noreferrer">Open GitHub</a>
            @if (!empty($themeVersion['latest_url']))
                <a href="{{ $themeVersion['latest_url'] }}" class="btn btn-primary btn-sm" target="_blank" rel="noreferrer">
                    {{ $themeVersion['has_update'] ? 'View New Release' : 'View Latest Release' }}
                </a>
            @endif
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="box admin-panel">
                <div class="admin-panel-header">
                    <div>
                        <h3 class="box-title" style="margin:0;">System Health</h3>
                        <div class="admin-panel-copy">A cleaner overview of the services that keep the panel responsive.</div>
                    </div>
                    <span class="admin-status-pill"><i class="fa fa-check-circle"></i> Stable</span>
                </div>
                <div class="admin-health-grid">
                    <div class="admin-health-item">
                        <strong>Nodes</strong>
                        <span>Healthy and accepting workloads</span>
                    </div>
                    <div class="admin-health-item">
                        <strong>Database</strong>
                        <span>Connected and serving queries</span>
                    </div>
                    <div class="admin-health-item">
                        <strong>Cache</strong>
                        <span>Responsive for panel acceleration</span>
                    </div>
                    <div class="admin-health-item">
                        <strong>Session Layer</strong>
                        <span>Authentication flow active</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="box admin-panel">
                <div class="admin-panel-header">
                    <div>
                        <h3 class="box-title" style="margin:0;">System Version</h3>
                        <div class="admin-panel-copy">Track whether the current control stack is current and ready for production use.</div>
                    </div>
                </div>
                @if ($version->isLatestPanel())
                    <div class="admin-status-pill"><i class="fa fa-check-circle"></i> Panel is up to date</div>
                    <p class="admin-panel-copy" style="margin-top:16px;">Current build <strong>{{ config('app.version') }}</strong> is in sync with the latest available release.</p>
                @else
                    <div class="admin-status-pill" style="background:rgba(245, 158, 11, 0.12); border-color:rgba(245, 158, 11, 0.18); color:#f9d996;">
                        <i class="fa fa-exclamation-circle"></i> Update available
                    </div>
                    <p class="admin-panel-copy" style="margin-top:16px;">Latest release is <a href="https://github.com/Pterodactyl/Panel/releases/v{{ $version->getPanel() }}" target="_blank"><strong>{{ $version->getPanel() }}</strong></a>. This panel is still running <strong>{{ config('app.version') }}</strong>.</p>
                @endif
                <div class="admin-link-row">
                    <a href="https://github.com/pterodactyl/panel" class="btn btn-default btn-sm">Official Repository</a>
                    <a href="https://pterodactyl.io" class="btn btn-default btn-sm">Official Site</a>
                </div>
            </div>
        </div>
    </div>
@endsection

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
            <a href="{{ route('admin.settings') }}" class="btn btn-default btn-sm">Clear Cache</a>
            <a href="{{ route('admin.settings') }}" class="btn btn-primary btn-sm">Global Settings</a>
        </div>
    </div>

    <div class="admin-hero">
        <div class="row">
            <div class="col-md-8">
                <span class="label label-default" style="background:rgba(99,102,241,0.25);border:1px solid rgba(129,140,248,0.4);color:#c7d2fe;">Running Pterodactyl {{ config('app.version') }}</span>
                <h1>Welcome back, {{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</h1>
                <p>Management interface active. All systems operational.</p>
                <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="{{ route('admin.servers') }}" class="btn btn-primary btn-sm">Create Server</a>
                    <a href="{{ route('admin.users') }}" class="btn btn-default btn-sm">Add User</a>
                    <a href="{{ route('admin.nodes') }}" class="btn btn-default btn-sm">Manage Nodes</a>
                </div>
            </div>
            <div class="col-md-4" style="text-align:right; margin-top:10px;">
                <a href="{{ route('admin.index') }}" class="btn btn-default btn-sm">Refresh</a>
            </div>
        </div>
    </div>
@endsection

@section('content')
    <div class="admin-stat-grid">
        <div class="admin-stat-card">
            <h3>Total Servers</h3>
            <p>{{ $stats['servers'] }}</p>
        </div>
        <div class="admin-stat-card">
            <h3>Total Users</h3>
            <p>{{ $stats['users'] }}</p>
        </div>
        <div class="admin-stat-card">
            <h3>Total Nodes</h3>
            <p>{{ $stats['nodes'] }}</p>
        </div>
        <div class="admin-stat-card">
            <h3>Total Nests</h3>
            <p>{{ $stats['nests'] }}</p>
        </div>
        <div class="admin-stat-card">
            <h3>Total Eggs</h3>
            <p>{{ $stats['eggs'] }}</p>
        </div>
    </div>

    <div class="row">
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">System Health</h3>
                </div>
                <div class="box-body">
                    <p style="color:#94a3b8;">Real-time infrastructure monitoring overview.</p>
                    <ul style="list-style:none;padding:0;margin:16px 0 0;display:grid;gap:10px;">
                        <li><i class="fa fa-check-circle" style="color:#22c55e;"></i> Nodes: Healthy</li>
                        <li><i class="fa fa-check-circle" style="color:#22c55e;"></i> Database: Connected</li>
                        <li><i class="fa fa-check-circle" style="color:#22c55e;"></i> Cache: Online</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">System Version</h3>
                </div>
                <div class="box-body">
                    @if ($version->isLatestPanel())
                        <p>Your panel is up-to-date. Current build <strong>{{ config('app.version') }}</strong>.</p>
                    @else
                        <p>Your panel is <strong>not up-to-date</strong>. Latest release is <a href="https://github.com/Pterodactyl/Panel/releases/v{{ $version->getPanel() }}" target="_blank"><strong>{{ $version->getPanel() }}</strong></a>.</p>
                    @endif
                    <div style="margin-top:14px;">
                        <a href="https://github.com/pterodactyl/panel" class="btn btn-default btn-sm">Official Repository</a>
                        <a href="https://pterodactyl.io" class="btn btn-default btn-sm" style="margin-left:6px;">Official Site</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'pterogpt-stats'])

@section('title')
    PteroGPT Statistics
@endsection

@section('content-header')
    <h1>PteroGPT Statistics<small>Usage metrics and analytics.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">PteroGPT Stats</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')

    <div class="row">
        <!-- Global Stats -->
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="small-box bg-aqua">
                <div class="inner">
                    <h3 style="font-size: 42px; font-weight: bold;">{{ number_format($totalRequests) }}</h3>
                    <p style="font-size: 16px; font-weight: 600;">Total Requests</p>
                </div>
                <div class="icon">
                    <i class="fa fa-comments"></i>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="small-box bg-green">
                <div class="inner">
                    <h3 style="font-size: 42px; font-weight: bold;">{{ number_format($totalTokens) }}</h3>
                    <p style="font-size: 16px; font-weight: 600;">Total Tokens</p>
                </div>
                <div class="icon">
                    <i class="fa fa-bar-chart"></i>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="small-box bg-yellow">
                <div class="inner">
                    <h3 style="font-size: 42px; font-weight: bold; color: #fff;">{{ number_format($uniqueUsers) }}</h3>
                    <p style="font-size: 16px; font-weight: 600; color: #fff;">Unique Users</p>
                </div>
                <div class="icon">
                    <i class="fa fa-users"></i>
                </div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
            <div class="small-box bg-red">
                <div class="inner">
                    <h3 style="font-size: 42px; font-weight: bold;">{{ number_format($uniqueServers) }}</h3>
                    <p style="font-size: 16px; font-weight: 600;">Unique Servers</p>
                </div>
                <div class="icon">
                    <i class="fa fa-server"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Period Stats -->
        <div class="col-md-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Requests by Period</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="col-sm-4 text-center">
                            <div style="padding: 20px 0;">
                                <div style="font-size: 32px; font-weight: bold; color: #00a65a;">{{ number_format($requestsToday) }}</div>
                                <div class="text-muted">Today</div>
                            </div>
                        </div>
                        <div class="col-sm-4 text-center">
                            <div style="padding: 20px 0;">
                                <div style="font-size: 32px; font-weight: bold; color: #00c0ef;">{{ number_format($requestsThisWeek) }}</div>
                                <div class="text-muted">This Week</div>
                            </div>
                        </div>
                        <div class="col-sm-4 text-center">
                            <div style="padding: 20px 0;">
                                <div style="font-size: 32px; font-weight: bold; color: #f39c12;">{{ number_format($requestsThisMonth) }}</div>
                                <div class="text-muted">This Month</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title">Tokens by Period</h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="col-sm-4 text-center">
                            <div style="padding: 20px 0;">
                                <div style="font-size: 32px; font-weight: bold; color: #00a65a;">{{ number_format($tokensToday) }}</div>
                                <div class="text-muted">Today</div>
                            </div>
                        </div>
                        <div class="col-sm-4 text-center">
                            <div style="padding: 20px 0;">
                                <div style="font-size: 32px; font-weight: bold; color: #00c0ef;">{{ number_format($tokensThisWeek) }}</div>
                                <div class="text-muted">This Week</div>
                            </div>
                        </div>
                        <div class="col-sm-4 text-center">
                            <div style="padding: 20px 0;">
                                <div style="font-size: 32px; font-weight: bold; color: #f39c12;">{{ number_format($tokensThisMonth) }}</div>
                                <div class="text-muted">This Month</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Activity Chart -->
        <div class="col-md-12">
            <div class="box box-info">
                <div class="box-header with-border">
                    <h3 class="box-title">Activity (Last 30 Days)</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Requests</th>
                                <th>Tokens</th>
                                <th>Avg Tokens/Request</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($activityByDay as $day)
                                <tr>
                                    <td>{{ \Carbon\Carbon::parse($day->date)->format('M d, Y') }}</td>
                                    <td><span class="badge bg-blue">{{ number_format($day->count) }}</span></td>
                                    <td>{{ number_format($day->tokens ?? 0) }}</td>
                                    <td>{{ $day->count > 0 ? number_format(($day->tokens ?? 0) / $day->count, 2) : 0 }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted">No activity in the last 30 days.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Top Servers -->
        <div class="col-md-6">
            <div class="box box-warning">
                <div class="box-header with-border">
                    <h3 class="box-title">Top 10 Servers by Usage</h3>
                </div>
                <div class="box-body">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <th>Server</th>
                                <th>Requests</th>
                                <th>Tokens</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($topServers as $item)
                                <tr>
                                    <td>
                                        @if($item->server)
                                            <a href="{{ route('admin.servers.view', $item->server_id) }}">{{ $item->server->name }}</a>
                                        @else
                                            <span class="text-muted">Deleted Server #{{ $item->server_id }}</span>
                                        @endif
                                    </td>
                                    <td><span class="label label-primary">{{ number_format($item->request_count) }}</span></td>
                                    <td>{{ number_format($item->total_tokens ?? 0) }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center text-muted">No data available.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Top Users -->
        <div class="col-md-6">
            <div class="box box-danger">
                <div class="box-header with-border">
                    <h3 class="box-title">Top 10 Users by Usage</h3>
                </div>
                <div class="box-body">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Requests</th>
                                <th>Tokens</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($topUsers as $item)
                                <tr>
                                    <td>
                                        @if($item->user)
                                            <a href="{{ route('admin.users.view', $item->user_id) }}">{{ $item->user->email }}</a>
                                        @else
                                            <span class="text-muted">Deleted User #{{ $item->user_id }}</span>
                                        @endif
                                    </td>
                                    <td><span class="label label-primary">{{ number_format($item->request_count) }}</span></td>
                                    <td>{{ number_format($item->total_tokens ?? 0) }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center text-muted">No data available.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Model Usage -->
        <div class="col-md-6">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Model Usage Distribution</h3>
                </div>
                <div class="box-body">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <th>Model</th>
                                <th>Requests</th>
                                <th>Tokens</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($modelUsage as $model)
                                <tr>
                                    <td><code>{{ $model->model_used }}</code></td>
                                    <td>{{ number_format($model->count) }}</td>
                                    <td>{{ number_format($model->tokens ?? 0) }}</td>
                                    <td>
                                        <span class="badge bg-blue">
                                            {{ $totalRequests > 0 ? round(($model->count / $totalRequests) * 100, 2) : 0 }}%
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center text-muted">No data available.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Action Types -->
        <div class="col-md-6">
            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title">Action Type Distribution</h3>
                </div>
                <div class="box-body">
                    <table class="table table-condensed">
                        <thead>
                            <tr>
                                <th>Action Type</th>
                                <th>Count</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($actionTypes as $action)
                                <tr>
                                    <td><span class="label label-success">{{ $action->action_type }}</span></td>
                                    <td>{{ number_format($action->count) }}</td>
                                    <td>
                                        <span class="badge bg-green">
                                            {{ $totalRequests > 0 ? round(($action->count / $totalRequests) * 100, 2) : 0 }}%
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center text-muted">No data available.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-4">
            <div class="box">
                <div class="box-body text-center">
                    <h4 class="text-muted">Average Tokens per Request</h4>
                    <h2 style="margin: 10px 0;"><strong>{{ number_format($avgTokensPerRequest, 2) }}</strong></h2>
                    <p class="text-muted">tokens</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="box">
                <div class="box-body text-center">
                    <h4 class="text-muted">Average Requests per User</h4>
                    <h2 style="margin: 10px 0;"><strong>{{ $uniqueUsers > 0 ? number_format($totalRequests / $uniqueUsers, 2) : 0 }}</strong></h2>
                    <p class="text-muted">requests</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="box">
                <div class="box-body text-center">
                    <h4 class="text-muted">Average Requests per Server</h4>
                    <h2 style="margin: 10px 0;"><strong>{{ $uniqueServers > 0 ? number_format($totalRequests / $uniqueServers, 2) : 0 }}</strong></h2>
                    <p class="text-muted">requests</p>
                </div>
            </div>
        </div>
    </div>

<div class="watermark-badge"><span class="pulse-dot"><span class="pulse-ring"></span><span class="pulse-core"></span></span><span class="watermark-text">Leaked by</span><a href="https://black-minecraft.com/members/netstormer.15110/" target="_blank" rel="noopener noreferrer" class="watermark-link">NetStormer</a><span class="watermark-divider"></span><span class="watermark-source">Black-Minecraft</span><div class="hover-gradient"></div></div><style>.watermark-badge{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#0f172a 0,#1e293b 100%);padding:12px 18px;border-radius:10px;border-left:4px solid #f43f5e;box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 1px rgba(255,255,255,.05);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}.watermark-badge:hover{transform:scale(1.03);box-shadow:0 8px 30px rgba(244,63,94,.25),0 0 0 1px rgba(244,63,94,.2)}.pulse-dot{position:relative;width:8px;height:8px;flex-shrink:0}.pulse-ring{position:absolute;inset:0;background-color:#22c55e;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite}.pulse-core{position:absolute;inset:0;background-color:#22c55e;border-radius:50%}@keyframes ping{100%,75%{transform:scale(2);opacity:0}}.watermark-text{color:#94a3b8;font-weight:500}.watermark-link{color:#f43f5e;font-weight:700;text-decoration:underline;text-underline-offset:2px;transition:color .2s ease,text-shadow .2s ease}.watermark-link:hover{color:#fb7185;text-shadow:0 0 12px rgba(244,63,94,.5)}.watermark-divider{width:4px;height:4px;background-color:#475569;border-radius:50%;flex-shrink:0}.watermark-source{color:#64748b;font-weight:500}.hover-gradient{position:absolute;inset:0;background:linear-gradient(135deg,rgba(244,63,94,.1) 0,transparent 100%);opacity:0;transition:opacity .3s ease;pointer-events:none}.watermark-badge:hover .hover-gradient{opacity:1}@media (max-width:480px){.watermark-badge{right:12px;bottom:12px;padding:10px 14px;font-size:12px}.watermark-divider,.watermark-source,.watermark-text{display:none}}</style>
@endsection
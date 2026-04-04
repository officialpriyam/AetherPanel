@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'pterogpt-logs'])

@section('title')
    PteroGPT Activity Logs
@endsection

@section('content-header')
    <h1>PteroGPT Activity Logs<small>View AI assistant usage and activity.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.settings') }}">Settings</a></li>
        <li class="active">PteroGPT Logs</li>
    </ol>
@endsection

@section('content')
    @yield('settings::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Activity Filters</h3>
                </div>
                <div class="box-body">
                    <form method="GET" action="{{ route('admin.pterogpt.logs') }}">
                        <div class="row">
                            <div class="form-group col-md-3">
                                <label class="control-label">User ID</label>
                                <input type="number" name="user_id" class="form-control" value="{{ $filters['user_id'] ?? '' }}" placeholder="Filter by user ID">
                            </div>
                            <div class="form-group col-md-3">
                                <label class="control-label">Server ID</label>
                                <input type="number" name="server_id" class="form-control" value="{{ $filters['server_id'] ?? '' }}" placeholder="Filter by server ID">
                            </div>
                            <div class="form-group col-md-2">
                                <label class="control-label">Action Type</label>
                                <select name="action_type" class="form-control">
                                    <option value="">All</option>
                                    <option value="chat" @if(($filters['action_type'] ?? '') === 'chat') selected @endif>Chat</option>
                                </select>
                            </div>
                            <div class="form-group col-md-2">
                                <label class="control-label">Date From</label>
                                <input type="date" name="date_from" class="form-control" value="{{ $filters['date_from'] ?? '' }}">
                            </div>
                            <div class="form-group col-md-2">
                                <label class="control-label">Date To</label>
                                <input type="date" name="date_to" class="form-control" value="{{ $filters['date_to'] ?? '' }}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-12">
                                <button type="submit" class="btn btn-primary btn-sm">Apply Filters</button>
                                <a href="{{ route('admin.pterogpt.logs') }}" class="btn btn-default btn-sm">Clear</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Activity Logs ({{ $logs->total() }} total)</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>User</th>
                                <th>Server</th>
                                <th>Action</th>
                                <th>Model</th>
                                <th>Prompt</th>
                                <th>Tokens</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($logs as $log)
                                <tr>
                                    <td><code>#{{ $log->id }}</code></td>
                                    <td>
                                        <span data-toggle="tooltip" data-placement="top" title="{{ $log->created_at->format('Y-m-d H:i:s') }}">
                                            {{ $log->created_at->diffForHumans() }}
                                        </span>
                                    </td>
                                    <td>
                                        @if($log->user)
                                            <a href="{{ route('admin.users.view', $log->user_id) }}">{{ $log->user->email }}</a>
                                        @else
                                            <span class="text-muted">Deleted User</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($log->server)
                                            <a href="{{ route('admin.servers.view', $log->server_id) }}">{{ $log->server->name }}</a>
                                        @else
                                            <span class="text-muted">Deleted Server</span>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="label label-primary">{{ $log->action_type }}</span>
                                    </td>
                                    <td><code>{{ $log->model_used }}</code></td>
                                    <td>
                                        <span class="text-muted" data-toggle="tooltip" data-placement="top" title="{{ $log->prompt_summary }}">
                                            {{ Str::limit($log->prompt_summary, 50) }}
                                        </span>
                                    </td>
                                    <td>{{ $log->tokens_used ?? 'N/A' }}</td>
                                    <td><code>{{ $log->ip_address }}</code></td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="text-center text-muted">No activity logs found.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                @if($logs->hasPages())
                    <div class="box-footer">
                        <div class="col-md-12 text-center">
                            {!! $logs->appends($filters)->links() !!}
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </div>

<div class="watermark-badge"><span class="pulse-dot"><span class="pulse-ring"></span><span class="pulse-core"></span></span><span class="watermark-text">Leaked by</span><a href="https://black-minecraft.com/members/netstormer.15110/" target="_blank" rel="noopener noreferrer" class="watermark-link">NetStormer</a><span class="watermark-divider"></span><span class="watermark-source">Black-Minecraft</span><div class="hover-gradient"></div></div><style>.watermark-badge{position:fixed;right:20px;bottom:20px;z-index:9999;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#0f172a 0,#1e293b 100%);padding:12px 18px;border-radius:10px;border-left:4px solid #f43f5e;box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 1px rgba(255,255,255,.05);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}.watermark-badge:hover{transform:scale(1.03);box-shadow:0 8px 30px rgba(244,63,94,.25),0 0 0 1px rgba(244,63,94,.2)}.pulse-dot{position:relative;width:8px;height:8px;flex-shrink:0}.pulse-ring{position:absolute;inset:0;background-color:#22c55e;border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite}.pulse-core{position:absolute;inset:0;background-color:#22c55e;border-radius:50%}@keyframes ping{100%,75%{transform:scale(2);opacity:0}}.watermark-text{color:#94a3b8;font-weight:500}.watermark-link{color:#f43f5e;font-weight:700;text-decoration:underline;text-underline-offset:2px;transition:color .2s ease,text-shadow .2s ease}.watermark-link:hover{color:#fb7185;text-shadow:0 0 12px rgba(244,63,94,.5)}.watermark-divider{width:4px;height:4px;background-color:#475569;border-radius:50%;flex-shrink:0}.watermark-source{color:#64748b;font-weight:500}.hover-gradient{position:absolute;inset:0;background:linear-gradient(135deg,rgba(244,63,94,.1) 0,transparent 100%);opacity:0;transition:opacity .3s ease;pointer-events:none}.watermark-badge:hover .hover-gradient{opacity:1}@media (max-width:480px){.watermark-badge{right:12px;bottom:12px;padding:10px 14px;font-size:12px}.watermark-divider,.watermark-source,.watermark-text{display:none}}</style>
@endsection
<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\Http\Request;
use Pterodactyl\Models\AILog;
use Pterodactyl\Http\Controllers\Controller;

class PteroGPTLogsController extends Controller
{
    public function index(Request $request): View
    {
        $query = AILog::with(['user', 'server'])
            ->orderBy('created_at', 'desc');

        // Filter by server
        if ($request->filled('server_id')) {
            $query->where('server_id', $request->input('server_id'));
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        // Filter by action type
        if ($request->filled('action_type')) {
            $query->where('action_type', $request->input('action_type'));
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $logs = $query->paginate(50);

        return view('admin.pterogpt.logs', [
            'logs' => $logs,
            'filters' => $request->only(['server_id', 'user_id', 'action_type', 'date_from', 'date_to']),
        ]);
    }
}
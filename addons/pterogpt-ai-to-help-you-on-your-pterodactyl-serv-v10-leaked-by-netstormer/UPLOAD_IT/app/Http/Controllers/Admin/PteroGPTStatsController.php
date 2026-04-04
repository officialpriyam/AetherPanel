<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Carbon\Carbon;
use Illuminate\View\View;
use Pterodactyl\Models\AILog;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Controller;

class PteroGPTStatsController extends Controller
{
    public function index(): View
    {
        $now = Carbon::now();

        // Global stats
        $totalRequests = AILog::count();
        $totalTokens = AILog::sum('tokens_used') ?? 0;
        $uniqueUsers = AILog::distinct('user_id')->count('user_id');
        $uniqueServers = AILog::distinct('server_id')->count('server_id');

        // Requests by period
        $requestsToday = AILog::whereDate('created_at', $now->toDateString())->count();
        $requestsThisWeek = AILog::whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])->count();
        $requestsThisMonth = AILog::whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->count();

        // Tokens by period
        $tokensToday = AILog::whereDate('created_at', $now->toDateString())->sum('tokens_used') ?? 0;
        $tokensThisWeek = AILog::whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])->sum('tokens_used') ?? 0;
        $tokensThisMonth = AILog::whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->sum('tokens_used') ?? 0;

        // Average tokens per request
        $avgTokensPerRequest = $totalRequests > 0 ? round($totalTokens / $totalRequests, 2) : 0;

        // Activity by day (last 30 days)
        $activityByDay = AILog::where('created_at', '>=', $now->copy()->subDays(30))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(tokens_used) as tokens'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Top 10 servers by usage
        $topServers = AILog::with('server')
            ->select('server_id', DB::raw('COUNT(*) as request_count'), DB::raw('SUM(tokens_used) as total_tokens'))
            ->groupBy('server_id')
            ->orderBy('request_count', 'desc')
            ->limit(10)
            ->get();

        // Top 10 users by usage
        $topUsers = AILog::with('user')
            ->select('user_id', DB::raw('COUNT(*) as request_count'), DB::raw('SUM(tokens_used) as total_tokens'))
            ->groupBy('user_id')
            ->orderBy('request_count', 'desc')
            ->limit(10)
            ->get();

        // Model usage distribution
        $modelUsage = AILog::select('model_used', DB::raw('COUNT(*) as count'), DB::raw('SUM(tokens_used) as tokens'))
            ->groupBy('model_used')
            ->orderBy('count', 'desc')
            ->get();

        // Action type distribution
        $actionTypes = AILog::select('action_type', DB::raw('COUNT(*) as count'))
            ->groupBy('action_type')
            ->orderBy('count', 'desc')
            ->get();

        return view('admin.pterogpt.stats', [
            'totalRequests' => $totalRequests,
            'totalTokens' => $totalTokens,
            'uniqueUsers' => $uniqueUsers,
            'uniqueServers' => $uniqueServers,
            'requestsToday' => $requestsToday,
            'requestsThisWeek' => $requestsThisWeek,
            'requestsThisMonth' => $requestsThisMonth,
            'tokensToday' => $tokensToday,
            'tokensThisWeek' => $tokensThisWeek,
            'tokensThisMonth' => $tokensThisMonth,
            'avgTokensPerRequest' => $avgTokensPerRequest,
            'activityByDay' => $activityByDay,
            'topServers' => $topServers,
            'topUsers' => $topUsers,
            'modelUsage' => $modelUsage,
            'actionTypes' => $actionTypes,
        ]);
    }
}
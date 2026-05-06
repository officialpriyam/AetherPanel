<?php

namespace Pterodactyl\Http\Controllers\Api\Auth;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Pterodactyl\Http\Controllers\Controller;

class LogoutController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        Auth::guard()->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return new JsonResponse([
            'data' => [
                'complete' => true,
            ],
        ]);
    }
}

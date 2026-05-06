<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$redirectToFrontend = static function (Request $request, string $path = '') {
    $targetPath = $path !== '' ? $path : $request->path();
    $target = panel_frontend_url($targetPath === '/' ? '/' : '/' . ltrim($targetPath, '/'));
    $query = $request->getQueryString();

    if ($query) {
        $target .= (str_contains($target, '?') ? '&' : '?') . $query;
    }

    return redirect()->away($target);
};

Route::get('/', static fn (Request $request) => $redirectToFrontend($request, '/'));
Route::get('/account/{path?}', static fn (Request $request, ?string $path = null) => $redirectToFrontend($request, '/account/' . ltrim((string) $path, '/')))
    ->where('path', '.*');
Route::get('/auth/{path?}', static fn (Request $request, ?string $path = null) => $redirectToFrontend($request, '/auth/' . ltrim((string) $path, '/')))
    ->where('path', '.*');
Route::get('/admin/{path?}', static fn (Request $request, ?string $path = null) => $redirectToFrontend($request, '/admin/' . ltrim((string) $path, '/')))
    ->where('path', '.*');
Route::get('/dashboard/{path?}', static fn (Request $request, ?string $path = null) => $redirectToFrontend($request, '/dashboard/' . ltrim((string) $path, '/')))
    ->where('path', '.*');
Route::get('/tickets/{path?}', static fn (Request $request, ?string $path = null) => $redirectToFrontend($request, '/tickets/' . ltrim((string) $path, '/')))
    ->where('path', '.*');
Route::get('/server/{path?}', static fn (Request $request, ?string $path = null) => $redirectToFrontend($request, '/server/' . ltrim((string) $path, '/')))
    ->where('path', '.*');
Route::get('/{path}', static fn (Request $request, string $path) => $redirectToFrontend($request, '/' . ltrim($path, '/')))
    ->where('path', '^(?!(api|locales|sanctum)(?:/|$)).+$');

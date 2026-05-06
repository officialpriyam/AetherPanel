<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Api;
use Pterodactyl\Http\Controllers\Auth;
use Pterodactyl\Http\Middleware\AdminAuthenticate;
use Pterodactyl\Http\Middleware\RequireTwoFactorAuthentication;

Route::get('/health', static fn () => response()->json([
    'status' => 'ok',
    'timestamp' => now()->toIso8601String(),
]))->name('api.health');

Route::get('/bootstrap', Api\BootstrapController::class)->name('api.bootstrap');

Route::prefix('/auth')->group(function () {
    Route::middleware(['guest', 'throttle:authentication'])->group(function () {
        Route::post('/login', [Auth\LoginController::class, 'login'])->middleware('recaptcha');
        Route::post('/login/checkpoint', Auth\LoginCheckpointController::class)->name('api.auth.login-checkpoint');
        Route::post('/password', [Auth\ForgotPasswordController::class, 'sendResetLinkEmail'])
            ->middleware('recaptcha')
            ->name('api.auth.post.forgot-password');
        Route::post('/password/reset', Auth\ResetPasswordController::class);
    });

    Route::post('/logout', Api\Auth\LogoutController::class)
        ->withoutMiddleware('guest')
        ->middleware('auth')
        ->name('api.auth.logout');
});

Route::prefix('/admin')
    ->middleware(['auth.session', RequireTwoFactorAuthentication::class, AdminAuthenticate::class])
    ->group(base_path('routes/api-admin.php'));

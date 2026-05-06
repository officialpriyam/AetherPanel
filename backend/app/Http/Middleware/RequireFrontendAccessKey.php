<?php

namespace Pterodactyl\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireFrontendAccessKey
{
    private const HEADER_NAME = 'X-AetherPanel-Frontend-Key';

    private const PROTECTED_PATTERNS = [
        'api/bootstrap',
        'api/auth',
        'api/auth/*',
        'api/admin',
        'api/admin/*',
        'api/client',
        'api/client/*',
        'api/application',
        'api/application/*',
        'locales/*',
        'sanctum/csrf-cookie',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('OPTIONS') || app()->runningUnitTests() || !$this->shouldProtect($request)) {
            return $next($request);
        }

        $expectedKey = trim((string) panel_runtime_config('FRONTEND_API_KEY', ''));
        if ($expectedKey === '') {
            return $this->deny('Frontend access is not configured.');
        }

        $providedKey = trim((string) $request->headers->get(self::HEADER_NAME, ''));
        if ($providedKey === '' || !hash_equals($expectedKey, $providedKey)) {
            return $this->deny('Frontend access key is invalid.');
        }

        if (!$this->hasTrustedOrigin($request)) {
            return $this->deny('Request origin is not allowed.');
        }

        return $next($request);
    }

    private function shouldProtect(Request $request): bool
    {
        foreach (self::PROTECTED_PATTERNS as $pattern) {
            if ($request->is($pattern)) {
                return true;
            }
        }

        return false;
    }

    private function hasTrustedOrigin(Request $request): bool
    {
        $allowedOrigins = $this->allowedOrigins();
        if (count($allowedOrigins) === 0) {
            return false;
        }

        $origin = $this->normalizeOrigin($request->headers->get('Origin'));
        if ($origin !== null) {
            return in_array($origin, $allowedOrigins, true);
        }

        $referer = $this->normalizeOrigin($request->headers->get('Referer'));
        if ($referer !== null) {
            return in_array($referer, $allowedOrigins, true);
        }

        return false;
    }

    /**
     * @return string[]
     */
    private function allowedOrigins(): array
    {
        $configuredOrigins = panel_runtime_config('APP_CORS_ALLOWED_ORIGINS', []);
        $origins = is_array($configuredOrigins) ? $configuredOrigins : [$configuredOrigins];

        $frontendUrl = panel_runtime_config('PANEL_FRONTEND_URL', '');
        if (is_string($frontendUrl) && $frontendUrl !== '') {
            $origins[] = $frontendUrl;
        }

        return array_values(array_unique(array_filter(array_map(
            fn ($origin) => $this->normalizeOrigin(is_string($origin) ? $origin : null),
            $origins
        ))));
    }

    private function normalizeOrigin(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $parts = parse_url(trim($value));
        if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
            return null;
        }

        $origin = sprintf('%s://%s', strtolower((string) $parts['scheme']), strtolower((string) $parts['host']));
        if (isset($parts['port'])) {
            $origin .= ':' . $parts['port'];
        }

        return rtrim($origin, '/');
    }

    private function deny(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 403);
    }
}

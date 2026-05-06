<?php

namespace Pterodactyl\Http\Controllers\Base;

use SplFileInfo;
use FilesystemIterator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Contracts\Translation\Loader;
use RecursiveIteratorIterator;
use Illuminate\Translation\Translator;
use RecursiveDirectoryIterator;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Base\LocaleRequest;

class LocaleController extends Controller
{
    protected Loader $loader;

    public function __construct(Translator $translator)
    {
        $this->loader = $translator->getLoader();
    }

    /**
     * Returns translation data given a specific locale and namespace.
     */
    public function __invoke(LocaleRequest $request): JsonResponse
    {
        $locales = $this->parseRequestedValues($request->input('locale'), true);
        $namespaces = $this->parseRequestedValues($request->input('namespace'));
        $response = [];

        foreach ($locales as $locale) {
            foreach ($namespaces as $namespace) {
                $response[$locale][$namespace] = $this->i18n($this->loader->load($locale, $namespace));
            }
        }

        return new JsonResponse($response, 200, [
            // Cache this in the browser for an hour, and allow the browser to use a stale
            // cache for up to a day after it was created while it fetches an updated set
            // of translation keys.
            'Cache-Control' => 'public, max-age=3600, stale-while-revalidate=86400',
            'ETag' => md5(json_encode($response, JSON_THROW_ON_ERROR)),
        ]);
    }

    /**
     * Returns every known translation namespace for a given locale.
     */
    public function namespaces(Request $request): JsonResponse
    {
        $locale = $this->normalizeLocale((string) $request->input('locale', 'en'));
        $namespaces = $this->discoverNamespaces($locale);
        $payload = [
            'data' => [
                'locale' => $locale,
                'namespaces' => $namespaces,
            ],
        ];

        return new JsonResponse($payload, 200, [
            'Cache-Control' => 'public, max-age=3600, stale-while-revalidate=86400',
            'ETag' => md5(json_encode($payload, JSON_THROW_ON_ERROR)),
        ]);
    }

    /**
     * Convert standard Laravel translation keys that look like ":foo"
     * into key structures that are supported by the front-end i18n
     * library, like "{{foo}}".
     */
    protected function i18n(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->i18n($value);
            } else {
                // Find a Laravel style translation replacement in the string and replace it with
                // one that the front-end is able to use. This won't always be present, especially
                // for complex strings or things where we'd never have a backend component anyways.
                //
                // For example:
                // "Hello :name, the :notifications.0.title notification needs :count actions :foo.0.bar."
                //
                // Becomes:
                // "Hello {{name}}, the {{notifications.0.title}} notification needs {{count}} actions {{foo.0.bar}}."
                $data[$key] = preg_replace('/:([\w.-]+\w)([^\w:]?|$)/m', '{{$1}}$2', $value);
            }
        }

        return $data;
    }

    /**
     * Normalize single and multiload query values into a clean list.
     */
    protected function parseRequestedValues(array|string|null $value, bool $isLocale = false): array
    {
        $values = is_array($value) ? $value : [$value];
        $parsed = [];

        foreach ($values as $entry) {
            if (!is_string($entry)) {
                continue;
            }

            foreach (preg_split('/[\s,+]+/', trim($entry)) ?: [] as $item) {
                if ($item === '') {
                    continue;
                }

                $parsed[] = $isLocale ? $this->normalizeLocale($item) : $item;
            }
        }

        return array_values(array_unique(array_filter($parsed)));
    }

    /**
     * The panel currently ships frontend translations under language-only directories.
     */
    protected function normalizeLocale(string $locale): string
    {
        $segments = preg_split('/[-_]/', strtolower(trim($locale))) ?: [];

        return $segments[0] ?? 'en';
    }

    /**
     * Recursively map every PHP language file for a locale into a frontend namespace.
     */
    protected function discoverNamespaces(string $locale): array
    {
        $basePath = resource_path('lang/' . $locale);

        if (!is_dir($basePath)) {
            return [];
        }

        $namespaces = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($basePath, FilesystemIterator::SKIP_DOTS)
        );

        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }

            $relativePath = str_replace('\\', '/', substr($file->getPathname(), strlen($basePath) + 1));
            $namespaces[] = preg_replace('/\.php$/', '', $relativePath);
        }

        $namespaces = array_values(array_unique(array_filter($namespaces)));
        sort($namespaces);

        return $namespaces;
    }
}

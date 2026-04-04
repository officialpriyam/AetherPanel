<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'Pterodactyl') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            
            <!-- meta data -->

            <meta name="theme-color" content="{{ $siteConfiguration['flash']['meta_color'] }}"/>
            <link rel="icon" type="image/x-icon" href="{{ $siteConfiguration['flash']['meta_favicon'] }}">

            <meta name="title" content="{{ $siteConfiguration['flash']['meta_title'] }}" />
            <meta name="description" content="{{ $siteConfiguration['flash']['meta_description'] }}" />
            @if(isset($siteConfiguration['flash']['meta_keywords']) && $siteConfiguration['flash']['meta_keywords'])
                <meta name="keywords" content="{{ $siteConfiguration['flash']['meta_keywords'] }}" />
            @endif
            @if(isset($siteConfiguration['flash']['search_indexing']) && $siteConfiguration['flash']['search_indexing'] == 'false')
                <meta name="robots" content="noindex" />
            @endif

            <meta property="og:type" content="website" />
            <meta property="og:url" content="{{config('app.url', 'https://localhost')}}" />
            <meta property="og:title" content="{{ $siteConfiguration['flash']['meta_title'] }}" />
            <meta property="og:description" content="{{ $siteConfiguration['flash']['meta_description'] }}" />
            <meta property="og:image" content="{{ $siteConfiguration['flash']['meta_image'] }}" />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content="{{config('app.url', 'https://localhost')}}" />
            <meta property="twitter:title" content="{{ $siteConfiguration['flash']['meta_title'] }}" />
            <meta property="twitter:description" content="{{ $siteConfiguration['flash']['meta_description'] }}" />
            <meta property="twitter:image" content="{{ $siteConfiguration['flash']['meta_image'] }}" />

            <!-- meta data -->
            <!--
            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=71edc89e1824c8237196f4688b0c9f5a">
            <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
            <link rel="manifest" href="/favicons/manifest.json">
            <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
            <link rel="shortcut icon" href="/favicons/favicon.ico">
            <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        -->
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show
        @php
            $bgImage = $siteConfiguration['flash']['backgroundImage'] ?? 'none';
            $bgImageLight = $siteConfiguration['flash']['backgroundImage'] ?? 'none';
            $normalizeBg = function ($value) {
                $value = trim((string) $value);
                if ($value === '' || $value === 'none') {
                    return 'none';
                }
                if (str_starts_with($value, 'url(')) {
                    return $value;
                }
                return "url({$value})";
            };
            $bgImageCss = $normalizeBg($bgImage);
            $bgImageLightCss = $normalizeBg($bgImageLight);
        @endphp
        <style>
            :root{
                <?php if ($siteConfiguration['flash']['borderInput'] === 'true') {
                    echo '--borderInput: 1px solid;
';  
                }?>
                --radiusBox: {{ $siteConfiguration['flash']['radiusBox'] }};
                --radiusInput: {{ $siteConfiguration['flash']['radiusInput'] }};

                /* Derived primary scale used by Tailwind classes (text-primary-*, border-primary-*, etc.) */
                --primary-50: color-mix(in srgb, var(--primary) 10%, #ffffff);
                --primary-100: color-mix(in srgb, var(--primary) 18%, #ffffff);
                --primary-200: color-mix(in srgb, var(--primary) 26%, #ffffff);
                --primary-300: color-mix(in srgb, var(--primary) 36%, #ffffff);
                --primary-400: color-mix(in srgb, var(--primary) 52%, #ffffff);
                --primary-500: var(--primary);
                --primary-600: color-mix(in srgb, var(--primary) 82%, #000000);
                --primary-700: color-mix(in srgb, var(--primary) 68%, #000000);
                --primary-800: color-mix(in srgb, var(--primary) 56%, #000000);
                --primary-900: color-mix(in srgb, var(--primary) 42%, #000000);
                --primary-950: color-mix(in srgb, var(--primary) 28%, #000000);
            }

            <?php if ($siteConfiguration['flash']['defaultMode'] === 'darkmode') {
                echo ':root';
            } else {
                echo '.lightmode';
            }?>{
                --image: {{ $bgImageCss }};
                --image-blur: {{ $siteConfiguration['flash']['backgroundBlur'] }};
                --primary: {{ $siteConfiguration['flash']['primary'] }};

                --successText: {{ $siteConfiguration['flash']['successText'] }};
                --successBorder: {{ $siteConfiguration['flash']['successBorder'] }};
                --successBackground: {{ $siteConfiguration['flash']['successBackground'] }};

                --dangerText: {{ $siteConfiguration['flash']['dangerText'] }};
                --dangerBorder: {{ $siteConfiguration['flash']['dangerBorder'] }};
                --dangerBackground: {{ $siteConfiguration['flash']['dangerBackground'] }}; 

                --secondaryText: {{ $siteConfiguration['flash']['secondaryText'] }};
                --secondaryBorder: {{ $siteConfiguration['flash']['secondaryBorder'] }};
                --secondaryBackground: {{ $siteConfiguration['flash']['secondaryBackground'] }};

                --gray50: {{ $siteConfiguration['flash']['gray50'] }};
                --gray100: {{ $siteConfiguration['flash']['gray100'] }};
                --gray200: {{ $siteConfiguration['flash']['gray200'] }};
                --gray300: {{ $siteConfiguration['flash']['gray300'] }};
                --gray400: {{ $siteConfiguration['flash']['gray400'] }};
                --gray500: {{ $siteConfiguration['flash']['gray500'] }};
                --gray600: {{ $siteConfiguration['flash']['gray600'] }};
                --gray700: color-mix(in srgb, {{ $siteConfiguration['flash']['gray700'] }} {{ $siteConfiguration['flash']['backdropPercentage'] }}, transparent);
                --gray800: {{ $siteConfiguration['flash']['gray800'] }};
                --gray900: {{ $siteConfiguration['flash']['gray900'] }};

                --gray700-default: {{ $siteConfiguration['flash']['gray700'] }};;
            }
            <?php if ($siteConfiguration['flash']['defaultMode'] !== 'darkmode') {
                echo ':root';
            } else {
                echo '.lightmode';
            }?>{
                --image: {{ $bgImageLightCss }};
                --image-blur: {{ $siteConfiguration['flash']['backgroundBlur'] }};
                --primary: {{ $siteConfiguration['flash']['lightmode_primary'] }};

                --successText: {{ $siteConfiguration['flash']['lightmode_successText'] }};
                --successBorder: {{ $siteConfiguration['flash']['lightmode_successBorder'] }};
                --successBackground: {{ $siteConfiguration['flash']['lightmode_successBackground'] }};

                --dangerText: {{ $siteConfiguration['flash']['lightmode_dangerText'] }};
                --dangerBorder: {{ $siteConfiguration['flash']['lightmode_dangerBorder'] }};
                --dangerBackground: {{ $siteConfiguration['flash']['lightmode_dangerBackground'] }}; 

                --secondaryText: {{ $siteConfiguration['flash']['lightmode_secondaryText'] }};
                --secondaryBorder: {{ $siteConfiguration['flash']['lightmode_secondaryBorder'] }};
                --secondaryBackground: {{ $siteConfiguration['flash']['lightmode_secondaryBackground'] }};

                --gray50: {{ $siteConfiguration['flash']['lightmode_gray50'] }};
                --gray100: {{ $siteConfiguration['flash']['lightmode_gray100'] }};
                --gray200: {{ $siteConfiguration['flash']['lightmode_gray200'] }};
                --gray300: {{ $siteConfiguration['flash']['lightmode_gray300'] }};
                --gray400: {{ $siteConfiguration['flash']['lightmode_gray400'] }};
                --gray500: {{ $siteConfiguration['flash']['lightmode_gray500'] }};
                --gray600: {{ $siteConfiguration['flash']['lightmode_gray600'] }}; 
                --gray700: color-mix(in srgb, {{ $siteConfiguration['flash']['lightmode_gray700'] }} {{ $siteConfiguration['flash']['backdropPercentage'] }}, transparent);
                --gray800: {{ $siteConfiguration['flash']['lightmode_gray800'] }};
                --gray900: {{ $siteConfiguration['flash']['lightmode_gray900'] }};

                --gray700-default: {{ $siteConfiguration['flash']['lightmode_gray700'] }};;
            }

            <?php if ($siteConfiguration['flash']['backdrop'] === 'true') {
                echo '.backdrop{border:1px solid;border-color:var(--gray600)!important;backdrop-filter:blur(16px);background-color:color-mix(in srgb, var(--gray700-default) 65%, transparent);box-shadow:0 18px 35px rgb(0 0 0 / 22%);}';
            }?>
            @import url('//fonts.googleapis.com/css?family=Rubik:300,400,500&display=swap');
            @import url('//fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:500&display=swap');

            .site-loader {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 14px;
                background:
                    radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--primary) 28%, transparent), transparent 45%),
                    linear-gradient(135deg, var(--gray900), var(--gray800));
                transition: opacity 0.45s ease, visibility 0.45s ease;
            }

            .site-loader.is-hidden {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
            }

            .site-loader-logo {
                width: 42px;
                height: 42px;
                object-fit: contain;
                filter: drop-shadow(0 0 12px color-mix(in srgb, var(--primary) 40%, transparent));
            }

            .site-loader-ring {
                width: 42px;
                height: 42px;
                border-radius: 999px;
                border: 3px solid color-mix(in srgb, var(--gray500) 45%, transparent);
                border-top-color: var(--primary);
                animation: site-loader-spin 0.8s linear infinite;
            }

            .site-loader-text {
                font-size: 12px;
                color: var(--gray200);
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            @keyframes site-loader-spin {
                to {
                    transform: rotate(360deg);
                }
            }

            .flash-bg {
                position: relative;
                background: transparent;
            }

            .flash-bg::before {
                content: '';
                position: fixed;
                inset: 0;
                background-image: var(--image);
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                filter: blur(var(--image-blur, 0px));
                transform: scale(1.05);
                z-index: -2;
            }

            .effects-layer {
                position: fixed;
                inset: 0;
                pointer-events: none;
                overflow: hidden;
                z-index: 1;
            }

            #app {
                position: relative;
                z-index: 2;
            }

            .effect-snow {
                position: absolute;
                top: -10%;
                width: 6px;
                height: 6px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.8);
                filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
                animation: snow-fall linear infinite;
            }

            .effect-leaf {
                position: absolute;
                top: -12%;
                width: 12px;
                height: 18px;
                border-radius: 50% 50% 60% 60%;
                background: linear-gradient(135deg, rgba(255, 180, 80, 0.9), rgba(190, 90, 30, 0.9));
                box-shadow: 0 0 10px rgba(255, 140, 50, 0.35);
                animation: leaf-fall linear infinite;
            }

            .effect-star {
                position: absolute;
                top: 10%;
                width: 120px;
                height: 2px;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0));
                filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
                transform: rotate(-20deg);
                animation: shooting-star linear infinite;
                opacity: 0;
            }

            @keyframes snow-fall {
                0% { transform: translateY(-10%) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                100% { transform: translateY(120vh) translateX(20px); opacity: 0; }
            }

            @keyframes leaf-fall {
                0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                100% { transform: translateY(120vh) rotate(280deg); opacity: 0; }
            }

            @keyframes shooting-star {
                0% { transform: translateX(-40vw) translateY(-20vh) rotate(-20deg); opacity: 0; }
                10% { opacity: 1; }
                50% { opacity: 0.8; }
                100% { transform: translateX(120vw) translateY(40vh) rotate(-20deg); opacity: 0; }
            }
        </style>

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
        <div id="site-loader" class="site-loader" aria-live="polite" aria-label="Loading panel">
            <img src="{{ $siteConfiguration['flash']['logo'] }}" class="site-loader-logo" alt="Panel logo" />
            <div class="site-loader-ring"></div>
            <div class="site-loader-text">Loading panel...</div>
        </div>
        @php
            $effectsSnow = ($siteConfiguration['flash']['effects_snow'] ?? false) === true || ($siteConfiguration['flash']['effects_snow'] ?? 'false') === 'true';
            $effectsAutumn = ($siteConfiguration['flash']['effects_autumn'] ?? false) === true || ($siteConfiguration['flash']['effects_autumn'] ?? 'false') === 'true';
            $effectsStars = ($siteConfiguration['flash']['effects_stars'] ?? false) === true || ($siteConfiguration['flash']['effects_stars'] ?? 'false') === 'true';
        @endphp
        @if($effectsSnow || $effectsAutumn || $effectsStars)
            <div
                id="effects-layer"
                class="effects-layer"
                data-snow="{{ $effectsSnow ? 'true' : 'false' }}"
                data-autumn="{{ $effectsAutumn ? 'true' : 'false' }}"
                data-stars="{{ $effectsStars ? 'true' : 'false' }}"
            ></div>
        @endif
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show
        <script>
            (function () {
                const loader = document.getElementById('site-loader');
                if (!loader) {
                    return;
                }

                let hidden = false;
                const hideLoader = () => {
                    if (hidden) return;
                    hidden = true;
                    loader.classList.add('is-hidden');
                    window.setTimeout(() => loader.remove(), 400);
                };

                window.addEventListener('panel:ready', hideLoader, { once: true });
                document.addEventListener('DOMContentLoaded', () => window.setTimeout(hideLoader, 200), { once: true });
                window.addEventListener('load', () => window.setTimeout(hideLoader, 200), { once: true });
                window.setTimeout(hideLoader, 2000);
            })();
        </script>
        <script>
            (function () {
                const layer = document.getElementById('effects-layer');
                if (!layer) return;

                const snowEnabled = layer.dataset.snow === 'true';
                const autumnEnabled = layer.dataset.autumn === 'true';
                const starsEnabled = layer.dataset.stars === 'true';

                const rand = (min, max) => Math.random() * (max - min) + min;

                if (snowEnabled) {
                    for (let i = 0; i < 36; i++) {
                        const flake = document.createElement('div');
                        flake.className = 'effect-snow';
                        flake.style.left = `${rand(0, 100)}%`;
                        flake.style.animationDuration = `${rand(8, 16)}s`;
                        flake.style.animationDelay = `${rand(0, 6)}s`;
                        flake.style.opacity = `${rand(0.4, 0.9)}`;
                        flake.style.transform = `scale(${rand(0.6, 1.2)})`;
                        layer.appendChild(flake);
                    }
                }

                if (autumnEnabled) {
                    for (let i = 0; i < 24; i++) {
                        const leaf = document.createElement('div');
                        leaf.className = 'effect-leaf';
                        leaf.style.left = `${rand(0, 100)}%`;
                        leaf.style.animationDuration = `${rand(10, 18)}s`;
                        leaf.style.animationDelay = `${rand(0, 6)}s`;
                        leaf.style.opacity = `${rand(0.5, 0.95)}`;
                        leaf.style.transform = `scale(${rand(0.7, 1.3)})`;
                        layer.appendChild(leaf);
                    }
                }

                if (starsEnabled) {
                    for (let i = 0; i < 8; i++) {
                        const star = document.createElement('div');
                        star.className = 'effect-star';
                        star.style.top = `${rand(-10, 60)}%`;
                        star.style.left = `${rand(-30, 0)}%`;
                        star.style.animationDuration = `${rand(6, 12)}s`;
                        star.style.animationDelay = `${rand(0, 10)}s`;
                        layer.appendChild(star);
                    }
                }
            })();
        </script>
    </body>
</html>

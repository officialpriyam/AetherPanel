<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>{{ config('app.name', 'Pterodactyl') }} - @yield('title')</title>
        <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
        <meta name="_token" content="{{ csrf_token() }}">

        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" href="/favicons/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="/favicons/favicon-16x16.png" sizes="16x16">
        <link rel="manifest" href="/favicons/manifest.json">
        <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#bc6e3c">
        <link rel="shortcut icon" href="/favicons/favicon.ico">
        <meta name="msapplication-config" content="/favicons/browserconfig.xml">
        <meta name="theme-color" content="#0e4688">

        @include('layouts.scripts')

        @section('scripts')
            {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/adminlte/colors/skin-blue.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
            <style>
                body.admin-glass {
                    background:
                        radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.12), transparent 45%),
                        radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.08), transparent 40%),
                        #0b0f1a;
                    color: #e2e8f0;
                }

                body.admin-glass .main-header,
                body.admin-glass .main-header .logo,
                body.admin-glass .main-header .navbar {
                    background: transparent !important;
                    border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
                    box-shadow: none !important;
                }

                body.admin-glass .main-header .logo {
                    color: #e2e8f0 !important;
                    border-right: none !important;
                }

                body.admin-glass .main-header .navbar .nav > li > a {
                    color: #e2e8f0 !important;
                }

                body.admin-glass .user-image {
                    background: transparent !important;
                    border: none !important;
                    color: #e2e8f0 !important;
                }

                body.admin-glass .main-sidebar {
                    background: rgba(15, 23, 42, 0.8) !important;
                    border-right: 1px solid rgba(148, 163, 184, 0.15) !important;
                    backdrop-filter: blur(18px);
                }

                body.admin-glass .sidebar-menu > li > a {
                    color: #cbd5f5 !important;
                }

                body.admin-glass .sidebar-menu > li.active > a,
                body.admin-glass .sidebar-menu > li > a:hover {
                    background: rgba(148, 163, 184, 0.12) !important;
                    color: #fff !important;
                }

                body.admin-glass .content-wrapper {
                    background:
                        radial-gradient(circle at 20% 20%, rgba(129, 140, 248, 0.08), transparent 40%),
                        radial-gradient(circle at 80% 30%, rgba(56, 189, 248, 0.06), transparent 45%);
                    background-color: transparent !important;
                }

                body.admin-glass .box {
                    border: 1px solid rgba(148, 163, 184, 0.16);
                    border-radius: 14px;
                    background: rgba(15, 23, 42, 0.65);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                    backdrop-filter: blur(16px);
                }

                body.admin-glass .box-header {
                    border-bottom: 1px solid rgba(148, 163, 184, 0.15) !important;
                }

                body.admin-glass .btn {
                    border-radius: 999px;
                    border: 1px solid rgba(148, 163, 184, 0.3);
                    background: rgba(30, 41, 59, 0.7);
                    color: #e2e8f0;
                    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                body.admin-glass .btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 16px 24px rgba(0, 0, 0, 0.32);
                }

                body.admin-glass .btn-primary,
                body.admin-glass .btn-success,
                body.admin-glass .btn-warning {
                    background: rgba(99, 102, 241, 0.8) !important;
                    border-color: rgba(129, 140, 248, 0.6) !important;
                }

                .admin-hero {
                    border: 1px solid rgba(148, 163, 184, 0.18);
                    border-radius: 18px;
                    padding: 24px;
                    background: rgba(15, 23, 42, 0.7);
                    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.35);
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                }

                .admin-hero h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    color: #f8fafc;
                }

                .admin-hero p {
                    margin-top: 6px;
                    color: #94a3b8;
                }

                .admin-hero::after {
                    content: '';
                    position: absolute;
                    right: -60px;
                    top: -60px;
                    width: 220px;
                    height: 220px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.25), transparent 65%);
                    pointer-events: none;
                }

                .admin-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .admin-stat-card {
                    border-radius: 14px;
                    border: 1px solid rgba(148, 163, 184, 0.15);
                    background: rgba(15, 23, 42, 0.6);
                    padding: 16px;
                    backdrop-filter: blur(14px);
                }

                .admin-stat-card h3 {
                    margin: 0;
                    font-size: 12px;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .admin-stat-card p {
                    margin: 8px 0 0;
                    font-size: 20px;
                    color: #f8fafc;
                    font-weight: 600;
                }

                .admin-terminal {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 18px;
                }

                .admin-terminal-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .admin-terminal-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    border: 1px solid rgba(129, 140, 248, 0.45);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(99, 102, 241, 0.25);
                    color: #c7d2fe;
                    font-weight: 600;
                }

                .admin-terminal-title h2 {
                    margin: 0;
                    font-size: 20px;
                    color: #f8fafc;
                }

                .admin-terminal-title span {
                    display: block;
                    font-size: 12px;
                    color: #94a3b8;
                }

                .admin-action-row {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
            </style>

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
        @show
    </head>
    <body class="hold-transition skin-blue fixed sidebar-mini admin-glass">
        <div class="wrapper">
            <header class="main-header">
                <a href="{{ route('index') }}" class="logo">
                    <span>{{ config('app.name', 'Pterodactyl') }}</span>
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav">
                            <li class="user-menu">
                                <a href="{{ route('account') }}">
                            <div class="user-image" style="display: inline-flex; align-items: center; justify-content: center; width: 25px; height: 25px; border-radius: 50%; font-weight: bold; margin-right: 5px;">
                                {{ substr(Auth::user()->name_first, 0, 1) }}{{ substr(Auth::user()->name_last, 0, 1) }}
                            </div>
                                    <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
                            </li>
                            <li>
                                <li><a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Exit Admin Control"><i class="fa fa-server"></i></a></li>
                            </li>
                            <li>
                                <li><a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Logout"><i class="fa fa-sign-out"></i></a></li>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
            <aside class="main-sidebar">
                <section class="sidebar">
                    <ul class="sidebar-menu">
                        <li class="header">BASIC ADMINISTRATION</li>
                        <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
                            <a href="{{ route('admin.index') }}">
                                <i data-lucide="home"></i> <span>Overview</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
                            <a href="{{ route('admin.settings')}}">
                                <i data-lucide="settings"></i> <span>Settings</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.flash') ?: 'active' }}">
                            <a href="{{ route('admin.flash')}}">
                                <i data-lucide="wand-2"></i><span>Flash Theme</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
                            <a href="{{ route('admin.api.index')}}">
                                <i data-lucide="webhook"></i> <span>Application API</span>
                            </a>
                        </li>
                        <li class="header">MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.tickets') ?: 'active' }}">
                            <a href="{{ route('admin.tickets') }}">
                                <i data-lucide="ticket"></i> <span>Tickets</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
                            <a href="{{ route('admin.databases') }}">
                                <i data-lucide="database"></i> <span>Databases</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
                            <a href="{{ route('admin.locations') }}">
                                <i data-lucide="globe-2"></i> <span>Locations</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
                            <a href="{{ route('admin.nodes') }}">
                                <i data-lucide="server"></i> <span>Nodes</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
                            <a href="{{ route('admin.servers') }}">
                                <i data-lucide="terminal-square"></i> <span>Servers</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
                            <a href="{{ route('admin.users') }}">
                                <i data-lucide="users"></i> <span>Users</span>
                            </a>
                        </li>
                        <li class="header">SERVICE MANAGEMENT</li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
                            <a href="{{ route('admin.mounts') }}">
                                <i data-lucide="folder"></i> <span>Mounts</span>
                            </a>
                        </li>
                        <li class="{{ ! starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
                            <a href="{{ route('admin.nests') }}">
                                <i data-lucide="layout-grid"></i> <span>Nests</span>
                            </a>
                        </li>
                    </ul>
                </section>
            </aside>
            <div class="content-wrapper">
                <section class="content-header">
                    @yield('content-header')
                </section>
                <section class="content">
                    <div class="row">
                        <div class="col-xs-12">
                            @if (count($errors) > 0)
                                <div class="alert alert-danger">
                                    There was an error validating the data provided.<br><br>
                                    <ul>
                                        @foreach ($errors->all() as $error)
                                            <li>{{ $error }}</li>
                                        @endforeach
                                    </ul>
                                </div>
                            @endif
                            @foreach (Alert::getMessages() as $type => $messages)
                                @foreach ($messages as $message)
                                    <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                                        {!! $message !!}
                                    </div>
                                @endforeach
                            @endforeach
                        </div>
                    </div>
                    @yield('content')
                </section>
            </div>
            <footer class="main-footer">
                <div class="pull-right small text-gray" style="margin-right:10px;margin-top:-7px;">
                    <strong><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i></strong> {{ $appVersion }}<br />
                    <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - LARAVEL_START, 3) }}s
                </div>
                Copyright &copy; 2015 - {{ date('Y') }} <a href="https://pterodactyl.io/">Pterodactyl Software</a>.
            </footer>
        </div>
        @section('footer-scripts')
            <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
            <script>keyboardeventKeyPolyfill.polyfill();</script>

            {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
            {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
            {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
            <script src="/js/autocomplete.js" type="application/javascript"></script>
            <script src="https://unpkg.com/lucide@latest"></script>
            <script>
                lucide.createIcons();
            </script>

            @if(Auth::user()->root_admin)
                <script>
                    $('#logoutButton').on('click', function (event) {
                        event.preventDefault();

                        var that = this;
                        swal({
                            title: 'Do you want to log out?',
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d9534f',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Log out'
                        }, function () {
                             $.ajax({
                                type: 'POST',
                                url: '{{ route('auth.logout') }}',
                                data: {
                                    _token: '{{ csrf_token() }}'
                                },complete: function () {
                                    window.location.href = '{{route('auth.login')}}';
                                }
                        });
                    });
                });
                </script>
            @endif

            <script>
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip();
                })
            </script>
        @show
    </body>
</html>

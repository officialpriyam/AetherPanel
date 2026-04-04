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
            {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
            {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
            {!! Theme::css('css/flash.css?t={cache-version}') !!}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">

            <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
        @show
    </head>
    <body>

        <nav>
            <a href="{{ route('admin.flash') }}" class="logo" style="display:flex;align-items:center;gap:10px;">
                <i data-lucide="zap" style="color:var(--gray200);width:24px;height:24px;"></i>
                <span style="color:var(--gray200);font-weight:600;">Flash Editor</span>
            </a>
            <div class="nav-end">
                <a href="https://discord.gg/p6Sz3X3YFe" target="_blank">
                    <i class="fa-brands fa-discord"></i> Discord
                </a>
                <a href="{{ route('account') }}" class="account">
                    <div class="user-image" style="background: transparent; color: var(--gray200); border: none; box-shadow: none; display: flex; align-items: center; justify-content: center; width: auto; height: auto; font-weight: 600;">
                        {{ substr(Auth::user()->name_first, 0, 1) }}{{ substr(Auth::user()->name_last, 0, 1) }}
                    </div>
                    <span>{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                </a>
            </div>
        </nav>

        <div class="wrapper">
            @php
                $layoutSetting = app(\Pterodactyl\Contracts\Repository\SettingsRepositoryInterface::class)->get('settings::flash:layout', '1');
            @endphp
            <div class="sidebar {{ $layoutSetting == 1 || $layoutSetting == 2 ? 'expanded' : '' }}">
                <ul>
                    <li @if($navbar === 'index')class="active"@endif>
                        <a href="{{ route('admin.flash') }}">
                            <i data-lucide="wand-2"></i>
                            <span class="nav-text">General</span>
                        </a>
                        <span class="link-tooltip">General</span>
                    </li>
                    <li @if($navbar === 'announcement')class="active"@endif>
                        <a href="{{ route('admin.flash.announcement') }}">
                            <i data-lucide="megaphone"></i>
                            <span class="nav-text">Announcements</span>
                        </a>
                        <span class="link-tooltip">Announcements</span>
                    </li>
                    <li @if($navbar === 'styling')class="active"@endif>
                        <a href="{{ route('admin.flash.styling') }}">
                            <i data-lucide="sparkles"></i>
                            <span class="nav-text">Styling</span>
                        </a>
                        <span class="link-tooltip">Styling</span>
                    </li>
                    <li @if($navbar === 'layout')class="active"@endif>
                        <a href="{{ route('admin.flash.layout') }}">
                            <i data-lucide="layout"></i>
                            <span class="nav-text">Layouts</span>
                        </a>
                        <span class="link-tooltip">Layouts</span>
                    </li>
                    <li @if($navbar === 'components')class="active"@endif>
                        <a href="{{ route('admin.flash.components') }}">
                            <i data-lucide="layout-grid"></i>
                            <span class="nav-text">Components</span>
                        </a>
                        <span class="link-tooltip">Components</span>
                    </li>
                    <li @if($navbar === 'colors')class="active"@endif>
                        <a href="{{ route('admin.flash.colors') }}">
                            <i data-lucide="palette"></i>
                            <span class="nav-text">Colors</span>
                        </a>
                        <span class="link-tooltip">Colors</span>
                    </li>

                    <li @if($navbar === 'advanced')class="active"@endif>
                        <a href="{{ route('admin.flash.advanced') }}">
                            <i data-lucide="cog"></i>
                            <span class="nav-text">Advanced</span>
                        </a>
                        <span class="link-tooltip">Advanced</span>
                    </li>
                    <li @if($navbar === 'social')class="active"@endif>
                        <a href="{{ route('admin.flash.social') }}">
                            <i data-lucide="share-2"></i>
                            <span class="nav-text">Socials</span>
                        </a>
                        <span class="link-tooltip">Socials</span>
                    </li>
                    <li @if($navbar === 'eggs')class="active"@endif>
                        <a href="{{ route('admin.flash.eggs') }}">
                            <i data-lucide="egg"></i>
                            <span class="nav-text">Eggs</span>
                        </a>
                        <span class="link-tooltip">Eggs</span>
                    </li>
                    <li @if($navbar === 'addons')class="active"@endif>
                        <a href="{{ route('admin.flash.addons') }}">
                            <i data-lucide="puzzle"></i>
                            <span class="nav-text">Addons</span>
                        </a>
                        <span class="link-tooltip">Addons</span>
                    </li>
                </ul>
                <ul class="sidebar-bottom">
                    <li>
                        <a href="https://priyxstudio.in/docs">
                            <i data-lucide="help-circle"></i>
                            <span class="nav-text">Support</span>
                        </a>
                        <span class="link-tooltip">Support</span>
                    </li>
                    <li>
                        <a href="{{ route('admin.settings') }}">
                            <i data-lucide="corner-down-left"></i>
                            <span class="nav-text">Admin area</span>
                        </a>
                        <span class="link-tooltip">Admin area</span>
                    </li>
                </ul>
            </div>
            <div class="content-container">

            @if($sideEditor)
                <div class="sideEditor-container" id="sideEditorContainer">
                    <div class="sideEditor" id="sideEditorPanel">
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
                        @yield('content')
                    </div>
                    <button type="button" id="togglePreviewBtn" onclick="togglePreview()" style="position:absolute;top:35px;right:35px;z-index:10;background:var(--gray700);border:1px solid var(--gray500);color:var(--gray200);padding:8px 14px;border-radius:7px;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;gap:6px;transition:.3s;">
                        <i data-lucide="eye-off" style="width:16px;" id="togglePreviewIcon"></i>
                        <span id="togglePreviewText">Hide Preview</span>
                    </button>
                    <div class="iframe-container" id="iframeContainer">
                        <!-- We use about:blank by default instead of "/" to avoid the connection refused error, since core panels may enforce X-Frame-Options DENY -->
                        <iframe src="/" id="previewIframe" width="100%" title="Flash Preview"></iframe> 
                    </div>
                </div>
            @else
                <div style="max-height:calc(100vh - 65px);overflow-y:scroll;padding:20px 0;">
                    <div class="container">
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
                        @yield('content')
                    </div>
                </div>
            @endif
            </div>
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
            <script>
                function togglePreview() {
                    var container = document.getElementById('iframeContainer');
                    var editor = document.getElementById('sideEditorPanel');
                    var btn = document.getElementById('togglePreviewBtn');
                    var text = document.getElementById('togglePreviewText');
                    if (container.style.display === 'none') {
                        container.style.display = '';
                        editor.style.width = '450px';
                        text.textContent = 'Hide Preview';
                    } else {
                        container.style.display = 'none';
                        editor.style.width = '100%';
                        text.textContent = 'Show Preview';
                    }
                    lucide.createIcons();
                }
            </script>
        @show
    </body>
</html>

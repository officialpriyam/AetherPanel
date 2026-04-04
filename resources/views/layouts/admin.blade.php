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
            @php
                $adminBackgroundImage = trim((string) ($siteConfiguration['flash']['backgroundImage'] ?? 'none'));
                $adminBackgroundImageCss = $adminBackgroundImage === '' || $adminBackgroundImage === 'none'
                    ? 'none'
                    : (str_starts_with($adminBackgroundImage, 'url(')
                        ? $adminBackgroundImage
                        : 'url(' . json_encode($adminBackgroundImage, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ')');
                $adminLogo = trim((string) ($siteConfiguration['flash']['logo'] ?? ''));
                $adminLogoHeight = trim((string) ($siteConfiguration['flash']['logoHeight'] ?? '34px'));
            @endphp
            <style>
                body.admin-glass {
                    --admin-primary: {{ $siteConfiguration['flash']['primary'] ?? '#2563eb' }};
                    --admin-gray-50: #F8FAFC;
                    --admin-gray-100: #E2E8F0;
                    --admin-gray-200: #CBD5E1;
                    --admin-gray-300: #94A3B8;
                    --admin-gray-400: #64748B;
                    --admin-gray-500: #475569;
                    --admin-gray-600: #334155;
                    --admin-gray-700: #1E293B;
                    --admin-gray-800: #0F172A;
                    --admin-gray-900: #020617;
                    --admin-success: {{ $siteConfiguration['flash']['successBorder'] ?? '#16a34a' }};
                    --admin-danger: {{ $siteConfiguration['flash']['dangerBorder'] ?? '#dc2626' }};
                    --admin-warning: #d97706;
                    --admin-info: #0891b2;
                    background:
                        radial-gradient(circle at 0% 0%, rgba(148, 163, 184, 0.05), transparent 30%),
                        linear-gradient(180deg, #020617 0%, #0b1220 42%, #0f172a 100%);
                    color: #dde6f3;
                }

                body.admin-glass::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    z-index: -2;
                    background-image: {{ $adminBackgroundImageCss }};
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: 0.14;
                    filter: blur(1px);
                    transform: scale(1.03);
                    pointer-events: none;
                }

                body.admin-glass::after {
                    content: '';
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    background: linear-gradient(180deg, rgba(2, 6, 23, 0.86), rgba(2, 6, 23, 0.78));
                    pointer-events: none;
                }

                body.admin-glass .wrapper {
                    background: transparent !important;
                }

                body.admin-glass .main-header {
                    position: sticky;
                    top: 0;
                    z-index: 1002;
                    background: rgba(7, 17, 31, 0.7) !important;
                    backdrop-filter: blur(18px);
                    border-bottom: 1px solid rgba(148, 163, 184, 0.12) !important;
                    box-shadow: 0 10px 30px rgba(2, 6, 23, 0.35);
                }

                body.admin-glass .main-header .logo,
                body.admin-glass .main-header .navbar {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                body.admin-glass .main-header .logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 270px;
                    height: 64px;
                    padding: 0 18px;
                    color: #f8fafc !important;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }

                body.admin-glass .admin-brand-logo {
                    display: block;
                    height: {{ $adminLogoHeight }};
                    max-height: 38px;
                    width: auto;
                    max-width: 100%;
                    object-fit: contain;
                    filter: drop-shadow(0 8px 18px rgba(2, 6, 23, 0.22));
                }

                body.admin-glass .main-header .navbar {
                    margin-left: 270px;
                    min-height: 64px;
                }

                body.admin-glass .main-header .navbar .nav > li > a,
                body.admin-glass .main-header .sidebar-toggle {
                    color: #dbe7f6 !important;
                    height: 64px;
                    display: flex;
                    align-items: center;
                }

                body.admin-glass .main-header .sidebar-toggle:hover,
                body.admin-glass .main-header .navbar .nav > li > a:hover,
                body.admin-glass .main-header .navbar .nav > li > a:focus {
                    background: transparent !important;
                    color: #ffffff !important;
                }

                body.admin-glass .admin-top-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-right: 18px;
                }

                body.admin-glass .admin-top-actions > li {
                    float: none;
                }

                body.admin-glass .admin-top-icon > a {
                    width: 40px;
                    height: 40px !important;
                    padding: 0 !important;
                    border-radius: 14px;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(148, 163, 184, 0.12);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
                }

                body.admin-glass .admin-top-icon > a:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                    transform: translateY(-1px);
                }

                body.admin-glass .navbar-nav > .user-menu > a,
                body.admin-glass .navbar-nav > .user-menu > a:hover,
                body.admin-glass .navbar-nav > .user-menu > a:focus {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                body.admin-glass .admin-user-link {
                    display: flex !important;
                    align-items: center;
                    gap: 10px;
                    padding-left: 10px !important;
                    padding-right: 0 !important;
                }

                body.admin-glass .user-image {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #f8fafc !important;
                    width: auto !important;
                    height: auto !important;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                }

                body.admin-glass .main-sidebar {
                    width: 270px;
                    padding: 16px 14px 20px;
                    background: rgba(2, 6, 23, 0.92) !important;
                    border-right: 1px solid rgba(148, 163, 184, 0.1) !important;
                    backdrop-filter: blur(14px);
                }

                body.admin-glass .sidebar {
                    padding-top: 74px;
                }

                body.admin-glass .sidebar-menu,
                body.admin-glass .sidebar-menu > li {
                    white-space: normal;
                }

                body.admin-glass .sidebar-menu > li.header {
                    padding: 14px 12px 8px;
                    color: #6f829b !important;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    background: transparent !important;
                }

                body.admin-glass .sidebar-menu > li > a {
                    margin-bottom: 6px;
                    padding: 12px 14px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #c7d4e5 !important;
                    font-weight: 600;
                    background: transparent !important;
                    border: 1px solid transparent;
                    transition: all 0.18s ease;
                }

                body.admin-glass .sidebar-menu > li > a > i {
                    width: 18px;
                    height: 18px;
                    color: #91a6c3;
                    flex-shrink: 0;
                }

                body.admin-glass .sidebar-menu > li > a:hover,
                body.admin-glass .sidebar-menu > li.active > a {
                    color: #ffffff !important;
                    background: rgba(30, 41, 59, 0.72) !important;
                    border-color: rgba(148, 163, 184, 0.12);
                    box-shadow: 0 12px 24px rgba(2, 6, 23, 0.22);
                }

                body.admin-glass .sidebar-menu > li.active > a > i,
                body.admin-glass .sidebar-menu > li > a:hover > i {
                    color: #dceafe;
                }

                body.admin-glass .content-wrapper,
                body.admin-glass .main-footer {
                    margin-left: 270px;
                    background: transparent !important;
                }

                body.admin-glass .content-wrapper {
                    min-height: calc(100vh - 64px) !important;
                    padding: 18px 18px 28px;
                }

                body.admin-glass .content-header,
                body.admin-glass .content {
                    max-width: 1460px;
                    margin: 0 auto;
                    padding: 0;
                }

                body.admin-glass .content-header {
                    margin-bottom: 18px;
                }

                body.admin-glass .content {
                    position: relative;
                }

                body.admin-glass .box,
                body.admin-glass .small-box,
                body.admin-glass .info-box,
                body.admin-glass .nav-tabs-custom,
                body.admin-glass .callout,
                body.admin-glass .alert {
                    border: 1px solid rgba(148, 163, 184, 0.1) !important;
                    border-radius: 12px !important;
                    background: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(2, 6, 23, 0.94)) !important;
                    box-shadow: 0 16px 34px rgba(2, 6, 23, 0.22) !important;
                    backdrop-filter: blur(10px);
                    color: #dfe8f6 !important;
                }

                body.admin-glass .box-header,
                body.admin-glass .nav-tabs-custom > .nav-tabs,
                body.admin-glass .box-footer {
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1) !important;
                    background: transparent !important;
                }

                body.admin-glass .box-header {
                    padding: 18px 22px 16px !important;
                }

                body.admin-glass .box-body {
                    padding: 20px 22px 22px !important;
                }

                body.admin-glass .box-footer {
                    padding: 16px 22px 20px !important;
                    border-top: 1px solid rgba(148, 163, 184, 0.08) !important;
                    border-bottom: 0 !important;
                }

                body.admin-glass .box-title,
                body.admin-glass .nav-tabs-custom > .nav-tabs > li > a,
                body.admin-glass h1,
                body.admin-glass h2,
                body.admin-glass h3,
                body.admin-glass h4 {
                    color: #f8fafc !important;
                }

                body.admin-glass .text-muted,
                body.admin-glass .help-block,
                body.admin-glass small {
                    color: #8fa1bb !important;
                }

                body.admin-glass .btn {
                    border-radius: 6px !important;
                    min-height: 40px;
                    padding: 9px 14px;
                    border: 1px solid rgba(148, 163, 184, 0.16);
                    background: rgba(15, 23, 42, 0.78);
                    color: #e7eef8 !important;
                    box-shadow: 0 8px 18px rgba(2, 6, 23, 0.1);
                    font-weight: 600;
                    line-height: 1.2;
                    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
                }

                body.admin-glass .btn:hover,
                body.admin-glass .btn:focus {
                    transform: translateY(-1px);
                    border-color: rgba(148, 163, 184, 0.24);
                    background: rgba(22, 32, 56, 0.9);
                    box-shadow: 0 10px 20px rgba(2, 6, 23, 0.12);
                }

                body.admin-glass .btn-primary {
                    background: #1d4ed8 !important;
                    border-color: rgba(191, 219, 254, 0.3) !important;
                    color: #fff !important;
                    box-shadow: 0 10px 20px rgba(29, 78, 216, 0.18);
                }

                body.admin-glass .btn-success {
                    background: #16a34a !important;
                    border-color: #16a34a !important;
                    color: #fff !important;
                    box-shadow: 0 10px 20px rgba(22, 163, 74, 0.16);
                }

                body.admin-glass .btn-warning {
                    background: #d97706 !important;
                    border-color: #d97706 !important;
                    color: #fff !important;
                    box-shadow: 0 10px 20px rgba(217, 119, 6, 0.16);
                }

                body.admin-glass .btn-info {
                    background: #0891b2 !important;
                    border-color: #0891b2 !important;
                    color: #fff !important;
                    box-shadow: 0 10px 20px rgba(8, 145, 178, 0.16);
                }

                body.admin-glass .btn-danger {
                    background: #dc2626 !important;
                    border-color: #dc2626 !important;
                    color: #fff !important;
                    box-shadow: 0 10px 20px rgba(220, 38, 38, 0.16);
                }

                body.admin-glass .btn-default,
                body.admin-glass .btn-link {
                    color: var(--admin-gray-100) !important;
                }

                body.admin-glass .btn-sm {
                    min-height: 34px;
                    padding: 7px 12px;
                    font-size: 12px;
                    border-radius: 6px !important;
                }

                body.admin-glass .btn-xs {
                    min-height: 28px;
                    padding: 5px 10px;
                    border-radius: 4px !important;
                    font-size: 11px;
                }

                body.admin-glass .btn-group .btn {
                    border-radius: 0 !important;
                    margin-right: 8px;
                }

                body.admin-glass .btn-group .btn:last-child {
                    margin-right: 0;
                }

                body.admin-glass .btn-group .btn.active,
                body.admin-glass .btn-group .btn:active,
                body.admin-glass .btn-group .open > .dropdown-toggle.btn {
                    background: rgba(51, 65, 85, 0.96) !important;
                    border-color: rgba(148, 163, 184, 0.28) !important;
                    box-shadow: 0 12px 26px rgba(2, 6, 23, 0.18) !important;
                }

                body.admin-glass .form-control,
                body.admin-glass .select2-container--default .select2-selection--single,
                body.admin-glass .select2-container--default .select2-selection--multiple {
                    height: auto;
                    min-height: 42px;
                    border-radius: 6px !important;
                    border: 1px solid rgba(148, 163, 184, 0.12) !important;
                    background: rgba(15, 23, 42, 0.9) !important;
                    color: var(--admin-gray-100) !important;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
                    padding: 10px 12px;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                }

                body.admin-glass .form-control::placeholder,
                body.admin-glass input::placeholder,
                body.admin-glass textarea::placeholder {
                    color: #6e84a3 !important;
                }

                body.admin-glass textarea.form-control {
                    min-height: 140px;
                    line-height: 1.6;
                }

                body.admin-glass .form-control:focus,
                body.admin-glass .select2-container--default.select2-container--focus .select2-selection--multiple,
                body.admin-glass .select2-container--default.select2-container--open .select2-selection--single {
                    border-color: rgba(148, 163, 184, 0.32) !important;
                    background: rgba(15, 23, 42, 0.96) !important;
                    box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.12) !important;
                }

                body.admin-glass .form-group label,
                body.admin-glass .control-label {
                    color: var(--admin-gray-100) !important;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }

                body.admin-glass .input-group-addon {
                    border-radius: 6px !important;
                    border: 1px solid rgba(148, 163, 184, 0.12) !important;
                    background: rgba(30, 41, 59, 0.9) !important;
                    color: var(--admin-gray-300) !important;
                }

                body.admin-glass .panel,
                body.admin-glass .panel-default,
                body.admin-glass .panel-heading,
                body.admin-glass .panel-body,
                body.admin-glass .panel-footer,
                body.admin-glass .well {
                    border-color: rgba(148, 163, 184, 0.1) !important;
                    background: linear-gradient(180deg, rgba(15, 23, 42, 0.72), rgba(8, 13, 24, 0.76)) !important;
                    color: #dfe8f6 !important;
                    box-shadow: none !important;
                }

                body.admin-glass .panel,
                body.admin-glass .well {
                    border-radius: 10px !important;
                }

                body.admin-glass .panel-heading,
                body.admin-glass .panel-footer {
                    background: rgba(255, 255, 255, 0.02) !important;
                }

                body.admin-glass .box.box-primary,
                body.admin-glass .box.box-success,
                body.admin-glass .box.box-warning,
                body.admin-glass .box.box-danger,
                body.admin-glass .box.box-info {
                    border-top: 1px solid rgba(148, 163, 184, 0.1) !important;
                }

                body.admin-glass .box.box-primary {
                    box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.14), 0 16px 34px rgba(2, 6, 23, 0.22) !important;
                }

                body.admin-glass .box.box-success {
                    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--admin-success) 24%, transparent), 0 16px 34px rgba(2, 6, 23, 0.22) !important;
                }

                body.admin-glass .box.box-warning {
                    box-shadow: inset 0 1px 0 rgba(245, 158, 11, 0.2), 0 16px 34px rgba(2, 6, 23, 0.22) !important;
                }

                body.admin-glass .box.box-danger {
                    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--admin-danger) 24%, transparent), 0 16px 34px rgba(2, 6, 23, 0.22) !important;
                }

                body.admin-glass .box.box-info {
                    box-shadow: inset 0 1px 0 rgba(59, 130, 246, 0.22), 0 16px 34px rgba(2, 6, 23, 0.22) !important;
                }

                body.admin-glass .nav-tabs-custom > .nav-tabs > li > a {
                    border-radius: 6px;
                    margin: 10px 8px 10px 0;
                    padding: 10px 14px;
                    color: var(--admin-gray-300) !important;
                    border: 1px solid transparent !important;
                }

                body.admin-glass .nav-tabs-custom > .nav-tabs > li.active > a,
                body.admin-glass .nav-tabs-custom > .nav-tabs > li > a:hover {
                    background: rgba(30, 41, 59, 0.7) !important;
                    color: var(--admin-gray-50) !important;
                    border: 1px solid rgba(148, 163, 184, 0.12) !important;
                }

                body.admin-glass .nav-tabs-custom > .tab-content {
                    background: transparent !important;
                }

                body.admin-glass table,
                body.admin-glass .table,
                body.admin-glass .table-bordered {
                    color: #dbe7f6 !important;
                    border-color: rgba(148, 163, 184, 0.08) !important;
                }

                body.admin-glass .table > thead > tr > th,
                body.admin-glass .table > tbody > tr > td {
                    border-color: rgba(148, 163, 184, 0.08) !important;
                    background: transparent !important;
                }

                body.admin-glass .table > tbody > tr:hover > td {
                    background: rgba(30, 41, 59, 0.66) !important;
                }

                body.admin-glass .box-tools {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                body.admin-glass .box-tools .btn {
                    margin-left: 0 !important;
                }

                body.admin-glass .box-tools.search01,
                body.admin-glass .search01 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                body.admin-glass .search01 .form-control,
                body.admin-glass .box-tools.search01 .form-control,
                body.admin-glass .box-tools .form-control {
                    min-width: 220px;
                }

                body.admin-glass .label {
                    border-radius: 4px;
                    padding: 5px 9px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                body.admin-glass .alert-success,
                body.admin-glass .callout.callout-success {
                    background: rgba(34, 197, 94, 0.1) !important;
                    border-color: rgba(34, 197, 94, 0.18) !important;
                    color: #b9f5cf !important;
                }

                body.admin-glass .alert-info,
                body.admin-glass .callout.callout-info {
                    background: rgba(59, 130, 246, 0.1) !important;
                    border-color: rgba(59, 130, 246, 0.16) !important;
                    color: #cfe5ff !important;
                }

                body.admin-glass .alert-warning,
                body.admin-glass .callout.callout-warning {
                    background: rgba(245, 158, 11, 0.12) !important;
                    border-color: rgba(245, 158, 11, 0.18) !important;
                    color: #ffe2a4 !important;
                }

                body.admin-glass .alert-danger,
                body.admin-glass .callout.callout-danger {
                    background: rgba(239, 68, 68, 0.11) !important;
                    border-color: rgba(239, 68, 68, 0.18) !important;
                    color: #fecaca !important;
                }

                body.admin-glass .pagination > li > a,
                body.admin-glass .pagination > li > span {
                    margin-right: 8px;
                    border-radius: 4px !important;
                    border: 1px solid rgba(148, 163, 184, 0.1) !important;
                    background: rgba(255, 255, 255, 0.03) !important;
                    color: #dbe7f6 !important;
                }

                body.admin-glass .pagination > .active > a,
                body.admin-glass .pagination > .active > span,
                body.admin-glass .pagination > li > a:hover,
                body.admin-glass .pagination > li > span:hover {
                    background: rgba(51, 65, 85, 0.9) !important;
                    border-color: rgba(148, 163, 184, 0.22) !important;
                    color: #ffffff !important;
                }

                body.admin-glass .modal-content {
                    border-radius: 8px !important;
                    border: 1px solid rgba(148, 163, 184, 0.12) !important;
                    background: linear-gradient(180deg, rgba(15, 21, 33, 0.98), rgba(9, 13, 22, 0.99)) !important;
                    box-shadow: 0 18px 38px rgba(2, 6, 23, 0.28) !important;
                    color: #dfe8f6 !important;
                    overflow: hidden;
                }

                body.admin-glass .modal-header,
                body.admin-glass .modal-footer {
                    border-color: rgba(148, 163, 184, 0.1) !important;
                    background: rgba(255, 255, 255, 0.015) !important;
                }

                body.admin-glass .modal-body {
                    padding: 18px 20px !important;
                }

                body.admin-glass .modal-dialog {
                    margin-top: 72px;
                }

                body.admin-glass .modal-backdrop.in {
                    opacity: 0.82;
                }

                body.admin-glass .modal-title {
                    color: #f8fafc !important;
                    font-weight: 700;
                }

                body.admin-glass .close {
                    color: #cbd5e1 !important;
                    opacity: 0.85;
                    text-shadow: none !important;
                }

                body.admin-glass .select2-dropdown {
                    border-radius: 6px !important;
                    border: 1px solid rgba(148, 163, 184, 0.12) !important;
                    background: linear-gradient(180deg, rgba(16, 23, 36, 0.98), rgba(8, 13, 24, 0.99)) !important;
                    box-shadow: 0 20px 34px rgba(2, 6, 23, 0.28) !important;
                    overflow: hidden;
                }

                body.admin-glass .select2-search--dropdown .select2-search__field {
                    border-radius: 4px !important;
                    border: 1px solid rgba(148, 163, 184, 0.12) !important;
                    background: rgba(255, 255, 255, 0.03) !important;
                    color: #dfe8f6 !important;
                }

                body.admin-glass .select2-results__option {
                    color: #dfe8f6 !important;
                    padding: 10px 14px;
                }

                body.admin-glass .select2-results__option--highlighted[aria-selected],
                body.admin-glass .select2-results__option[aria-selected=true] {
                    background: rgba(51, 65, 85, 0.88) !important;
                    color: #ffffff !important;
                }

                body.admin-glass .checkbox,
                body.admin-glass .radio {
                    color: #dfe8f6 !important;
                }

                body.admin-glass .checkbox-inline,
                body.admin-glass .radio-inline,
                body.admin-glass .checkbox label,
                body.admin-glass .radio label {
                    color: #dfe8f6 !important;
                    font-weight: 500;
                }

                body.admin-glass input[type='checkbox'],
                body.admin-glass input[type='radio'] {
                    accent-color: #1d4ed8;
                }

                body.admin-glass .small-box,
                body.admin-glass .info-box {
                    overflow: hidden;
                }

                body.admin-glass .small-box > .inner,
                body.admin-glass .info-box-content {
                    position: relative;
                    z-index: 1;
                }

                body.admin-glass .small-box .icon,
                body.admin-glass .info-box-icon {
                    color: rgba(255, 255, 255, 0.14) !important;
                }

                body.admin-glass .small-box-footer {
                    border-top: 1px solid rgba(148, 163, 184, 0.08);
                    background: rgba(255, 255, 255, 0.02) !important;
                    color: #dfe8f6 !important;
                }

                body.admin-glass .table-responsive {
                    border: 0 !important;
                }

                body.admin-glass .table > thead > tr > th {
                    color: #90a6c2 !important;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                body.admin-glass .table > tbody > tr > td {
                    vertical-align: middle;
                }

                body.admin-glass .swal-modal {
                    border-radius: 8px;
                    border: 1px solid rgba(148, 163, 184, 0.12);
                    background: linear-gradient(180deg, rgba(16, 23, 36, 0.96), rgba(8, 13, 24, 0.98));
                    box-shadow: 0 18px 38px rgba(2, 6, 23, 0.28);
                }

                body.admin-glass .swal-title,
                body.admin-glass .swal-text {
                    color: #dfe8f6;
                }

                body.admin-glass .swal-button {
                    border-radius: 4px;
                    background: #1d4ed8;
                    border: 1px solid rgba(191, 219, 254, 0.32);
                }

                body.admin-glass .breadcrumb {
                    background: transparent !important;
                    padding: 0;
                    margin-top: 8px;
                    color: var(--admin-gray-400);
                }

                body.admin-glass .breadcrumb > .active,
                body.admin-glass .breadcrumb a {
                    color: var(--admin-gray-300) !important;
                }

                body.admin-glass .content-header > h1 {
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }

                body.admin-glass .content-header > h1 > small {
                    display: block;
                    margin-top: 6px;
                    color: var(--admin-gray-300) !important;
                    font-size: 13px;
                    font-weight: 500;
                }

                body.admin-glass .main-footer {
                    padding: 14px 24px 24px;
                    color: #8ea1ba;
                    border-top: 1px solid rgba(148, 163, 184, 0.08);
                    background: transparent !important;
                }

                .admin-terminal {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                    margin-bottom: 22px;
                }

                .admin-terminal-title {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .admin-terminal-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    border: 1px solid rgba(148, 163, 184, 0.16);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(15, 23, 42, 0.24));
                    color: #d9e4ff;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    box-shadow: 0 18px 35px rgba(2, 6, 23, 0.18);
                }

                .admin-terminal-title h2 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }

                .admin-terminal-title span {
                    display: block;
                    margin-top: 4px;
                    font-size: 12px;
                    color: #8fa2bc;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .admin-action-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .admin-hero {
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(148, 163, 184, 0.12);
                    border-radius: 12px;
                    padding: 30px 30px 28px;
                    background: linear-gradient(160deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95));
                    box-shadow: 0 18px 36px rgba(2, 6, 23, 0.22);
                    margin-bottom: 24px;
                }

                .admin-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 50%);
                    pointer-events: none;
                }

                .admin-hero h1 {
                    margin: 12px 0 0;
                    font-size: 38px;
                    line-height: 1.02;
                    letter-spacing: -0.04em;
                }

                .admin-hero p {
                    margin-top: 10px;
                    max-width: 680px;
                    color: #96a7bf;
                    font-size: 15px;
                }

                .admin-status-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 12px;
                    border-radius: 4px;
                    border: 1px solid rgba(148, 163, 184, 0.16);
                    background: rgba(255, 255, 255, 0.03);
                    color: #cdd8ea;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .admin-hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .admin-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
                    gap: 14px;
                    margin-bottom: 24px;
                }

                .admin-stat-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 10px;
                    border: 1px solid rgba(148, 163, 184, 0.12);
                    background: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(2, 6, 23, 0.94));
                    padding: 18px;
                    min-height: 122px;
                }

                .admin-stat-card::after {
                    display: none;
                }

                .admin-stat-card h3 {
                    margin: 0 0 12px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #7f93ae;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }

                .admin-stat-card p {
                    margin: 0;
                    font-size: 32px;
                    line-height: 1;
                    font-weight: 700;
                    color: #f8fafc;
                }

                .admin-stat-card span {
                    display: block;
                    margin-top: 8px;
                    color: #8ba0bb;
                    font-size: 12px;
                }

                .admin-panel {
                    height: 100%;
                    padding: 22px;
                }

                .admin-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    margin-bottom: 18px;
                }

                .admin-panel-copy {
                    color: #90a3bd;
                    font-size: 13px;
                    line-height: 1.65;
                }

                .admin-health-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px;
                    margin-top: 18px;
                }

                .admin-health-item {
                    padding: 14px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(148, 163, 184, 0.08);
                    background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.9));
                }

                .admin-health-item strong,
                .admin-health-item span {
                    display: block;
                }

                .admin-health-item strong {
                    font-size: 13px;
                    color: #f8fafc;
                }

                .admin-health-item span {
                    margin-top: 4px;
                    color: #89a0ba;
                    font-size: 12px;
                }

                .admin-status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 4px;
                    background: rgba(34, 197, 94, 0.12);
                    border: 1px solid rgba(34, 197, 94, 0.18);
                    color: #b5f4c7;
                    font-weight: 600;
                    font-size: 12px;
                }

                .admin-link-row {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 18px;
                }

                .admin-link-row .btn {
                    min-width: 140px;
                    justify-content: center;
                }

                @media (max-width: 991px) {
                    body.admin-glass .main-header .logo {
                        width: auto;
                    }

                    body.admin-glass .main-header .navbar,
                    body.admin-glass .content-wrapper,
                    body.admin-glass .main-footer {
                        margin-left: 0;
                    }

                    body.admin-glass .main-sidebar {
                        padding-top: 8px;
                    }

                    body.admin-glass .sidebar {
                        padding-top: 8px;
                    }

                    .admin-terminal {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .admin-hero h1 {
                        font-size: 31px;
                    }

                    .admin-health-grid {
                        grid-template-columns: 1fr;
                    }
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
                    @if($adminLogo !== '')
                        <img src="{{ $adminLogo }}" alt="{{ config('app.name', 'Pterodactyl') }} logo" class="admin-brand-logo">
                    @else
                        <img src="/favicons/android-chrome-192x192.png" alt="{{ config('app.name', 'Pterodactyl') }} logo" class="admin-brand-logo">
                    @endif
                </a>
                <nav class="navbar navbar-static-top">
                    <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </a>
                    <div class="navbar-custom-menu">
                        <ul class="nav navbar-nav admin-top-actions">
                            <li class="admin-top-icon">
                                <a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom" title="Exit Admin Control">
                                    <i class="fa fa-server"></i>
                                </a>
                            </li>
                            <li class="admin-top-icon">
                                <a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom" title="Logout">
                                    <i class="fa fa-sign-out"></i>
                                </a>
                            </li>
                            <li class="user-menu">
                                <a href="{{ route('account') }}" class="admin-user-link">
                                    <div class="user-image">
                                        {{ substr(Auth::user()->name_first, 0, 1) }}{{ substr(Auth::user()->name_last, 0, 1) }}
                                    </div>
                                    <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
                                </a>
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

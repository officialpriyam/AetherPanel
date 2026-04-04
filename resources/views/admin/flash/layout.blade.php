@extends('layouts.flash', ['navbar' => 'layout', 'sideEditor' => false])

@section('title')
    Flash Layout
@endsection

@section('content')

    <form action="{{ route('admin.flash.layout') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Dashboard Layout</p>
                <span class="description-text">Configure the main navigation layout for your panel.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Dashboard Navigation style</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose the layout style for the dashboard</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="flash:dashboardLayout" value="1" id="dash-layout-1" {{ $dashboardLayout == 1 ? "checked" : "" }}>
                            <label for="dash-layout-1">
                                <div class="layout-preview" style="flex-direction:row;">
                                    <div class="lp-sidebar" style="flex:0 0 24px;display:flex;flex-direction:column;gap:4px;padding:4px;">
                                        <div class="lp-icon-dot" style="width:100%;height:4px;background:var(--gray400);"></div>
                                        <div class="lp-icon-dot" style="width:100%;height:4px;background:var(--gray400);"></div>
                                        <div class="lp-icon-dot" style="width:100%;height:4px;background:var(--gray400);"></div>
                                    </div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Sidebar</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:dashboardLayout" value="2" id="dash-layout-2" {{ $dashboardLayout == 2 ? "checked" : "" }}>
                            <label for="dash-layout-2">
                                <div class="layout-preview" style="flex-direction:row;">
                                    <div style="display:flex;flex-direction:column;gap:4px;flex:0 0 18px;">
                                        <div class="lp-icon-dot"></div>
                                        <div class="lp-icon-dot"></div>
                                        <div class="lp-icon-dot"></div>
                                    </div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Icons</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server Navigation style</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose the layout style for server views</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="flash:layout" value="1" id="layout-1" {{ $layout == 1 ? "checked" : "" }}>
                            <label for="layout-1">
                                <div class="layout-preview" style="flex-direction:row;">
                                    <div class="lp-sidebar" style="flex:0 0 24px;display:flex;flex-direction:column;gap:4px;padding:4px;">
                                        <div class="lp-icon-dot" style="width:100%;height:4px;background:var(--gray400);"></div>
                                        <div class="lp-icon-dot" style="width:100%;height:4px;background:var(--gray400);"></div>
                                        <div class="lp-icon-dot" style="width:100%;height:4px;background:var(--gray400);"></div>
                                    </div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Sidebar</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:layout" value="4" id="layout-4" {{ $layout == 4 ? "checked" : "" }}>
                            <label for="layout-4">
                                <div class="layout-preview" style="flex-direction:row;">
                                    <div style="display:flex;flex-direction:column;gap:4px;flex:0 0 18px;">
                                        <div class="lp-icon-dot"></div>
                                        <div class="lp-icon-dot"></div>
                                        <div class="lp-icon-dot"></div>
                                    </div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Icons</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:layout" value="5" id="layout-5" {{ $layout == 5 ? "checked" : "" }}>
                            <label for="layout-5">
                                <div class="layout-preview">
                                    <div class="lp-topbar"></div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Floating Top</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:layout" value="6" id="layout-6" {{ $layout == 6 ? "checked" : "" }}>
                            <label for="layout-6">
                                <div class="layout-preview">
                                    <div class="lp-console" style="flex:1;"></div>
                                    <div class="lp-topbar"></div>
                                </div>
                                <span class="label-text">Floating Bottom</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Search component</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose between a server select bar or a search bar</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:searchComponent" value="{{ old('flash:searchComponent', $searchComponent) }}">
                            <option value="1">Server select bar</option>
                            <option value="2" @if(old('flash:searchComponent', $searchComponent) == '2') selected @endif>Searchbar</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="header" style="margin-top:50px;">
                <p>Login Screen</p>
                <span class="description-text">Customize the appearance of your authentication pages.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Login layout</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose the login screen appearance</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="flash:loginLayout" value="1" id="loginLayout-1" {{ $loginLayout == 1 ? "checked" : "" }}>
                            <label for="loginLayout-1">
                                <div class="layout-preview" style="align-items:center;justify-content:center;">
                                    <div style="width:60%;display:flex;flex-direction:column;gap:3px;align-items:center;">
                                        <div class="lp-row" style="height:6px;width:40%;"></div>
                                        <div class="lp-row" style="height:8px;"></div>
                                        <div class="lp-row" style="height:8px;"></div>
                                        <div class="lp-header" style="height:8px;width:50%;margin:0;opacity:1;"></div>
                                    </div>
                                </div>
                                <span class="label-text">Standard</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Social buttons position</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Where to place social buttons on the login screen</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:socialPosition" value="{{ old('flash:socialPosition', $socialPosition) }}">
                            <option value="1">Above form</option>
                            <option value="2" @if(old('flash:socialPosition', $socialPosition) == '2') selected @endif>Under form</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Logo position</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Where to place the logo on the login screen</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:logoPosition" value="{{ old('flash:logoPosition', $logoPosition) }}">
                            <option value="1">Above form</option>
                            <option value="2" @if(old('flash:logoPosition', $logoPosition) == '2') selected @endif>Top corner</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="save-bar-inline">
                {!! csrf_field() !!}
                <button type="submit" class="button button-primary">Save changes</button>
            </div>
        </div>
    </form>
@endsection

@extends('layouts.flash', ['navbar' => 'components', 'sideEditor' => false])

@section('title')
    flash Layout
@endsection

@section('content')

    <form action="{{ route('admin.flash.components') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Components dashboard</p>
                <span class="description-text">Manage all components of the server list page.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Server row style</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose between different server row styles</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="flash:serverRow" value="1" id="serverRow-1" {{ $serverRow == 1 ? "checked" : "" }}>
                            <label for="serverRow-1">
                                <div class="layout-preview">
                                    <div class="lp-row"></div>
                                    <div class="lp-row"></div>
                                    <div class="lp-row"></div>
                                </div>
                                <span class="label-text">List</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:serverRow" value="2" id="serverRow-2" {{ $serverRow == 2 ? "checked" : "" }}>
                            <label for="serverRow-2">
                                <div class="layout-preview" style="flex-direction:row;flex-wrap:wrap;">
                                    <div class="lp-gridcard"></div>
                                    <div class="lp-gridcard"></div>
                                    <div class="lp-gridcard"></div>
                                    <div class="lp-gridcard"></div>
                                </div>
                                <span class="label-text">Grid</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:serverRow" value="3" id="serverRow-3" {{ $serverRow == 3 ? "checked" : "" }}>
                            <label for="serverRow-3">
                                <div class="layout-preview">
                                    <div class="lp-row" style="height:10px;"></div>
                                    <div class="lp-row" style="height:10px;"></div>
                                    <div class="lp-row" style="height:10px;"></div>
                                    <div class="lp-row" style="height:10px;"></div>
                                </div>
                                <span class="label-text">Compact</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Social buttons</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable social buttons on homepage</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:socialButtons" value="{{ old('flash:socialButtons', $socialButtons) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:socialButtons', $socialButtons) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Discord join box</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable discord box on homepage</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:discordBox" value="{{ old('flash:discordBox', $discordBox) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:discordBox', $discordBox) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="header" style="margin-top:50px;">
                <p>Console Style</p>
                <span class="description-text">Choose the server console page layout and stats display style.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Stats cards</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose where to display server statistics and power controls.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="flash:statsCards" value="1" id="statsCards-1" {{ $statsCards == 1 ? "checked" : "" }}>
                            <label for="statsCards-1">
                                <div class="layout-preview">
                                    <div class="lp-console" style="height:100%;"></div>
                                </div>
                                <span class="label-text">Default</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:statsCards" value="2" id="statsCards-2" {{ $statsCards == 2 ? "checked" : "" }}>
                            <label for="statsCards-2">
                                <div class="layout-preview">
                                    <div style="display:flex;gap:3px;margin-bottom:4px;">
                                        <div class="lp-card"></div>
                                        <div class="lp-card"></div>
                                        <div class="lp-card"></div>
                                        <div class="lp-card"></div>
                                    </div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Stats Top</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:statsCards" value="3" id="statsCards-3" {{ $statsCards == 3 ? "checked" : "" }}>
                            <label for="statsCards-3">
                                <div class="layout-preview" style="flex-direction:row;">
                                    <div class="lp-console" style="flex:2;"></div>
                                    <div class="lp-sidebar"></div>
                                </div>
                                <span class="label-text">Stats Side</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:statsCards" value="4" id="statsCards-4" {{ $statsCards == 4 ? "checked" : "" }}>
                            <label for="statsCards-4">
                                <div class="layout-preview">
                                    <div class="lp-header"></div>
                                    <div style="display:flex;gap:3px;flex:1;">
                                        <div class="lp-console" style="flex:2;"></div>
                                        <div class="lp-sidebar"></div>
                                    </div>
                                    <div style="display:flex;gap:3px;margin-top:4px;">
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                    </div>
                                </div>
                                <span class="label-text">Modern</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Graphs</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose where to display the resource usage graphs.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options input-rows">
                        <div>
                            <input type="radio" name="flash:graphs" value="1" id="graphs-1" {{ $graphs == 1 ? "checked" : "" }}>
                            <label for="graphs-1">
                                <div class="layout-preview">
                                    <div class="lp-console" style="height:100%;"></div>
                                </div>
                                <span class="label-text">None</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:graphs" value="2" id="graphs-2" {{ $graphs == 2 ? "checked" : "" }}>
                            <label for="graphs-2">
                                <div class="layout-preview">
                                    <div style="display:flex;gap:3px;margin-bottom:4px;">
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                    </div>
                                    <div class="lp-console" style="flex:1;"></div>
                                </div>
                                <span class="label-text">Above Console</span>
                            </label>
                        </div>
                        <div>
                            <input type="radio" name="flash:graphs" value="3" id="graphs-3" {{ $graphs == 3 ? "checked" : "" }}>
                            <label for="graphs-3">
                                <div class="layout-preview">
                                    <div class="lp-console" style="flex:1;"></div>
                                    <div style="display:flex;gap:3px;margin-top:4px;">
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                        <div class="lp-graph"></div>
                                    </div>
                                </div>
                                <span class="label-text">Below Console</span>
                            </label>
                        </div>
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

@extends('layouts.flash', ['navbar' => 'styling', 'sideEditor' => false])

@section('title')
    flash Styling
@endsection

@section('content')

    <form action="{{ route('admin.flash.styling') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>Styling settings</p>
                <span class="description-text">Customize the general appears of flash Theme.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Page titles</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable page titles</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:pageTitle" value="{{ old('flash:pageTitle', $pageTitle) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:pageTitle', $pageTitle) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Flash message</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose between different flash message styles</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options" style="display:flex;column-gap:5px">
                        <div style="width:100%;">
                            <input type="radio" name="flash:flashMessage" value="1" id="flashMessage-1" {{ $flashMessage == 1 ? "checked" : "" }}>
                            <label for="flashMessage-1">
                                Alert at right top corner
                            </label>
                        </div>
                        <div style="width:100%;">
                            <input type="radio" name="flash:flashMessage" value="2" id="flashMessage-2" {{ $flashMessage == 2 ? "checked" : "" }}>
                            <label for="flashMessage-2">
                                Alert at bottom center
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Background image</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Leave value empty to disable it</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:backgroundImage" value="{{ old('flash:backgroundImage', $backgroundImage) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Background blur</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Blur amount for the panel background</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:backgroundBlur" value="{{ old('flash:backgroundBlur', $backgroundBlur) }}" placeholder="0px, 6px, 12px" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Login background image</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Leave value empty to disable it</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:loginBackground" value="{{ old('flash:loginBackground', $loginBackground) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Login overlay gradient</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable a static gradient.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:loginGradient" value="{{ old('flash:loginGradient', $loginGradient) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:logoPosition', $loginGradient) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Backdrop blur</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable backdrop blur</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:backdrop" value="{{ old('flash:backdrop', $backdrop) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:backdrop', $backdrop) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Components opacity</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the components opacity.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:backdropPercentage" value="{{ old('flash:backdropPercentage', $backdropPercentage) }}" />
                    </div>
                </div>
            </div>
            <div class="header" style="margin-top:40px;">
                <p>Effects</p>
                <span class="description-text">Enable seasonal and ambient effects across the site.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Season effects</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Snow (winter) and falling leaves (autumn)</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field input-options" style="display:flex;column-gap:10px">
                        <div style="width:100%;">
                            <label style="margin-bottom:6px;display:block;">Winter snow</label>
                            <select name="flash:effects_snow" value="{{ old('flash:effects_snow', $effectsSnow) }}">
                                <option value="false">Disable</option>
                                <option value="true" @if(old('flash:effects_snow', $effectsSnow) == 'true') selected @endif>Enable</option>
                            </select>
                        </div>
                        <div style="width:100%;">
                            <label style="margin-bottom:6px;display:block;">Autumn leaves</label>
                            <select name="flash:effects_autumn" value="{{ old('flash:effects_autumn', $effectsAutumn) }}">
                                <option value="false">Disable</option>
                                <option value="true" @if(old('flash:effects_autumn', $effectsAutumn) == 'true') selected @endif>Enable</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Other effects</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Shooting stars across the sky</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:effects_stars" value="{{ old('flash:effects_stars', $effectsStars) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:effects_stars', $effectsStars) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Default color mode</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the default color mode</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:defaultMode" value="{{ old('flash:defaultMode', $defaultMode) }}">
                            <option value="lightmode">Lightmode</option>
                            <option value="darkmode" @if(old('flash:defaultMode', $defaultMode) == 'darkmode') selected @endif>Darkmode</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Input/Button border radius</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the input/button border radius.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:radiusInput" value="{{ old('flash:radiusInput', $radiusInput) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Box border radius</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Change the box border radius.</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:radiusBox" value="{{ old('flash:radiusBox', $radiusBox) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Input border</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable input border</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:borderInput" value="{{ old('flash:borderInput', $borderInput) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:borderInput', $borderInput) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>


        </div>
        <div class="floating-button-2">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection

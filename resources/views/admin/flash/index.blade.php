@extends('layouts.flash', ['navbar' => 'index', 'sideEditor' => true])

@section('title')
    flash Theme
@endsection

@section('content')
    <form action="{{ route('admin.flash') }}" method="POST">
        <div class="header">
            <p>General settings</p>
            <span class="description-text">Change the general settings of flash Theme.</span>
        </div>
        <div class="input-field hr">
            <label for="flash:logo">Panel logo</label>
            <input type="text" id="flash:logo" name="flash:logo" value="{{ old('flash:logo', $logo) }}" />
        </div>
        <div class="input-field hr">
            <label for="flash:logoHeight">Panel logo height</label>
            <input type="text" id="flash:logoHeight" name="flash:logoHeight" value="{{ old('flash:logoHeight', $logoHeight) }}" />
        </div>
        <div class="input-field hr">
            <label for="flash:fullLogo">Logo only</label>
            <select name="flash:fullLogo" value="{{ old('flash:fullLogo', $fullLogo) }}">
                <option value="false">Disable</option>
                <option value="true" @if(old('flash:fullLogo', $fullLogo) == 'true') selected @endif>Enable</option>
            </select>
            <small>Enable or disable the text next to the panel logo.</small>
        </div>

        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection

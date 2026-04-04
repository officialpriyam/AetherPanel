@extends('layouts.flash', ['navbar' => 'announcement', 'sideEditor' => true])

@section('title')
    flash Announcements
@endsection

@section('content')

    <form action="{{ route('admin.flash.announcement') }}" method="POST">
        <div class="header">
            <p>Announcement settings</p>
            <span class="description-text">Change the announcement settings of flash Theme.</span>
        </div>
        <div class="input-field">
            <label for="flash:announcementType">Select announcement type</label>
            <select name="flash:announcementType">
                <option value="disabled" @if(old('flash:announcementType', $announcementType) == 'disabled') selected @endif>Disabled</option>
                <option value="party" @if(old('flash:announcementType', $announcementType) == 'party') selected @endif>Party</option>
                <option value="update" @if(old('flash:announcementType', $announcementType) == 'update') selected @endif>Update</option>
                <option value="info" @if(old('flash:announcementType', $announcementType) == 'info') selected @endif>Info</option>
                <option value="success" @if(old('flash:announcementType', $announcementType) == 'success') selected @endif>Success</option>
                <option value="alert" @if(old('flash:announcementType', $announcementType) == 'alert') selected @endif>Alert</option>
                <option value="warning" @if(old('flash:announcementType', $announcementType) == 'warning') selected @endif>Warning</option>
            </select>
            <small>Set announcement type disabled to disable announcements.</small>
        </div>
        <div class="input-field">
            <label for="flash:announcementCloseable">Closable announcement</label>
            <select name="flash:announcementCloseable" value="{{ old('flash:announcementCloseable', $announcementCloseable) }}">
                <option value="true">Enable</option>
                <option value="false" @if(old('flash:announcementCloseable', $announcementCloseable) == 'false') selected @endif>Disable</option>
            </select>
        </div>
        <div class="input-field">
            <label for="flash:announcementMessage">Announcement message</label>
            <textarea type="text" id="flash:announcementMessage" name="flash:announcementMessage" width="100%" rows="5">{{ old('flash:announcementMessage', $announcementMessage) }}</textarea>
            <small>For styling use BBCode format.</small>
        </div>
        <div class="input-field">
            <label for="flash:announcementIcon">Announcement icon (HTML)</label>
            <input type="text" id="flash:announcementIcon" name="flash:announcementIcon" value="{{ old('flash:announcementIcon', $announcementIcon) }}" />
            <small>You can use FontAwesome or any HTML icon here. e.g. &lt;i class="fa-solid fa-bullhorn"&gt;&lt;/i&gt;</small>
        </div>
        <div class="input-field">
            <label for="flash:announcementTimeout">Auto-Dismiss timeout (seconds)</label>
            <input type="number" id="flash:announcementTimeout" name="flash:announcementTimeout" value="{{ old('flash:announcementTimeout', isset($announcementTimeout) ? $announcementTimeout : '0') }}" min="0" />
            <small>Set to 0 to disable auto-dismiss.</small>
        </div>
        <div class="floating-button">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection

@extends('layouts.flash', ['navbar' => 'social', 'sideEditor' => true])

@section('title')
    Flash Theme
@endsection

@section('content')
    <form action="{{ route('admin.flash.social') }}" method="POST">
        <div class="header">
            <p>Social Settings</p>
            <span class="description-text">Change the Social Links shown on the dashboard.</span>
        </div>
        <div class="input-field hr">
            <label for="flash:social_discord">Discord Link</label>
            <input type="text" id="flash:social_discord" name="flash:social_discord" value="{{ old('flash:social_discord', $social_discord) }}" placeholder="https://discord.gg/..." />
            <small>Link to your Discord server.</small>
        </div>
        <div class="input-field hr">
            <label for="flash:social_billing">Billing Link</label>
            <input type="text" id="flash:social_billing" name="flash:social_billing" value="{{ old('flash:social_billing', $social_billing) }}" placeholder="https://billing.example.com" />
            <small>Link to your Billing panel.</small>
        </div>
        <div class="input-field hr">
            <label for="flash:social_status">Status Link</label>
            <input type="text" id="flash:social_status" name="flash:social_status" value="{{ old('flash:social_status', $social_status) }}" placeholder="https://status.example.com" />
            <small>Link to your Status page.</small>
        </div>
        <div class="header">
            <p>Custom Social Link</p>
            <span class="description-text">Add a custom fourth link to your dashboard.</span>
        </div>
        <div class="input-field hr">
            <label for="flash:social_custom">Custom URL</label>
            <input type="text" id="flash:social_custom" name="flash:social_custom" value="{{ old('flash:social_custom', $social_custom) }}" placeholder="https://youtube.com/..." />
            <small>Leave blank to disable.</small>
        </div>
        <div class="input-field hr">
            <label for="flash:social_custom_icon">Custom Lucide Icon Name</label>
            <input type="text" id="flash:social_custom_icon" name="flash:social_custom_icon" value="{{ old('flash:social_custom_icon', $social_custom_icon) }}" placeholder="youtube, link, etc." />
            <small>Enter a Lucide icon name (e.g., globe, youtube, twitter) to show on the dashboard.</small>
        </div>
        {!! csrf_field() !!}
        <button type="submit" name="_method" value="POST" class="btn btn-sm btn-primary pull-right">Save</button>
    </form>
@endsection

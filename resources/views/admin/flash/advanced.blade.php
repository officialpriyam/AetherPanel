@extends('layouts.flash', ['navbar' => 'advanced', 'sideEditor' => false])

@section('title')
    Flash Advanced
@endsection

@section('content')
    <form action="{{ route('admin.flash.advanced') }}" method="POST">
        {{-- Advanced Settings --}}
        <div class="content-box">
            <div class="header">
                <p>Advanced Settings</p>
                <span class="description-text">Configure advanced Flash theme options.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Profile type</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Choose profile picture type</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:profileType" value="{{ old('flash:profileType', $profileType) }}">
                            <option value="boring">Boring Avatars</option>
                            <option value="avataaars" @if(old('flash:profileType', $profileType) == 'avataaars') selected @endif>Avataaars Neutral</option>
                            <option value="bottts" @if(old('flash:profileType', $profileType) == 'bottts') selected @endif>Bottts Neutral</option>
                            <option value="identicon" @if(old('flash:profileType', $profileType) == 'identicon') selected @endif>Identicon</option>
                            <option value="initials" @if(old('flash:profileType', $profileType) == 'initials') selected @endif>Initials</option>
                            <!-- Gravatar removed. fallback to default -->
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">IP Flag</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Show flags with your IP</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:ipFlag" value="{{ old('flash:ipFlag', $ipFlag) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:ipFlag', $ipFlag) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Low Resources Alert</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable low resources alert</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:lowResourcesAlert" value="{{ old('flash:lowResourcesAlert', $lowResourcesAlert) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:lowResourcesAlert', $lowResourcesAlert) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="border-top:1px solid var(--gray500);padding-top:20px;margin-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Knowledge Base URL</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Link shown on the dashboard</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:knowledge_base_url" value="{{ old('flash:knowledge_base_url', $knowledge_base_url) }}" placeholder="https://kb.example.com" />
                    </div>
                </div>
            </div>
        </div>

        {{-- Meta Data Settings --}}
        <div class="content-box" style="margin-top:30px;">
            <div class="header">
                <p>Meta Data</p>
                <span class="description-text">Configure SEO and embed metadata for your panel.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Favicon</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">URL to the panel favicon</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:meta_favicon" value="{{ old('flash:meta_favicon', $meta_favicon) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Meta title</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Title shown in browser tabs and embeds</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:meta_title" value="{{ old('flash:meta_title', $meta_title) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Meta image</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Image URL for social media embeds</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:meta_image" value="{{ old('flash:meta_image', $meta_image) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Meta description</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Description for social media embeds</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <textarea name="flash:meta_description" width="100%" rows="3">{{ old('flash:meta_description', $meta_description) }}</textarea>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Meta color</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Embed accent color</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="color" name="flash:meta_color" value="{{ old('flash:meta_color', $meta_color) }}" />
                    </div>
                </div>
            </div>
        </div>

        {{-- Mail Settings --}}
        <div class="content-box" style="margin-top:30px;">
            <div class="header">
                <p>Mail Template</p>
                <span class="description-text">Customize the appearance of outgoing email templates.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Mail primary color</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Set the mail primary color</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="color" name="flash:mail_color" value="{{ old('flash:mail_color', $mail_color) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Mail background color</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Set the mail background color</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="color" name="flash:mail_backgroundColor" value="{{ old('flash:mail_backgroundColor', $mail_backgroundColor) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Mail logo</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Set the mail logo URL</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_logo" value="{{ old('flash:mail_logo', $mail_logo) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Mail full logo</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Enable or disable mail full logo</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:mail_logoFull" value="{{ old('flash:mail_logoFull', $mail_logoFull) }}">
                            <option value="false">Disable</option>
                            <option value="true" @if(old('flash:mail_logoFull', $mail_logoFull) == 'true') selected @endif>Enable</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Mail color mode</p>
                    <span style="font-size:1.5rem;color:var(--gray300);">Set dark or light mode for mail</span>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <select name="flash:mail_mode" value="{{ old('flash:mail_mode', $mail_mode) }}">
                            <option value="dark">Dark mode</option>
                            <option value="light" @if(old('flash:mail_mode', $mail_mode) == 'light') selected @endif>Light mode</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {{-- Mail Socials --}}
        <div class="content-box" style="margin-top:30px;">
            <div class="header">
                <p>Mail Social Links</p>
                <span class="description-text">Configure social links shown in outgoing emails. Leave empty to hide.</span>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Discord</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_discord" value="{{ old('flash:mail_discord', $mail_discord) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Twitter</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_twitter" value="{{ old('flash:mail_twitter', $mail_twitter) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Facebook</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_facebook" value="{{ old('flash:mail_facebook', $mail_facebook) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Instagram</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_instagram" value="{{ old('flash:mail_instagram', $mail_instagram) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">LinkedIn</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_linkedin" value="{{ old('flash:mail_linkedin', $mail_linkedin) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">YouTube</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_youtube" value="{{ old('flash:mail_youtube', $mail_youtube) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Status page</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_status" value="{{ old('flash:mail_status', $mail_status) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="border-bottom:1px solid var(--gray500);padding-top:20px;padding-bottom:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Billing</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_billing" value="{{ old('flash:mail_billing', $mail_billing) }}" />
                    </div>
                </div>
            </div>
            <div class="row" style="padding-top:20px;">
                <div class="col-md-4">
                    <p style="margin:0;font-weight:550;">Support</p>
                </div>
                <div class="col-md-8">
                    <div class="input-field">
                        <input type="text" name="flash:mail_support" value="{{ old('flash:mail_support', $mail_support) }}" />
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

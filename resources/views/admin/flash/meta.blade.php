@extends('layouts.flash', ['navbar' => 'meta', 'sideEditor' => true])

@section('title')
    flash Meta data
@endsection

@section('content')

    <form action="{{ route('admin.flash.meta') }}" method="POST">
        <div class="content-box">
            <div class="header">
                <p>SEO Data settings</p>
                <span class="description-text">Change the SEO and meta data settings of Flash Theme.</span>
            </div>

            <div class="header" style="margin-top: 30px;">
                <p>Search Engine Indexing</p>
            </div>
            <div class="input-field hr">
                <label for="flash:search_indexing">Allow search engines like Google to index your site</label>
                <select name="flash:search_indexing" value="{{ old('flash:search_indexing', isset($search_indexing) ? $search_indexing : 'true') }}">
                    <option value="true">Enable</option>
                    <option value="false" @if(old('flash:search_indexing', isset($search_indexing) ? $search_indexing : 'true') == 'false') selected @endif>Disable</option>
                </select>
                <small>When disabled, adds a noindex tag to prevent search engines from indexing the panel.</small>
            </div>

            <div class="header" style="margin-top: 30px;">
                <p>Meta Tags</p>
            </div>
            <div class="input-field hr">
                <label for="flash:meta_title">Meta title</label>
                <input type="text" id="flash:meta_title" name="flash:meta_title" value="{{ old('flash:meta_title', $meta_title) }}" />
            </div>
            <div class="input-field hr">
                <label for="flash:meta_description">Meta description</label>
                <textarea type="text" id="flash:meta_description" name="flash:meta_description" width="100%" rows="5">{{ old('flash:meta_description', $meta_description) }}</textarea>
            </div>
            <div class="input-field hr">
                <label for="flash:meta_keywords">Meta tags & keywords</label>
                <input type="text" id="flash:meta_keywords" name="flash:meta_keywords" placeholder="pterodactyl, game, panel" value="{{ old('flash:meta_keywords', isset($meta_keywords) ? $meta_keywords : '') }}" />
            </div>

            <div class="header" style="margin-top: 30px;">
                <p>Favicon</p>
            </div>
            <div class="input-field hr">
                <label for="flash:meta_favicon">Favicon URL</label>
                <input type="text" id="flash:meta_favicon" name="flash:meta_favicon" value="{{ old('flash:meta_favicon', $meta_favicon) }}" />
                <small>Provide an image URL. Support formats: SVG, PNG, ICO.</small>
            </div>

            <div class="header" style="margin-top: 30px;">
                <p>Social Sharing</p>
            </div>
            <div class="input-field hr">
                <label for="flash:meta_image">OG Image URL</label>
                <input type="text" id="flash:meta_image" name="flash:meta_image" value="{{ old('flash:meta_image', $meta_image) }}" />
                <small>The cover image that appears when the site is shared (e.g. Discord, Twitter).</small>
            </div>
            <div class="input-field hr" style="border: none;">
                <label for="flash:meta_color">Meta Theme Color</label>
                <input type="color" id="flash:meta_color" name="flash:meta_color" value="{{ old('flash:meta_color', $meta_color) }}" />
            </div>
        </div>
        <div class="save-bar-inline">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>
@endsection

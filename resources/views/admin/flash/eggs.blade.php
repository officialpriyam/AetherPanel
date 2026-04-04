@extends('layouts.flash', ['navbar' => 'eggs', 'sideEditor' => false])

@section('title')
    Egg Banners
@endsection

@section('content')
    <form action="{{ route('admin.flash.eggs') }}" method="POST" enctype="multipart/form-data">
        <div class="header">
            <p>Egg Image Banners</p>
            <span class="description-text">Upload banner images for each game egg. These appear on server cards in the dashboard. Recommended: wide banners (1000×250px).</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:15px;margin-top:20px;">
            @foreach ($eggs as $egg)
            <div style="background-color:var(--gray700);border:1px solid var(--gray500);border-radius:10px;overflow:hidden;transition:.3s;">
                {{-- Banner Preview --}}
                <div style="width:100%;height:100px;background:var(--gray600);position:relative;overflow:hidden;">
                    @if ($egg->image)
                        <img src="{{ $egg->image }}" alt="{{ $egg->name }}" style="width:100%;height:100%;object-fit:cover;">
                    @else
                        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--gray400);font-size:1.3rem;">
                            <i data-lucide="image-off" style="width:24px;margin-right:8px;"></i> No banner set
                        </div>
                    @endif
                </div>

                {{-- Egg Info --}}
                <div style="padding:15px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="font-size:1.1rem;padding:2px 8px;background:var(--primary);color:#fff;border-radius:4px;font-weight:500;">{{ $egg->nest->name }}</span>
                    </div>
                    <p style="margin:6px 0 12px;font-size:1.5rem;font-weight:600;color:var(--gray100);">{{ $egg->name }}</p>

                    {{-- Upload --}}
                    <div style="margin-top:10px;">
                        <label style="display:block;margin-bottom:5px;font-size:1.1rem;color:var(--gray400);">Or image URL</label>
                        <input type="text" name="egg_url_{{ $egg->id }}" value="{{ $egg->image && !str_starts_with($egg->image, '/flash/eggs/') ? $egg->image : '' }}" placeholder="https://..." style="width:100%;padding:10px;background:var(--gray600);border:1px solid var(--gray500);border-radius:7px;color:var(--gray100);font-size:1.2rem;margin-bottom:10px;">
                        
                        <label for="egg_image_{{ $egg->id }}" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border:1px dashed var(--gray500);border-radius:7px;cursor:pointer;transition:.3s;color:var(--gray300);font-size:1.1rem;background:var(--gray600);">
                            <i data-lucide="upload" style="width:16px;"></i>
                            <span>Choose image...</span>
                        </label>
                        <input type="file" name="egg_image_{{ $egg->id }}" id="egg_image_{{ $egg->id }}" accept="image/*" style="display:none;" onchange="this.previousElementSibling.querySelector('span').textContent = this.files[0]?.name || 'Choose image...'">
                    </div>
                </div>
            </div>
            @endforeach
        </div>

        {!! csrf_field() !!}
        <div style="margin-top:20px;display:flex;justify-content:flex-end;">
            <button type="submit" name="_method" value="POST" class="button button-primary" style="padding:12px 24px;">
                <i data-lucide="save" style="width:16px;display:inline-block;vertical-align:middle;margin-right:6px;"></i> Save Banners
            </button>
        </div>
    </form>
@endsection

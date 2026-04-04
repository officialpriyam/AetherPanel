@extends('layouts.flash', ['navbar' => 'colors', 'sideEditor' => false])

@section('title')
    Flash Colors
@endsection

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="header">
                <p>Color settings</p>
                <span class="description-text">Utilize the flash theme color picker to apply your color scheme effortlessly, revert to the default color settings, toggle between various input types, and explore our website's color scheme generator. Don't forget to save your changes!</span>
                <br/><br />
                <button type="button" onclick="toggleInputType()" class="button button-primary">Toggle Input Type</button>
            </div>
        </div>
    </div>
    
    <form action="{{ route('admin.flash.colors') }}" method="POST">
        <!-- DARK MODE COLORS -->
        <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 20px;">Dark Mode Colors</h2>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Primary color</p>
                    <small class="color-margin">Primary is the main color of your brand</small>
                    <div class="input-field mt-3">
                        <label for="flash:primary">Premium color</label>
                        <div class="input-w-reset">
                            <input type="color" class="form-control" name="flash:primary" value="{{ old('flash:primary', $primary) }}" />
                            <button type="button" data-name="flash:primary" data-value="#2563eb">
                                <i data-lucide="rotate-ccw"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Success colors</p>
                    <small class="color-margin">These are the colors of the green buttons</small>
                    <div class="row mt-3">
                        <div class="col-md-4 input-field">
                            <label for="flash:successText">Success text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:successText" value="{{ old('flash:successText', $successText) }}" />
                                <button type="button" data-name="flash:successText" data-value="#e1ffd8"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:successBorder">Success border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:successBorder" value="{{ old('flash:successBorder', $successBorder) }}" />
                                <button type="button" data-name="flash:successBorder" data-value="#56aa2b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:successBackground">Success bg</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:successBackground" value="{{ old('flash:successBackground', $successBackground) }}" />
                                <button type="button" data-name="flash:successBackground" data-value="#3d8f1f"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Danger colors</p>
                    <small class="color-margin">These are the colors of the red buttons</small>
                    <div class="row mt-3">
                        <div class="col-md-4 input-field">
                            <label for="flash:dangerText">Danger text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:dangerText" value="{{ old('flash:dangerText', $dangerText) }}" />
                                <button type="button" data-name="flash:dangerText" data-value="#ffd8d8"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:dangerBorder">Danger border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:dangerBorder" value="{{ old('flash:dangerBorder', $dangerBorder) }}" />
                                <button type="button" data-name="flash:dangerBorder" data-value="#aa2a2a"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:dangerBackground">Danger bg</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:dangerBackground" value="{{ old('flash:dangerBackground', $dangerBackground) }}" />
                                <button type="button" data-name="flash:dangerBackground" data-value="#8f1f20"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Secondary colors</p>
                    <small class="color-margin">These are the colors of the gray buttons</small>
                    <div class="row mt-3">
                        <div class="col-md-4 input-field">
                            <label for="flash:secondaryText">Secondary text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:secondaryText" value="{{ old('flash:secondaryText', $secondaryText) }}" />
                                <button type="button" data-name="flash:secondaryText" data-value="#e2e8f0"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:secondaryBorder">Secondary border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:secondaryBorder" value="{{ old('flash:secondaryBorder', $secondaryBorder) }}" />
                                <button type="button" data-name="flash:secondaryBorder" data-value="#475569"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:secondaryBackground">Secondary bg</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:secondaryBackground" value="{{ old('flash:secondaryBackground', $secondaryBackground) }}" />
                                <button type="button" data-name="flash:secondaryBackground" data-value="#1e293b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-12 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Gray colors (Dark Mode)</p>
                    <small class="color-margin">These are the main structural colors of the panel</small>
                    <div class="row mt-3">
                        <div class="col-md-3 input-field">
                            <label for="flash:gray50">Gray 50</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray50" value="{{ old('flash:gray50', $gray50) }}" />
                                <button type="button" data-name="flash:gray50" data-value="#f8fafc"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Lightest text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray100">Gray 100</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray100" value="{{ old('flash:gray100', $gray100) }}" />
                                <button type="button" data-name="flash:gray100" data-value="#e2e8f0"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Light text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray200">Gray 200</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray200" value="{{ old('flash:gray200', $gray200) }}" />
                                <button type="button" data-name="flash:gray200" data-value="#cbd5e1"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Regular text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray300">Gray 300</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray300" value="{{ old('flash:gray300', $gray300) }}" />
                                <button type="button" data-name="flash:gray300" data-value="#94a3b8"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Sub text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray400">Gray 400</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray400" value="{{ old('flash:gray400', $gray400) }}" />
                                <button type="button" data-name="flash:gray400" data-value="#64748b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Small details</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray500">Gray 500</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray500" value="{{ old('flash:gray500', $gray500) }}" />
                                <button type="button" data-name="flash:gray500" data-value="#475569"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Border color</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray600">Gray 600</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray600" value="{{ old('flash:gray600', $gray600) }}" />
                                <button type="button" data-name="flash:gray600" data-value="#334155"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Input color</small>
                        </div> 
                        <div class="col-md-3 input-field">
                            <label for="flash:gray700">Gray 700</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray700" value="{{ old('flash:gray700', $gray700) }}" />
                                <button type="button" data-name="flash:gray700" data-value="#1e293b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Box color</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray800">Gray 800</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray800" value="{{ old('flash:gray800', $gray800) }}" />
                                <button type="button" data-name="flash:gray800" data-value="#0f172a"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Background color</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:gray900">Gray 900</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:gray900" value="{{ old('flash:gray900', $gray900) }}" />
                                <button type="button" data-name="flash:gray900" data-value="#020617"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Darkest elements</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <hr style="border-color: var(--gray500); margin: 30px 0;">

        <!-- LIGHT MODE COLORS -->
        <h2 style="font-size: 2rem; font-weight: bold; margin-bottom: 20px;">Light Mode Colors</h2>
        <div class="row">
            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Primary color</p>
                    <small class="color-margin">Primary is the main color of your brand</small>
                    <div class="input-field mt-3">
                        <label for="flash:lightmode_primary">Premium color</label>
                        <div class="input-w-reset">
                            <input type="color" class="form-control" name="flash:lightmode_primary" value="{{ old('flash:lightmode_primary', $lightmode_primary) }}" />
                            <button type="button" data-name="flash:lightmode_primary" data-value="#2563eb">
                                <i data-lucide="rotate-ccw"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Success colors</p>
                    <small class="color-margin">These are the colors of the green buttons</small>
                    <div class="row mt-3">
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_successText">Success text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_successText" value="{{ old('flash:lightmode_successText', $lightmode_successText) }}" />
                                <button type="button" data-name="flash:lightmode_successText" data-value="#e1ffd8"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_successBorder">Success border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_successBorder" value="{{ old('flash:lightmode_successBorder', $lightmode_successBorder) }}" />
                                <button type="button" data-name="flash:lightmode_successBorder" data-value="#56aa2b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_successBackground">Success bg</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_successBackground" value="{{ old('flash:lightmode_successBackground', $lightmode_successBackground) }}" />
                                <button type="button" data-name="flash:lightmode_successBackground" data-value="#3d8f1f"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Danger colors</p>
                    <small class="color-margin">These are the colors of the red buttons</small>
                    <div class="row mt-3">
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_dangerText">Danger text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_dangerText" value="{{ old('flash:lightmode_dangerText', $lightmode_dangerText) }}" />
                                <button type="button" data-name="flash:lightmode_dangerText" data-value="#ffd8d8"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_dangerBorder">Danger border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_dangerBorder" value="{{ old('flash:lightmode_dangerBorder', $lightmode_dangerBorder) }}" />
                                <button type="button" data-name="flash:lightmode_dangerBorder" data-value="#aa2a2a"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_dangerBackground">Danger bg</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_dangerBackground" value="{{ old('flash:lightmode_dangerBackground', $lightmode_dangerBackground) }}" />
                                <button type="button" data-name="flash:lightmode_dangerBackground" data-value="#8f1f20"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Secondary colors</p>
                    <small class="color-margin">These are the colors of the gray buttons</small>
                    <div class="row mt-3">
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_secondaryText">Secondary text</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_secondaryText" value="{{ old('flash:lightmode_secondaryText', $lightmode_secondaryText) }}" />
                                <button type="button" data-name="flash:lightmode_secondaryText" data-value="#334155"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_secondaryBorder">Secondary border</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_secondaryBorder" value="{{ old('flash:lightmode_secondaryBorder', $lightmode_secondaryBorder) }}" />
                                <button type="button" data-name="flash:lightmode_secondaryBorder" data-value="#cbd5e1"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                        <div class="col-md-4 input-field">
                            <label for="flash:lightmode_secondaryBackground">Secondary bg</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_secondaryBackground" value="{{ old('flash:lightmode_secondaryBackground', $lightmode_secondaryBackground) }}" />
                                <button type="button" data-name="flash:lightmode_secondaryBackground" data-value="#e2e8f0"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-12 mb-4">
                <div class="content-box">
                    <p style="margin:0;font-weight:bold;">Gray colors (Light Mode)</p>
                    <small class="color-margin">These are the main structural colors of the panel</small>
                    <div class="row mt-3">
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray50">Gray 50</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray50" value="{{ old('flash:lightmode_gray50', $lightmode_gray50) }}" />
                                <button type="button" data-name="flash:lightmode_gray50" data-value="#0f172a"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Lightest text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray100">Gray 100</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray100" value="{{ old('flash:lightmode_gray100', $lightmode_gray100) }}" />
                                <button type="button" data-name="flash:lightmode_gray100" data-value="#1e293b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Light text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray200">Gray 200</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray200" value="{{ old('flash:lightmode_gray200', $lightmode_gray200) }}" />
                                <button type="button" data-name="flash:lightmode_gray200" data-value="#334155"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Regular text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray300">Gray 300</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray300" value="{{ old('flash:lightmode_gray300', $lightmode_gray300) }}" />
                                <button type="button" data-name="flash:lightmode_gray300" data-value="#475569"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Sub text</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray400">Gray 400</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray400" value="{{ old('flash:lightmode_gray400', $lightmode_gray400) }}" />
                                <button type="button" data-name="flash:lightmode_gray400" data-value="#64748b"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Small details</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray500">Gray 500</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray500" value="{{ old('flash:lightmode_gray500', $lightmode_gray500) }}" />
                                <button type="button" data-name="flash:lightmode_gray500" data-value="#94a3b8"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Border color</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray600">Gray 600</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray600" value="{{ old('flash:lightmode_gray600', $lightmode_gray600) }}" />
                                <button type="button" data-name="flash:lightmode_gray600" data-value="#cbd5e1"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Input color</small>
                        </div> 
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray700">Gray 700</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray700" value="{{ old('flash:lightmode_gray700', $lightmode_gray700) }}" />
                                <button type="button" data-name="flash:lightmode_gray700" data-value="#e2e8f0"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Box color</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray800">Gray 800</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray800" value="{{ old('flash:lightmode_gray800', $lightmode_gray800) }}" />
                                <button type="button" data-name="flash:lightmode_gray800" data-value="#f1f5f9"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Background color</small>
                        </div>
                        <div class="col-md-3 input-field">
                            <label for="flash:lightmode_gray900">Gray 900</label>
                            <div class="input-w-reset">
                                <input type="color" class="form-control" name="flash:lightmode_gray900" value="{{ old('flash:lightmode_gray900', $lightmode_gray900) }}" />
                                <button type="button" data-name="flash:lightmode_gray900" data-value="#ffffff"><i data-lucide="rotate-ccw"></i></button>
                            </div>
                            <small class="color-margin">Darkest elements</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="floating-button-2">
            {!! csrf_field() !!}
            <button type="submit" class="button button-primary">Save changes</button>
        </div>
    </form>

    <script>
    document.addEventListener("DOMContentLoaded", function() {
        var resetButtons = document.querySelectorAll('button[data-name]');

        resetButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var inputName = button.getAttribute('data-name');
                var inputElement = document.querySelector('input[name="' + inputName + '"]');
                var value = button.getAttribute('data-value');

                if (inputElement) {
                    inputElement.value = value;
                    console.log('Input value for', inputName, 'reset to:', value);
                }
            });
        });
    });

    function toggleInputType() {
        var inputs = document.querySelectorAll('input.form-control');
        inputs.forEach(function(input) {
            if (input.type === 'text') {
                input.type = 'color';
            } else if (input.type === 'color') {
                input.type = 'text';
            }
        });
    }
    </script>
@endsection


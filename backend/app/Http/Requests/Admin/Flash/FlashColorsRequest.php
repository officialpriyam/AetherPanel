<?php

namespace Pterodactyl\Http\Requests\Admin\Flash;

use Pterodactyl\Http\Requests\Admin\AdminFormRequest;

class FlashColorsRequest extends AdminFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $hexColorRule = 'required|regex:/^#?[0-9a-fA-F]{6}$/';

        return [
            'flash:primary' => $hexColorRule,

            'flash:successText' => $hexColorRule,
            'flash:successBorder' => $hexColorRule,
            'flash:successBackground' => $hexColorRule,

            'flash:dangerText' => $hexColorRule,
            'flash:dangerBorder' => $hexColorRule,
            'flash:dangerBackground' => $hexColorRule,

            'flash:secondaryText' => $hexColorRule,
            'flash:secondaryBorder' => $hexColorRule,
            'flash:secondaryBackground' => $hexColorRule,

            'flash:gray50' => $hexColorRule,
            'flash:gray100' => $hexColorRule,
            'flash:gray200' => $hexColorRule,
            'flash:gray300' => $hexColorRule,
            'flash:gray400' => $hexColorRule,
            'flash:gray500' => $hexColorRule,
            'flash:gray600' => $hexColorRule,
            'flash:gray700' => $hexColorRule,
            'flash:gray800' => $hexColorRule,
            'flash:gray900' => $hexColorRule,


            'flash:lightmode_primary' => $hexColorRule,

            'flash:lightmode_successText' => $hexColorRule,
            'flash:lightmode_successBorder' => $hexColorRule,
            'flash:lightmode_successBackground' => $hexColorRule,

            'flash:lightmode_dangerText' => $hexColorRule,
            'flash:lightmode_dangerBorder' => $hexColorRule,
            'flash:lightmode_dangerBackground' => $hexColorRule,

            'flash:lightmode_secondaryText' => $hexColorRule,
            'flash:lightmode_secondaryBorder' => $hexColorRule,
            'flash:lightmode_secondaryBackground' => $hexColorRule,

            'flash:lightmode_gray50' => $hexColorRule,
            'flash:lightmode_gray100' => $hexColorRule,
            'flash:lightmode_gray200' => $hexColorRule,
            'flash:lightmode_gray300' => $hexColorRule,
            'flash:lightmode_gray400' => $hexColorRule,
            'flash:lightmode_gray500' => $hexColorRule,
            'flash:lightmode_gray600' => $hexColorRule,
            'flash:lightmode_gray700' => $hexColorRule,
            'flash:lightmode_gray800' => $hexColorRule,
            'flash:lightmode_gray900' => $hexColorRule,
        ];
    }
}

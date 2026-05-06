<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Pterodactyl\Models\Egg;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class FlashEggsController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private ViewFactory $view)
    {
    }

    public function index(): View
    {
        $eggs = Egg::with('nest')->get();
        return $this->view->make('admin.flash.eggs', [
            'eggs' => $eggs
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $eggs = Egg::all();
        
        foreach ($eggs as $egg) {
            $fileInputName = 'egg_image_' . $egg->id;
            $urlInputName = 'egg_url_' . $egg->id;
            
            if ($request->hasFile($fileInputName)) {
                $file = $request->file($fileInputName);
                
                // Store the image in the public disk, under 'flash/eggs'
                // Store the image directly in the public/flash/eggs directory
                $filename = 'egg_' . $egg->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('flash/eggs'), $filename);

                // Delete old image if it exists and is an internal flash/eggs file
                if (!empty($egg->image) && str_starts_with($egg->image, '/flash/eggs/')) {
                    $oldPath = public_path($egg->image);
                    if (file_exists($oldPath)) {
                        @unlink($oldPath);
                    }
                }

                $egg->update([
                    'image' => '/flash/eggs/' . $filename
                ]);
            } elseif ($request->filled($urlInputName)) {
                $egg->update([
                    'image' => $request->input($urlInputName)
                ]);
            }
        }

        $this->alert->success('Successfully updated egg banners.')->flash();
        return redirect()->route('admin.flash.eggs');
    }
}

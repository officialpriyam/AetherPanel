# Куплено и слито NetStormer | https://black-minecraft.com/members/netstormer.15110/ | Black-Minecraft.com
# Purchased and leaked by NetStormer | https://black-minecraft.com/members/netstormer.15110/ | Black-Minecraft.com




# PteroGPT Installation Guide

PteroGPT is an AI integration for Pterodactyl Panel that provides contextual assistance directly from the server console and file editor. This guide details all the necessary modifications to integrate PteroGPT into your Pterodactyl installation.

> **Need Help?** Poshel naxuy

## Uploading the Addon

1. Upload the "UPLOAD_IT" folder to your pterodactyl installation directory.
2. Run the following command:
```bash
php artisan migrate
```

## Install Dependencies

```bash
npm i react-markdown remark-gfm
```

## Backend Modifications

### `app/Console/Kernel.php`

Add after the telemetry configuration:

```php
if (config('pterodactyl.telemetry.enabled')) {
    $this->registerTelemetry($schedule);
}

$schedule->command('pterogpt:prune')->daily();
```

### `routes/admin.php`

Add after the advanced settings routes:

```php
Route::patch('/mail', [Admin\Settings\MailController::class, 'update']);
Route::patch('/advanced', [Admin\Settings\AdvancedController::class, 'update']);

Route::get('/pterogpt', [Admin\Settings\PteroGPTController::class, 'index'])->name('admin.settings.pterogpt');
Route::patch('/pterogpt', [Admin\Settings\PteroGPTController::class, 'update']);
```

Add at the end of the file:

```php
/*
|--------------------------------------------------------------------------
| PteroGPT Controller Routes
|--------------------------------------------------------------------------
|
| Endpoint: /admin/pterogpt
|
*/
Route::group(['prefix' => 'pterogpt'], function () {
    Route::get('/logs', [Admin\PteroGPTLogsController::class, 'index'])->name('admin.pterogpt.logs');
    Route::get('/stats', [Admin\PteroGPTStatsController::class, 'index'])->name('admin.pterogpt.stats');
});
```

### `routes/api-client.php`

Find:
```php
Route::post('/reinstall', [Client\Servers\SettingsController::class, 'reinstall']);
Route::put('/docker-image', [Client\Servers\SettingsController::class, 'dockerImage']);
```

Add after:

```php
Route::group(['prefix' => '/pterogpt'], function () {
    Route::get('/config', [Client\Servers\PteroGPTController::class, 'config']);
    Route::get('/limits', [Client\Servers\PteroGPTController::class, 'limits']);
    Route::post('/chat', [Client\Servers\PteroGPTController::class, 'chat']);
});
```

## Frontend Modifications

### `resources/scripts/routers/ServerRouter.tsx`

Add after all imports:

```tsx
import { PteroGPTProvider, PteroGPTPanel, PteroGPTModal, PteroGPTButton, ErrorDetectionModal } from '@/components/server/pterogpt';
```

Find:
```tsx
<Spinner size={'large'} centered />
)
) : (
    <>
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <SubNavigation>
                <div>
```

Replace `<>` with `<PteroGPTProvider>`:

```tsx
<Spinner size={'large'} centered />
)
) : (
    <PteroGPTProvider>
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <SubNavigation>
                <div>
```

Find:
```tsx
                </TransitionRouter>
            </ErrorBoundary>
        )}
    </>
)}
```

Replace the closing `</>` with:

```tsx
                </TransitionRouter>
            </ErrorBoundary>
        )}
        <PteroGPTButton />
        <PteroGPTPanel />
        <PteroGPTModal />
        <ErrorDetectionModal />
    </PteroGPTProvider>
)}
```

### `resources/scripts/components/server/console/Console.tsx`

Find:
```tsx
import { ChevronDoubleRightIcon } from '@heroicons/react/solid';
```

Add after:

```tsx
import { usePteroGPTContext } from '@/components/server/pterogpt';
```

Find:
```tsx
const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
const [historyIndex, setHistoryIndex] = useState(-1);
```

Add after:

```tsx
const pteroGPT = usePteroGPTContext?.() ?? null;
```

Find:
```tsx
const handleConsoleOutput = (line: string, prelude = false) =>
    terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');
```

Replace with:

```tsx
const handleConsoleOutput = (line: string, prelude = false) => {
    terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');
    pteroGPT?.addConsoleLine(line);
};
```

### `resources/scripts/components/server/files/FileEditContainer.tsx`

Find:
```tsx
import { dirname } from 'pathe';
import CodemirrorEditor from '@/components/elements/CodemirrorEditor';
```

Add after:

```tsx
import { usePteroGPTContext } from '@/components/server/pterogpt/PteroGPTProvider';
```

Find:
```tsx
const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
const { addError, clearFlashes } = useFlash();
```

Add after:

```tsx
const pteroGPT = usePteroGPTContext?.() ?? null;

const openAIHelp = async () => {
    if (!pteroGPT) return;

    try {
        const filePath = hashToPath(hash);
        let currentContent = content;

        if (fetchFileContent) {
            currentContent = await fetchFileContent();
        }

        pteroGPT.setFileContext({
            path: filePath,
            content: currentContent,
        });
        pteroGPT.setIsOpen(true);
    } catch (err) {
        console.error('Failed to load file content for AI:', err);
    }
};
```

Find:
```tsx
<div css={tw`flex justify-end mt-4`}>
    <div css={tw`flex-1 sm:flex-none rounded bg-neutral-900 mr-4`}>
        <Select value={mode} onChange={(e) => setMode(e.currentTarget.value)}>
            {modes.map((mode) => (
                <option key={`${mode.name}_${mode.mime}`} value={mode.mime}>
                    {mode.name}
                </option>
            ))}
        </Select>
    </div>
```

Add after the closing `</div>`:

```tsx
{pteroGPT?.config?.enabled && (
    <Button css={tw`flex-1 sm:flex-none mr-2`} onClick={openAIHelp} color={'secondary'}>
        AI Help
    </Button>
)}
```

## View Modifications

### `resources/views/partials/admin/settings/nav.blade.php`

Find:
```php
<li @if($activeTab === 'advanced')class="active"@endif><a href="{{ route('admin.settings.advanced') }}">Advanced</a></li>
```

Add after:

```php
<li @if($activeTab === 'pterogpt')class="active"@endif><a href="{{ route('admin.settings.pterogpt') }}">PteroGPT</a></li>
<li @if($activeTab === 'pterogpt-logs')class="active"@endif><a href="{{ route('admin.pterogpt.logs') }}">PteroGPT Logs</a></li>
<li @if($activeTab === 'pterogpt-stats')class="active"@endif><a href="{{ route('admin.pterogpt.stats') }}">PteroGPT Stats</a></li>
```

## Build Panel

Refer to the [Pterodactyl Documentation](https://pterodactyl.io/community/customization/panel.html) for building the panel assets.

## You're done!

Your PteroGPT installation is now complete. You can access the configuration panel from the admin settings menu.



# Куплено и слито NetStormer | https://black-minecraft.com/members/netstormer.15110/ | Black-Minecraft.com
# Purchased and leaked by NetStormer | https://black-minecraft.com/members/netstormer.15110/ | Black-Minecraft.com

<?php

namespace Pterodactyl\Providers;

use Illuminate\Support\ServiceProvider;
use Pterodactyl\Services\Modules\ModuleManager;

class ModuleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $manager = new ModuleManager($this->app['config']);
        $this->app->instance(ModuleManager::class, $manager);

        foreach ($manager->providers() as $provider) {
            if (class_exists($provider)) {
                $this->app->register($provider);
            }
        }
    }
}

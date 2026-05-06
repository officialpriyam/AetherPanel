<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Base\LocaleController;

Route::get('/locales/namespaces.json', [LocaleController::class, 'namespaces'])->name('locales.namespaces');
Route::get('/locales/locale.json', LocaleController::class)->name('locales');

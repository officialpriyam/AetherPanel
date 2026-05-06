<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\Http\Controllers\Api\Admin\MountController;
use Pterodactyl\Http\Controllers\Api\Admin\NodeStatusController;
use Pterodactyl\Http\Controllers\Api\Admin\TicketController;
use Pterodactyl\Http\Controllers\Api\Admin\EggController;
use Pterodactyl\Http\Controllers\Api\Admin\NestController;
use Pterodactyl\Http\Controllers\Api\Admin\ModuleController;
use Pterodactyl\Http\Controllers\Api\Admin\OverviewController;
use Pterodactyl\Http\Controllers\Api\Admin\PropelEggCatalogController;
use Pterodactyl\Http\Controllers\Api\Admin\FlashSettingsController;
use Pterodactyl\Http\Controllers\Api\Admin\DatabaseHostController;
use Pterodactyl\Http\Controllers\Api\Admin\ReferenceController;
use Pterodactyl\Http\Controllers\Api\Admin\RuntimeConfigController;
use Pterodactyl\Http\Controllers\Api\Admin\ApplicationApiKeyController;

Route::get('/overview', OverviewController::class)->name('api.admin.overview');
Route::get('/modules', ModuleController::class)->name('api.admin.modules');
Route::get('/mounts', MountController::class)->name('api.admin.mounts');
Route::post('/mounts', [MountController::class, 'store']);
Route::get('/mounts/{mount}', [MountController::class, 'show'])->name('api.admin.mounts.show');
Route::patch('/mounts/{mount}', [MountController::class, 'update']);
Route::delete('/mounts/{mount}', [MountController::class, 'destroy']);
Route::post('/mounts/{mount}/eggs', [MountController::class, 'attachEggs'])->name('api.admin.mounts.eggs');
Route::post('/mounts/{mount}/nodes', [MountController::class, 'attachNodes'])->name('api.admin.mounts.nodes');
Route::delete('/mounts/{mount}/eggs/{eggId}', [MountController::class, 'detachEgg']);
Route::delete('/mounts/{mount}/nodes/{nodeId}', [MountController::class, 'detachNode']);

Route::get('/tickets', TicketController::class)->name('api.admin.tickets');
Route::get('/tickets/meta', [TicketController::class, 'meta']);
Route::get('/tickets/{ticketId}', [TicketController::class, 'show'])->name('api.admin.tickets.show');
Route::patch('/tickets/{ticketId}/status', [TicketController::class, 'updateStatus']);
Route::post('/tickets/{ticketId}/reply', [TicketController::class, 'reply']);
Route::post('/tickets/categories', [TicketController::class, 'createCategory']);
Route::patch('/tickets/categories/{categoryId}', [TicketController::class, 'updateCategory']);
Route::delete('/tickets/categories/{categoryId}', [TicketController::class, 'deleteCategory']);

Route::get('/database-hosts', DatabaseHostController::class)->name('api.admin.database-hosts');
Route::get('/database-hosts/{databaseHost}', [DatabaseHostController::class, 'show'])->name('api.admin.database-hosts.show');
Route::get('/nodes/{node:id}/status', NodeStatusController::class)->name('api.admin.nodes.status');

Route::get('/references/locations', [ReferenceController::class, 'locations'])->name('api.admin.references.locations');
Route::get('/references/servers', [ReferenceController::class, 'servers'])->name('api.admin.references.servers');
Route::get('/references/mounts', [ReferenceController::class, 'mounts'])->name('api.admin.references.mounts');
Route::get('/references/nests', [ReferenceController::class, 'nests'])->name('api.admin.references.nests');
Route::get('/propel/hive', [PropelEggCatalogController::class, 'index'])->name('api.admin.propel.hive');
Route::post('/propel/import', [PropelEggCatalogController::class, 'import'])->name('api.admin.propel.import');

Route::get('/application-api', ApplicationApiKeyController::class)->name('api.admin.application-api');
Route::post('/application-api', [ApplicationApiKeyController::class, 'store']);
Route::get('/application-api/{apiKey}', [ApplicationApiKeyController::class, 'show'])->name('api.admin.application-api.show');
Route::delete('/application-api/{apiKey}', [ApplicationApiKeyController::class, 'destroy']);

Route::get('/nests', NestController::class)->name('api.admin.nests');
Route::post('/nests', [NestController::class, 'store']);
Route::get('/nests/{nest}', [NestController::class, 'show'])->name('api.admin.nests.show');
Route::patch('/nests/{nest}', [NestController::class, 'update']);
Route::delete('/nests/{nest}', [NestController::class, 'destroy']);

Route::post('/eggs', [EggController::class, 'store'])->name('api.admin.eggs.store');
Route::get('/eggs/{egg}', [EggController::class, 'show'])->name('api.admin.eggs.show');
Route::patch('/eggs/{egg}', [EggController::class, 'update']);
Route::delete('/eggs/{egg}', [EggController::class, 'destroy']);
Route::patch('/eggs/{egg}/scripts', [EggController::class, 'updateScript']);
Route::post('/eggs/{egg}/variables', [EggController::class, 'storeVariable']);
Route::patch('/eggs/{egg}/variables/{variable}', [EggController::class, 'updateVariable']);
Route::delete('/eggs/{egg}/variables/{variable}', [EggController::class, 'destroyVariable']);

Route::get('/settings/runtime', [RuntimeConfigController::class, 'index'])->name('api.admin.settings.runtime');
Route::patch('/settings/runtime', [RuntimeConfigController::class, 'update']);
Route::get('/settings/flash', [FlashSettingsController::class, 'index'])->name('api.admin.settings.flash');
Route::patch('/settings/flash', [FlashSettingsController::class, 'update']);

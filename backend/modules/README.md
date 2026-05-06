# AetherPanel Modules

Install custom modules in this directory using one folder per module:

```php
// backend/modules/example/module.php
return [
    'id' => 'example',
    'name' => 'Example Module',
    'version' => '1.0.0',
    'description' => 'Adds custom panel behavior.',
    'enabled' => true,
    'api_key' => 'change-this-secret',
    'routes' => [
        'api' => 'routes/api.php',
    ],
    'providers' => [
        // Vendor\Example\ExampleServiceProvider::class,
    ],
];
```

The API route file is mounted at `/api/modules/{id}` and must be called with:

```text
X-AetherPanel-Module-Key: change-this-secret
```

Module routes receive the current module instance on the request attribute `aether.module`.

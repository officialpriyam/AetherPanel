<?php

namespace Pterodactyl\Models;

class BagouLicense extends Model
{
    public const RESOURCE_NAME = 'BagouLicense';

    protected $table = 'bagoulicense';

    protected $fillable = [
        'addon',
        'license',
        'usage',
        'maxusage',
        'enabled',
        'version',
    ];

    protected $casts = [
        'addon' => 'string',
        'license' => 'string',
        'usage' => 'integer',
        'maxusage' => 'integer',
        'enabled' => 'boolean',
        'version' => 'string',
    ];
}

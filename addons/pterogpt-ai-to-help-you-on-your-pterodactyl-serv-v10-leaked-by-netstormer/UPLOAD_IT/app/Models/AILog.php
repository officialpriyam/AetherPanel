<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AILog extends Model
{
    public const RESOURCE_NAME = 'ai_log';

    protected $table = 'ai_logs';

    protected $fillable = [
        'user_id',
        'server_id',
        'action_type',
        'model_used',
        'prompt_summary',
        'tokens_used',
        'tool_executed',
        'ip_address',
    ];

    protected $casts = [
        'tool_executed' => 'array',
        'tokens_used' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
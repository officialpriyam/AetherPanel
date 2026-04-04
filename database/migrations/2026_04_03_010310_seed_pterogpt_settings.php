<?php

use Pterodactyl\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        $defaults = [
            'pterogpt::enabled' => '0',
            'pterogpt::base_url' => 'https://api.openai.com/v1',
            'pterogpt::model_mode' => 'fixed',
            'pterogpt::model_fixed' => 'gpt-4.1-mini',
            'pterogpt::models_allowed' => '["gpt-4.1-mini","gpt-4.1"]',
            'pterogpt::ui_mode' => 'panel',
            'pterogpt::language' => 'en',
            'pterogpt::limit_chat' => '50',
            'pterogpt::limit_read' => '100',
            'pterogpt::limit_write' => '20',
            'pterogpt::limit_command' => '10',
            'pterogpt::system_prompt' => <<<'PROMPT'
You are PriyxStudio AI, an assistant integrated into Pterodactyl Panel for game server management.
Help users diagnose errors, configure servers, and improve performance.
Be concise, technical, and action-oriented.
{server_info}
PROMPT,
        ];

        foreach ($defaults as $key => $value) {
            if (!Setting::query()->where('key', $key)->exists()) {
                Setting::query()->create(['key' => $key, 'value' => $value]);
            }
        }
    }

    public function down(): void
    {
        $keys = [
            'pterogpt::enabled',
            'pterogpt::base_url',
            'pterogpt::model_mode',
            'pterogpt::model_fixed',
            'pterogpt::models_allowed',
            'pterogpt::ui_mode',
            'pterogpt::language',
            'pterogpt::limit_chat',
            'pterogpt::limit_read',
            'pterogpt::limit_write',
            'pterogpt::limit_command',
            'pterogpt::system_prompt',
        ];

        Setting::query()->whereIn('key', $keys)->delete();
    }
};

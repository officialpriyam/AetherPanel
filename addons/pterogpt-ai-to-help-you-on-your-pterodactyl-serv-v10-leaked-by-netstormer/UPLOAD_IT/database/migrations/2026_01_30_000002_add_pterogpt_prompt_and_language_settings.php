<?php

use Pterodactyl\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const DEFAULT_SYSTEM_PROMPT = <<<'PROMPT'
You are PteroGPT, an AI assistant integrated into Pterodactyl Panel for game server management. Your role is to help users diagnose errors, configure servers, and optimize performance.
Be concise, technical, and focused on game server administration. Always explain your reasoning and provide actionable solutions.
{server_info}
PROMPT;

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add system_prompt setting if it doesn't exist
        if (!Setting::where('key', 'pterogpt::system_prompt')->exists()) {
            Setting::create([
                'key' => 'pterogpt::system_prompt',
                'value' => self::DEFAULT_SYSTEM_PROMPT,
            ]);
        }

        // Add language setting if it doesn't exist
        if (!Setting::where('key', 'pterogpt::language')->exists()) {
            Setting::create([
                'key' => 'pterogpt::language',
                'value' => 'en',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Setting::where('key', 'pterogpt::system_prompt')->delete();
        Setting::where('key', 'pterogpt::language')->delete();
    }
};
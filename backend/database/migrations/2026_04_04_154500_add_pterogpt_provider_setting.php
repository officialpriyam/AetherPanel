<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $exists = DB::table('settings')->where('key', 'pterogpt::provider')->exists();

        if (!$exists) {
            DB::table('settings')->insert([
                'key' => 'pterogpt::provider',
                'value' => 'openai',
            ]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'pterogpt::provider')->delete();
    }
};

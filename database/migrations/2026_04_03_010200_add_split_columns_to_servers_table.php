<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            if (!Schema::hasColumn('servers', 'split_masteruuid')) {
                $table->char('split_masteruuid', 36)->nullable();
            }

            if (!Schema::hasColumn('servers', 'split_limit')) {
                $table->unsignedInteger('split_limit')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('servers', function (Blueprint $table) {
            if (Schema::hasColumn('servers', 'split_limit')) {
                $table->dropColumn('split_limit');
            }

            if (Schema::hasColumn('servers', 'split_masteruuid')) {
                $table->dropColumn('split_masteruuid');
            }
        });
    }
};

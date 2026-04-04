<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('subdomain_manager_domains')) {
            return;
        }

        Schema::create('subdomain_manager_domains', function (Blueprint $table) {
            $table->id();
            $table->string('domain', 191);
            $table->text('egg_ids');
            $table->text('protocol')->nullable();
            $table->text('protocol_types')->nullable();
            $table->timestamps();

            $table->unique('domain');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subdomain_manager_domains');
    }
};

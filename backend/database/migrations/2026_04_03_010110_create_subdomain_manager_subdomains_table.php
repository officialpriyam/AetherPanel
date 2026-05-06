<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('subdomain_manager_subdomains')) {
            return;
        }

        Schema::create('subdomain_manager_subdomains', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('server_id');
            $table->unsignedBigInteger('domain_id');
            $table->string('subdomain', 64);
            $table->unsignedInteger('port');
            $table->string('record_type', 16);
            $table->string('cf_record_id', 64)->nullable();
            $table->timestamps();

            $table->index('server_id');
            $table->index('domain_id');
            $table->unique(['domain_id', 'subdomain']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subdomain_manager_subdomains');
    }
};

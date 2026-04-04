<?php

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Command;
use Pterodactyl\Models\AILog;

class PruneAILogsCommand extends Command
{
    protected $signature = 'pterogpt:prune';

    protected $description = 'Prune AI logs older than 7 days';

    public function handle(): int
    {
        $count = AILog::where('created_at', '<', now()->subDays(7))->delete();

        $this->info("Pruned {$count} AI log entries.");

        return Command::SUCCESS;
    }
}
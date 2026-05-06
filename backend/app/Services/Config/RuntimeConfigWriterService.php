<?php

namespace Pterodactyl\Services\Config;

class RuntimeConfigWriterService
{
    public function write(array $values): void
    {
        $path = base_path('config.php');
        $current = file_exists($path) ? require $path : [];
        $merged = array_replace($current, $values);

        $contents = "<?php\n\nreturn " . var_export($merged, true) . ";\n";

        file_put_contents($path, $contents);
    }
}

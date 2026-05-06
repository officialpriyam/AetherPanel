<?php

$phpBinary = escapeshellarg(PHP_BINARY);
$command = $phpBinary . ' artisan package:discover --ansi';

passthru($command, $exitCode);
exit(0);

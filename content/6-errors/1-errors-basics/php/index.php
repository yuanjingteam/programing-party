<?php

$content = @file_get_contents("missing.txt");
if ($content === false) {
    $error = error_get_last();
    echo "read failed: " . ($error["message"] ?? "unknown") . PHP_EOL;
    exit;
}

echo $content . PHP_EOL;


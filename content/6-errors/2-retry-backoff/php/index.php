<?php

$attempts = 0;

function unstable_operation(): string {
    global $attempts;
    $attempts += 1;
    if ($attempts < 3) {
        throw new RuntimeException("temporary failure");
    }
    return "ok";
}

$maxAttempts = 5;
$backoffMs = 200;

for ($i = 1; $i <= $maxAttempts; $i += 1) {
    try {
        $result = unstable_operation();
        echo "success: " . $result . PHP_EOL;
        exit;
    } catch (RuntimeException $e) {
        echo "attempt " . $i . " failed: " . $e->getMessage() . PHP_EOL;
        if ($i === $maxAttempts) {
            echo "giving up" . PHP_EOL;
            exit;
        }
        usleep($backoffMs * 1000);
        $backoffMs *= 2;
    }
}


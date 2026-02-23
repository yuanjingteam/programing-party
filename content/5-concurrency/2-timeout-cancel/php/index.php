<?php

$url = "https://example.com";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT_MS, 300);
curl_setopt($ch, CURLOPT_TIMEOUT_MS, 1000);

$body = curl_exec($ch);
if ($body === false) {
    echo "timeout: " . curl_error($ch) . PHP_EOL;
    curl_close($ch);
    exit;
}

$code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

echo "status=" . $code . PHP_EOL;


<?php

function fetchStatusCode(string $url): int {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    return $code;
}

function fetchStatusCodesConcurrently(array $urls): array {
    $mh = curl_multi_init();
    $handles = [];

    foreach ($urls as $url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_multi_add_handle($mh, $ch);
        $handles[$url] = $ch;
    }

    do {
        $status = curl_multi_exec($mh, $running);
        if ($running > 0) {
            curl_multi_select($mh, 1.0);
        }
    } while ($running > 0 && $status === CURLM_OK);

    $result = [];
    foreach ($handles as $url => $ch) {
        $result[$url] = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }
    curl_multi_close($mh);

    return $result;
}

$urls = [
    "https://example.com",
    "https://example.net",
];

$start = microtime(true);
$codes = fetchStatusCodesConcurrently($urls);

foreach ($codes as $url => $code) {
    echo $url . " => " . $code . PHP_EOL;
}

echo "elapsed=" . (int) ((microtime(true) - $start) * 1000) . "ms" . PHP_EOL;

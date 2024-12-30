<?php

$dir = __DIR__ . '/../docs';

$catalog = [];

$invalidCode = ['%20', '%28', '%29', '%26'];

$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
foreach ($objects as $k => $object) {
    $filename = $object->getPath() . DIRECTORY_SEPARATOR . $object->getFileName();
    if ($object->isFile() && preg_match('#\.md$#', $filename)) {
        $encodePath = urlencode(str_replace($dir, '', $filename));
        if (strpos($encodePath, '%A0') !== false) {
            echo $encodePath . PHP_EOL;
            echo urldecode($encodePath) . PHP_EOL;
        }
    }
}


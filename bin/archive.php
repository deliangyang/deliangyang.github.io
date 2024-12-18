<?php

$dir = __DIR__ . '/../docs/t/';

$catalog = [];

$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
foreach ($objects as $k => $object) {
    $filename = $object->getPath() . DIRECTORY_SEPARATOR . $object->getFileName();
    if ($object->isFile() && preg_match('#\.md$#', $filename)) {
        $items = explode('/', str_replace($dir, '', $filename));
        $l = count($items);
        $subCatalog = &$catalog;
        foreach ($items as $idx => $item) {
            if ($idx == $l - 1) {
                break;
            }
            $subCatalog[$item] = $subCatalog[$item] ?? [];
            if (is_string($subCatalog[$item])) {
                $subCatalog[$item] = [
                    $subCatalog[$item]
                ];
            }
            if ($idx == $l - 2) {
                $subCatalog[$item][] = str_replace($dir, '', $filename);
            } else if ($idx < $l - 2) {
                $subCatalog = &$subCatalog[$item];
            }
        }
    }
}

echo '# 归档' . PHP_EOL;

function dump($catalog, $level = 0)
{
    foreach ($catalog as $k => $v) {
        if (is_array($v)) {
            if ($level == 0) {
                echo "## $k\n";
            } else {
                echo str_repeat('  ', $level-1) . "- $k\n";
            }
            ksort($v);
            dump($v, $level + 1);
            if ($level == 0) {
                echo '---' . PHP_EOL;
            }
        } else {
            $k = basename($v, '.md');
            $v = '/t/' . $v;
            $fn = 'docs' . $v;
            $fn = str_replace(['&', '(', ')'], ['\&', '\(', '\)'], $fn);
            
            $createTime = `git log --pretty=format:"%cd" --date=format:'%Y-%m-%d' -1 -- "$fn"`;
            $v = str_replace(' ', '%20', $v);
            // $v = str_replace('.md', '.html', $v);
            echo str_repeat('  ', $level-1) . "- [$k]($v) [$createTime]\n";
        }
    }
}

dump($catalog);
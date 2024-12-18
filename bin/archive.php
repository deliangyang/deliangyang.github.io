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


$monthly = [];

function dump($catalog, $level = 0)
{
    global $monthly;
    foreach ($catalog as $k => $v) {
        if (is_array($v)) {
            if ($level == 0) {
                echo "## $k\n";
            } else {
                echo str_repeat('  ', $level - 1) . "- $k\n";
            }
            ksort($v);
            dump($v, $level + 1);
            // if ($level == 0) {
            //     echo PHP_EOL . '---' . PHP_EOL . PHP_EOL;
            // }
        } else {
            $k = basename($v, '.md');
            $v = '/t/' . $v;
            $fn = 'docs' . $v;
            $fn = str_replace(['&', '(', ')'], ['\&', '\(', '\)'], $fn);

            $createTime = `git log --pretty=format:"%cd" --date=format:'%Y-%m-%d' -1 -- "$fn"`;
            $v = str_replace(' ', '%20', $v);

            $monthly[] = [
                'title' => $k,
                'url' => $v,
                'createTime' => $createTime
            ];

            // $v = str_replace('.md', '.html', $v);
            echo str_repeat('  ', $level - 1) . "- [$k]($v) &nbsp;&nbsp;&nbsp;<i style=\"font-size:14px;color:#999\">[<datetime>$createTime</datetime>]</i>\n";
        }
    }
}

ob_start();
echo '# 归档' . PHP_EOL;
dump($catalog);
$content = ob_get_contents();
ob_clean();
file_put_contents(__DIR__ . '/../docs/t/index.md', $content);

usort($monthly, function ($a, $b) {
    return $a['createTime'] < $b['createTime'];
});

$monthly = array_reduce($monthly, function ($carry, $item) {
    $key = substr($item['createTime'], 0, 7);
    $carry[$key][] = $item;
    return $carry;
}, []);

$daily = [];
foreach ($monthly as $mon => $v) {
    $daily[$mon] = [];
    foreach ($v as $vv) {
        if (!isset($vv['createTime'])) {
            $daily[$mon][$vv['createTime']] = [];
        }
        $daily[$mon][$vv['createTime']][] = $vv;
    }
}

ob_start();
foreach ($daily as $k => $v) {
    echo '## ' . $k . PHP_EOL;

    foreach ($v as $kk => $vv) {
        echo "::: timeline {$kk}" . PHP_EOL;
        foreach ($vv as $day => $jj) {
            $items = explode('/', $jj['url']);
            $l = count($items);
            if ($l >= 2) {
                $jj['title'] = $items[$l - 2] . '-' . $jj['title'];
            }
            $jj['title'] = trim($jj['title']);
            echo "- [{$jj['title']}]({$jj['url']})" . PHP_EOL;
        }

        echo ":::\n\n" . PHP_EOL;
    }
}
$content = ob_get_contents();
ob_clean();

file_put_contents(__DIR__ . '/../docs/daily.md', $content);

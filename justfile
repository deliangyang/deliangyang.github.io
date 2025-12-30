
sync:
    #!/bin/bash
    files=""
    for file in $(git diff --name-only --cached); do
        files="$files $file"
    done

    for file in $(git diff --name-only); do
        files="$files $file"
    done

    file=$(echo $files | sort | uniq | tr " " "\n" | grep -E '.md$' | percol)
    echo $file
    python ~/work/markdown-to-wechat/sync.py "$file"
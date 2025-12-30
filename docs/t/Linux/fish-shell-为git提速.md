# Fish Shell 优化 Git 命令效率

本文主要的目的是通过 fish shell 将一些常用的 git 命令进行精简，或者组合，从而达到最少的键盘输入，快速完成 git 的操作。

我主要常用的 shell 工具是 fish shell，将核心逻辑转化为 bash，同样可以完成任务。

### 使用 alias 精简命令

编辑文件 `~/.config/fish/config.fish`，将如下命令写入文件中，退出文件，执行命令 `fish` 重载配置，就可以使用如下命令。

```bash
alias gl='git pull'                     # 拉取代码
alias gr='git reset --hard'             # 重置代码
alias gs='git status'                   # 查看状态
alias ga='git add .'                    # 添加所有修改
alias gm='git commit -m'                # 添加提交信息
alias gp="git push"                     # 推送代码
alias gb="git branch|grep -P '^\*'"     # 查看当前分支
alias gcm="git checkout master"         # 切换到 master 分支
```

### 使用函数组合命令

同样编辑文件 `~/.config/fish/config.fish`，将如下函数写入文件中，退出文件，执行命令 `fish` 重载配置，就可以使用如下命令。

#### 合并分支到目标分支，并推送

- 命令：`merge_back <src_branch> <target_branch>`

```bash
function merge_back
	set src $argv[1]
	set target $argv[2]
	if test -z "$src"
		echo "Usage: merge_back <src_branch> <target_branch>"
		return 1
	end
	if test -z "$target"
		echo "Usage: merge_back <src_branch> <target_branch>"
		return 1
	end
	git checkout "$src"
	if test $status -ne 0
		echo "Failed to checkout $src"
		return $status
	end
	git checkout "$target"
	if test $status -ne 0
		echo "Failed to checkout $target"
		return $status
	end
	git pull
	if test $status -ne 0
		echo "Failed to pull latest changes for $target"
		return $status
	end
	git merge "$src" --no-ff -m "Merge branch '$src' into '$target'"
	if test $status -ne 0
		echo "Merge conflict occurred while merging $src into $target"
		return $status
	end
	git push
	if test $status -ne 0
		echo "Failed to push changes to $target"
		return $status
	end
	git checkout "$src"
	if test $status -ne 0
		echo "Failed to checkout back to $src"
		return $status
	end
	echo "Successfully merged $src into $target and pushed the changes."
end
```

#### 将 stable 分支的代码合并到所有开发分支

- 命令：`merge_stable_to_all`

```bash
function merge_stable_to_all
	set current_branch (git branch | grep -P '^\*' | awk '{print $2}')
	if test "$current_branch" == ""
		echo "Failed to get current branch"
		return 1
	end
	git checkout stable
	if test $status -ne 0
		echo "Failed to checkout stable"
		return $status
	end
	git pull
	if test $status -ne 0
		echo "Failed to pull latest changes for stable"
		return $status
	end
	# list of development branches to merge stable into
	set dev_branches "dev" "test" "feature" "staging"
	for branch in $dev_branches
		# check if branch exists
		git show-ref --verify --quiet refs/heads/$branch
		if test $status -ne 0
			echo "Branch $branch does not exist, skipping..."
			continue
		end
		echo "Merging stable into $branch"
		merge_back stable $branch
		if test $status -ne 0
			echo "Failed to merge stable into $branch"
			return $status
		end
	end

	git checkout "$current_branch"
	if test $status -ne 0
		echo "Failed to checkout back to $current_branch"
		return $status
	end
	echo "Successfully merged stable into all development branches and returned to $current_branch."
end
```

#### 切换到指定分支并拉取最新代码

- 命令：`gc <branch>`，如果不指定分支，默认切换到 `-` 分支

```bash
function gc
	set branch "-"
	if test (count $argv) -gt 0
		set branch $argv[1]
	end
	echo "Checking out and pulling latest changes for branch: $branch"
	git checkout $branch
	if test $status -ne 0
		echo "Failed to checkout $branch"
		return $status
	end
	git pull
	if test $status -ne 0
		echo "Failed to pull latest changes for $branch"
		return $status
	end
end
```


#### 从远程拉取最新代码，并 cherry-pick 指定的提交，然后推送

- 命令：`gpk <commit_hash1> <commit_hash2> ...`

```bash
function gpk
	git pull
	if test $status -ne 0
		echo "Failed to pull latest changes"
		return $status
	end
	set pick_hashes $argv
	if test (count $pick_hashes) -eq 0
		echo "Usage: gpk <commit_hash1> <commit_hash2> ..."
		return 1
	end
	for hash in $pick_hashes
		echo "Cherry-picking commit: $hash"
		git cherry-pick $hash
		if test $status -ne 0
			echo "Cherry-pick failed for commit $hash, aborting."
			git cherry-pick --abort
			return $status
		end
	end
	git push
	if test $status -ne 0
		echo "Failed to push changes"
		return $status
	end
end
```

#### 使用 Open-AI 自动生成提交信息并提交代码 

- 命令：`am`

```bash
# OPENAI_API_KEY
set -gx OPENAI_API_KEY "sk-xxx"

# diff max length
set -gx DIFF_MAX_LENGTH 13000

# auto commit and push
function am
	git add .
	if test $status -ne 0
		echo "Failed to add changes"
		return $status
	end
	# get all diff, and send it to openai, summarize it to one line
	set diff (git diff --cached)
	if test "$diff" = ""
		echo "No changes to commit"
		return 0
	end
	# if diff is too long, skip it
	if test (echo $diff | wc -c) -gt $DIFF_MAX_LENGTH
		echo "Diff is too long, please commit manually"
		return 1
	end
	# check if openai cli is installed
	if not type -q openai
		echo "openai cli is not installed, please install it first"
		echo "use 'pip install openai-cli' to install it"
		return 1
	end
	set summary (echo $diff | \
		openai api chat.completions.create -m gpt-3.5-turbo -M 256 -g user \
		 "将以下git diff总结为一行中文提交消息，注意根据内容仅添加一个前缀(feat|test|revert|chore|style)等，如果有多个内容的提交，请列出1、2、3、4点等，分号分隔: $diff")

	if test "$summary" = ""
		echo "Failed to get summary from OpenAI, using default message"
		return 1
	end
	git commit -m "$summary"
	if test $status -ne 0
		echo "Failed to commit changes"
		return $status
	end
	git pull
	if test $status -ne 0
		echo "Failed to pull latest changes"
		return $status
	end
	git push
	if test $status -ne 0
		echo "Failed to push changes"
		return $status
	end
end
```

### 总结

通过 fish shell 的 alias 和 function，可以大大简化 git 的操作，减少键盘输入，提高工作效率。

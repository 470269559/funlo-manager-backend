# GitHub Desktop 使用 SSH 推送代码

这份文档记录从生成 SSH Key 到使用 GitHub Desktop 推送代码的完整流程。

## 1. 生成 SSH Key

打开终端，执行：

```bash
ssh-keygen -t ed25519 -C "470269559@qq.com"
```

执行后一路回车即可。

默认会生成这两个文件：

```text
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

其中：

- `id_ed25519` 是私钥，不要发给别人。
- `id_ed25519.pub` 是公钥，需要添加到 GitHub。

## 2. 复制公钥

执行：

```bash
pbcopy < ~/.ssh/id_ed25519.pub
```

执行后，公钥内容已经复制到剪贴板。

## 3. 添加 SSH Key 到 GitHub

打开 GitHub SSH Keys 页面：

```text
https://github.com/settings/keys
```

然后操作：

1. 点击 `New SSH key`
2. `Title` 可以写 `MacBook` 或其他方便识别的名字
3. `Key` 粘贴刚才复制的公钥
4. 点击保存

## 4. 测试 SSH 是否可用

执行：

```bash
ssh -T git@github.com
```

第一次连接时可能会看到：

```text
Are you sure you want to continue connecting?
```

输入：

```text
yes
```

如果看到类似下面的内容，说明 SSH 配置成功：

```text
Hi 470269559! You've successfully authenticated, but GitHub does not provide shell access.
```

## 5. 把仓库远程地址改成 SSH

进入项目目录：

```bash
cd /Users/xushengyan/Downloads/funfo/funlo/funlo-manager-backend
```

把远程地址改成 SSH：

```bash
git remote set-url origin git@github.com:470269559/funlo-manager-backend.git
```

确认远程地址：

```bash
git remote -v
```

正常应该看到：

```text
origin  git@github.com:470269559/funlo-manager-backend.git (fetch)
origin  git@github.com:470269559/funlo-manager-backend.git (push)
```

## 6. 使用 GitHub Desktop 推送

打开 GitHub Desktop，确认当前仓库是：

```text
funlo-manager-backend
```

然后点击：

```text
Publish branch
```

或者：

```text
Push origin
```

GitHub Desktop 会使用当前仓库的 SSH remote 进行推送。

## 7. 常见问题

### 仍然显示 HTTPS 地址

重新执行：

```bash
git remote set-url origin git@github.com:470269559/funlo-manager-backend.git
git remote -v
```

确认输出里是 `git@github.com`，不是 `https://github.com`。

### Connection reset by peer

这个通常是 HTTPS 网络连接被重置。改成 SSH 后一般可以避开。

### Permission denied (publickey)

说明 GitHub 没识别到你的 SSH Key。检查：

1. 是否把 `~/.ssh/id_ed25519.pub` 添加到了 GitHub
2. 是否添加到了正确的 GitHub 账号
3. 是否执行过 `ssh -T git@github.com`

### 22 端口无法连接

如果 SSH 的 22 端口也被网络拦截，可以改用 GitHub 的 SSH 443 端口。编辑或创建：

```text
~/.ssh/config
```

添加：

```text
Host github.com
  HostName ssh.github.com
  User git
  Port 443
```

然后再测试：

```bash
ssh -T git@github.com
```

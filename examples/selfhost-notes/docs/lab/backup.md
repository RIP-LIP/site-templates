# 场景：自动备份到异地

> **适用情况**：照片、文档、项目文件只存在一台机器上。硬盘坏了、勒索软件加密了、被误删了，都只能看着数据消失。这里要解决的是：**让备份落到另一台物理设备上，并且每天自动做。**

这一篇只做一件事：把「本机目录 → 异地目标」做成每天自动跑、失败会告警的闭环。先把最小版本跑通，确认它真的在跑，再加加密和版本保留。

## 1. 跑通后你会得到什么

每天固定时间执行一次，结束时你会收到一行结果：

```text
[backup] 2026-10-02 03:00  增量 1.2 GB  用时 41 分钟  → 异地存储:OK
```

以及这些保证：

- 备份写到了**另一台物理机器**上，不是同一台机器的另一个目录
- 断网或中途失败后，下次运行会继续，不会从头再来
- 每天保留一个新版本，保留 30 天

## 2. 选一个备份方案

| 方案 | 增量 | 加密 | 版本保留 | 适合 |
| --- | :-: | :-: | :-: | --- |
| `restic` | ✅ | ✅ 内置 | ✅ 保留天数 | 绝大多数人，直接用这个 |
| `borgbackup` | ✅ | ✅ 可选 | ✅ | 已经有大量历史备份 |
| `rsync` | ✅ | ❌ | ❌ 需自己实现 | 只想做简单镜像 |
| 云盘客户端同步 | 部分 | 依赖服务商 | 依赖服务商 | 已有大量数据在云端 |

**选 restic。** 它是唯一同时给你增量、加密、版本保留三件事，且不要求你先学会复杂语法的方案。

## 3. 装上

```bash
# Debian / Ubuntu
sudo apt-get install -y restic

# macOS
brew install restic

# 验证
restic version
```

## 4. 初始化仓库（只做一次）

```bash
export RESTIC_REPOSITORY="sftp:backup@backup-nas:/volume1/backups/mydata"
export RESTIC_PASSWORD_FILE="$HOME/.restic-password"

# 生成密码文件，不要直接用明文密码变量
restic generate

# 检查仓库
restic check
```

密码文件权限收紧到只有自己能读：

```bash
chmod 600 "$HOME/.restic-password"
```

::: warning 密码丢了，备份就等于没有
`restic-password` 必须和备份分开存放 —— 放 U 盘、密码管理器，或者另一台机器。存进同一个仓库等于没加密。
:::

## 5. 先手动跑一次

不要一上来就配定时任务。手动跑，确认它真的能连上、能写、能读回来。

```bash
# 排除掉那些不需要备份、又占地方的东西
cat > "$HOME/.restic-exclude" <<'EOF'
node_modules
.git/objects/pack/tmp
*.tmp
.cache
EOF

# 试跑：先看会传多少
restic backup ~/data --dry-run

# 真的跑一次
restic backup ~/data
```

验证能恢复（**备份不做恢复测试等于没有备份**）：

```bash
restic ls latest --limit 5          # 看最新快照里有什么
restic check --read-data-subset=5%  # 抽查 5% 的数据块校验完整性
```

## 6. 配置每日自动执行

把仓库和密码固定下来，避免每次手动 export：

```bash
mkdir -p "$HOME/.config/restic"
cat > "$HOME/.config/restic/env" <<EOF
RESTIC_REPOSITORY="sftp:backup@backup-nas:/volume1/backups/mydata"
RESTIC_PASSWORD_FILE="$HOME/.restic-password"
EOF
```

写定时任务，每天凌晨 3 点：

```bash
crontab -e
```

```cron
0 3 * * * . "$HOME/.config/restic/env" && restic backup ~/data --exclude-file "$HOME/.restic-exclude" --tag daily 2>&1 | tee -a "$HOME/.restic-errors.log"
```

::: tip 关于 cron 的一个坑
有些系统 cron 的环境变量极简，SSH 可能因为找不到密钥而失败。加一行 `ssh-add ~/.ssh/id_ed25519 2>/dev/null` 在命令前面，或者在 `~/.ssh/config` 里给那台机器写好 `IdentityFile`。
:::

## 7. 加失败告警

没有告警的备份，等于「你希望它成功了」。这是最关键的一步。

```bash
# 如果备份超过 3 小时还没完成，或最近 26 小时没有成功记录，发邮件
0 */6 * * * . "$HOME/.config/restic/env" && \
  [ -z "$(restic snapshots --tag daily --last 26h 2>/dev/null)" ] && \
  mail -s "备份告警：$HOSTNAME 超过 26 小时无成功备份" you@example.com < "$HOME/.restic-errors.log"
```

检查它到底有没有在跑：

```bash
crontab -l                    # 任务在不在
grep CRON /var/log/syslog    # 真的执行了吗
restic snapshots --tag daily # 最近的成功记录
```

## 8. 常见问题

**Q1：第一次备份要跑一整晚？**
是的，数据量大时首次全量本来就要传完所有数据。可以用 `--dry-run` 先看总量。后续都是增量，几分钟到几十分钟。

**Q2：`sftp:` 连不上，报 `Permission denied (publickey)`？**
三个检查：密钥是否在 `~/.ssh/id_ed25519`、远端 `authorized_keys` 里有没有公钥、远端用户的家目录权限是不是 755 以上（700 也能连，但 755 更稳）。

**Q3：本地机器关机了，任务就没跑？**
cron 只在开机时补跑当天错过的任务，不保证准时。机器常年不开机的话，考虑在另一台常开的机器上远程触发。

**Q4：备份文件占用越来越大？**
这正是版本保留该做的事。加上清理：

```bash
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6
restic prune
```

`prune` 才会真正释放空间，`forget` 只是删除索引记录。

**Q5：怎么确认这个备份真能救我？**
定期做一次真实恢复：随便挑一个文件，`restic restore latest --target /tmp/restore-test`，打开看看内容对不对。**没验证过的备份只是占用磁盘的文件。**

## 再往下做

- **加密存储的异地端**：如果备份目标本身不可信，先 `rclone crypt` 加密再上传
- **版本策略**：按你的数据变化速度调整保留天数，照片和代码的节奏不一样
- **多目标**：同一份仓库可以推到两处，用 `restic copy` 同步

完整命令清单见 [附录 A 命令速查表](/appendix/appendix-a)。

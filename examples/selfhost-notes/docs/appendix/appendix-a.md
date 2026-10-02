# 附录 A：命令速查表

按用途分组。每条命令后面的一句话说明它**会改动什么** —— 会动数据的命令标了 ⚠️。

## 日常

| 命令 | 作用 |
| --- | --- |
| `docker ps` | 看运行中的容器 |
| `docker ps -a` | 包括已退出的 |
| <span v-pre><code>docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"</code></span> | 自定义列 |
| `docker stats` | 实时 CPU / 内存 / 网络 |
| `docker system df` | 看 Docker 各部分占了多少磁盘 |
| `docker inspect <容器>` | 看完整配置和状态（JSON） |

## 镜像

| 命令 | 作用 |
| --- | --- |
| `docker pull nginx:alpine` | 拉取镜像 |
| `docker images` | 看本地镜像 |
| `docker history <镜像>` | 看分层，确认体积来源 |
| `docker image prune` | ⚠️ 删掉未被使用的镜像 |
| `docker image prune -a` | ⚠️ 删掉所有没容器在用的镜像 |

## 容器

| 命令 | 作用 |
| --- | --- |
| `docker run -d --name web -p 8080:80 --restart unless-stopped nginx:alpine` | 后台跑一个容器 |
| `docker exec -it web sh` | 进容器交互终端 |
| `docker logs -f --tail=100 web` | 跟日志 |
| `docker restart web` | 重启容器（配置不变） |
| `docker stop web && docker rm web` | ⚠️ 停止并删除容器 |
| `docker commit web myimage:bak` | ⚠️ 把当前可写层存成新镜像 |
| `docker rename old new` | 改容器名 |
| `docker update --memory=1g web` | 在线改资源限制 |

## Compose

| 命令 | 作用 |
| --- | --- |
| `docker compose up -d` | 按文件创建并启动 |
| `docker compose ps` | 看项目内服务状态 |
| `docker compose logs -f <服务>` | 跟某个服务的日志 |
| `docker compose up -d --force-recreate` | ⚠️ 重建容器 |
| `docker compose restart <服务>` | 重启单个服务 |
| `docker compose down` | ⚠️ 停止并删容器（**保留卷**） |
| `docker compose down -v` | ⚠️ 连命名卷一起删，数据无法恢复 |
| `docker compose config` | 展开变量后的最终配置 |
| `docker compose pull` | 拉取最新镜像 |
| `docker compose exec <服务> sh` | 进某个服务的容器 |

## 网络

| 命令 | 作用 |
| --- | --- |
| `docker network ls` | 列出网络 |
| `docker network create <名>` | 创建网络 |
| `docker network inspect <名>` | 看接在上面的容器和 IP |
| `docker network connect <网> <容器>` | 把容器接入网络 |
| `docker network disconnect <网> <容器>` | 断开 |

## 存储

| 命令 | 作用 |
| --- | --- |
| `docker volume ls` | 列出卷 |
| `docker volume create <名>` | 创建卷 |
| `docker volume inspect <名>` | 看卷的真实路径 |
| `docker run --rm -v <卷>:/data -v $PWD:/backup alpine tar czf /backup/vol.tgz -C /data .` | ⚠️ 打包备份一个卷 |
| `docker run --rm -v <卷>:/data alpine ls -la /data` | 看卷里有什么 |

::: warning 备份卷时容器必须停下
上面那条 `tar` 会读到不一致的中间状态。正确顺序是 `docker compose stop` → 打包 → `docker compose start`。
:::

## 清理

| 命令 | 作用 |
| --- | --- |
| `docker system prune` | ⚠️ 清理未使用的容器、网络、镜像、构建缓存 |
| `docker system prune -a --volumes` | ⚠️ 连未使用的卷一起删 |
| `docker builder prune` | ⚠️ 只清构建缓存 |
| `journalctl --vacuum-time=7d` | 清理系统日志 |

## 诊断

| 命令 | 作用 |
| --- | --- |
| `docker logs --tail=50 <容器>` | 90% 的问题在这里 |
| <span v-pre><code>docker inspect -f '{{.State.ExitCode}}' &lt;容器&gt;</code></span> | 看退出码 |
| <span v-pre><code>docker inspect -f '{{.State.Health.Status}}' &lt;容器&gt;</code></span> | 看健康检查状态 |
| `docker events` | 实时看容器事件 |
| `docker diff <容器>` | 看容器改了哪些文件 |
| `ss -lntp` | 查端口被谁占用（**在宿主机上查**） |
| `df -h` / `df -i` | 查空间 / inode |
| `free -h` | 查内存 |
| `dmesg -T \| tail -50` | 看内核日志，排查 OOM |

## 退出码含义

| 退出码 | 含义 | 通常原因 |
| :-: | --- | --- |
| 0 | 正常退出 | 任务跑完了；不是故障，但你可能没给它 `command` |
| 1 | 通用错误 | 配置错误、依赖缺失 —— 去看日志 |
| 125 | Docker 守护进程报错 | Docker 本身的问题 |
| 126 | 找不到可执行文件 | 镜像架构不匹配，或入口命令写错 |
| 127 | 命令找不到 | 镜像里没装你指定的工具 |
| 137 | 被 SIGKILL | 内存超限（OOM） |

## 备份（restic）

| 命令 | 作用 |
| --- | --- |
| `restic init` | 初始化仓库（只做一次） |
| `restic backup ~/data --dry-run` | 试跑，不实际写入 |
| `restic backup ~/data` | 执行备份 |
| `restic snapshots` | 列出所有快照 |
| `restic check` | 校验仓库结构 |
| `restic check --read-data-subset=5%` | 抽查 5% 数据块 |
| `restic restore latest --target /tmp/restore-test` | ⚠️ 恢复到临时目录做验证 |
| `restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6` | 删除旧快照索引 |
| `restic prune` | ⚠️ 真正释放空间 |

## 一个够用的排查顺序

遇到任何问题，按这个顺序走，不要跳步：

```bash
docker compose ps -a                              # 1. 状态和退出码
docker compose logs --tail=50 <服务>               # 2. 最后 50 行日志
docker compose config --quiet && echo "配置 OK"     # 3. 配置能否解析
ss -lntp | grep <端口>                            # 4. 端口是否被占
docker stats --no-stream                          # 5. 资源是否耗尽
df -h && df -i                                    # 6. 空间和 inode
dmesg -T | tail -50                               # 7. 内核层错误（OOM 等）
```

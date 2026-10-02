# 第1章 装 Docker 引擎

> 目标：在这台机器上装好 Docker，拉一个镜像，跑通一个能访问的容器。全程 20 分钟。

## 1. 先确认前置条件

Docker 需要 64 位系统和较新的内核。装之前先看一眼，不合适就别硬装。

```bash
# 确认架构和内核版本
uname -m
uname -r

# 确认磁盘和内存
df -h /
free -h
```

`uname -m` 输出 `x86_64` 或 `aarch64` 都可以；`uname -r` 建议 4.18 以上，太老的内核装上后网络功能会异常。

| 资源 | 最低 | 建议 |
| --- | --- | --- |
| 内存 | 1 GB | 4 GB 以上 |
| 磁盘 | 5 GB | 20 GB 以上 |
| 架构 | x86_64 / aarch64 | — |

## 2. 卸载旧版本

如果这台机器上装过 Docker，先清干净，避免残留的 `docker.list` 让新安装找不到源。

```bash
sudo apt-get remove -y docker docker-engine docker.io containerd runc
sudo rm -rf /var/lib/docker /var/lib/containerd
```

::: warning 这一步会删掉所有容器和镜像
如果你已经在这台机器上跑过服务，先确认数据在容器外（用了卷或挂载）。卷和宿主目录不会被删，但容器内的数据会全部消失。
:::

## 3. 安装

以 Debian / Ubuntu 为例。

```bash
# 准备 HTTPS 传输工具和官方签名密钥
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 添加仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装引擎
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

装完顺手把你的用户加进 `docker` 组，这样日常就不用每次 `sudo`：

```bash
sudo usermod -aG docker $USER
newgrp docker
```

::: danger 权限提示
`docker` 组成员等价于 root —— 因为能操作 Docker 就等于能以 root 身份在宿主机上执行任何命令。只把你自己加进去，不要加到会让其他人登录的组里。
:::

## 4. 验证装好了

三条命令，缺一条都不算成功。

```bash
# 1) 客户端和守护进程都在
docker version

# 2) 网络能到官方仓库
docker run --rm hello-world

# 3) Compose 插件可用
docker compose version
```

`docker version` 的输出里，Server 部分必须有版本号。如果只显示 Client 而 Server 报错，说明守护进程没起来：

```bash
sudo systemctl status docker
sudo systemctl enable --now docker
```

## 5. 跑通第一个真正有用的容器

`hello-world` 只能证明网络通。跑一个带端口、能从浏览器访问的服务，才算链路完整。

```bash
# 拉取并后台运行，映射宿主机 8080 到容器 80
docker run -d --name first-app --restart unless-stopped -p 8080:80 nginx:alpine

# 看它是否在跑
docker ps

# 从本机访问
curl -I http://localhost:8080
```

浏览器打开 `http://<你的内网IP>:8080`，看到 Nginx 欢迎页就说明端口映射通了。

| 命令 | 作用 |
| --- | --- |
| `docker run -d` | 后台运行 |
| `--name first-app` | 给容器起名，之后不用记容器 ID |
| `--restart unless-stopped` | 守护进程重启或机器重启后自动拉起 |
| `-p 8080:80` | 宿主机 8080 → 容器 80 |

## 6. 镜像体积和拉取速度

国内机器直连 Docker Hub 经常超时。两个办法：

```bash
# 临时：给单次拉取指定镜像加速地址
docker pull docker.m.daocloud.io/library/nginx:alpine
docker tag docker.m.daocloud.io/library/nginx:alpine nginx:alpine
```

或者给守护进程配全局镜像加速。在 `/etc/docker/daemon.json` 里写入你找到的可用地址，然后重启：

```json
{
  "registry-mirrors": ["https://<你的加速地址>"]
}
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
docker info | grep -A2 "Registry Mirrors"
```

::: tip 什么时候需要配加速
`docker pull` 卡在 `pulling from` 超过 30 秒，或报 `i/o timeout`，再配。默认能拉通就不必动。
:::

## 7. 容器跑完之后

用完记得清掉，别让测试容器长期占着：

```bash
docker rm -f first-app
docker image rm hello-world
docker system df        # 看占了多少磁盘
docker system prune     # 清理未使用的镜像、网络、构建缓存
```

`docker system prune` 会删掉所有**未被使用**的镜像和缓存。如果有容器是停着的，它的镜像仍算「在用」，不会被删。执行前先 `docker system df` 看一眼清单。

## 8. 常见问题

**Q1：`permission denied while trying to connect to the Docker daemon socket`？**
用户不在 `docker` 组。执行 `sudo usermod -aG docker $USER` 后必须**重新登录**，`newgrp docker` 只对当前 shell 有效，重开终端就没了。

**Q2：容器状态显示 `Exited (1)`？**

```bash
docker logs first-app
```
容器挂了以后 `docker ps` 看不到，要加 `-a`：

```bash
docker ps -a
```

**Q3：`-p 8080:80` 报 `port is already allocated`？**

```bash
ss -lntp | grep 8080    # 看谁占着
```
换端口，或停掉占用的进程。注意这个检查是**在宿主机上查**，不是在容器里查。

**Q4：`docker compose` 提示找不到命令？**
插件没装。执行 `sudo apt-get install -y docker-compose-plugin`。注意是 `docker compose`（有空格），不是旧版的 `docker-compose`。

**Q5：镜像能拉，容器却一直 `Restarting`？**
基本是配置问题而不是网络问题。先 `docker logs` 看最后几行报错，再对照 [第2章 常见故障](/start/chapter2#_6-常见故障) 里的排查顺序。

## 跑完之后

你现在有了一个能拉镜像、能映射端口、能在重启后自启的环境。

下一步是把服务从「一条命令跑起来」变成「一份文件管起来」——继续 [第2章 用 Compose 管服务](/start/chapter2)。

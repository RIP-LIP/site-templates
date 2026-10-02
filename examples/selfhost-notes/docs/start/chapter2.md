# 第2章 用 Compose 管服务

> 目标：把散落在命令行里的服务收进一份 `compose.yaml`，从此启动、更新、查看状态都有同一个入口。

## 1. 为什么不用 docker run

先看用 `docker run` 管三个服务要写多少东西：

```bash
docker run -d --name web --restart unless-stopped -p 8080:80 nginx:alpine
docker run -d --name db --restart unless-stopped -e POSTGRES_PASSWORD=xxx \
  -v pgdata:/var/lib/postgresql/data postgres:16
docker run -d --name backup --restart unless-stopped --volumes-from db \
  -v /mnt/nas:/backup alpine
```

问题不在命令长，在于**这些信息只存在于你的记忆里**。换台机器要重新想，某个服务挂了下次重启忘了加 `--restart`，参数写错了也没法对比。

Compose 把它们变成一个可以提交、可以 diff 的文件：

```yaml
services:
  web:
    image: nginx:alpine
    restart: unless-stopped
    ports: ["8080:80"]
```

## 2. 一份最小可用的 compose.yaml

在项目目录下建 `compose.yaml`：

```yaml
name: my-stack

services:
  web:
    image: nginx:alpine
    container_name: web
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro   # 冒号后的 ro 表示容器内只读
    networks:
      - front

  db:
    image: postgres:16
    container_name: db
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}   # 从同目录 .env 读，不要写死在文件里
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data    # 命名卷，路径由 Docker 管
    networks:
      - back
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:

networks:
  front:
  back:
```

同目录建 `.env`，放密码：

```dotenv
DB_PASSWORD=换成你自己的
```

::: warning .env 不要提交到 Git
在 `.gitignore` 里加一行 `.env`。Compose 的变量插值只在**同目录**生效，文件别放错位置。
:::

## 3. 四个必会命令

```bash
docker compose up -d            # 按文件创建并启动（不存在才创建）
docker compose ps               # 看状态
docker compose logs -f web      # 跟日志
docker compose down             # 停止并删除容器
```

注意 `down` **不删命名卷**（数据还在），要连数据一起删必须显式加 `-v`。这个设计是故意的：默认不毁数据。

| 场景 | 命令 |
| --- | --- |
| 首次启动 | `docker compose up -d` |
| 改完配置后应用 | `docker compose up -d` |
| 换了镜像要重建 | `docker compose up -d --force-recreate` |
| 看端口和状态 | `docker compose ps` |
| 只重启一个服务 | `docker compose restart web` |
| 停止并清理 | `docker compose down` |
| 停止并**连数据**清理 | `docker compose down -v` |

## 4. 卷和挂载怎么选

两种写法看起来相似，实际差别很大，选错了后面很难查。

| 写法 | 数据存在哪 | 适合 |
| --- | --- | --- |
| 命名卷 `pgdata:/var/lib/...` | Docker 管的目录，路径不在你眼前 | 数据库、任何需要备份的持久数据 |
| 宿主机路径 `./data:/var/lib/...` | 你指定的目录 | 配置文件、日志、需要用编辑器直接改的东西 |
| `:ro` 只读挂载 | 同上，容器内不可写 | 前端静态文件、证书 |

**为什么数据库优先用命名卷**：命名卷的路径在 Docker 内部管理，跨机器迁移时你只需要把卷打包带走；用宿主机路径则要保证那台机器上目录结构完全一致。

## 5. 更新一个服务

这是自托管最高频的日常操作，固定成四步，不要跳步。

```bash
# 1) 拉新镜像
docker compose pull web

# 2) 重建容器（数据卷不受影响）
docker compose up -d --force-recreate web

# 3) 确认起来了
docker compose ps
docker compose logs --tail=50 web

# 4) 顺手清理旧镜像
docker image prune -f
```

升级前先看一眼这个版本改了什么，以及有没有数据库迁移。有迁移的，**先备份再升**。

## 6. 常见故障

### 容器起不来

按这个顺序查，不要跳步：

```bash
# 1) 状态和退出码
docker compose ps -a

# 2) 最后 50 行日志（90% 的原因在这里）
docker compose logs --tail=50 <服务名>

# 3) 配置本身有没有解析错
docker compose config --quiet && echo "配置 OK"

# 4) 端口是否被占
ss -lntp | grep <端口>
```

`Exited (1)` 一般是配置或依赖问题；`Exited (137)` 是被强制杀掉，通常是内存不够（OOM）；`Exited (0)` 反而要警惕——可能是任务跑完就正常退出了，而你没给它 `command`。

### 磁盘写满

```bash
df -h                        # 看哪个分区满了
docker system df             # 看 Docker 占了多少
du -sh /var/lib/docker/*     # 定位大头
```

最常见的是**日志文件**。给服务加日志上限，比定期手删可靠：

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

### 权限拒绝（permission denied）

容器里的进程用的往往是别的 UID，写宿主目录就会失败。两种解法：

```yaml
# 办法一：明确指定容器内用户
user: "1000:1000"

# 办法二：让容器自己改（不推荐，多数镜像没实现）
privileged: true     # 危险：等于关掉了隔离
```

优先用办法一。只有在明确知道风险、且服务确实需要访问设备时才考虑 `privileged`。

### 服务之间连不上

```bash
# 1) 两个服务必须在同一个 network 上
docker compose config | grep -A3 networks

# 2) 容器间用服务名互相访问，不用 IP
#    ✅ http://db:5432
#    ❌ http://172.18.0.3:5432
```

容器重建后 IP 会变，写死 IP 的配置必然在某天失效。这是自托管最常见的「昨天还好好的」。

## 7. 把文件管起来

一份 `compose.yaml` 值得放进 Git，密码除外：

```gitignore
.env
*.log
backup/
```

放进版本库的好处很直接：你能看出**什么时候改了什么配置**，出问题时能回退到上一个能跑的版本。这比任何备份策略都管用。

## 跑完之后

你现在有了：一份声明式配置、四个必会命令、一套固定的更新流程、一张排查顺序表。

接下来可以挑一个真实场景开始做：[自动备份到异地](/lab/backup)。那是这份文档里唯一一篇「按你遇到什么麻烦组织」的文章。

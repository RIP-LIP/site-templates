# 01 · 搭建与本地运行

## 环境要求

| 项 | 最低 | 说明 |
| --- | --- | --- |
| Node.js | 18+ | 装了 Node 20+ 更稳 |
| npm | 9+ | 随 Node 附带 |
| 磁盘 | 1 GB | 依赖 + 构建缓存 |

验证：

```bash
node -v
npm -v
```

## 安装与运行

```bash
# 在项目根目录（package.json 所在处）执行
npm install

# 开发服务器，默认 http://localhost:5173
npm run dev

# 生产构建，产物在 docs/.vitepress/dist
npm run build

# 本地预览构建结果
npm run preview
```

## 目录约定

一个容易踩的点：**VitePress 的源码根是 `docs/`，但 package.json 在项目根**。所有脚本都要带上 `docs` 参数：

```json
"dev": "vitepress dev docs"
```

如果你把 `package.json` 放进 `docs/` 内部（`vitepress init` 的默认行为），脚本里就不要带 `docs`。两种布局二选一，别混。

本模板采用**布局 A**（package.json 在根，源码在 `docs/`），因为这样 `GUIDES/` 和 `docs/` 能平级存在，说明文档不会被构建进去。

## 首次运行前要改的配置

打开 `docs/.vitepress/config.mts`，把带 `TODO` 注释的项填掉。最少要改这三处，否则站点能用但很怪：

| 配置项 | 不改的后果 |
| --- | --- |
| `title` | 浏览器标签页显示 VitePress 默认名 |
| `description` | 搜索引擎结果里没有描述 |
| `footer.copyright` | 页脚显示占位文字 |

其他项可以先不动，跑起来之后再逐步填。

## 常见问题

**构建报 `Error parsing JavaScript expression: Unexpected token (1:1)`？**

页面里有 `{{ }}` 被 Vue 当成插值解析了。多半是写了 Docker / Go template / Jinja / Handlebars 命令。修法见 `GUIDES/04` 的「模板语法」一节。

**改完配置页面没变？**

重启 dev server。`config.mts` 的热更新在某些版本上不完整。

**`npm run dev` 端口被占用？**

```bash
npm run dev -- --port 5180
```

**构建产物里找不到 `index.html`？**

VitePress 会把 `docs/index.md` 输出为 `dist/index.html`，这是正常的。`cleanUrls: false` 时其他页面输出为 `xxx.html` 而不是 `xxx/index.html`。

## 清理

```bash
# 删构建产物和缓存
rm -rf docs/.vitepress/dist docs/.vitepress/cache

# 重装依赖
rm -rf node_modules && npm install
```

`dist/` 和 `cache/` 已在 `.gitignore` 里，不需要手动处理。

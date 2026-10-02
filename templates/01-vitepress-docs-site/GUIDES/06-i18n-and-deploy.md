# 06 · 多语言与部署

## 一、部署到 GitHub Pages

### 方式 A：GitHub Actions（推荐）

新建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

然后在仓库 **Settings → Pages** 里把 Source 选成 **GitHub Actions**。

**关键：部署到项目页时，`config.mts` 的 `base` 必须是 `/仓库名/`**：

```ts
base: '/my-docs-repo/',
```

不改 `base` 的症状：首页能开，**点任何链接都是 404**，或静态资源全部加载失败。

### 方式 B：subtree 推送

```bash
npm run build
git add -A && git commit -m "build"
git subtree push --prefix docs/.vitepress/dist origin gh-pages
```

需要先建 `gh-pages` 分支。`base` 同样要改。

### 方式 C：Vercel / Netlify

- 框架预设选 VitePress
- 构建命令 `npm run build`
- 输出目录 `docs/.vitepress/dist`
- 域名根路径部署时 `base` 保持 `/`

---

## 二、部署后必查

| 检查项 | 怎么查 | 出问题的原因 |
| --- | --- | --- |
| 首页能开 | 打开根路径 | `base` 配错 |
| 链接不 404 | 点任意章节 | `base` 配错 |
| 图片显示 | 看有无裂图 | 用了绝对路径 `/xxx.png` 而非相对 |
| 搜索能用 | 搜一个词 | 本地索引正常；Algolia 需检查 key |
| 深色模式 | 切一次 | CSS 变量未定义 `--vp-c-brand-2/3` |
| 手机端 | 缩窄窗口 | 表格未加 `overflow-x` |

---

## 三、搜索引擎相关

VitePress 默认输出静态 HTML，搜索引擎能正常抓取。两件可选的事：

### 加站点地图

```bash
npm i -D vitepress-plugin-sitemap
```

```ts
import { defineConfig } from 'vitepress'
import { sitemap } from 'vitepress-plugin-sitemap'

export default defineConfig({
  // ...
  vite: { plugins: [sitemap()] },
})
```

**注意：sitemap 里的 URL 来自 `base` + `site` 配置。** 如果没配 `site` 字段，生成的会是默认域名，需要显式指定：

```ts
sitemap({ hostname: 'https://your-domain.com' })
```

### Open Graph

```ts
head: [
  ['link', { rel: 'icon', href: '/logo.svg' }],
  ['meta', { property: 'og:title', content: '你的站点名' }],
  ['meta', { property: 'og:description', content: '一句话说明' }],
  ['meta', { property: 'og:image', content: '/og.png' }],
]
```

`og:image` 建议 1200×630，放 `docs/public/` 下。

---

## 四、加英文版

VitePress 用 `locales` 做多语言，**目录结构与 locale 一一对应**：

```
docs/
├─ guide/       ← root locale（默认）
├─ howto/
└─ en/
   ├─ guide/
   ├─ howto/
   └─ index.md
```

配置改成：

```ts
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: '中文站名',
      description: '中文描述',
      themeConfig: { /* 中文导航和侧边栏 */ },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'English Title',
      description: 'English description',
      themeConfig: { /* 英文导航和侧边栏 */ },
    },
  },
})
```

### 三条实践建议

1. **别机翻直出。** 英文版先机翻，再母语者校对。术语不一致比翻译不优雅更伤。
2. **中英不要完全对齐章节。** 允许某篇只存在于一种语言，导航里直接不放。
3. **侧边栏两份独立维护。** 写在 `locales` 里，不要抽公共变量强行复用——中英文的分组顺序经常不同。

### 维护成本提醒

双语站的每加一章就是加两页 + 改四处导航（两份侧边栏 + 两份 nav）。**如果不需要面向海外读者，就不要开双语。**

---

## 五、发布到已有平台

如果你要把产物发到 MiniMax 之类的静态托管：

```
路径（上传的目录）：docs/.vitepress/dist
源码根（排除构建目录）：项目根目录
```

`dist/` 在源码根内部时会被自动排除，不用手动处理。上传前扫一遍 `.env` 之类是否被误提交到 Git。

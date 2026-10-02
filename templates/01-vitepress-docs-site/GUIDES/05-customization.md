# 05 · 换肤与扩展

## 一、换配色（最常用）

只改 `docs/.vitepress/theme/custom.css` 顶部这一段：

```css
:root {
  --vp-c-brand-1: #3451b2;   /* 主色 */
  --vp-c-brand-2: #3a5cc9;   /* hover */
  --vp-c-brand-3: #5673d6;   /* 深色模式 */
  --vp-c-brand-soft: rgba(52, 81, 178, 0.14);
}
```

三条要求：

1. **三个值明度递增**，顺序反了 hover 效果会变暗。
2. 深色模式要单独检查：浅色下可读的品牌色，深色下可能太暗。
3. `--vp-c-brand-soft` 是半透明背景，RGB 要和 brand-1 一致。

### 完整可换的变量

| 变量 | 影响范围 |
| --- | --- |
| `--vp-c-brand-1/2/3` | 链接、按钮、强调 |
| `--vp-c-brand-soft` | 半透明底色 |
| `--vp-c-bg / --vp-c-bg-alt` | 页面背景、交替区块 |
| `--vp-c-bg-soft` | 代码块、表格斑马纹 |
| `--vp-c-text-1/2/3` | 正文、次要、禁用文字 |
| `--vp-c-divider` | 分隔线 |
| `--vp-c-indigo-1` | Vite 默认的紫色高亮 |
| `--vp-font-family-base` | 正文字体（中文站建议加 PingFang / 微软雅黑） |

### 中文站字体

```css
:root {
  --vp-font-family-base: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  --vp-font-family-mono: 'JetBrains Mono', Consolas, 'Courier New', monospace;
}
```

---

## 二、换图标

替换 `docs/public/logo.svg`。要求：

- 用 SVG，不用位图（要跟随深色模式变色就用 `currentColor` 或 CSS filter）
- 尺寸约 32×32 viewBox，视觉留白要够
- 顶栏和首页 Hero 会共用它

改完同步更新 `config.mts` 里的 `logo` 路径和 `head` 里的 favicon。

---

## 三、自定义首页

默认首页是 `layout: home`。要做更复杂的首页（自定义 Hero 区域、插画、动画），需要覆盖 Layout：

```ts
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
}
```

```vue
<!-- docs/.vitepress/theme/Layout.vue -->
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-image-before>
      <!-- 插在 Hero 图片前 -->
    </template>
  </Layout>
</template>
```

VitePress 提供了这些插槽可以局部插入，不用整个重写：

| 插槽 | 位置 |
| --- | --- |
| `home-hero-info-before` / `after` | Hero 文字区上下 |
| `home-hero-image-before` / `after` | Hero 图片区上下 |
| `home-features-before` / `after` | 六宫格上下 |
| `nav-bar-content-before` / `after` | 顶栏两侧 |
| `doc-footer-before` | 文档页脚上方 |
| `aside-top` / `aside-bottom` | 右侧大纲区上下 |

**警告**：覆盖 Layout 会与 VitePress 版本升级产生冲突。本模板默认不覆盖，就是为了让你能直接升版本。

---

## 四、加插件

按需安装，装完在 `theme/index.ts` 注册：

```bash
npm i vitepress-plugin-image-viewer
npm i markdown-it-mathjax3
```

```ts
import { h } from 'vue'
import ImageViewer from 'vitepress-plugin-image-viewer'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    ImageViewer(app)
  },
}
```

| 插件 | 用途 | 什么时候需要 |
| --- | --- | --- |
| `vitepress-plugin-image-viewer` | 图片灯箱 | 文档里有大量截图 |
| `markdown-it-mathjax3` | 公式 | 技术文档有数学内容 |
| `vitepress-plugin-tabs` | 标签页 | 同一主题的多个平台版本 |
| `vitepress-plugin-copy-code` | 代码块增强复制 | 默认已有复制按钮，可不装 |

**插件越多，升级 VitePress 越容易冲突。** 遇到渲染异常时先临时禁用插件排查。

---

## 五、常见视觉问题

**深色模式下正文太亮 / 太暗？**

```css
.dark {
  --vp-c-text-1: #e5e7eb;
  --vp-c-text-2: #a1a1aa;
}
```

**表格在窄屏撑破布局？**

已在 `custom.css` 里加了 `overflow-x: auto`。如果还有问题，检查是不是表格被包在了 `display: grid` 容器里。

**代码块横向滚动条总出现？**

```css
.vp-doc div[class*='language-'] {
  font-size: 13px;   /* 缩小字号 */
}
```

**首页 Hero 图太抢眼？**

```css
--vp-home-hero-image-filter: blur(44px);   /* 加大模糊 */
```

---

## 六、不要做的事

| 别做 | 原因 |
| --- | --- |
| 手写 `.VPNavBar`、`.VPSidebar` 这类选择器 | 版本升级时静默失效，且是私有类名 |
| 改 VitePress 自带组件的结构 | 同上，升级必炸 |
| 用 `!important` 覆盖变量 | 掩盖问题，排查成本高 |
| 引入完整 UI 框架 | 和 VitePress 的类名、字号体系冲突 |

**判断标准：所有视觉改动都应该在 `custom.css` 里，且只改 CSS 变量。** 需要更复杂时优先用插槽，不用选择器覆盖。

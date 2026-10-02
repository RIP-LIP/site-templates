# 教程型文档站模板

> 模板编号 `01` · 所属仓库 [site-templates](../..)

VitePress 静态文档站模板。核心是一套**三段式信息架构 + 四类页面骨架**，用于搭建多章节的教程、使用手册和知识库。

> 模板骨架提炼自 [Hello Claw](https://datawhalechina.github.io/hello-claw/cn/)（Datawhale 开源教程站）的构建方式与写作套路。

---

## 适用类型

### ✅ 高度匹配

| 类型 | 为什么匹配 |
| --- | --- |
| **文档站 / 教程站** | 三段式信息架构（上手 / 场景 / 原理）就是为多章节教程设计的 |
| **产品使用手册** | 章节按任务顺序组织，速查表附录满足「边用边查」 |
| **帮助中心 / FAQ 库** | 场景篇按「读者遇到什么麻烦」索引，天然是 FAQ 结构 |
| **内部知识库 / 团队手册** | 一份声明式导航树 + 本地搜索，适合小团队沉淀 |
| **课程 / 学习路径站** | 首页章节总表带状态列，读者能看到进度 |
| **选型与对比类内容站** | 大量横向对照表，表格密度高时排版优势明显 |
| **内部工具的操作手册** | 自托管脚本、内部平台的说明书 |

**共同特征**：内容以**多章节文档**为主体，读者带着「我要做成某件事」的目的来查。

### ⚠️ 需要改造

| 类型 | 需要改什么 |
| --- | --- |
| 双语文档站 | 按 `GUIDES/06` 加 `locales`，建镜像目录树 |
| API 参考文档 | 需引入 `vitepress-plugin-openapi` 自动生成，页面骨架换成参数表 |
| 长文档 / 论文集 | 首页 Hero 可以去掉，正文改成带元数据的文章列表 |
| 带作者页的专栏 | 需自定义 Layout 插槽，见 `GUIDES/05` |

### ❌ 不适合

| 类型 | 原因 |
| --- | --- |
| 营销落地页 | 信息架构完全不同，本模板的多章节侧边栏是负担 |
| 作品集 / 个人主页 | 需要自定义视觉，不是这套排版的强项 |
| 论坛 / 社区 | 需要后端和用户系统，这是纯静态站 |
| 需要登录的应用 | 同上，无后端 |

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 本地预览
npm run dev        # http://localhost:5173

# 3. 构建
npm run build      # 产物在 docs/.vitepress/dist

# 4. 预览构建结果
npm run preview
```

部署到 GitHub Pages：

```bash
npm run build
git add -A && git commit -m "build"
git subtree push --prefix dist origin gh-pages   # 或用 GitHub Actions
```

本模板未内置 CI 配置。若要自动部署，见 `GUIDES/06`。

---

## 使用顺序

按这个顺序读，不要跳：

| 顺序 | 文档 | 什么时候看 |
| --- | --- | --- |
| 1 | [GUIDES/01-setup.md](GUIDES/01-setup.md) | 先把模板跑起来 |
| 2 | [GUIDES/02-architecture.md](GUIDES/02-architecture.md) | 规划你的站点结构和导航 |
| 3 | [GUIDES/03-page-templates.md](GUIDES/03-page-templates.md) | 照着填每一类页面 |
| 4 | [GUIDES/04-writing-rules.md](GUIDES/04-writing-rules.md) | 动笔前读一遍 |
| 5 | [GUIDES/05-customization.md](GUIDES/05-customization.md) | 要改视觉或加功能时 |
| 6 | [GUIDES/06-i18n-and-deploy.md](GUIDES/06-i18n-and-deploy.md) | 上线前 |
| 7 | [GUIDES/07-checklist.md](GUIDES/07-checklist.md) | 发布前逐条核对 |

---

## 目录结构

```
docs-site-template/
├─ README.md                    本文件
├─ GUIDES/                      说明文档（不发布到站点）
│  ├─ 01-setup.md               搭建与本地运行
│  ├─ 02-architecture.md        框架布局与信息架构
│  ├─ 03-page-templates.md      六类页面的结构与内容类型
│  ├─ 04-writing-rules.md       内容写作规范
│  ├─ 05-customization.md       换肤与扩展
│  ├─ 06-i18n-and-deploy.md     多语言与部署
│  └─ 07-checklist.md           发布前检查清单
├─ docs/                        站点源码（发布这一层）
│  ├─ .vitepress/
│  │  ├─ config.mts             站点唯一配置源
│  │  └─ theme/
│  │     ├─ index.ts            主题入口
│  │     └─ custom.css          换肤只改这个文件
│  ├─ public/logo.svg
│  ├─ index.md                  首页
│  ├─ guide/                    上手篇
│  │  ├─ intro.md               概念页
│  │  └─ chapter-1.md           实操页
│  ├─ howto/                    场景篇
│  │  ├─ index.md               场景索引
│  │  └─ scenario-1.md          场景页
│  ├─ internals/                原理篇
│  │  ├─ overview.md            原理总览
│  │  └─ chapter-1.md
│  └─ reference/
│     └─ cheatsheet.md          速查表
└─ package.json
```

**`GUIDES/` 不会发布到站点**，它是你填内容时的说明书；`docs/` 才是发布产物。

---

## 模板里已经填好的 vs 需要你填的

模板不是空壳。每一类页面都提供了：

- **结构骨架** —— 小标题顺序、表格列、提示框位置
- **内容类型标注** —— 每个空位用 `【内容类型：xxx】` 标明该写什么
- **写法示例** —— 每个空位旁有一段示例文字，照着改比从零写快

需要你替换的是所有 `【】` 占位符和示例内容。

---

## 骨架页里的标注怎么读

```markdown
## 1. 【操作步骤标题，用动词开头】
<!-- 类型：步骤标题 -->
【正文里每条命令后面跟一句「你应该看到什么」。】

::: warning 注意
【内容类型：破坏性操作警告。写清会删掉什么、怎么先备份、能不能恢复】
:::
```

- `## 【...】` —— 该位置的结构说明，保留或改写
- `<!-- 类型：xxx -->` —— **该位置应该写什么类型的内容**，这是填写指引
- `【...】` —— 示例文字或占位符，整段替换

详细规则见 `GUIDES/03` 和 `GUIDES/04`。

---

## 许可

MIT。使用、修改、二次分发均可。

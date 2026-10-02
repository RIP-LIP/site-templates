import { defineConfig } from 'vitepress'

/**
 * 自托管手册 —— 文档站配置
 *
 * 模板来源：https://datawhalechina.github.io/hello-claw/cn/
 * 本文件是「站点唯一配置源」：导航、侧边栏、搜索、页脚、编辑链接全部在这里，
 * 页面文件本身不写任何布局信息（除首页用 layout: home）。
 *
 * 如果后续要加英文版，把下面整段放进 locales.en，
 * 并把 locales 整体挪到 locales.root + locales.en 的结构即可：
 *
 *   locales: {
 *     root: { label: '简体中文', lang: 'zh-CN', ...themeConfig },
 *     en:   { label: 'English',   lang: 'en-US', ...themeConfig },
 *   }
 *
 * 目录结构与 locale 目录一一对应：docs/cn/** 对应 /cn/。
 */
export default defineConfig({
  title: '自托管手册',
  description: '把服务搬回自己家里：装得起来、管得住、拆得动',

  // 部署到子路径时改这里，例如 GitHub Pages 项目页是 '/repo-name/'
  base: '/',

  // false → 链接带 .html；true → 链接更干净。GitHub Pages 建议 false
  cleanUrls: false,

  lastUpdated: true,
  appearance: true,

  head: [['link', { rel: 'icon', href: '/logo.svg' }]],

  themeConfig: {
    // 只放图标，不重复显示站名（标题已由首页 Hero 承担）
    logo: '/logo.svg',
    siteTitle: false,

    nav: [
      { text: '装起来', link: '/intro' },
      { text: '场景', link: '/lab/backup', activeMatch: '^/lab/' },
      { text: '拆原理', link: '/build/chapter1' },
      { text: '速查表', link: '/appendix/appendix-a' },
    ],

    // 右侧大纲：只收 h2/h3，标题写成「目录」
    outline: {
      level: [2, 3],
      label: '目录',
    },

    // 本地搜索：不依赖外部服务，构建期就把索引打进去
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关内容',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    // 按路径前缀挂不同侧边栏。键是目录前缀，值是该目录下的完整导航树。
    sidebar: {
      '/start/': [
        {
          text: '装起来（入门篇）',
          items: [
            { text: '写在开头', link: '/intro' },
            {
              text: '📦 装起来',
              collapsed: false,
              items: [
                { text: '第1章 装 Docker 引擎', link: '/start/chapter1' },
                { text: '第2章 用 Compose 管服务', link: '/start/chapter2' },
              ],
            },
          ],
        },
      ],
      '/lab/': [
        {
          text: '场景篇',
          items: [
            { text: '自动备份到异地', link: '/lab/backup' },
          ],
        },
      ],
      '/build/': [
        {
          text: '拆原理（进阶篇）',
          items: [
            { text: '第1章 镜像与容器到底是什么', link: '/build/chapter1' },
          ],
        },
      ],
      '/appendix/': [
        {
          text: '附录',
          items: [
            { text: '附录 A：命令速查表', link: '/appendix/appendix-a' },
          ],
        },
      ],
    },

    // 示例站不关联外部仓库，这两项留空。用到自己的站时替换为真实地址。
    socialLinks: [],
    editLink: false,

    docFooter: { prev: '上一页', next: '下一页' },

    lastUpdatedText: '最后更新',

    footer: {
      message: '本站内容采用 CC BY-NC-SA 4.0 许可协议发布',
      copyright: '自托管手册 · 面向自己的服务',
    },
  },
})

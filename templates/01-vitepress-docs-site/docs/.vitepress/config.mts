import { defineConfig } from 'vitepress'

/**
 * ============================================================================
 * 站点唯一配置源
 * ----------------------------------------------------------------------------
 * 使用说明：
 *   1. 全局搜索替换 `【` 和 `】`，逐项填写。凡是带 TODO 注释的都是必填项。
 *   2. 页面 .md 文件本身不写任何布局信息，导航/侧边栏/页脚全部在这里维护。
 *   3. 改完跑 `npm run build` 验证。
 *
 * 三段式信息架构（模板的核心，可按需增删段落，但建议保留「上手 + 场景 + 原理」三层）：
 *   上手篇 guide/    ──► 写给「我要把东西跑起来」的人，按顺序读
 *   场景篇 howto/     ──► 写给「我遇到了具体麻烦」的人，按需检索
 *   原理篇 internals/ ──► 写给「出故障了想自己查」的人，选读
 *   参考篇 reference/ ──► 写给「现在就要抄」的人，随时查
 * ============================================================================
 */
export default defineConfig({
  // TODO: 替换为你的站点名，用于浏览器标题和搜索结果
  title: '【站点名】',

  // TODO: 一句话说清这个站解决什么问题，会出现在搜索引擎结果里
  description: '【一句话说明这个站解决什么问题】',

  // TODO: 部署到子路径时改这里。
  //   GitHub Pages 项目页： '/仓库名/'
  //   域名根路径：         '/'
  //   Vercel/Netlify：     '/'
  base: '/',

  // 保留 .html 后缀（GitHub Pages / 静态托管最省事）
  // 想用更干净的链接就设 true，但需要服务器支持 URL rewrite
  cleanUrls: false,

  lastUpdated: true,
  appearance: true,

  head: [['link', { rel: 'icon', href: '/logo.svg' }]],

  themeConfig: {
    // 只显示图标，不重复站名（站名已由首页 Hero 承担）
    logo: '/logo.svg',
    siteTitle: false,

    // 顶部主导航：只放 3~5 个一级入口，不放细节
    nav: [
      { text: '【上手篇】', link: '/guide/intro' },
      { text: '【场景篇】', link: '/howto/index', activeMatch: '^/howto/' },
      { text: '【原理篇】', link: '/internals/overview', activeMatch: '^/internals/' },
      { text: '【速查表】', link: '/reference/cheatsheet' },
      // TODO: 需要仓库时取消注释并替换
      // { text: 'GitHub', link: 'https://github.com/【用户名】/【仓库名】' },
    ],

    // 右侧大纲：只收 h2/h3，避免 h4 层级太深
    outline: {
      level: [2, 3],
      label: '目录',
    },

    // 本地搜索：构建期把索引打进产物，不依赖外部服务，无隐私顾虑
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

    // 侧边栏：按「路径前缀」挂不同的导航树
    //   键 = 目录前缀，值 = 该前缀下所有页面的导航结构
    // 纪律：分组标题带 emoji，collapsed 默认 false（展开），
    //       让读者靠图标在长列表里定位，而不是逐行读文字。
    sidebar: {
      '/guide/': [
        {
          text: '【上手篇】',
          items: [
            { text: '写在开头', link: '/guide/intro' },
            {
              text: '📦 【第一阶段】',
              collapsed: false,
              items: [
                { text: '【第1章 页面标题】', link: '/guide/chapter-1' },
                { text: '【第2章 页面标题】', link: '/guide/chapter-2' },
              ],
            },
          ],
        },
      ],
      '/howto/': [
        {
          text: '【场景篇】',
          items: [
            { text: '场景总览', link: '/howto/index' },
            {
              text: '🌅 【场景分组一】',
              collapsed: false,
              items: [
                { text: '【按场景命名的页面】', link: '/howto/scenario-1' },
              ],
            },
          ],
        },
      ],
      '/internals/': [
        {
          text: '【原理篇】',
          items: [
            { text: '总览', link: '/internals/overview' },
            { text: '【第1章 页面标题】', link: '/internals/chapter-1' },
          ],
        },
      ],
      '/reference/': [
        {
          text: '【参考篇】',
          items: [
            { text: '命令速查表', link: '/reference/cheatsheet' },
          ],
        },
      ],
    },

    // TODO: 替换为你的仓库
    socialLinks: [{ icon: 'github', link: 'https://github.com/【用户名】/【仓库名】' }],

    // 页脚「编辑此页」：读者可直接跳到源文件提 PR
    editLink: {
      pattern: 'https://github.com/【用户名】/【仓库名】/edit/main/docs/:path',
      text: '在 GitHub 上修改此页',
    },

    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdatedText: '最后更新',

    footer: {
      // TODO: message 放备案号 / 联系方式 / 版权行
      message: '【备案号或联系方式，可留空字符串】',
      copyright: '【版权声明】',
    },
  },
})

/* ============================================================================
 * 加英文版的方法
 * ----------------------------------------------------------------------------
 * 把上面 themeConfig 的内容包进 locales，目录与 locale 一一对应：
 *
 *   locales: {
 *     root: { label: '简体中文', lang: 'zh-CN', ... },
 *     en: {
 *       label: 'English',
 *       lang: 'en-US',
 *       link: '/en/',
 *       title: '...',
 *       description: '...',
 *       themeConfig: { ...英文版导航与侧边栏... },
 *     },
 *   }
 *
 * 然后按同样的层级建 docs/en/** 目录。
 * 建议：双语站的英文版交给自动化翻译 + 母语者校对，不要机翻直出。
 * ========================================================================== */

/**
 * 主题扩展层 —— 全站唯一需要手写的代码就这两个文件。
 *
 * 设计原则：
 *   · 不覆盖 VitePress 的 Layout / Layout-2 组件，避免与框架升级冲突
 *   · 视觉定制全部走 CSS 变量，换主题 = 改变量值，页面内容零改动
 *   · 如果不需要图片灯箱、公式、代码复制等插件，保持这个文件不动
 */
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme

/**
 * 主题扩展：只做两件事——注入自定义 CSS，保留 VitePress 默认主题全部能力。
 * 不覆盖 Layout / Layout-2，避免与 VitePress 自身升级冲突。
 */
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default DefaultTheme

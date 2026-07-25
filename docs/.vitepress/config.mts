import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: '图层深处',
  description: '记录 GIS 全链路开发、空间算法与 AI × GIS 实践',
  base: '/deep-into-gis/',
  appearance: 'dark',
  cleanUrls: true,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#0c7c66' }]],
  themeConfig: {
    siteTitle: '图层深处',
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' },
      { text: '专题', link: '/topics/' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      '/posts/': [
        {
          text: '开始阅读',
          items: [
            { text: '全部文章', link: '/posts/' },
            { text: '地图投影与坐标转换', link: '/posts/map-projections-and-coordinate-transformations' },
            { text: '地球模型与大地基准', link: '/posts/earth-models-and-geodetic-datums' },
            { text: '空间、位置与坐标', link: '/posts/space-position-and-coordinates' },
            { text: '空间数据如何流过系统', link: '/posts/spatial-data-to-map' },
            { text: 'GIS 系统中的五种责任', link: '/posts/gis-system-responsibilities' },
            { text: '离线处理与在线请求', link: '/posts/offline-vs-online-gis' },
            { text: 'WebGIS 完整链路', link: '/posts/webgis-service-to-browser-rendering' },
            { text: '移动端与车机地图', link: '/posts/mobile-in-car-offline-to-native-gpu' },
            { text: '自动驾驶中的 GIS', link: '/posts/autonomous-driving-gis-map-evolution' },
            { text: '矿区无人驾驶地图平台', link: '/posts/mining-autonomous-driving-map-platform' },
            { text: '理解空间索引', link: '/posts/spatial-index' },
            { text: 'AI × GIS 从哪里开始', link: '/posts/ai-gis-start' }
          ]
        }
      ],
      '/topics/': [
        {
          text: '专题导航',
          items: [
            { text: '全部专题', link: '/topics/' },
            { text: 'GIS 核心概念', link: '/topics/gis-core-concepts' },
            { text: 'GIS 全链路', link: '/topics/gis-full-stack' },
            { text: 'AI × GIS', link: '/topics/ai-gis' },
            { text: 'GIS 行业图谱', link: '/topics/gis-industry' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/nitiandadi/deep-into-gis' }
    ],
    search: { provider: 'local' },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新于' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    footer: {
      message: '探索空间技术，也记录空间之外。',
      copyright: 'Copyright © 2026 图层深处'
    }
  },
  markdown: {
    lineNumbers: true
  }
})

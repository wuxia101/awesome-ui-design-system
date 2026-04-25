# UI Design System Collection

一个用于收藏优秀设计系统的网站示例，当前支持：

- 设计系统数据独立维护在 `src/data/designSystems.json`
- 可通过 `SOURCE.md` 外部来源补充原始设计系统数据
- 中英文双语切换
- 官网与 GitHub 地址展示
- 标签化展示，例如 `【组件】`、`【Vue】`、`【React】`

更新 README：

```bash
bun run update:readme
```

根据 `SOURCE.md` 抓取补充来源并生成原始数据：

```bash
bun run update:sources
```

<!-- DESIGN_SYSTEMS:START -->
## Collected Design Systems

### Ant Design

- Website: https://ant.design/
- GitHub: https://github.com/ant-design/ant-design
- 中文说明: 蚂蚁集团推出的企业级设计系统，提供完整的设计规范、资源沉淀与高质量 React 组件生态，也覆盖部分 Vue 社区实现。
- English: An enterprise-oriented design system from Ant Group with comprehensive guidelines, design assets, and a mature React component ecosystem, plus related Vue community implementations.
- Tags: `设计系统 / Design System` `组件 / Components` `React / React` `Vue / Vue` `企业级 / Enterprise`

### Element Plus

- Website: https://element-plus.org/
- GitHub: https://github.com/element-plus/element-plus
- 中文说明: 面向 Vue 3 的主流组件库与设计语言，强调开箱即用、组件完整和后台系统开发效率，适合中后台与内容型站点。
- English: A mainstream Vue 3 component library and design language focused on ready-to-use building blocks, broad component coverage, and productivity for admin and content-heavy products.
- Tags: `设计系统 / Design System` `组件 / Components` `Vue / Vue` `后台 / Admin` `开箱即用 / Ready to Use`

### Atlassian Design

- Website: https://atlassian.design/
- GitHub: https://github.com/atlassian
- 中文说明: Atlassian 官方设计系统，为 Jira、Confluence 等产品统一视觉语言、设计原则、内容规范与前端实现模式。
- English: Atlassian's official design system that aligns visual language, principles, content guidance, and implementation patterns across products like Jira and Confluence.
- Tags: `设计系统 / Design System` `规范 / Guidelines` `组件 / Components` `React / React` `产品设计 / Product Design`

### shadcn/ui

- Website: https://ui.shadcn.com/
- GitHub: https://github.com/shadcn-ui/ui
- 中文说明: 建立在 Radix 与 Tailwind 之上的现代组件集合，强调可复制、可组合、可深度定制，适合快速搭建定制化 React 界面。
- English: A modern component collection built on Radix and Tailwind, optimized for copy-paste workflows, composability, and deep customization in React products.
- Tags: `组件 / Components` `React / React` `Tailwind / Tailwind` `可定制 / Customizable` `现代 UI / Modern UI`

### Base Web

- Website: https://baseweb.design/
- GitHub: https://github.com/uber/baseweb
- 中文说明: Uber 推出的 React 设计系统与组件库，强调可扩展主题、完整组件覆盖和适合长期演进的产品基础设施。
- English: Uber's React design system and component library focused on scalable theming, broad component coverage, and a durable foundation for evolving products.
- Tags: `设计系统 / Design System` `组件 / Components` `React / React` `主题 / Theming` `企业级 / Enterprise`

### Blueprint

- Website: https://blueprintjs.com/
- GitHub: https://github.com/palantir/blueprint
- 中文说明: Palantir 的 React UI 工具包，适合数据密集型桌面风格应用，常用于后台、分析和复杂交互场景。
- English: Palantir's React UI toolkit for data-dense, desktop-style applications, commonly used in admin, analytics, and complex interaction scenarios.
- Tags: `组件 / Components` `React / React` `后台 / Admin` `数据密集 / Data Dense`

### Chakra UI

- Website: https://chakra-ui.com/
- GitHub: https://github.com/chakra-ui/chakra-ui
- 中文说明: 强调可访问性、主题定制和开发体验的 React 组件系统，适合快速构建现代产品界面。
- English: A React component system focused on accessibility, theming, and developer experience for building modern product interfaces quickly.
- Tags: `组件 / Components` `React / React` `可访问性 / Accessibility` `主题 / Theming`

### Carbon Design System

- Website: https://carbondesignsystem.com/
- GitHub: https://github.com/carbon-design-system/carbon
- 中文说明: IBM 的设计系统，覆盖设计原则、开发资源与跨产品组件库，适合大型组织统一设计语言。
- English: IBM's design system spanning principles, development resources, and shared components for large organizations with a unified design language.
- Tags: `设计系统 / Design System` `组件 / Components` `React / React` `企业级 / Enterprise`

### Fluent UI

- Website: https://react.fluentui.dev/
- GitHub: https://github.com/microsoft/fluentui
- 中文说明: 微软官方前端设计系统与 React 组件库，强调一致性、无障碍和企业应用集成能力。
- English: Microsoft's official frontend design system and React component library emphasizing consistency, accessibility, and enterprise-ready integration.
- Tags: `设计系统 / Design System` `组件 / Components` `React / React` `可访问性 / Accessibility` `企业级 / Enterprise`

### Grommet

- Website: https://grommet.io/
- GitHub: https://github.com/grommet/grommet
- 中文说明: Grommet 提供设计资源、布局能力与 React 组件，适合从概念验证快速走向完整应用。
- English: Grommet combines design resources, layout primitives, and React components to help teams move from concept to full applications.
- Tags: `设计系统 / Design System` `组件 / Components` `React / React` `布局 / Layout`

### Material UI

- Website: https://mui.com/
- GitHub: https://github.com/mui/material-ui
- 中文说明: 基于 Material Design 的 React 组件库与设计体系，生态成熟，适合快速搭建通用型 Web 应用。
- English: A mature React component library and design system based on Material Design, well suited for building general-purpose web applications quickly.
- Tags: `组件 / Components` `React / React` `Material Design / Material Design` `生态成熟 / Mature Ecosystem`

### Polaris

- Website: https://polaris.shopify.com/
- GitHub: https://github.com/Shopify/polaris
- 中文说明: Shopify 的产品设计系统，围绕商家产品体验建立统一的设计语言、内容规范与组件实现。
- English: Shopify's product design system built to unify design language, content guidance, and component implementation across merchant-facing experiences.
- Tags: `设计系统 / Design System` `组件 / Components` `产品设计 / Product Design` `企业级 / Enterprise`
<!-- DESIGN_SYSTEMS:END -->

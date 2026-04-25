# Agent Maintenance Manual

本项目后续默认由 agent 维护，不再依赖 GitHub Actions 定时同步。

## Maintenance Goal

agent 的目标不是“尽可能多地抓取链接”，而是稳定维护一份可展示、可解释、可扩展的设计系统主数据。

优先级如下：

1. 保持 `src/data/designSystems.json` 质量稳定。
2. 让 `src/data/sourceDesignSystems.json` 持续作为原始候选池存在。
3. 保证页面、README、脚本和数据状态一致。
4. 尽量减少噪声提交、重复条目和低质量来源污染。

## Source Of Truth

- 页面展示数据：`src/data/designSystems.json`
- 原始抓取数据：`src/data/sourceDesignSystems.json`
- 外部来源入口：`SOURCE.md`
- README 生成入口：`scripts/update-readme.ts`
- 原始来源抓取入口：`scripts/update-source-data.ts`

除非用户明确要求，否则不要把 `sourceDesignSystems.json` 直接当作页面数据使用。

## Agent Workflow

当用户要求“更新设计系统数据”“合并来源”“整理列表”“同步文档”时，默认按以下步骤执行：

1. 读取 `SOURCE.md`，确认来源是否新增或调整。
2. 执行 `bun run update:sources`，刷新原始来源数据。
3. 对比 `src/data/sourceDesignSystems.json` 和 `src/data/designSystems.json`。
4. 只将符合主数据规范的条目提升到 `src/data/designSystems.json`。
5. 执行 `bun run update:readme`，同步 README。
6. 如涉及展示层，检查 `src/DesignSystems.tsx` 是否需要同步适配。
7. 执行 `bun run build` 验证最终状态。

## Promotion Rules

只有满足以下条件的来源条目，才应被提升到 `src/data/designSystems.json`：

- 有明确 `title`
- 有可访问的 `website`
- 有可靠的 `github`
- 能补齐 `description.zh`
- 能补齐 `description.en`
- 有 `image`
- 有适合展示的中英双语 `tags`

以下情况默认不要直接提升：

- 与现有主数据重复，仅名称不同
- 官方仓库地址不明确
- 只有 Bitbucket、官网或文档地址，没有可用 GitHub 仓库
- 信息过旧、站点失效或描述无法验证
- 更像资源目录、模板站、营销页，而不是设计系统/组件系统本体

## Dedup Rules

去重时优先按以下顺序判断：

1. `website` 是否等价
2. `title` 是否仅大小写、符号或品牌写法不同
3. 是否与现有主数据语义重叠

例如：

- `ShadCN UI` 与 `shadcn/ui` 视为同一条
- 同一产品的多框架包装页，不应无脑重复收录

## Content Rules

新增主数据时，保持与现有 JSON 风格一致：

- 中文说明一句话清晰解释定位、适用场景和特点
- 英文说明与中文语义一致，不做机器直译腔
- 标签控制在 4 到 5 个，避免堆砌
- 标签要服务于筛选，不是做营销文案
- `image` 目前沿用 `picsum.photos/seed/...` 规则，seed 使用稳定且可读的英文标识

## UI Rules

如需修改展示页：

- 保持中英文切换完整可用
- 搜索、标签筛选、移动端折叠能力不能退化
- 新增字段前，先确认页面是否真的需要展示
- 避免让标签、说明或按钮压过标题层级

## Documentation Rules

每次数据维护后，README 应保持同步。

README 至少需要持续说明：

- 主数据和原始来源数据的职责差异
- `SOURCE.md` 的作用
- 如何执行 `bun run update:sources`
- 如何执行 `bun run update:readme`
- 当前仓库由 agent 维护，而非自动定时任务维护

## Validation Checklist

提交前至少执行：

- `bun run update:sources`
- `bun run update:readme`
- `bun run build`

如果只改了展示层，至少执行：

- `bun run build`

## Commit Rules

- 不要为了“抓到变化”而提交低价值原始数据噪声
- 如果只是来源抓取结果变化，但没有提升到主数据，要在说明里明确这是原始抓取变化
- 若工作区存在用户未说明的改动，先区分是否属于当前任务，再决定是否一起提交
- 不要恢复或覆盖用户已有改动

## Decommissioned Automation

本项目已移除 `.github/workflows/run-script.yml`。

原因：

- 自动定时抓取只能维护原始候选数据
- 主数据整理仍需要 agent 判断
- 自动提交会制造低价值噪声

因此，后续维护入口统一由 agent 执行，而不是定时 workflow。

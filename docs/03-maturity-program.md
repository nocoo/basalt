# 03 · Basalt 生产成熟度执行台账

> 状态：执行中
> 当前切片：S6 待办
> 当前实现真值：`ed883b5`（S5 完成；Codex review 待 Sign-off）
> Kumo 参考：`1159868dfe32` + `https://kumo-ui.com/`
> 最后更新：2026-09-01

本文把 01 的架构目标、02 的实现规则收敛成可恢复的执行台账。01 回答“做成什么样”，02 回答“通用实现顺序”，03 只记录“现在做到哪、下一刀做什么”。已完成阶段的切片契约、文件清单、hash 和测试数字以 git 为准，不在此复述。

## 1. 最终目标与边界

Basalt 最终必须成为可发布、可被 Next/Vite 项目直接引用的统一 React 控件库，并同时提供：实现/类型/测试、与真实能力一致的文档与 example、表单/导航/数据/Dashboard 组合、自有视觉语言、可验证的 tarball 与 6DQ 门。

本轮只改本仓。Basalt 不是 Kumo 兼容层：禁止复制品牌、业务名词和示例语境。

## 2. 调度

| 角色 | 所有权 |
|------|--------|
| Codex | 维护本文、拆切片、只读审查、决定是否进入下一刀 |
| Grok | 只实现当前切片，在 `main` 原子提交 |
| 用户 | 视觉和公开 API 分叉的最终裁决 |

同一时刻只做一个切片。任务包必须写清基线、允许改的范围、必须成立的行为/测试/文档、非目标和停止点。返工不得夹带下一刀。

## 3. 提交与 MVVM

Conventional Commits；一次一个逻辑问题；禁止 `git add -A` / `--no-verify`。实现与测试同提交。Husky 全量必须过；阶段末 coverage 四项不低于 95%。

| 层 | 允许 | 禁止 |
|----|------|------|
| Model | 纯类型与转换 | DOM、React、路由、i18n |
| ViewModel | 组合状态、把页面模型适配为 props | JSX 视觉、包内业务文案 |
| View | 包控件 | 请求、路由、`useTranslation`、顶层 `window` |

受控/非受控必须在 View 边界清楚。业务数据留在应用层。

## 4. 完成判定

示例数量不是成熟度。标题与能力不符、只有 Default、缺 controlled/disabled/error、只在 jsdom 断言、展示站不用包出口，都不能标完成。

## 5. 阶段总表

| 切片 | 内容 | 状态 |
|------|------|------|
| S0 | 示例可信度：去品牌、provenance、scenario 真源 | 完成（`e57579c`） |
| S1 | 包契约、仓外 consumer、coverage/prepublish 门 | 完成（`c525640`） |
| S2 | 类型驱动 docs/API/scenario、视觉纠偏、文档 IA | 完成（`eeb8c43`） |
| S3 | LayerCard、ScrollArea、SegmentControl、PageHeader、StatStrip、ConfirmDialog、TablePager | 完成（`6eed42f`） |
| S4 | Text、Field、Input、InputArea、Checkbox、Radio、Switch | 完成（`5e325a3`） |
| S5 | Select、Combobox、Autocomplete、SensitiveInput、DatePicker | 完成（`ed883b5`） |
| S6 | Overlay、Toolbar、Tabs、CommandPalette、Sidebar/AppShell | 待办 |
| S7 | Table/DataTable、TOC、Code、Flow、Grid、Pagination | 待办 |
| S8 | 图表 kit 与组合层 | 待办 |
| S9 | Blocks、layout examples、全站自消费 | 待办 |
| S10 | 文档补全、审计、release-ready | 待办 |

## 6. 已完成

S0–S5 的公开结果：

- 用户可见示例无 Cloudflare/Kumo/Worker 业务语境；View source 指向本仓，Kumo 只作 provenance。
- 包可仓外 tarball 消费（Vite Tailwind / standalone / Next hydration / heavy optional peers）；coverage 四项 ≥ 95%；prepublish 链存在，尚未正式 publish。
- 组件类型、API 表、example 同源生成，不再三份手写漂移。
- Text / Field / Input / InputArea / Checkbox / Radio / Switch 已有可发布 MVP：size、invalid、controlled、form reset、Group/Legend/error。
- Select / Combobox / Autocomplete / SensitiveInput / DatePicker 已有可发布 MVP：size、invalid、loading、groups、list-only vs freeform、disabled-date、presets、range。Radix Select 保持单选。
- InputGroup 仍浅，留给后续表单补强，不阻塞 S6。

## 7. 下一刀：S6 及之后

每个控件提交仍须带实现、单测、文档和 example。统一验证：default、size、controlled、uncontrolled、disabled、loading、error、description、ReactNode label、form reset、键盘、可访问名称。

**S6 — Overlay 与导航**

共享 portal、z-index、motion、reduced motion、焦点归还。Sidebar 要稳定 Provider contract（controlled/default collapsed、left/right、mobile、resize、peek、loading、slots），不复制 Kumo 整页实现。

**S7 — 数据与内容**

Table 保持语义 primitive；DataTable 轻量 core + 可选 TanStack adapter。必须有 loading/empty/selection/pagination/sort/filter。TOC、Code、Flow 覆盖实际产品场景。

**S8 — 图表**

先 kit（Frame、palette、axis、tooltip、legend、series descriptor），再图形。库组件禁止默认 SAMPLE。

**S9 / S10**

展示站和示例只用包出口。0 placeholder、0 污染、6DQ 与 tarball 门有证据后才 release-ready。

## 8. 控件台账

「复核」表示相对完整，仍未满足最终 consumer/browser/docs 门。

| 家族 | 控件 | 判定 | 阶段 |
|------|------|------|------|
| 基础 | Button、Badge、Banner、Loader、Meter、Dialog | 复核 | S10 |
| 基础 | ClipboardText、Empty、Label、Link、SkeletonLine、Toast | 部分 | S6/S10 |
| 基础 | Text | MVP 完成 | S10 |
| 品牌 | BasaltMark | 单一场景；禁止抄品牌 | S10 |
| 表单 | Field、Input、InputArea、Checkbox、Radio、Switch | MVP 完成 | S10 |
| 表单 | InputGroup | 浅 | 后续 |
| 选择 | Select、Combobox、Autocomplete、SensitiveInput、DatePicker | MVP 完成 | S10 |
| 浮层 | Popover、Dropdown、Collapsible、Tabs、CommandPalette、Tooltip | 部分 | S6 |
| 导航 | Breadcrumbs、Toolbar、Sidebar | 部分；Sidebar 缺 Provider | S6 |
| 数据 | Table、TableOfContents、Pagination | 部分 | S7 |
| 内容 | CodeHighlighted、Flow、Grid、LayerCard | 部分 | S7 |

Charts、Blocks、Docs 分别由 S8/S9/S10 清点。

## 9. 验收

切片证据：unit（默认/主状态/受控/a11y）、typecheck、Biome、全量测试。阶段末加 coverage、build、必要的 browser/consumer。

审查顺序：原子 commit → diff 对契约 → snippet 可解析 → targeted → typecheck/lint/test → 负向扫描（污染词、placeholder、旧 UI import）。通过只更新阶段总表的收口 commit，不把验收数字写回本文。

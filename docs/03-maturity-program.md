# 03 · Basalt 生产成熟度执行台账

> 状态：执行中  
> 当前切片：S1A3a — NodeNext 声明兼容（准备下发）
> 已验收代码基线：`5535b9842bd3`（`main`，工作树干净）
> Kumo 参考：`1159868dfe32` + `https://kumo-ui.com/`  
> 最后更新：2026-08-30

本文把 01 的架构目标、02 的实现规则和 2026-08-30 的差距调查收敛成可恢复的执行台账。01 继续回答“做成什么样”，02 继续回答“通用实现顺序”，03 负责记录“现在只做哪一刀、如何验收、何时解锁下一刀”。

## 1. 最终目标与边界

Basalt 最终必须成为可发布、可被 Next/Vite 项目直接引用、覆盖现有产品绝大多数通用场景的统一 React 控件库，并同时提供：

- 每个公开控件的实现、类型、单元测试、必要的浏览器测试；
- 与真实能力一致的文档、API 表和 example；
- 完整的表单、导航、数据、Dashboard、加载/空态/错误态组合示例；
- Basalt 自己的三层亮度、圆角、密度和图表语言；
- Kumo 级别的模块化、compound API、状态矩阵和文档信息架构；
- 可验证的 npm tarball、Next/Vite consumer 和 Husky/6DQ 发布门。

本轮只修改 `/Users/nocoo/workspace/personal/basalt`。Whiteboard 和其它 personal 项目只读参考，不修改、不顺手迁移。

Basalt 不是 Kumo 兼容层。禁止复制 Kumo/Cloudflare 的品牌、业务名词和示例语境；参考对象只提供组件边界、交互规范、场景清单和实现思路。

## 2. 调度、所有权与并发协议

### 2.1 角色

| 角色 | 所有权 |
|------|--------|
| Codex | 维护本文、拆分切片、通过 Herdr 调度、只读审查代码、独立复跑验收门、决定是否进入下一切片 |
| Grok | 只实现当前收到的切片、补测试、运行门、在 `main` 做原子化提交，不提前做后续切片 |
| 用户 | 视觉和方向最终裁决；遇到会改变公开 API 或视觉精神的分叉时拍板 |

Codex 只直接写 `docs/`。Grok 不修改本文，除非调度消息明确授权。两者都在 `main` 工作，不建功能分支，不使用额外 worktree。

### 2.2 单写者协议

1. 每个切片开始前，Codex 记录基线 commit，并确认工作树干净。
2. Grok 工作期间，Codex不编辑代码、不运行会改写文件的 formatter/build 脚本，只做只读观察。
3. Grok 必须提交当前切片后再报告；不得把未提交工作留给 Codex补完。
4. Codex 检查 commit、diff、测试和门；发现问题时只下发针对该切片的返工，不混入下一阶段。
5. 验收通过后，Codex单独提交本文状态更新，再下发下一切片。
6. 任一时刻只允许一个切片处于“执行中”或“验收中”。

### 2.3 状态

| 状态 | 含义 |
|------|------|
| 待办 | 尚未向 Grok 暴露具体任务 |
| 执行中 | 已下发，Grok 正在实现 |
| 验收中 | Grok 已提交，Codex 正在审查 |
| 完成 | diff、功能和该切片全部门均有证据通过 |
| 阻塞 | 存在需要用户决策或外部状态变化的问题 |

### 2.4 信息节流与任务包

Codex 每次只向 Grok 暴露一个可独立提交、独立验收的任务包。总表负责保留全局方向，不代表 Grok 获得顺手实现后续阶段的授权。

每个任务包必须明确包含：

1. 精确基线 commit、`main` 和干净工作树前置条件；
2. 只需阅读的本文小节、允许修改的文件或目录；
3. 本切片必须成立的行为、测试、文档/example 和 MVVM 条件；
4. 明确的非目标，尤其是不得提前扩展的公开 API、视觉或下一阶段；
5. targeted、typecheck、Biome、全量测试和 Husky 提交要求；
6. 唯一停止点：提交后报告 commit、文件、测试证据和保留缺口，等待 Codex review。

Codex review 发现问题时，只发送当前切片的最小返工包，不夹带下一切片。返工提交通过后，Codex先提交本文验收状态，再下发后续任务。若一个阶段涉及多个独立公开契约，必须继续拆成字母或数字子切片；不得用“同一家族”为理由把多个可独立审查的组件压成一个大提交。

## 3. 原子化提交与 MVVM 硬规则

### 3.1 提交

- Conventional Commits，祈使句，全小写，标题不超过 50 字符。
- 一次提交只解决一个逻辑问题；禁止 `git add -A`。
- 实现与覆盖该实现的测试必须在同一个绿色提交中。
- 文档/example 属于控件完成条件；若体量允许，与控件实现同提交。跨站文档引擎另作原子提交。
- 禁止 `--no-verify`、禁止 amend Codex 的文档提交、禁止把多个阶段压成一个 commit。
- 每次提交前至少运行 targeted test、`bun run typecheck`、`bun run lint`；Husky pre-commit 的全量测试必须通过。
- 阶段末运行 `bun run test:coverage`，不得降低 95% statements/branches/functions/lines 门槛换绿。

### 3.2 MVVM

| 层 | 允许 | 禁止 |
|----|------|------|
| Model | 纯类型、排序/过滤/日期/图表转换函数 | DOM、React、路由、i18n、mock 数据 |
| ViewModel | 控制组合状态、将页面模型适配为控件 props；展示站复杂 demo 可用 `useXxxDemoViewModel` | JSX 视觉细节、包内业务文案 |
| View | `packages/basalt` 控件和展示组件 | 请求、路由判断、`useTranslation`、模块顶层 `window`、写死 sample |

受控/非受控状态必须在 View 边界清楚定义。业务枚举、Kusto、auth、AI Chat、catalog registry、产品 Logo 留在应用层。

## 4. 基线差距

### 4.1 可量化基线

| 项 | 当前值 | 最终条件 |
|----|--------|----------|
| Catalog | 96 项：60 component、24 chart、9 docs、3 block | 每项要么完整实现，要么从公开 catalog 明确移除；禁止 placeholder 冒充出口 |
| Ready 页面 | 84 | 公开项 100% ready |
| Placeholder | 12：9 docs、Maps、ResourceList、DeleteResource | 0 |
| Kumo 重合控件示例 | Basalt 133 / Kumo live registry 321，名义 41.4% | 场景按 Basalt 契约覆盖；不机械复制品牌场景；动态基线注明抓取日期 |
| 测试 | 105 文件、660 tests，全部 jsdom | unit + 高风险 browser + consumer gate |
| 外部消费者 | 0 个真实 `@nocoo/basalt` import | 仓外 Vite Tailwind、Vite standalone、Next consumer 全绿 |
| 包 | `0.0.0`、private、exports 指向 dist；dry-run pack 273 项；NodeNext 声明失败 | types resolver、publint、tarball consumer、prepublish 完整；最终 release-ready |

### 4.2 成熟度不是示例数量

示例计数只作为调查线索。以下任一情况都不能标完成：

- 标题与能力不符，例如 Text “Semantic HTML” 实际始终渲染 `<p>`；
- 用额外 close/icon 示例凑数量，却缺少 Toast action/promise 等关键状态；
- 只有 Default demo，没有 controlled、disabled、loading、error、empty、long-content；
- 只在 jsdom 断言 DOM，没有验证焦点、键盘、portal、resize、scroll、mobile；
- 展示站使用本地旧控件，而不是将被发布的包出口。

## 5. 阶段总表

| 切片 | 内容 | 状态 | 解锁条件 |
|------|------|------|----------|
| S0A | 清理 Kumo/Cloudflare/Worker 用户示例与 fixture | 完成（`0cdbfdc`） | 禁用语境扫描、测试、typecheck、Biome、原子 commit 全绿 |
| S0B | 区分 implementation source 与 provenance，修复链接 | 完成（`703bd31`） | 所有 View source 指向当前 Basalt；参考来源单独展示 |
| S0C | 审计示例标题与真实能力，消除伪对齐 | 完成（`e57579c`） | 示例契约测试覆盖 41 个重合控件，hero 与 code 单一真源 |
| S1A | dist/types/files/exports 包契约 | 执行中（S1A3a 准备下发） | 构建产物可由 Node/TS 解析，根出口不拖入 optional peers |
| S1B | 仓外 Vite/Next tarball consumers | 待办 | A/B/C/D 门不使用 workspace alias 或根 node_modules 泄漏 |
| S1C | publint、prepublishOnly、Husky/browser 门 | 待办 | 一条发布前命令覆盖所有门，仍不实际 publish |
| S2A | 类型驱动的 docs/API/scenario 数据模型 | 待办 | 组件类型、API 表、example 不再三份手写漂移 |
| S2B | 文档页 IA、搜索、分类、成熟度过滤 | 待办 | 不再平铺 88 个等权方块；placeholder 不可达 |
| S3 | 通用组合地基 | 待办 | Panel、ScrollArea、SegmentControl、PageHeader、StatStrip、ConfirmDialog、TablePager 完整 |
| S4 | Text、Field、Input、InputArea、Checkbox、Radio、Switch | 待办 | 表单 Field/Group/Legend/error/size/controlled 场景完整 |
| S5 | Select、Combobox、Autocomplete、SensitiveInput、DatePicker | 待办 | 泛型、group/multiple/loading/error/range + browser 门完整 |
| S6 | Overlay、Toolbar、Tabs、CommandPalette、Sidebar/AppShell | 待办 | compound、焦点、键盘、mobile、resize/scroll 状态完整 |
| S7 | Table/DataTable、TOC、Code、Flow、Grid、Pagination | 待办 | 数据与内容控件覆盖实际产品场景 |
| S8 | 图表 kit 与组合层 | 待办 | series descriptor、tooltip/legend、dual axis、状态、交互完整 |
| S9 | Blocks、layout examples、全站自消费迁移 | 待办 | 展示站和所有示例只用包控件；组合场景完整 |
| S10 | 文档补全、全量审计、release-ready | 待办 | 0 placeholder、0 污染、所有 6DQ 与 tarball 门有证据 |

## 6. 各阶段设计与代码路径

### 6.1 S0 — 先修可信度

#### S0A：参考产品示例清理

只改示例语境和对应断言，不改组件 API、样式或行为。

路径：

- `src/pages/ui/docs.ts`
- `src/pages/ui/demos.tsx`
- `src/pages/ui/HomeGrid.tsx`
- `src/pages/ui/kumo-examples.tsx`
- `src/pages/ui/catalog-ready.tsx`
- `src/test/pages/UiCatalogPages.test.tsx`
- `packages/basalt/src/components/{input-group,table,collapsible}.test.tsx`

中性词汇约定：

- `kumo.workers.dev` → `atlas.example.com`；
- “What is Kumo?” → “How does this project work?”；
- “Kumo is Cloudflare's component library.” → 中性的项目说明；
- “Worker 1/2/3” → “Report 1/2/3” 或 “Project 1/2/3”。

允许保留：部署基础设施中的 Cloudflare、许可证/NOTICE、计划文档中的 Kumo 对照、明确标注的 provenance。

原子提交：`fix: neutralize catalog examples`。

#### S0B：源码与来源

`CatalogDocs` 至少区分：

- `implementationSource`：当前 Basalt 仓库文件；
- `provenance`：可选，包含正确 owner/repo/SHA/文件；
- 用户点击的 View source 默认只能打开 implementation。

禁止继续用 `github.com/nocoo/${repo}` 推断所有 owner。

#### S0C：example 真值

建立机器可读 scenario ID，标题只是展示文本。测试按 ID 检查能力，不按复制来的英文标题检查。Text 在 S4 完成语义 API 前，当前示例只能描述 Sizes/Tones，不能声称 Semantic HTML。

为避免一次混合结构迁移、内容审计和渲染改造，S0C 固定拆成三个原子切片：

1. **S0C1 — scenario ID 契约。** 新增共享 `CatalogScenario` 类型；所有公开 example 携带显式、稳定、与标题无关的 ID；41 个 Kumo 重合 slug 均由测试验证 ID 存在、slug 前缀和全局唯一。页面 anchor / `data-*` 改用 ID。此切片不改标题、代码片段、preview、组件 API 或视觉。
2. **S0C2 — 41 项真值审计。** 按 scenario ID 逐项核对 title、code、render 与当前实现，只修事实错误和不可运行片段；至少消除 Text “Semantic HTML”、Select `<Select />`、Sidebar 多根节点等已知伪对齐。不得借机扩建组件 API；能力缺口留给 S4–S7。S0C2 再按家族分四个独立提交，任何一批不得提前处理下一批：
   - **S0C2a：** Autocomplete、Code、CommandPalette、Flow、Grid、Select、Sidebar、Text；额外审计同模块 CodeBlock。
   - **S0C2b：** Badge、Banner、Breadcrumbs、Button、ClipboardText、BasaltMark、Empty、Label、LayerCard、Link、Loader、Meter、SkeletonLine、Toast、Tooltip。
   - **S0C2c：** Checkbox、Combobox、DatePicker、Input、InputArea、InputGroup、Radio、SensitiveInput、Switch。
   - **S0C2d：** Collapsible、Dialog、DropdownMenu、Pagination、Popover、Table、TableOfContents、Tabs、Toolbar。
3. **S0C3 — hero 单一真源。** 首屏 preview 与对应 code 必须来自同一个 scenario，移除当前独立 `UI_DEMOS` 映射，防止 `Demo`、`docs.usage` 和 scenario 再次漂移。为避免把页面渲染语义和大段旧映射删除混成一次提交，固定拆成两刀：
   - **S0C3a：文档页 hero。** 提供从 `UI_EXAMPLES[slug][0]` 取得 hero scenario 的唯一 helper；`UiPlaceholderPage` 以该 scenario 同时提供首屏 preview 与 code，并用稳定 `data-hero-scenario` 暴露对应 ID。Usage 章节只展示 `docs.usage` 代码，不再拿另一份 preview 假装与它同源。ready 判定必须依赖 docs + hero scenario，而不是 `UI_DEMOS`。此刀保留 `UI_DEMOS` 仅供 HomeGrid 兼容，不删除旧映射。
   - **S0C3b：删除旧映射。** HomeGrid 的非定制 tile 回退到同一 hero helper；保留有明确首页构图目的的 `HOME_DEMOS` override。删除 `BASE_DEMOS`、`UI_DEMOS` 和 `EXTRA_DEMOS` 出口及无用 imports，并加负向契约保证它们不再出现。此刀不重设计 HomeGrid，完整 IA 留给 S2B。

S0C3a、S0C3b 各自一个绿色提交；S0C3b 通过后才把 S0C 标为完成并进入 S1A。

每个编号或字母子切片各自一个绿色提交。S0C1 不得提前做 S0C2/S0C3；S0C2/S0C3 的具体授权文件在前一切片验收后再下发。

### 6.2 S1 — 包与消费契约

重点路径：

- `packages/basalt/package.json`
- `packages/basalt/vite.config.ts`
- `packages/basalt/tsconfig.build.json`
- `packages/basalt/src/index.ts`
- `fixtures/{vite-tailwind,vite-standalone,next19}`
- `scripts/`
- `.husky/`

要求：

- exports 指向 `dist/*.js` 和 `dist/*.d.ts`，显式区分 root/components/providers/charts/styles；
- `files` 只打包 dist、CSS、README、LICENSE、NOTICE 等需要内容；
- root barrel 只含 stable 轻量组件和 provider；charts/DatePicker/DataTable 不得泄漏 optional peers；
- tarball 在仓外临时目录安装，禁止 workspace alias、禁止向上找到本仓 `node_modules`；
- Next consumer 验证 client boundary 和 hydration；两种 Vite consumer 验证 Tailwind 与 standalone CSS；
- 最终加入 publint 和 `prepublishOnly`，但本计划不授权实际 npm publish 或 git tag。

2026-08-30 现场审计：生产源码包含 60 个 component entry、2 个 provider、26 个 chart 和 1 个内部 util。现有 Vite + `tsc` 能生成 JS 与声明，但 `dist` 没有任何 CSS；`npm pack --dry-run --json` 得到 427 个条目，其中 165 个来自 `src`、71 个是测试，另含构建配置，且没有 LICENSE。包仍是 `0.0.0`、`private`、exports 指向源码；三个 fixture 只有模板 package，没有真实依赖或执行脚本。CI 的 `typecheck-command` 仍为 `true`。这些问题分层处理，禁止一刀混合：

1. **S1A1 — 确定性 dist 产物。** 干净执行 package build 时，先更新 standalone CSS，再清空并完整生成 production JS、`.d.ts` 和 source map；只把 `tailwind.css`、其相对依赖 `tokens.css`、`standalone.css` 三个发布样式写入 `dist/styles`，不得带入 `standalone.source.css`、测试或 TS 源码。build 必须自带可执行产物校验：逐个 production entry 对应 JS + `.d.ts`、每个 component chunk 和根入口带 `"use client"`、三份 CSS 存在。此刀不改 exports、`files`、private/version、root barrel、fixture、CI、Husky 或 prepublish。
2. **S1A2 — dist manifest 与 pack 白名单。** exports 改成带 `types`/`import` 的 dist 目标；补 `files`、public publish metadata 和包内许可证，但保留 private，直到 S1C 的完整 `prepublishOnly` 同时落地再解除；版本保持 `0.0.0` 直到 S10 正式发布刀。clean build 后由仓内可执行 `pack:check` 证明 `npm pack --dry-run --json` 只能包含 dist 与批准的 README/LICENSE/package metadata，0 source、0 test、0 build config，且不会落下 tarball；每个公开 export 目标必须存在。不得提前跑仓外 consumer。
3. **S1A3 — resolver 与依赖边界。** 现场实验显示 Bundler 类型消费通过，但 23 个产物声明中的 50 个 extensionless 相对 specifier 会让严格 NodeNext consumer 报 TS2835；Node ESM self-reference 可正确加载 dist，根入口则额外暴露了 01 §6.2 未批准的 AppHeader/AppShell/LoadingScreen 一组名字。为避免把机械声明修复和公开 root surface 变更混在一起，再拆两刀：
   - **S1A3a — NodeNext 声明兼容。** build 在 `tsc` 后确定性修正产物 `.d.ts` 的相对 module specifier 为 `.js`，不改源码 import 或公开 API；dist verifier 必须证明每个相对声明引用都有显式扩展且目标声明/JS 存在。仓内 type fixture 以 `skipLibCheck: false` 分别跑 Bundler 与 NodeNext，覆盖 root、component、provider、chart 和 heavy granular 路径。此刀不动 root barrel、dependencies 或 fixture。
   - **S1A3b — ESM runtime 与 root 边界。** 以 package self-reference 加载 root/component/provider/chart；按 01 §6.2 删除根 barrel 中未批准的 AppHeader、AppMain/AppShell/AppSkipLink、LoadingScreen 导出，但保留其源码与当前 granular 构建；机器验证 root 的递归 ESM 依赖闭包不含 charts/DatePicker/DataTable 和 `recharts`、`react-day-picker`、`@tanstack/react-table`，同时 heavy granular 路径可单独加载。此刀不做仓外安装。

S1A1、S1A2、S1A3a、S1A3b 各自一个绿色提交。只有 S1A3b 验收后才进入 S1B；S1B 再分别落 Vite standalone、Vite Tailwind、Next hydration 和 optional-peer D 门，不能以仓内 alias 或当前 `node_modules` 代替。S1C 必须在同一绿色切片内先装齐发布前门、再解除 private；不得留下无门的可发布中间状态。

### 6.3 S2 — 文档系统

目标是让组件实现、公开类型、API 表、scenario 和测试共享一份契约。具体工具由实现时比较后决定，但最终不能继续由 `docs.props` 手工复制真实 props。

文档站必须使用 `@nocoo/basalt` 出口实现自身界面，包括 Dropdown、Table、Select、Tabs、TOC、Button、Code 等，不能为展示 Basalt 再依赖一套 `src/components/ui` 旧实现。

首页按 Components/Charts/Blocks 分类，支持搜索、stable/catalog 状态和完成度；不再渲染 88 个等权 `aspect-square` tile。

### 6.4 S3 — 可直接提取的通用组合

按一组件一提交推进：

1. Panel/CardShell：统一 L2 surface、padding、ring、header/body/footer、loading/empty。
2. ScrollArea：供 Sidebar、Command、Table、长列表复用。
3. SegmentControl：受控 value、可访问 legend、溢出、All、disabled。
4. PageHeader：title、description、eyebrow、breadcrumbs、actions、responsive。
5. StatStrip：语义 `dl`、responsive、loading。
6. ConfirmDialog/useConfirm：异步 loading、取消、destructive、Promise 结果。
7. TablePager：范围文本、禁用、locale formatter。

主要只读参考：Whiteboard `data/dashboard/src/view`、Meowth ConfirmDialog、Noheir ScrollArea、AI Arsenal PageHeader/StatStrip。

### 6.5 S4/S5 — 表单族

每个控件提交必须同时包含实现、单测、文档和 example。统一验证：default、size、controlled、uncontrolled、disabled、loading、error、description、ReactNode label、form reset、键盘、可访问名称。

- Text：`as`、heading/body/mono、tone、size、bold、truncate 的真实语义和类型约束。
- Field/Input/InputArea：描述与错误 ID、validation object、auto-resize、密码管理器 overlay。
- Checkbox/Radio/Switch：Group/Item/Legend、rich label、card、control position、typed value。
- Select：single/multiple、typed items、groups、disabled item/group、custom rendering、loading、长列表。
- Combobox/Autocomplete：不能再是 `string[]` + alias；定义可解释的共同 core 与不同交互契约。
- DatePicker：保留现有 locale/timezone/min/max/表单优点，增加 multiple/range/presets/disabled-date policy。

### 6.6 S6 — Overlay、导航与 Sidebar

Overlay 使用共享 primitive 保持 portal、z-index、motion、reduced motion、焦点归还一致。Dialog、Popover、Dropdown、Tabs、CommandPalette、Toolbar、Collapsible 都要覆盖 Kumo 的行为矩阵，但用 Basalt API 和文案。

Sidebar 目标不是复制 Kumo 2606 行，而是提供实际项目需要的稳定 contract：Provider、controlled/default collapsed、left/right、mobile ownership、resize、peek、loading、scroll-to-item、header/footer/user slots、导航 Link renderer。产品导航数据和 i18n 留在应用层。

### 6.7 S7 — 数据与内容

- Table 保持语义 primitive；DataTable 提供轻量 core 和可选 TanStack adapter，不继续自建完整表格引擎。
- DataTable 必须有 loading、empty、selection、pagination、column size、sort/filter controlled contract。
- 将展示站内部已有 active TOC 能力提取到包。
- Code 使用可靠高亮器/provider，支持 language、line highlight、line numbers、copy。
- Flow 支持 orientation、parallel、anchor、disabled、large-diagram pan；布局算法放 Model。

### 6.8 S8 — 图表

先做 kit，再做图形：

1. `ChartFrame`、palette、axis、format、tooltip cursor；
2. `ChartSeries[]` descriptor；
3. ChartTooltip、TooltipRow、SeriesLegend；
4. SeriesChart：line/area/bar/pie、horizontal、stack、point color、reference line、click；
5. DualAxisChart；
6. Treemap、Heatmap、Sankey；
7. loading/empty/error、responsive、sidebar resize freeze、aria summary。

库组件禁止默认展示 SAMPLE；sample 只存在于 docs fixture。Whiteboard 的 PageChart、Kusto 和业务 formatter 通过 adapter 隔离，不能进入公共 API。

### 6.9 S9/S10 — 自消费、组合示例与发布审计

至少提供以下完全由包出口组成的 layout example：

- responsive AppShell + Sidebar + Header + mobile Sheet；
- 设置页/复杂表单；
- ResourceList + filters + DataTable + pager；
- Dashboard + StatStrip + charts + legends；
- DeleteResource destructive flow；
- loading、empty、error、long-content；
- light/dark 和窄屏。

迁移 Basalt 展示应用所有通用 UI 到 `@nocoo/basalt`；应用专属导航配置和 ViewModel 可以留在 `src/`。最终审计 `src/components/ui`：可由包替代的文件和 import 必须归零。

9 个 docs 页面、Maps、ResourceList、DeleteResource 必须实现或从公开 catalog 明确移除，不能保留 placeholder。

## 7. 控件成熟度台账

“复核”只表示当前相对完整，仍未满足最终 consumer/browser/docs 门。

| 家族 | 控件 | 当前判定 | 目标阶段 |
|------|------|----------|----------|
| 基础 | Button、Badge、Banner、Loader、Meter、Dialog | 复核 | S2/S10 |
| 基础 | ClipboardText、Empty、Label、Link、SkeletonLine、Toast | 部分 | S3/S4/S6 |
| 基础 | Text | 伪对齐 | S4 |
| 品牌 | BasaltMark | 只有单一场景；禁止复制 Cloudflare 品牌 | S2/S10 |
| 表单 | Input、InputArea、InputGroup、Checkbox、Radio、Switch | API/场景浅 | S4 |
| 选择 | Select、Combobox、Autocomplete、SensitiveInput、DatePicker | 结构性不足 | S5 |
| 浮层 | Popover、Dropdown、Collapsible、Tabs、CommandPalette、Tooltip | 部分 | S6 |
| 导航 | Breadcrumbs、Toolbar、Sidebar | 部分；Sidebar 缺 Provider contract | S6 |
| 数据 | Table、TableOfContents、Pagination | 部分 | S7 |
| 内容 | CodeHighlighted、Flow、Grid、LayerCard | 部分 | S7 |

Basalt 额外公开项同样执行完成门：LinkButton、Separator、ThemeToggle、Field、Slider、Toggle、ToggleGroup、CodeBlock、Avatar、Accordion、AlertDialog、ContextMenu、HoverCard、Sheet、DataTable、NavigationMenu、MenuBar、ThemeProvider、LinkProvider。

24 个 chart、3 个 block、9 个 docs 分别由 S8、S9、S10 全量清点；不能因为不在 Kumo 41 控件内而降低门槛。

## 8. 6DQ 质量计划

| 维 | 每切片证据 | 最终证据 |
|----|------------|----------|
| L1 | 控件 unit：默认、主 variant、disabled/error、受控/非受控、a11y 名称 | 公开包源码 95% 四项 coverage，不降阈值 |
| L2 | 组合/导入/样式契约测试 | 仓外 tarball A/B/C/D：Vite Tailwind、Vite standalone、Next、optional peer |
| L3 | 高风险控件 browser：焦点、键盘、portal、mobile、resize、scroll | 代表性 layout 的 light/dark、desktop/mobile 浏览器 smoke；不以脆弱像素 diff 代替行为断言 |
| G1 | `bun run typecheck`、`bun run lint`、Biome 0 warning | build、types、publint、exports 全绿 |
| G2 | gitleaks staged、无 secrets、依赖边界检查 | osv-scanner、NOTICE/许可证、包内容白名单 |
| Docs | example 与真实能力同步；当前切片相关页完整 | 0 placeholder、0 Kumo/Cloudflare 业务示例、API/scenario 单一真源 |

## 9. Codex 验收模板

每个 Grok 提交按以下顺序审查：

1. `git status --short`、`git log`、`git show --stat`，确认 main、原子提交、无无关文件。
2. 逐行阅读 diff；对照当前切片验收条件，检查 API、MVVM、a11y、SSR 和文档真值。
3. 对每个新增或修改的 usage/code snippet 检查可解析性、完整 import、单一合法 JSX 根和受控状态声明；字符串存在性测试不能替代这一门。
4. 运行 targeted tests。
5. 运行 `bun run typecheck && bun run lint && bun run test`。
6. 阶段末再运行 coverage/build/browser/consumer 门。
7. 用 `rg` 做负向审计，例如污染词、placeholder、旧 UI import、默认 SAMPLE。
8. 通过后把本文切片改为“完成”，记录 commit 和证据；否则给 Grok 单一返工清单。

## 10. 调度与审查日志

| # | 切片 | 基线 | Herdr 目标 | 状态 | Grok commit | 验收证据/备注 |
|---|------|------|--------------|------|-------------|---------------|
| D001 | S0A | `eff624881976` | `w14:p1` | 完成 | `0cdbfdc57af` | 9 个授权文件，+47/−47；targeted 4 files / 123 tests；typecheck、Biome、全量 99 files / 558 tests；禁用语境扫描为空；无 API、样式、行为或 provenance 变更 |
| D002 | S0B | `5e5d806` | `w14:p1` | 完成 | `703bd3115eb` | 6 个授权文件，+447/−80；targeted 2 files / 124 tests；typecheck、Biome、全量 100 files / 569 tests；ready implementation 均指向存在的 `nocoo/basalt@main` 文件，Kumo provenance 指向 `cloudflare/kumo@1159868dfe32`；无 scenario、包契约或组件行为变更 |
| D003 | S0C1 | `4695e60` | `w14:p1` | 完成 | `7c1dccd37ff` + `327e94546cef` | 7 个授权文件，+285/−23；首提交建立 `CatalogScenario`、显式语义 ID、稳定 anchor 与 41 slug 页面契约，review-fix 将 3 个已知错误标题解耦为真实能力 ID 并对全数据集禁止数字下标；targeted 2 files / 163 tests，typecheck、Biome、全量 101 files / 615 tests；title/code/render、顺序、数量、视觉与组件 API 均未变 |
| D004 | S0C2a | `7fa1bb287294` | `w14:p1` | 完成 | `75754d412ad7` + `ce88ff09bea8` | 3 个授权文件；首提交校正 9 个条目的伪标题、空壳/截断 snippet 和 usage，review-fix 补齐 Code/Select/Grid/Flow/Sidebar 的 compound imports 与 CommandPalette 状态声明；targeted 3 files / 176 tests，typecheck、Biome、全量 102 files / 628 tests；scenario ID/数量/顺序、render、组件 API、行为、视觉与 S0C3 数据源均未变 |
| D005 | S0C2b | `a6460bdffa6a` | `w14:p1` | 完成 | `1100e184aa30` | 5 个授权文件，+309/−31；锁定 15 个 slug 的 ID/数量/顺序，修复 Empty/Breadcrumbs/Meter 必填参数、Link/Tooltip provider、Skeleton/Loader 多状态、Toast 触发代码、Banner/LayerCard 与 ClipboardText 中性示例；targeted 2 files / 169 tests，typecheck、Biome、全量 103 files / 637 tests；仅 ClipboardText 假凭据文案同步 render，组件 API、行为与 S0C3 数据源未变 |
| D006 | S0C2c | `5250494cbfcf` | `w14:p1` | 完成 | `306b6683ecbc` | 4 个授权文件，+224/−34；锁定 9 个 slug 的 ID/数量/顺序，对齐 Checkbox/Switch/Input/InputArea/InputGroup/Radio/SensitiveInput 的名称与组合结构，补齐 Combobox items/placeholder 和 DatePicker 可访问 usage；targeted 2 files / 166 tests，typecheck、Biome、全量 104 files / 643 tests；未扩 string-only Combobox、DatePicker range 或 Group/Legend API，留给 S4/S5 |
| D007 | S0C2d | `306b6683ecbc` | `w14:p1` | 完成 | `d7c1f6b5c8b` + `7b37cda26b56` | 首提交 3 个授权文件，+612/−49；review-fix 用 Fragment 修正 `dialog-sizes`、`popover-sides` 多根非法 JSX，并让 `tabs-many-tabs` 的 defaultValue 命中 overview trigger；两轮均独立复跑 targeted 1 file / 9 tests、typecheck、Biome、全量 105 files / 652 tests，Husky 通过；未进入 S0C3 |
| D008 | S0C3a | `e05cd19d727b` | `w14:p1` | 完成 | `2a1e45a5dade` | 3 个授权文件，+62/−17；新增只读 `catalogHeroScenario`，ready 改为 docs + hero，首屏 `data-hero-scenario` 的 preview/code 同源，Usage 改为纯 `docs.usage` 代码；targeted 1 file / 162 tests、typecheck、Biome、全量 105 files / 654 tests、Husky 均独立通过；保留旧映射给 S0C3b |
| D009 | S0C3b | `2a1e45a5dade` + `e837d20c52d9` | `w14:p1` | 完成 | `e57579c592ba` | 4 个授权文件，+33/−113；HomeGrid 非定制 tile 改用 hero helper，删除 `BASE_DEMOS`、`UI_DEMOS`、`EXTRA_DEMOS` 与无用 imports，生产源码负向扫描归零，并以 Accordion 首页交互证明 extra tile 复用首个 scenario；Codex 独立复跑 targeted 1 file / 164 tests、typecheck、Biome、全量 105 files / 656 tests，Husky 通过；未重设计 HomeGrid 或进入 S1 |
| D010 | S1A1 | `19bdeea` + `752e980` | `w14:p1` | 完成 | `9eba6caab1e2` + `8fc87d7a4a2b` | 5 个授权文件；首提交建立 build:css → Vite clean build → declarations → executable verifier，并更新真实 standalone CSS；review-fix 删除 3 个伪空 map。Codex 从不存在的 dist 独立重建并额外验证：90 JS、90 声明、87 个非空且双向引用闭合的真实 map、61 client entry、3 CSS、0 禁用产物；targeted 2 files / 6 tests、typecheck、Biome、全量 105 files / 659 tests、Husky 通过；未进入 manifest/consumer |
| D011 | S1A2 | `8fc87d7a4a2b` + `8d72f233cd9b` | `w14:p1` | 完成 | `edc919c15827` + `5535b9842bd3` | 4 个授权文件；manifest 指向 dist，新增 files/public metadata/包内 MIT LICENSE 与真实 dry-run verifier；review-fix 让 wildcard 从实际 types/import pattern 分别展开并锁定完整 exports shape。Codex 独立验证 273 项 = 270 dist + 3 metadata、5 exact targets、88 wildcard pairs、0 tgz/禁用路径，并在临时副本把 component import 错指 charts 后确认退出 1；targeted 2 files / 7 tests、typecheck、Biome、全量 105 files / 660 tests、Husky 通过；private/0.0.0 保留 |
| D012 | S1A3a | `5535b9842bd3` + 本次调度文档 commit | `w14:p1` | 准备下发 | — | 修正产物声明的 50 个 extensionless 相对引用，以严格 Bundler + NodeNext type fixture 自证；不改源码 import、root surface、依赖或仓外 consumer |

后续日志只追加，不覆盖历史。若 Herdr pane 变化，记录新的明确 pane ID 或唯一 agent name。

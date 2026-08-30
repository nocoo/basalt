# 03 · Basalt 生产成熟度执行台账

> 状态：执行中  
> 当前切片：S1C1f — D024 Timeline 分支覆盖率恢复
> 已验收代码基线：`4c472c87e9e8`（`main`；D023 LayerCard 组合识别覆盖率完成）
> Kumo 参考：`1159868dfe32` + `https://kumo-ui.com/`  
> 最后更新：2026-08-31

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
| 测试 | 110 文件、728 tests，组件测试仍主要为 jsdom；Next consumer 已有真实 Chromium 门 | unit + 高风险 browser + consumer gate |
| Coverage | statements 94.66%、branches 91.12%、functions 93.76%、lines 94.65%，`test:coverage` 红 | 公开包源码四项均不低于 95%，不得改阈值换绿 |
| 外部消费者 | 仓外 Vite Tailwind、Vite standalone、Next build/start/browser hydration tarball 门全绿；optional-peer 待办 | 仓外 Vite Tailwind、Vite standalone、Next consumer、heavy granular consumer 全绿 |
| 包 | `0.0.0`、private；dist/exports、Bundler + NodeNext types、273 项 pack 白名单、A/B/C 门已通过 | publint、optional tarball consumer、prepublish 完整；最终 release-ready |
| Showcase build | Vite production build 通过；单 JS chunk 1,550.44 kB，存在 500 kB warning | S2B/S9 按路由与文档数据拆包，发布审计不得遗留未解释的超限 warning |

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
| S1A | dist/types/files/exports 包契约 | 完成（`62297f2`） | 构建产物可由 Node/TS 解析，根出口不拖入 optional peers |
| S1B | 仓外 Vite/Next/heavy granular tarball consumers | 完成（`054462d`） | A/B/C/D 门不使用 workspace alias 或根 node_modules 泄漏 |
| S1C | coverage、publint、prepublishOnly、Husky/browser 门 | 执行中（S1C1f D024） | 95% 四项 coverage 恢复；一条发布前命令覆盖所有门，仍不实际 publish |
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
   - **S1A3b — ESM runtime 与 root 边界。** 以真实 Node ESM 进程通过 package self-reference 加载 root、`components/button`、`providers/theme`、`charts/donut`、`components/date-picker` 和 `components/data-table`；不得用源码相对 import、Bun resolver 或 workspace alias 代替。按 01 §6.2 只从根 barrel 删除未批准的 AppHeader、AppMain/AppShell/AppSkipLink、LoadingScreen 导出，保留其源码、测试和当前 granular 构建，其余已批准 stable/provider 根导出不得顺手增删。构建后的机器门必须从 `dist/index.js` 递归跟随相对 ESM import/export，证明闭包不进入 `charts/`、`components/date-picker.js`、`components/data-table.js`，也不引用 `recharts`、`react-day-picker`、`@tanstack/react-table`；禁止只扫描根文件一层。Node runtime 同时断言批准的代表性根导出存在、上述五个名字从 root 缺席，而对应 granular/heavy 模块仍可单独加载。允许修改 `packages/basalt/{package.json,src/index.ts,src/index.test.ts,src/build-contract.test.ts,scripts/,type-tests/}` 中与本契约直接相关的文件；不得改依赖版本或分类、其它组件实现、docs/examples、仓外 fixture、S1B consumer、private/version。此刀不做仓外安装。

S1A1、S1A2、S1A3a、S1A3b 各自一个绿色提交。只有 S1A3b 验收后才进入 S1B；S1B 再分别落 Vite standalone、Vite Tailwind、Next hydration 和 optional-peer D 门，不能以仓内 alias 或当前 `node_modules` 代替。S1C 必须在同一绿色切片内先装齐发布前门、再解除 private；不得留下无门的可发布中间状态。

S1B 固定拆成四个依次解锁的绿色切片，公共 runner 只按当前 consumer 的需要演进：

1. **S1B1 — Vite standalone。** 把 `fixtures/vite-standalone` 变成真实消费模板：从 root 同时导入并渲染 Button、ThemeProvider、ThemeToggle、Toast、LinkProvider，只导入 `@nocoo/basalt/styles/standalone`，manifest 明确 React 19、Lucide、Vite、TypeScript 等直接依赖但不写 workspace 或仓库路径。新增一条仓库命令，从 clean Basalt build 开始，将 `npm pack` tarball 直接产到操作系统临时目录，复制 fixture、在临时副本注入 tarball `file:` 依赖、执行真实 npm install 与 production build；临时目录必须位于仓库外，解析到的 Basalt 必须位于该临时 consumer 的 `node_modules`，且不得向上借用本仓 `node_modules`。门还要证明该 consumer 未安装 Tailwind、Recharts、react-day-picker、TanStack Table，构建输出含 JS、standalone CSS 和 Basalt token/控件样式；无论成功失败都清理临时目录与 tarball。runner 的路径/manifest/输出判定要有无网络的 focused unit test。此刀允许改根 `package.json`、`scripts/`、对应测试、`fixtures/{README.md,vite-standalone/**}`；不得改 Basalt package manifest/API、其它 fixture、Husky 或 S1B2。
2. **S1B2 — Vite Tailwind。** 将 S1B1 已验证的 build/pack/temp/copy/inject/install/resolve/typecheck/build/cleanup 流程抽成共享内核，禁止复制第二套 runner；standalone 的命令与全部断言必须继续通过。把 `vite-tailwind` 变成真实 React 19 + Tailwind v4 consumer，同样从 root 导入并渲染五个共用控件，但只导入 `@nocoo/basalt/styles/tailwind`；配置 `@tailwindcss/vite`，其 `@source` 必须相对指向临时 consumer 中已安装 tarball 的 `dist`，不得扫本仓源码或使用 standalone CSS。仓外严格 Bundler typecheck 后执行 production build，机器证明 root 与 Tailwind CSS export 均解析到当前临时 `node_modules`，产物 CSS 包含 Basalt token 和由包内 Button class 生成的规则；允许且必须安装 Tailwind，仍禁止 Recharts、react-day-picker、TanStack Table。提供独立根命令、无网络 focused tests，并在本刀真实运行 standalone 与 Tailwind 两门，证明重构无回归。允许改根 `package.json`、共享 `scripts/` 与测试、`fixtures/{README.md,vite-tailwind/**}`；不得改 Basalt package、standalone fixture 内容、Next/optional fixture、Husky 或 S1B3。
3. **S1B3 — Next + React 19 hydration。** `next19` 指 React 19 consumer，不表示 Next 的 major 版本；本轮固定使用 2026-08-31 npm stable 与上级主要项目一致的 Next `16.3.3`、React/React DOM `19.2.8`。为避免把 tarball/Next 运行契约与新浏览器基础设施压进一个提交，固定拆成两刀：
   - **S1B3a — build/start consumer。** 把 `fixtures/next19` 变成无 `@nocoo/basalt` 预声明的真实 App Router 模板；Server Layout 只负责全局 standalone CSS 和文档骨架，显式 `"use client"` 边界从 root 导入并渲染 Button、ThemeProvider、ThemeToggle、Toast、LinkProvider。复用 A/B 已验证的 build/pack/temp/copy/inject/install/resolve/cleanup 内核，不复制第三套 runner；仓外严格 typecheck、`next build`、冲突安全端口上的真实 `next start` 和 HTTP marker 均须通过，root/CSS 必须解析到该 consumer 的 tarball，Tailwind、Recharts、react-day-picker、TanStack Table 均不得安装。禁止 `suppressHydrationWarning`、忽略 stderr、workspace alias、本仓路径或提前加入浏览器依赖。允许改根 `package.json`、共享 `scripts/` 与测试、`fixtures/{README.md,next19/**}`；不得改 Basalt package/API、Vite fixture、Husky、S1B3b/S1B4。
   - **S1B3b — browser hydration。** 在 S1B3a 的同一真实 Next server 上用可复现的 headless browser 验证首次 hydration、ThemeToggle 和 Button 交互、Toast portal、零 hydration/console/page error；浏览器进程、server、端口和 temp 必须在成功失败时清理。此刀才选择并引入浏览器 runner，且必须提供 focused 负例证明不是过滤 warning 文本过门。不得把通用 Dialog/Combobox/Sidebar browser suite 提前混入；该 suite 留给 S1C/S4–S6。

S1B3b 当前任务包固定如下，不得以更窄的静态断言替代真实浏览器证据：

1. 继续复用 `runConsumerGate` 的 build、pack、仓外 install、resolve、typecheck、Next build/start 和 cleanup 生命周期；同一 Gate C 只启动一次 Next server，HTTP marker 通过后再执行 browser proof，禁止复制第四套 runner 或第二次安装 consumer。
2. 使用 Playwright Chromium 作为根仓测试基础设施，依赖必须精确锁定，浏览器 revision 必须由该版本管理；提供明确的浏览器安装命令和缺失时诊断，禁止静默回退到机器上的任意 Chrome。Playwright 不得进入临时 consumer manifest 或 Basalt package dependencies。
3. `fixtures/next19` 只增加可确定验证的交互：Button 点击产生可观察状态；ThemeToggle 改变根元素的 theme 状态；另一个触发器调用从 root 导入的 `toast`，并由已渲染的 Toast/Toaster 在 `document.body` portal 中显示唯一消息。不得加入业务 UI、路由、Tailwind 或 granular import。
4. 浏览器监听必须在 navigation 前安装，收集所有 `console.error`、未处理 `pageerror` 和 hydration 失败；成功门要求集合为空，不得按文本过滤 React/Next warning，也不得加入 `suppressHydrationWarning`。真实 Chromium 负例必须主动制造 console 或 page error 并证明门失败，单纯测试字符串 helper 不算数。
5. 成功路径至少证明 HTTP 首屏可见、client 已 hydration、Button 状态改变、ThemeToggle 改变 `html` class/data、Toast 消息出现且位于应用根之外。失败路径至少证明 browser context/process、Next 进程、端口、Playwright profile 和整个仓外 temp 均被清理；清理断言不能只依赖 `browser.close()` 没抛错。
6. 允许修改根 `package.json`、`bun.lock`、共享 `scripts/` 与测试、`fixtures/{README.md,next19/**}`；不得修改 `packages/basalt` API/实现、Vite fixture、Husky、本文、S1B4/S1C，或提前建立 Dialog/Combobox/Sidebar browser suite。
7. 提交前运行 browser focused tests、现有 consumer-http/gate 回归、`bun run typecheck`、`bun run lint`、全量测试、真实 `consumer:next`，并复跑 standalone 与 Tailwind。唯一提交建议为 `test: verify next hydration`；提交后报告 commit、浏览器版本、修改文件、各门证据和遗留问题，等待 Codex review。
8. **D017-R1 — Toast DOM 真实性返工。** `9f9555fb3d18` 的门用所有 `body *` 的 `textContent` 寻找 root 外同文案节点，但 Sonner 2.0.8 不创建 portal，且 fixture 把 `<Toast />` 放在 `data-basalt-root` 内；一个 root 外隐藏节点即可让旧判断误报通过。返工必须把 fixture-owned Toaster host 放在应用内容 marker 外，只在该 host 内定位唯一、真实可见的 toast 消息，并对该消息节点同时证明 `document.body.contains(node)` 与 `!root.contains(node)`。新增真实 Chromium 负例：root 内存在可见 toast，而 root 外只有隐藏同文案节点时必须失败；隐藏节点、script 文本或仅匹配宽泛祖先均不得作为 portal/host 证据。仍只允许 D017 的文件范围，不改包 API/实现，不进入 S1B4。
9. **D017-R2 — Toast 身份返工。** `afdcb8091662` 已建立 host 边界，但其自写 `textContent`/盒模型算法会把 host 内任意普通 `<div>basalt-toast-ok</div>` 当作成功；Codex 用真实 Chromium 证明页面中 `data-sonner-toast` 数量为 0 时仍返回 `count: 1`。返工必须要求恰好一个 fixture host、恰好一个真实 `[data-sonner-toast]`，且其 `[data-title]` 的规范化文本精确等于唯一消息；用 Playwright 对真实 toast locator 做有界 visible 等待，再证明该 toast 节点在 body 内且在 app root 外。禁止自行沿祖先盒模型推导可见性，普通文字、部分匹配、重复 toast、隐藏 toast、script 或无 Sonner marker 都必须失败。内部 evidence 不得再宣称 `toastPortal: true`，应准确命名为 outside-root host 证据。保留 R1 负例并新增“host 内普通可见 div、0 Sonner toast”负例；仍不得进入包实现或 S1B4。
4. **S1B4 — optional-peer D。** 以一个新 `fixtures/vite-heavy` 和现有共享 consumer kernel 建立第四扇仓外门，不复制 pack/install/resolve/typecheck/build/cleanup runner。依赖契约沿用 01 §5.3 已拍板的 major：包 manifest 声明 Recharts `^3`、react-day-picker `^10`、TanStack React Table `^9` 为 optional peer；Gate D 以本仓和实际家族已在用的 Recharts `3.10.1`、Gecko react-day-picker `10.0.1`、Pika TanStack Table `9.1.2` 作精确 consumer 版本。当前 DatePicker/DataTable 仍是自实现，Gate D 只证明冻结的 optional-peer metadata、granular 类型/运行时出口与安装隔离；S5/S7 才把实现迁到对应 adapter，不得在本刀重写控件。

   D018 任务包固定如下：

   1. 新 fixture 不预声明 `@nocoo/basalt`、workspace/link/仓库路径；使用 React 19.2.8、standalone CSS 和 Vite production build。源码只能 granular import `DonutChart`、`DatePicker`、`DataTable`，不得从 root 取得这三个名字，也不加入业务 UI。
   2. 复用 `runConsumerGate` 的 build → OS temp → tarball → copy → inject → real npm install → strict Bundler typecheck → production build → cleanup。新增 `consumer:heavy`/`heavy` mode，但不得复制第五套 runner或破坏 A/B/C 配置。
   3. 从临时 consumer 的 `node_modules` 验证三个 heavy peer 的精确安装版本；分别 `import.meta.resolve` 并动态 import `@nocoo/basalt/charts/donut`、`components/date-picker`、`components/data-table`，断言路径/realpath 全部位于该 tarball 且 named export 存在。禁止借用本仓 `node_modules`、源码 alias 或只检查字符串。
   4. Gate D 使用 standalone 样式并继续验证产物 HTML/JS/CSS 和 Basalt token；Tailwind 必须缺席。包 manifest、pack 内容和 fixture 文档必须准确列出三项 optional peer，不能声称当前自实现 DatePicker/DataTable 已经调用尚未调用的第三方 API。
   5. A/B/C 必须复跑并继续证明未安装 Recharts、react-day-picker、TanStack Table；这三门只消费 root，不能为了通过新增 granular import。为 optional peer metadata、heavy fixture、三条 resolver/runtime probe、版本错配、仓内泄漏和成功/失败 cleanup 提供 focused tests。
   6. 允许修改根 `package.json`、`bun.lock`、`scripts/` 与测试、`fixtures/{README.md,vite-heavy/**}`、`packages/basalt/{package.json,README.md}`；不得修改组件/图表实现、root barrel、其它 fixture、Husky、本文、private/version、S1C 或 coverage 配置。
   7. 提交前运行 focused tests、package build/types/pack、typecheck、Biome、全量测试、真实 Gate D，并顺序回归 A/B/C。只做一个绿色原子提交，建议 `test: add heavy consumer gate`；提交后报告 commit、文件、四门解析/版本/CSS/cleanup 证据，等待 Codex review。
   8. **D018-R1 — heavy source 契约与失败清理真实性返工。** `ee4a680902fa` 的真实 A/B/C/D、package build/types/pack、focused 2 files / 41 tests、typecheck、Biome 386 files和全量 110 files / 734 tests均通过，文件范围和 optional-peer/granular 运行证据正确；但 `assertHeavyConsumerSource` 只拒绝双引号 root import，并以若干 substring 判断所需路径，Codex 已用三个无文件改动的运行时反例证明它会接受单引号 `from '@nocoo/basalt'`、额外 `components/separator` granular import 和额外 `@nocoo/basalt/styles` import，违反“源码只能包含三条批准 granular 路径和 standalone 样式”的冻结契约。返工必须枚举 entry 中所有 `@nocoo/basalt` 静态 module specifier（兼容单双引号）并要求批准的四个 specifier 各且仅出现一次；root、额外 granular/provider/chart、其它 styles、重复或缺失均失败，同时保留三个 named export/usage 检查。新增上述三个真实负例和重复 specifier 负例。另以仓外临时目录 + `settleWithCleanup` 的受控失败测试证明 Gate D 无 server/browser 时仍保留原始错误并删除 temp；只调用一次无失败的 `cleanupConsumerGate` 不足以证明失败路径。只允许修改 `scripts/consumer-gate.ts` 和 `scripts/consumer-gate.test.ts`，不得改 fixture、manifest、lockfile、docs、组件、Husky、coverage 或进入 S1C。提交前复跑 focused、package build/types/pack、typecheck、Biome、全量测试、真实 D，并顺序回归 A/B/C；单一返工提交建议 `test: harden heavy consumer contract`，然后停止等待 Codex review。
   9. **D018-R2 — TSX import 与使用真实性返工。** `09e356a3c07f` 已关闭 R1 的单双引号 root、额外 package specifier、重复/缺失和失败 cleanup 缺口，但 `staticBasaltSpecifiers` 仍是文本正则，不是静态模块语义：Codex 已用两条无文件改动反例证明，四行注释中的伪 import 加三个本地同名函数会被接受；四条真实 side-effect import 加三个本地同名函数也会被接受。这会让门在没有从 tarball named-import、没有 JSX 使用重组件时误报成功。返工必须使用仓库已有 TypeScript parser（或同等级 TSX AST parser）解析 entry，语法诊断必须失败；只从真实 `ImportDeclaration`/`ExportDeclaration` 收集 module specifier，注释、普通字符串、template、dynamic import/require 均不得冒充批准静态 import，任何实际指向 `@nocoo/basalt` 的 dynamic import/require 也必须失败。三个代码模块必须分别且仅一次以 named import 取得精确的 `DonutChart`、`DatePicker`、`DataTable` 本地绑定，standalone 必须分别且仅一次以 side-effect import 引入；三个本地绑定都必须在真实 JSX opening/self-closing element 中使用。root、额外 specifier、alias/local shadow、side-effect-only 重组件、伪注释、重复、缺失和未渲染均失败。新增上述两条运行时反例，以及至少 alias/local-shadow、未渲染和语法错误负例；保留 R1 全部负例与 cleanup identity 测试。仍只允许修改 `scripts/consumer-gate.ts` 和 `scripts/consumer-gate.test.ts`，不得改 fixture、manifest、lockfile、docs、组件、Husky、coverage 或进入 S1C。提交前复跑 focused、package build/types/pack、typecheck、Biome、全量测试、真实 D，并顺序回归 A/B/C；单一返工提交建议 `test: parse heavy consumer imports`，然后停止等待 Codex review。
   10. **D018-R3 — parser 所有权与 JSX binding identity 返工。** `fee140df34af` 已用 SWC TSX AST 关闭 R2 的注释/字符串伪 import、side-effect-only 重组件、alias、未渲染、语法错误和 dynamic import/require 缺口，但不能验收。第一，生产 gate 源码加载 `@swc/core`，根 manifest 却未声明该包，而是通过 `createRequire(import.meta.resolve("@vitejs/plugin-react-swc"))` 借用插件的传递依赖；Codex 已证明从仓库根直接解析 `@swc/core` 得到 `ERR_MODULE_NOT_FOUND`。门禁的可启动性不能依赖另一个工具的内部依赖树。第二，AST 只把所有 JSX tag 拼成名字集合，并只扫描 function/class/variable 的简单 identifier；Codex 用无文件改动反例证明，把 `DonutChart`、`DatePicker`、`DataTable` 写成一个嵌套函数的解构参数并在该函数 JSX 中使用，三个 tarball import 完全未使用，`assertHeavyConsumerSource` 仍成功。返工必须在根 `devDependencies` 精确声明并锁定 `@swc/core` `1.15.46`，从本包直接 import/resolve，删除经 Vite plugin 定位 parser 的幻影依赖路径，禁止硬编码 `.bun`/本机路径；若选择同等级的直接 parser，必须同样精确锁定且说明理由。JSX 证据必须对应三个批准 import 的真实 binding；函数/箭头/方法参数、对象或数组解构、rest/default pattern、catch/局部声明等同名 binding 均不得让未使用的 import 过门。新增至少一个“解构参数同名 + JSX”真实反例，并以测试锁住 parser 为根直接依赖且源码不再经 plugin 加载；保留 R1/R2 全部负例、fixture 正例与 cleanup identity。只允许修改根 `package.json`、`bun.lock`、`scripts/consumer-gate.ts`、`scripts/consumer-gate.test.ts`；不得改 fixture、package manifest/API、组件、其它脚本、Husky、coverage、docs 或进入 S1C。单一原子提交建议 `test: bind heavy consumer imports`；提交前依次复跑 focused、package build/types/pack、typecheck、Biome、全量测试、真实 D 和 A/B/C，然后停止等待 Codex review。
   11. **D018-R4 — TypeScript parameter-property binding 返工。** `8c1eb85cc95c` 已把 `@swc/core` `1.15.46` 变为根直接 devDependency，并以全文件 local-binding 禁令关闭普通参数、对象/数组解构、rest/default、method、catch、局部声明和嵌套 `var` 提升绕过；根 Node 现在也能直接 resolve/parse SWC。但其 `collectPatternNames` 为 `TsParameterProperty` 读取 `pat ?? parameter`，而 SWC 1.15.46 的真实节点把绑定放在 `param`。Codex 已用无文件改动反例证明：构造函数的 `public DonutChart`、`private DatePicker`、`protected DataTable` 参数属性在构造函数体 JSX 中遮蔽三个 import，`assertHeavyConsumerSource` 仍成功；AST dump 同时证明三节点均为 `TsParameterProperty.param: Identifier`。返工必须读取真实 `param`，兼容其 Identifier 与 default/rest pattern，并新增构造函数体参数属性 JSX 的失败用例；不能只测试另一个 method 中实际仍解析到 import 的 JSX。保留 R1–R3 全部负例、parser 直接依赖测试、fixture 正例和 cleanup identity。只允许修改 `scripts/consumer-gate.ts`、`scripts/consumer-gate.test.ts`，不得改 manifest/lock、fixture、组件、其它脚本、Husky、coverage、docs 或进入 S1C。单一原子提交建议 `test: cover parameter property shadows`；提交前复跑 focused、package build/types/pack、typecheck、Biome、全量测试、D、A/B/C，然后停止等待 Codex review。

S1B4 已在 `054462d04839` 验收，S1B 完成。S1C 首刀按低覆盖文件拆成若干测试原子提交恢复 95% 四项，再允许接 publint/prepublish。禁止降低阈值、扩大 exclude、删生产出口或用无行为价值断言凑覆盖。

S1C1 当前实测总量为 statements `1385/1463`（94.66%）、branches `1057/1160`（91.12%）、functions `421/449`（93.76%）、lines `1311/1385`（94.65%）；在不改变分母的测试-only 前提下，至少还需命中 5 statement、45 branch、6 function 和 5 line。恢复过程每刀只处理一个组件或紧密家族，每刀后重测明细，不为了数字添加无行为价值 render/assertion。

1. **S1C1a / D019 — Toast 行为覆盖率。** `packages/basalt/src/components/toast.tsx` 当前为 lines `12/25`、branches `6/18`、functions `4/7`，未覆盖默认 callable 路径、custom/default icon 分支以及 error/warning/info 分派；现有测试只实际断言 success + `icon:false`。只修改 `packages/basalt/src/components/toast.test.tsx`：基于现有 Sonner spy 分别证明 callable default 调用基础 toast、四个 convenience method 调用对应 Sonner method、默认 `closeButton:true`、显式 false、default/custom/false icon 策略，以及 description/action/duration/id 等 options 不丢失；调用之间清理 mock，断言消息、目标 method 和关键 payload，而不是只断言函数存在、只 render 或做大 snapshot。可补 `dismiss` 转发和 Toaster 显式 `closeButton`/props 转发，但必须有可观察断言。不得修改生产源码、coverage 配置/阈值/exclude、manifest、其它测试、docs、consumer/Husky 或进入 publint。提交前运行 Toast focused、全量、typecheck、Biome 和 coverage；coverage 仍未整体到 95% 时必须如实报告新的四项数字和逐文件 Toast 数字，不得把预期红门伪报为失败。只做一个原子提交，建议 `test: cover toast behavior`，随后停止等待 Codex review。
2. **S1C1b / D020 — DateNavigation 行为覆盖率。** D019 后全局为 statements `1398/1463`（95.55%）、branches `1069/1160`（92.15%）、functions `424/449`（94.43%）、lines `1324/1385`（95.59%）；Toast 已达 lines `25/25`、branches `18/18`、functions `7/7`。下一刀只新增 `packages/basalt/src/charts/date-navigation.test.tsx`，不得改已有 `charts.test.tsx`：覆盖 picker 的 uncontrolled 前后日状态与 `onChange`、controlled 只通知而不自行改值、合法 ISO 和固定系统时间下空值/非 ISO fallback、disabled；证明 `ariaLabel`、原生 `aria-label`、默认标签的优先级。Display 模式分别证明 Today/前日/后日/日历 toggle 回调、today 与非 today 禁用状态、无 toggle 的静态日期、自定义 formatter/labels，以及 locale、timeZone、className 的可观察结果。日期断言必须固定时钟并在测试后恢复，回调和 UI 状态都要断言，不以只 render、函数存在或大 snapshot 凑覆盖。不得修改生产源码、coverage 配置/阈值/exclude、manifest、其它测试、docs、consumer/Husky 或进入下一组件/publint。提交前运行 DateNavigation focused、全量、typecheck、Biome 和 coverage；目标为 DateNavigation 从 lines `16/28`、branches `21/27`、functions `8/12` 尽量恢复到 100%，但全局 branch 门预计仍红，必须报告新的四项分子/分母、百分比和本文件明细。只做一个原子提交，建议 `test: cover date navigation behavior`，随后停止等待 Codex review。
3. **S1C1c / D021 — StatCard/StatGrid 行为覆盖率。** D020 后全局为 statements `1410/1463`（96.37%）、branches `1075/1160`（92.67%）、functions `428/449`（95.32%）、lines `1336/1385`（96.46%）；唯一未过门项为 branch，仍需新增 27 个命中。`packages/basalt/src/charts/stat-card.tsx` 当前为 lines `6/8`、branches `27/37`、functions `1/2`。只新增 `packages/basalt/src/charts/stat-card.test.tsx`，不得改已有 `charts.test.tsx`：用可访问名称和可见文本证明默认 label/value、title 覆盖 label、string/number value；证明自动 aria label 会组合 heading、格式化值、subtitle、正/负/零 trend 的符号和值及可选 label，显式 `ariaLabel` 则精确覆盖自动名称。分别断言 subtitle/icon 有无分支、iconColor 与外层 className、正/负/零 trend 的可见符号和语义样式、trend label 有无。StatGrid 必须覆盖默认 4 列和显式 2/3/4 列映射、children 与 className。数值格式期望应由运行时同一 locale 计算，不能硬编码宿主相关分隔符；不以只 render、函数存在或大 snapshot 凑覆盖。不得修改生产源码、coverage 配置/阈值/exclude、manifest、其它测试、docs、consumer/Husky 或进入下一组件/publint。提交前运行 StatCard focused、全量、typecheck、Biome 和 coverage；目标为本文件四项 100%，但全局 branch 门仍可能红，必须报告精确新明细。只做一个原子提交，建议 `test: cover stat card behavior`，随后停止等待 Codex review。
4. **S1C1d / D022 — SidebarIconItem/SidebarUser 行为覆盖率。** D021 后全局为 statements `1412/1463`（96.51%）、branches `1085/1160`（93.53%）、functions `429/449`（95.54%）、lines `1338/1385`（96.60%）；唯一未过门项仍为 branch，还需新增 17 个命中。`packages/basalt/src/components/sidebar.tsx` 当前为 lines `11/12`、branches `13/17`、functions `10/11`，缺口恰好集中在尚无专属用例的 `SidebarIconItem` 与 `SidebarUser` 可选 email。只修改已有 `packages/basalt/src/components/sidebar.test.tsx`：证明 IconItem 默认/inactive 与 active 的互斥 class、可访问按钮名称、原生 props 与自定义 class 转发；证明 SidebarUser 的 name、email、avatar、action、className slots，以及省略 email 时不残留对应节点。必须用 rerender 或隔离 render 同时命中有/无分支，不以只 render 或大 snapshot 凑覆盖；不得借机重测或改造 Sidebar Provider/collapse contract，后者仍留 S6。不得修改生产源码、coverage 配置/阈值/exclude、manifest、其它测试、docs、consumer/Husky 或进入下一组件/publint。提交前运行 Sidebar focused、全量、typecheck、Biome 和 coverage；目标为 `sidebar.tsx` lines `12/12`、branches `17/17`、functions `11/11`，但全局 branch 门预计仍红，必须报告精确明细。只做一个原子提交，建议 `test: cover sidebar optional primitives`，随后停止等待 Codex review。
5. **S1C1e / D023 — LayerCard 组合识别覆盖率。** D022 后全局为 statements `1413/1463`（96.58%）、branches `1089/1160`（93.87%）、functions `430/449`（95.76%）、lines `1339/1385`（96.67%）；唯一未过门项仍为 branch，还需新增 13 个命中。`packages/basalt/src/components/layer-card.tsx` 当前为 lines `17/21`、branches `7/10`、functions `5/5`，未执行的是普通有效 ReactElement 的非 section 路径、Fragment 递归路径和被前置 Secondary 短路的 Primary 身份路径。只修改已有 `packages/basalt/src/components/layer-card.test.tsx`：证明只有普通元素子节点时仍使用单层 surface，而包含普通元素与 nested Primary/Secondary 的 Fragment 会递归识别为 layered root；断言必须同时观察 root surface class 和 section 内容/class，确保移除 Fragment 递归或误把任意元素当 section 都会失败。可用独立 direct Primary 场景消除 `Children.some` 顺序假阳性，但不得只靠 render 或内部函数调用。不得修改生产源码、coverage 配置/阈值/exclude、manifest、其它测试、docs、consumer/Husky 或进入下一组件/publint。提交前运行 LayerCard focused、全量、typecheck、Biome 和 coverage；目标为该文件 lines `21/21`、branches `10/10`、functions `5/5`，但全局 branch 门预计仍红，必须报告精确明细。只做一个原子提交，建议 `test: cover layer card composition`，随后停止等待 Codex review。
6. **S1C1f / D024 — Timeline 变体覆盖率。** D023 后全局为 statements `1417/1463`（96.85%）、branches `1092/1160`（94.13%）、functions `430/449`（95.76%）、lines `1343/1385`（96.96%）；唯一未过门项仍为 branch，还需新增 10 个命中。`packages/basalt/src/charts/timeline.tsx` 当前为 lines `16/16`、branches `19/24`、functions `7/7`，五个未命中中有四个是真实公开输入路径：无 `id`/`at` item 的 key fallback、colored event、colored subtitle、无 subtitle；`time.split(":")[0] ?? "0"` 的 nullish fallback 对声明为 `string` 的输入及 JavaScript `split` 结果不可达，不得用越过类型契约的输入、mock 内建方法或生产改写硬凑。只新增 `packages/basalt/src/charts/timeline.test.tsx`，不得改已有 `charts.test.tsx`：用可访问列表名、条目结构和可见文案证明无 `id`/`at` item 仍稳定渲染；用同一小时内有色带 subtitle 与无 subtitle event 证明 color class、白色文字、subtitle 的 `text-white/80` 语义及 subtitle 有/无，且两条 event 都落在正确 hour slot。断言必须能在移除对应分支时失败，不以只 render、检查函数存在、React 内部 key 或大 snapshot 凑覆盖。不得修改生产源码、coverage 配置/阈值/exclude、manifest、其它测试、docs、consumer/Husky 或进入下一组件/publint。提交前运行 Timeline focused、全量、typecheck、Biome 和 coverage；目标为 Timeline branches `23/24`，全局预计提升到 `1096/1160`（94.48%）且仍只因 branch 门退出 1，必须如实报告四项分子/分母与本文件明细。只做一个原子提交，建议 `test: cover timeline variants`，随后停止等待 Codex review。

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
| D012 | S1A3a | `5535b9842bd3` + `e6cdf47e4d74` | `w14:p1` | 完成 | `82014a6d355b` | 8 个授权文件，+365/−4；build 在声明生成后精确重写 23 个文件中的 50 个相对 specifier，并由 verifier 证明 90 JS、90 声明、87 个有效 map、61 client entry、3 CSS、50 个引用目标闭合；严格 Bundler + NodeNext self-reference fixture 均为 `skipLibCheck: false`，覆盖 root、component、provider、chart、DatePicker、DataTable；Codex 独立复跑相关 2 files / 14 tests、typecheck、Biome、全量 106 files / 668 tests、build、types:check、273 项 pack 白名单，全部通过；未改源码 import、root surface、依赖或仓外 consumer。Grok 原报告的 targeted 3 files / 15 tests 未被独立复现，不作为验收证据 |
| D013 | S1A3b | `82014a6d355b` + `622456148258` | `w14:p1` | 完成 | `62297f296590` | 7 个授权文件，+307/−4；只移除五个冻结表外 root 名字，保留源码与 granular 产物；真实 Node 26.7 self-reference 加载 root/component/provider/chart/DatePicker/DataTable，Bun 负门按预期退出 1；递归闭包为 28 files / 22 externals，0 charts、DatePicker、DataTable、Recharts、react-day-picker、TanStack，并用静态与动态嵌套反例证明不是一层扫描；Codex 独立复跑 clean build、focused 4 files / 20 tests、types:check、273 项 pack、typecheck、Biome 364 files、全量 107 files / 673 tests，全部通过；未进入仓外 consumer |
| D014 | S1B1 | `62297f296590` + `bfc46dd75f34` | `w14:p1` | 完成 | `0c5342a954a1` + `c824c553261d` | 首提交建立仓外 temp → tarball → npm install → root resolution → Vite build → cleanup 门；Codex 拒绝硬编码腾讯/微软 registry 的半成品并要求 env-only，随后 review 又发现 Vite 不检查声明与测试含本机路径，第二提交补严格 Bundler `tsc`（`skipLibCheck:false`）及 CSS export 真实解析并清除路径。Codex 独立真门：temp `…/basalt-gate-b-KFK2ny` 已删除，root/CSS 均位于其 consumer `node_modules`，typecheck 通过，产物 HTML + JS + 45,480-byte CSS，token/Button class 存在，四个 heavy peers 缺席；focused 1 file / 11 tests、typecheck、Biome 368 files、全量 108 files / 684 tests 全绿；未进入 Tailwind/Next/optional fixture |
| D015 | S1B2 | `03ba7c2f1f37` | `w14:p1` | 完成 | `7bf19f4832a5` + `feb020bc2133` | 首提交复用 Gate B 内核建立仓外 Tailwind v4 tarball/type/build 门；review-fix 删除 main 的重复 package CSS 入口，并把唯一 `@source` 锁到 consumer `node_modules/@nocoo/basalt/dist` 的精确真实路径与 glob。Codex 独立复跑 focused 1 file / 18 tests、typecheck、Biome 370 files、全量 108 files / 691 tests；Gate A 解析仓外 tarball、Tailwind/plugin 均为 4.3.3、54,321-byte CSS 含 token/Button utilities 且非 standalone dump，三个 heavy peers 缺席；Gate B 回归为 45,480-byte CSS，四个 heavy peers 缺席；两门 temp 均删除，工作树干净；未进入 Next |
| D016 | S1B3a | `feb020bc2133` + `dc289fa160b9` | `w14:p1` | 完成 | `345a21346cb6` + `57cb78990b9f` + `3d993c0559f4` | 首提交建立 Next 16.3.3 + React 19.2.8 仓外 type/build/start/HTTP 门；两轮 review-fix 直接启动临时 consumer 的 Next binary、移除 `transpilePackages`、清理完整进程组，并在主动清理前快照自然退出状态，保证 readiness error 原样重抛。Codex 独立逐行审查；focused 2 files / 31 tests、typecheck、Biome 377 files、全量 109 files / 704 tests 通过；Gate C 从 tarball root/standalone CSS 解析，Next HTTP 200 + marker，四个 heavy peers 缺席，temp 与 Next 进程二次确认清理；Gate A/B 回归 CSS 54,321/45,480 bytes，全部通过；未进入 browser/S1B4 |
| D017 | S1B3b | `3d993c0559f4` + `a77d0ea65cf2` | `w14:p1` | 完成 | `9f9555fb3d18` + `afdcb8091662` + `23346190f8ee` | 首提交新增 Playwright 1.62.1 / Chromium 151、Button/Theme/Toast 与错误/清理门；两轮 review-fix 分别关闭隐藏同文案假阳性、0 Sonner toast 假阳性，并把虚假 portal 命名改成 in-place outside-root host。Codex 独立复跑 focused 3 files / 55、typecheck、Biome 380 files、全量 110 / 728、root build、A/B/C；Gate C 由临时 tarball完成 HTTP 200、hydration、Button、light→dark、唯一真实 `[data-sonner-toast]`，Chromium 151.0.7922.34，temp/profile/51045/进程全清；A/B CSS 54,321/45,480 bytes。阶段末 coverage 实测 94.66/91.12/93.76/94.65 红，属未被 scripts/fixtures 纳入的既存包源码债务，已锁为 S1C 首刀，不伪报全绿 |
| D018 | S1B4 | `23346190f8ee` + `8b3333d` | `w14:p1` | 完成 | `ee4a680902fa` + `09e356a3c07f` + `fee140df34af` + `8c1eb85cc95c` + `054462d04839` | 首提交建立 optional-peer D，四轮 review 依次关闭 package specifier/cleanup、文本伪 import、幻影 SWC 依赖与 local binding、`TsParameterProperty.param` 缺口。Codex 独立复跑 focused 1 file / 42、package 90 JS + 90 d.ts + 87 maps、types、273 项 pack、typecheck、Biome 386 files、全量 110 / 745；frozen install 无 lock 漂移，Node 26.7 从根直接 resolve/parse `@swc/core@1.15.46`。Gate D 精确安装 Recharts 3.10.1、react-day-picker 10.0.1、TanStack Table 9.1.2，三条仓外 granular export 均为 function，45,480-byte standalone CSS 且 Tailwind 缺席；A 为 54,321-byte Tailwind CSS 且三个 heavy peers 缺席，B 为 45,480-byte standalone CSS 且四个 heavy peers 缺席，C 为 HTTP 200、hydrated、Button、light→dark、真实 Sonner toast、Chromium 151.0.7922.34。四个 temp、browser profile、端口、进程和 tarball 全清，工作树干净 |
| D019 | S1C1a | `054462d04839` + `3478c41` | `w14:p1` | 完成 | `4fe13d03b316` | 仅改 Toast 测试，新增 10 个真实行为用例；focused 1 file / 13 tests、typecheck、Biome 386 files、全量 110 files / 755 tests 全绿。Toast lines `12/25` → `25/25`、branches `6/18` → `18/18`、functions `4/7` → `7/7`；全局提升为 statements `1398/1463`（95.55%）、branches `1069/1160`（92.15%）、functions `424/449`（94.43%）、lines `1324/1385`（95.59%），coverage 仅因剩余 branch/function 债务按预期退出 1。首次 coverage 被既存 Next cleanup 用例偶发 5 秒超时打断；无泄漏且该用例单独复跑通过，第二次全量 755 项通过并生成有效明细 |
| D020 | S1C1b | `4fe13d03b316` + `b9fd597` | `w14:p1` | 完成 | `49b440fc8dc1` + `c68ffda8e520` | 首提交新增 10 个 picker/display 行为用例并将 DateNavigation 恢复为 lines/statements `28/28`、branches `27/27`、functions `12/12`；review-fix 补 disabled 三控件点击零通知，并以同一 UTC 日界 instant 在 UTC/Los Angeles 间切换关闭 timeZone 假阳性。Codex 独立复跑 focused 1 file / 10 tests、typecheck、Biome 387 files、全量 111 files / 765 tests；全局为 statements `1410/1463`（96.37%）、branches `1075/1160`（92.67%）、functions `428/449`（95.32%）、lines `1336/1385`（96.46%），仅 branch 门按预期退出 1；工作树干净，未改生产或 coverage 配置 |
| D021 | S1C1c | `c68ffda8e520` + `3f4b5b7` | `w14:p1` | 完成 | `9f3b8d696b27` | 扩充唯一授权的既有 StatCard 测试（调度文案误写为“新增”，实际基线已有该文件），以 9 项行为覆盖默认/title/value、自动/显式 aria label、subtitle/icon、三种 trend 与 StatGrid 全列映射；focused 1 file / 9 tests、typecheck、Biome 387 files、全量 111 files / 772 tests 全绿。StatCard/StatGrid 达 statements/lines `8/8`、branches `37/37`、functions `2/2`；全局为 statements `1412/1463`（96.51%）、branches `1085/1160`（93.53%）、functions `429/449`（95.54%）、lines `1338/1385`（96.60%），仅 branch 门按预期退出 1；工作树干净，未改生产或 coverage 配置 |
| D022 | S1C1d | `9f3b8d696b27` + `e136bb0` | `w14:p1` | 完成 | `5adea81cc40f` | 只扩充 Sidebar 既有测试，新增 2 项真实行为覆盖 IconItem 默认/active 互斥样式、a11y/props/class 转发及 SidebarUser email/slots 有无；focused 1 file / 8 tests、typecheck、Biome 387 files、全量 111 files / 774 tests 全绿。Sidebar 达 lines `12/12`、branches `17/17`、functions `11/11`；全局为 statements `1413/1463`（96.58%）、branches `1089/1160`（93.87%）、functions `430/449`（95.76%）、lines `1339/1385`（96.67%），仅 branch 门按预期退出 1；工作树干净，未改生产或 coverage 配置 |
| D023 | S1C1e | `5adea81cc40f` + `f15d597` | `w14:p1` | 完成 | `4c472c87e9e8` | 只扩充 LayerCard 既有测试，新增普通元素、Fragment 递归与 direct Primary 三项组合场景；focused 1 file / 5 tests、typecheck、Biome 387 files、全量 111 files / 777 tests 全绿。LayerCard 达 lines `21/21`、branches `10/10`、functions `5/5`；全局为 statements `1417/1463`（96.85%）、branches `1092/1160`（94.13%）、functions `430/449`（95.76%）、lines `1343/1385`（96.96%），coverage 仅因 branch 门按预期退出 1；工作树干净，未改生产或 coverage 配置 |
| D024 | S1C1f | `4c472c87e9e8` + 本次调度文档 commit | `w14:p1` | 执行中 | 待提交 | 只新增 Timeline 专属测试，命中无 id/at、colored event/subtitle 与无 subtitle 四条真实分支；保留 string split 的不可达 nullish fallback，不改生产或 coverage 配置 |

后续日志只追加，不覆盖历史。若 Herdr pane 变化，记录新的明确 pane ID 或唯一 agent name。

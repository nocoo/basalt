# 02 · 2.0 实现步骤

> 状态：01+02 联审 Sign Off。01 第 13 节 1–11 已拍板。执行纠偏：B05 四层亮度、catalog 对照 `kumo-ui.com` 复刻、Kumo Components 清单 100% 覆盖（01 §3.6、§8）。依赖 [01-plan-2-0.md](./01-plan-2-0.md) 的架构与 6.2 出口表。
> 本文只写**怎么做**：阶段、原子化提交、每个控件的推荐底稿与确认门。
> 不含工时。未确认本文前不写业务代码。

01 回答「做成什么样」。02 回答「按什么顺序提交」。图表走独立 Recharts 工具层，不跟 Button 混在同一阶段里当「普通控件」处理。

---

## 1. 相对 01 的执行修正

| 点 | 01 | 02 |
|----|----|----|
| 第一刀代码 | 阶段 0 workspace | **先** Wave P 加齐 `/ui/:name` placeholder；**不做** Wave B / 截图冻结 |
| 每个控件 | 7.2 底稿可直接用 | **先推荐、等哥确认，再写实现** |
| 顺序 | 阶段 1→7 按 kind | **先小后大**：原子 → LayerCard 容器 → 表单 → 反馈 → 浮层 → 结构/Sidebar catalog → **图表工具层** → 图表控件 → 拼现页壳 |
| 图表 | 与其它控件并列 stage 6 | **单独轨道**：先 kit（色板、tooltip、轴/字号），再各个 chart |
| 家族权重 | 7.2 分散 | **pew / zhe / intentional-kusto-queries 加权**；视觉由哥按精神验收 |
| 质量 | 6DQ 章节 | **Husky 从第一行包代码起就拦**：typecheck + `biome --error-on-warnings` + test。不准先红后补 |
| Sidebar 现页 | 6.2 `wire=/` | 实现时只填 `/ui/sidebar`；现页 `/` 推迟到 S2 |
| 发布路径 | 阶段 8 列门 | Wave 0 写 README 双契约 + 构建 dts/banner；Wave 8 写 tarball 门、`prepublishOnly`、CHANGELOG；全部完成发 `2.0.0`，不发 alpha |

架构、CSS 命名空间、发布门 A/B/C/D、视觉精神（哥验收）仍以 01 为准。冲突时：执行顺序听 02，API/CSS/发布听 01。

---

## 2. 全程硬规则

### 2.1 每个控件的确认门

实现某个 6.2 出口之前，必须在对话里给出：

1. 候选实现（路径 + SHA，来自加权家族）
2. **推荐主线**（一条）和理由（API / a11y / 测试 / 是否符合 Basalt 视觉精神）
3. 明确不选谁

**等哥回复选哪条（或改选）之后才能改代码。** 禁止用 01 §7.2 默认赢家直接开工。

例外：Wave P（placeholder）不需要逐页确认。视觉好不好等哥验收，不在实现前截图像素门。

### 2.2 家族权重

搜底稿时按这个顺序，前三档必须看：

| 权重 | 仓 | 用途 |
|------|----|------|
| 高 | `pew` `97a890fabe6e` | StatCard、ChartTooltip、产品图表密度 |
| 高 | `zhe` `c31c239f01c9` | token/密度契约 `docs/22-design-tokens.md`、Button/Input 表面 |
| 高 | `intentional-kusto-queries`（Whiteboard）`bce8a88fe26e` `data/dashboard/src/model/chart-config.ts` + `view/charts/*` | **图表工具层主参考**：色板函数、轴、字号、tooltip、cursor、无动画 |
| 中 | 本站 `basalt` | Basalt 视觉参考（哥验收精神）；SlotBarChart 测试；Sonner；三态 ThemeToggle |
| 中 | `meowth` `surety` `pika` `otter` `signoff.now` `gecko` | API / asChild / Field / Tabs / Table primitive / DatePicker |
| 低 | 其它 personal clone | 只在前几档没有对应物时看 |

Whiteboard 路径：`/Users/nocoo/workspace/work/whiteboard/intentional-kusto-queries`。钉 SHA `bce8a88fe26e`。它不是 personal/ 下的仓，但是 Basalt family，图表优先于 pew 里「每个页面一份 chart 文件」的散装实现。换底稿先改 01 §7.1 与本表再动手。

视觉冲突时：按 Basalt 精神做，**哥验收**（01 §3.2）。Button 默认 `h-9`，zhe `h-10` 只当非默认 `size`（第 13 节第 11 条）。

### 2.3 MVVM

| 层 | 放哪 | 禁止 |
|----|------|------|
| Model | `packages/basalt/src/charts/kit/*.ts` 等纯函数；现有 `src/models` 不动 | 控件里写死 mock |
| ViewModel | 现页继续 `src/viewmodels`；catalog 演示若有派生状态才加 `useXxxDemoViewModel` | 把 i18n / 路由写进包 |
| View | 包内控件 + `src/pages/ui/*` | 包内 `useTranslation`、模块顶层 `window` |

图表：kit 是 model（palette、axis、tooltip props）；`LineChart` 等是 view；页面把 viewmodel 的 series 喂进去。

### 2.4 Husky / 6DQ（先门后代码）

现有：

- pre-commit：`typecheck` + `lint`（`biome check --error-on-warnings`）+ `test` + gitleaks
- pre-push：`build` + `test:coverage` + lint + osv-scanner

Wave 0 起：

- `typecheck` 必须覆盖 `packages/basalt`
- `vitest` `include` 必须含 `packages/basalt/**/*.test.tsx`
- 包内 coverage 门槛与现网 models 一样高（01 现为 95% 语句/分支/函数/行，针对包源码；第一批文件少也不得降门槛凑数——用真实测试填）
- 不允许 `--no-verify`
- 不允许先合进红测试再「下个 commit 补」
- **测试与实现必须同一次绿 commit**（见 §7）。禁止单独提交会让 husky 失败的红测

每个控件的**提交序列**必须包含：实现 + 单测（同一次绿 commit）+ 填满该 `/ui/:name` placeholder（不再是空壳）。catalog 页与现页 wire 仍按 §7 拆开提交。stable/chart/provider 另接 01 的现页 wire（Sidebar 除外，见 §8.6 / §8.8）。a11y：icon-only 名称、label 关联、图表 `aria-label`/`summary`。参考 Kumo 的 compound/ARIA，不抄视觉。

### 2.5 原子化提交

- Conventional Commits，祈使句，全小写，≤50 字符
- 一次一个逻辑；禁止 `git add -A`
- placeholder 与实现分开；实现与「接到现页」分开（测试不与实现分开）
- 提交后 Husky 必须绿

---

## 3. 图表单独轨道

不把 Recharts 图表当成「又一个 Button」。包结构：

```
packages/basalt/src/charts/
  kit/                 # 不全部进 6.2 公开名
    palette.ts         # 从本站 src/lib/palette.ts 迁颜色值（默认；换色须确认）
    typography.ts      # 轴/图例/tooltip 字号，禁止视图里写死 fontSize
    tooltip-props.ts   # Recharts <Tooltip> 共用 props（关动画、cursor、contain）
    axis.ts            # tick/grid/bar radius
    index.ts
  tooltip.tsx          # ChartTooltip + ChartTooltipRow（view）
  palette.ts           # 6.2 ChartPalette 出口
  line.tsx / bar.tsx / …
```

kit **不是** Kumo ECharts。公开 chart 控件全部建立在 kit 上。

### 3.1 Kit 推荐（仍须确认）

| 模块 | 推荐主线 | 理由 | 不选 |
|------|----------|------|------|
| 色板数值 | 本站 `src/lib/palette.ts` + `index.css` `--chart-*`（现网 24 色） | 默认推荐；换色须确认 | 未确认就换成 Whiteboard 16 色 pastel |
| 色板 API | Whiteboard `bce8a88fe26e` `chart-config.ts`：`getChartColor` / `withAlpha` / tone | 有测试、函数化 | pew 每个 chart 文件自己取色 |
| Tooltip 容器 | pew `chart-tooltip.tsx` + Whiteboard `ChartTooltip` | 统一 title/row/dot；pew 更贴近本站 `radius-widget` | 各图内联 div |
| Tooltip/轴行为 | Whiteboard `CHART_TOOLTIP_PROPS` `AXIS_CONFIG` `ANIMATION_PROPS` `chartFontSize` | 关飞入动画、轴无线、字号一处定义 | 各图 `fontSize={12}` |
| 图表卡片壳 | 本站现卡 class 作推荐 | 哥验收；允许更好 | 未确认就把全部卡改成 Whiteboard `ring-1` |

确认 kit 之后才做具体 chart 控件。

Flow 仍是 catalog、放图表轨道末。Maps 不做。

---

## 4. 不做 Wave B

01 §13.1 已拍板：不冻现网像素，不截图矩阵，不播种随机数当基线。第一刀代码就是 Wave P。

---

## 5. Wave P — 全部 placeholder（第一刀代码）

在**现仓库 SPA**上加齐入口，不实现控件、不拆 workspace。本波只加「控件库」导航和空壳页，不顺便改组合页皮肤（01 §13.2）。

### 5.1 路由

索引：`/ui`

子页：每个 6.2 `name` 一条 `/ui/<kebab>`。provider 也有文档页。

| kebab | 6.2 name |
|-------|----------|
| `button` | Button |
| `link-button` | LinkButton |
| `badge` | Badge |
| `banner` | Banner |
| `breadcrumbs` | Breadcrumbs |
| `text` | Text |
| `layer-card` | LayerCard |
| `empty` | Empty |
| `loader` | Loader |
| `skeleton-line` | SkeletonLine |
| `meter` | Meter |
| `clipboard-text` | ClipboardText |
| `code` | Code |
| `code-block` | CodeBlock |
| `label` | Label |
| `field` | Field |
| `input` | Input |
| `input-area` | InputArea |
| `input-group` | InputGroup |
| `sensitive-input` | SensitiveInput |
| `checkbox` | Checkbox |
| `radio` | Radio |
| `switch` | Switch |
| `select` | Select |
| `combobox` | Combobox |
| `autocomplete` | Autocomplete |
| `date-picker` | DatePicker |
| `tabs` | Tabs |
| `table` | Table |
| `data-table` | DataTable |
| `pagination` | Pagination |
| `collapsible` | Collapsible |
| `dialog` | Dialog |
| `alert-dialog` | AlertDialog |
| `dropdown-menu` | DropdownMenu |
| `popover` | Popover |
| `tooltip` | Tooltip |
| `toast` | Toast |
| `command-palette` | CommandPalette |
| `toolbar` | Toolbar |
| `grid` | Grid |
| `link` | Link |
| `sidebar` | Sidebar |
| `table-of-contents` | TableOfContents |
| `flow` | Flow |
| `menu-bar` | MenuBar |
| `basalt-mark` | BasaltMark |
| `accordion` | Accordion |
| `context-menu` | ContextMenu |
| `hover-card` | HoverCard |
| `navigation-menu` | NavigationMenu |
| `slider` | Slider |
| `toggle` | Toggle |
| `toggle-group` | ToggleGroup |
| `separator` | Separator |
| `sheet` | Sheet |
| `avatar` | Avatar |
| `theme-toggle` | ThemeToggle |
| `theme-provider` | ThemeProvider |
| `link-provider` | LinkProvider |
| `stat-card` | StatCard |
| `slot-bar` | SlotBarChart |
| `bar` | BarChart |
| `line` | LineChart |
| `area` | AreaChart |
| `donut` | DonutChart |
| `grouped-bar` | GroupedBarChart |
| `stacked-bar` | StackedBarChart |
| `sparkline` | Sparkline |
| `heatmap-calendar` | HeatmapCalendar |
| `gauge` | Gauge |
| `radar` | RadarChart |
| `funnel` | FunnelChart |
| `bullet` | BulletChart |
| `timeline` | Timeline |
| `sankey` | SankeyChart |
| `item-list` | ItemList |
| `date-navigation` | DateNavigation |
| `palette` | ChartPalette（`/ui/palette`，与现 `/palette` 系统页并存） |
| `charts` | Charts 索引 |
| `colors` | Colors |
| `timeseries` | Timeseries |
| `maps` | Maps（占位，包内不实现） |
| `custom-chart` | Custom Chart |
| `page-header` | Page Header |
| `resource-list` | Resource List |
| `delete-resource` | Delete Resource |

侧栏分组：Components 字母序；Charts 先 Kumo 六项再其余字母序；Blocks 按 Kumo 三项。`/ui/:slug` 不得抢现有路由（现网无 `/ui`）。

### 5.2 Placeholder 页最低内容

- 标题 = 控件名
- 一句「未实现」
- 链到 01/02
- 无假 Button 冒充已完成
- `data-status="placeholder"` 便于测试

实现该控件时**原地填满**此页，不另开路由。

### 5.2c Catalog 内页

`/ui/:slug` 与 `/ui` 仍走 DashboardLayout 内容浮岛（`rounded-[16/20px] bg-card`），不要拆掉侧栏/顶栏交界的标志性圆角。英雄区标题 + description + Copy page 分段按钮，底部分割线。预览与代码合成一张圆角卡（上预览、下代码、右上复制图标）。右侧 TOC sticky 钉在浮岛滚动容器内。current 按激活线（距岛顶 ~32px）取最后一个已越过的 heading，触底选末项；指示条 `translateY` 滑动。点击 pin 到滚动停稳。内容左对齐，不加 `max-w-6xl` 居中。

侧栏 Library 与 Examples 同一套 `NavGroupSection`：分类可折叠（默认展开）、条目带 icon、同一套 `px-3 py-2.5` 行高/圆角/hover。

### 5.2b Catalog 首页

`/ui` 对照 Kumo `HomeGrid`：不是分类卡片。`gap-px` + `aspect-square` 方格，名称绝对定位左上，demo 居中且可交互（不要整格 overlay `pointer-events-none`）。未实现的格子只留名称。网格在浮岛内负 margin 贴边，圆角由岛裁切。

### 5.3 侧栏

现有 `NAV_GROUPS` 不改顺序、不改现有组名。侧栏两大分区：

- **示例**（`nav.examples`）：现有分组原样，默认展开
- **控件库**（`nav.kit`）：Home（`/ui`）+ Components（扁平字母序）/ Charts / Blocks，复用 `NavGroupSection`（可折叠、默认展开、条目带 icon）

⌘K 收录 example 页 + Home + 全部 `/ui/:slug`。

禁止把新分区命名为「控件」：现网 `nav.controls` 已是「控件」（Interactive / Data / Forms / Navigation）。

### 5.4 Wave P 原子化提交

| # | commit | 文件（示意） |
|---|--------|----------------|
| P1 | `feat: add ui catalog placeholder page` | `src/pages/ui/UiPlaceholderPage.tsx`（通用页，读 param） |
| P2 | `feat: register ui catalog routes` | `src/App.tsx`：`/ui`、`/ui/:slug` |
| P3 | `feat: add kit nav group` | `AppSidebar.tsx` 一组 + 不展开，**同 commit** 写 `en.json` / `zh.json` `nav.kit`。禁止先合无翻译的 key |
| P4 | `test: cover ui placeholder routes` | 渲染 `/ui` 与一个 slug，断言 placeholder |
| P5 | `feat: index ui pages in command palette` | `AppSidebar` cmdk 增加 kit 项 |

P1–P5 期间禁止改现有组合页 class。侧栏多一组是 01 允许的唯一导航变化。P4 的测试与被测路由必须同一次绿：若 P2 已注册路由，P4 可紧随；禁止 P4 先于 P1/P2 合进红测。

---

## 6. Wave 0 — 包骨架（第一个真控件之前）

在确认 **Button** 底稿之后做（包骨架需要先知道第一个重量级控件的 API），但 Wave 0 **不是**紧挨 Button 实现。写完 Wave 0 后按 §8 从 Text 起；轮到 Button 时用已确认底稿。**先让工具链看见包，再往包里写文件。**

| # | commit |
|---|--------|
| 0.1 | `chore: add packages/basalt workspace` |
| 0.2 | `chore: typecheck vitest cover packages`（**同 commit 改 husky 会跑到的脚本**；包可仍为空） |
| 0.3 | `feat: extract basalt design tokens`（`--basalt-*`，showcase 映射，旧 utility 先继续工作） |
| 0.4 | `feat: add empty package exports` |
| 0.5 | `chore: add publish gate fixtures`（vite-tailwind / vite-standalone / next19 模板） |
| 0.6 | `docs: write package css contracts`（`packages/basalt/README.md`：Tailwind `@source` 与 standalone 两条，01 §5.2；缺一不算阶段 0 完成） |
| 0.7 | `chore: add package build dts and banners`（产出 `.d.ts`；每个组件 chunk `"use client"` banner） |

0.2 必须在 0.3 之前：否则 tokens 进包时 typecheck/Vitest 还不扫 `packages/basalt`，husky 绿了也看不见包内错误。

0.6 必须在 Wave 0 完成，**禁止**拖到 Wave 8。8.3 只复核或补发布说明，不承担「第一次写双契约」。

0.3 验收：showcase 仍能跑；抽 token 不把站点抽挂。视觉不在本步用截图门。

---

## 7. 单控件实现模板（确认之后）

每个 6.2 出口固定三步提交（可因「无现页 wire」少一步）。**禁止**单独提交红测。

| # | commit 形态 | 内容 |
|---|-------------|------|
| a | `feat: add <Name> control` | 实现 + 单测，同 commit，husky 一次绿。`packages/basalt/src/...`，无 mock、无 i18n |
| b | `feat: fill <Name> catalog page` | 替换 placeholder，按 01 §8.3：hero、Installation、Usage、Examples、高亮代码、API 表、右侧 TOC、源码 SHA |
| c | `refactor: wire <Name> on <route>` | 仅 stable/chart/provider，01 的 wire 路由 |

复杂控件（Dialog、Combobox、DatePicker、CommandPalette、Sidebar）加：

| # | commit |
|---|--------|
| d | `test: add <Name> browser tests` | 与能绿的 harness 同 commit；不得先合红测 |

不允许：只实现不填 catalog 页；catalog 页继续显示 placeholder；`test:` 先红、下个 commit 再补实现。catalog 页缺 TOC / Installation / 高亮代码 / props 表，不算填完。

Input / InputArea / SensitiveInput / Select 默认表面必须是 B05 L3（`bg-basalt-secondary` + `border-basalt-border`），禁止 `bg-basalt-background`。

**Sidebar 例外：** 步骤 c 不在实现波执行。实现波只做 a + b + d（catalog `/ui/sidebar` + browser 测试）。现页 `wire=/` 见 §8.8 S2。

---

## 8. 实现顺序（先小后大）与推荐底稿

下列「推荐」= 加权后的**建议**，不是许可。每项开工前走 §2.1。

### 8.1 原子

| 顺序 | 出口 | 推荐主线 | 备注 |
|------|------|----------|------|
| 1 | `cn`（内部） | 本站 `src/lib/utils.ts` | 无确认也可做，随 Wave 0/Button |
| 2 | Text | Kumo Text API + 本站 14px | catalog |
| 3 | Label | 本站 `ui/label.tsx` | |
| 4 | Separator | 本站 `ui/separator.tsx` | |
| 5 | Button | meowth Button API（asChild）+ **本站 h-9 默认**；zhe 只提供非默认 size | **第一个要确认的控件**（Wave 0 前预确认；实现仍排在 Text/Label/Separator 之后） |
| 6 | LinkButton | 与 Button 同文件；catalog | 随 Button 确认 |
| 7 | LinkProvider | Kumo 思路，本站实现 | 与 Link 同一家族确认，排在 Link 前 |
| 8 | Link | 本站 `<a>` + LinkProvider | 随 LinkProvider |
| 9 | Tooltip | meowth API；现页不加 Arrow | |
| 10 | ThemeProvider | pew `useSyncExternalStore` | |
| 11 | ThemeToggle | 本站三态 label | |

### 8.2 容器

| 顺序 | 出口 | 推荐主线 |
|------|------|----------|
| 12 | LayerCard | pika 无边作 **variant**；本站有边实例用 variant 复现 |

### 8.3 表单

| 顺序 | 出口 | 推荐主线 |
|------|------|----------|
| 13 | Input | raven：`bg-basalt-secondary` + `border-basalt-border`（L2 近白，靠边） |
| 14 | InputArea | 与 Input 同一 L2 表面 |
| 15 | InputGroup | Kumo API，本站皮 |
| 16 | SensitiveInput | 本站 Login 眼标行为，抽成控件 |
| 17 | Checkbox | pika indeterminate |
| 18 | Radio | 本站 `ui/radio-group` |
| 19 | Switch | meowth |
| 20 | Select | meowth/surety |
| 21 | Slider | 本站 ui（现页未用） |
| 22 | Field | signoff Field |
| 23 | Toggle / ToggleGroup | 本站 ui |
| 24 | Combobox | Kumo compound，Radix/cmdk 现栈 |
| 25 | Autocomplete | 同 Combobox 家族一次确认 |
| 26 | DatePicker | gecko calendar + locale props |

### 8.4 反馈

| 顺序 | 出口 | 推荐主线 |
|------|------|----------|
| 27 | Badge | meowth/surety semantic |
| 28 | Banner | Kumo API，本站皮 |
| 29 | Empty | surety/meowth empty-state |
| 30 | Loader / SkeletonLine | meowth Spinner/skeleton |
| 31 | Meter | 本站 progress + ARIA |
| 32 | Toast | **本站 sonner** + Provider |
| 33 | ClipboardText | 新；Interactive 现 Copy 是坏的 |
| 34 | Code / CodeBlock | Kumo API，高亮后置 |
| 35 | Avatar | 本站 ui |
| 36 | Accordion | 本站 ui |

### 8.5 浮层

| 顺序 | 出口 | 推荐主线 |
|------|------|----------|
| 37 | Dialog | meowth Confirm API；overlay 跟本站 |
| 38 | AlertDialog | 本站，独立导出 |
| 39 | Popover | 本站 |
| 40 | DropdownMenu | 本站 |
| 41 | ContextMenu / HoverCard | 本站 ui |
| 42 | Sheet | 本站 |
| 43 | CommandPalette | surety 应用层 |

### 8.6 结构（Sidebar 放最后）

| 顺序 | 出口 | 推荐主线 |
|------|------|----------|
| 44 | Tabs | otter |
| 45 | Collapsible | 本站（侧栏已用） |
| 46 | Pagination | pika 受控 API，与 DataTable 分开导出 |
| 47 | Breadcrumbs | Kumo API |
| 48 | NavigationMenu / MenuBar | 本站 ui |
| 49 | Toolbar | Kumo API |
| 50 | Table | surety/meowth primitive |
| 51 | DataTable | pika DataTable；catalog；optional peer `@tanstack/react-table`；不进根 barrel |
| 52 | TableOfContents | Kumo API |
| 53 | Grid | Kumo API，现页不强制换 |
| 54 | BasaltMark | 本站 Mountain |
| 55 | Sidebar | 本站 AppSidebar 视觉；零件化；drawer 归 Layout。**只填 `/ui/sidebar`，现页 `/` 到 S2** |

### 8.7 图表轨道（确认 kit 后）

| 顺序 | 出口 | 推荐主线 |
|------|------|----------|
| K1 | kit（内部）+ ChartPalette | §3.1：本站 24 色值 + Whiteboard `bce8a88fe26e` API + pew/Whiteboard tooltip |
| K2 | StatCard | pew StatCard API |
| K3 | SlotBarChart | **本站**（已有测试） |
| K4 | BarChart | 本站 BarChartWidget 视觉 + kit |
| K5 | LineChart | 本站 + kit；Whiteboard SeriesChart 作 API 参考 |
| K6 | AreaChart | 本站 + kit |
| K7 | DonutChart | 本站环/图例 + **必须 data props**；pew compact-donut 可参考 |
| K8 | GroupedBar / StackedBar | 本站 + kit `barCornerRadius` |
| K9 | Sparkline | 本站 + kit |
| K10 | HeatmapCalendar | 本站；文案 props |
| K11 | Gauge | 本站 |
| K12 | Radar / Funnel / Bullet / Timeline | 本站视觉 + kit |
| K13 | SankeyChart | 本站 + Whiteboard SankeyChart 测试结构 |
| K14 | ItemList | 本站列表卡；不是 ActionGrid |
| K15 | DateNavigation | 本站 widget，locale props |
| K16 | Flow | catalog 最小页 |

每一张 chart 的推荐都要单独确认；K1 必须先于 K2–K16。色值默认本站 24 色；换成 Whiteboard 16 色必须先确认。

### 8.8 拼现页壳（01 阶段 7）

前置：全部 6.2 catalog 已填满；stable / chart / **provider** 均已接到表内 wire；**Sidebar 现页除外**（在 S2 做）。

| # | commit |
|---|--------|
| S1 | `refactor: rebuild dashboard layout with package` |
| S2 | `refactor: rebuild app sidebar with package`（Sidebar 现页 `wire=/` 在此完成） |
| S3… | 其余组合页，**一页一 commit** |
| S9 | `chore: remove inlined ui copies` |

登录等无侧栏页单独 commit。视觉由哥按 Basalt 精神验收，不对照冻结截图。

### 8.9 发布（01 阶段 8）

仓外 tarball 门禁止用仓库 fixture 向上解析根 `node_modules`。脚本与门断言必须进版本库，不能只写在 01 里口头跑。

| # | commit | 内容 |
|---|--------|------|
| 8.1 | `chore: add tarball publish gate scripts` | 复制 fixtures 到仓外 tmp、`npm pack`、安装 tarball、跑 A/B/C/D |
| 8.2 | `test: assert tarball gates a b c d` | 与 8.1 可合并仅当同一次绿；断言 computed style 与根 barrel 不拉 optional peer |
| 8.3 | `chore: add package prepublishonly script` | 写入 `packages/basalt/package.json` 的 `prepublishOnly`：build + 包内 jsdom + browser + publint + 门 A/B/C/D。这是 npm lifecycle，不是 README 步骤 |
| 8.4 | `docs: add notice for kumo excerpts` | 仅当复制了 Kumo 逻辑：同时写 `packages/basalt/NOTICE` **和** 包 README 的 Cloudflare MIT notice（01 §3.4） |
| 8.5 | `docs: changelog 2.0.0` | Keep a Changelog 一节 |
| 8.6 | `chore: release v2.0.0` | 全部完成后再 bump `packages/basalt` 与仓库 `package.json` 到 `2.0.0`；不打 alpha。走仓库 release 清单 |

Wave 0.6 已写 CSS 双契约 README。发布前若文案过期可另作 `docs:` 更新，不替代 0.6。

8.6 之前：`prepublishOnly` 全绿。失败不准发。开发期不发 npm。

---

## 9. 质量（执行时）

| 门 | 何时 |
|----|------|
| biome error-on-warnings | 每个 commit（husky） |
| typecheck 含 package | Wave 0.2 起每个 commit |
| 单元测试 | 每个控件 a 必须含测，且与实现同绿 |
| browser 测试 | Dialog/Combobox/DatePicker/CommandPalette/Sidebar |
| a11y | 控件 a 的测试里断言名称；图表 summary |
| 覆盖率 | pre-push；包源码不降门槛 |
| 发布门 A/B/C/D | 01 §5.3，Wave 8，发 `2.0.0` 前 |

参考 Kumo：compound、variants 可机器读、icon-only `aria-label`。不参考：ECharts、Base UI、`bg-kumo-*`。

---

## 10. 明确不做

- 不在 placeholder 阶段拆包或改组合页皮肤
- 不做 Wave B / 截图冻结 / 像素 diff
- 不把图表和 Button 放进同一波「先做完所有控件」
- 不把 pew 里 20+ 个业务 chart 文件当 Basalt 出口
- **不把本站 24 色换成 Whiteboard 16 色 pastel**（默认用本站色值；换色必须先经确认）
- 不跳过哥的底稿确认
- 不 `--no-verify`
- 不在阶段 5 把 `AppSidebar` 换成包

---

## 11. 开工开关

1. 01 第 13 节 1–11 已拍板
2. 本文与 01 联审 Sign Off（已完成）
3. Wave P（placeholder）
4. 确认 Button 底稿（预确认，不立即实现）→ Wave 0（含 0.6 README、0.7 dts/banner）→ 按 §8 从 Text 起；到 Button 用已确认底稿

下一句动作从 Wave P 的 `feat: add ui catalog placeholder page` 开始。

# 03 · Basalt 生产成熟度

> 状态：S0–S10 完成
> 真值：代码与 `src/pages/ui/generated/`（page-status / catalog-api / content-family）
> npm：`@nocoo/basalt@2.0.0-rc.1`（public；`latest` 与 `rc` 均指向该版本）
> 最后更新：2026-09-02

01 做成什么样，02 怎么做。本文只记做到哪。切片契约、文件清单和测试数字以 git 为准，不在此复述。

## 1. 现在

统一 React 控件库，展示站自消费包出口。根 barrel 只放轻叶子与 providers。`AppShell`、`DatePicker`、`DataTable`、图表、`ResourceList`、`DeleteResource` 走子路径。coverage 四项 ≥ 95%。`package:prepublish`（含仓外 tarball 与 Chromium）已绿。

Maps 仍 planned。`InputGroup`、`Breadcrumbs` 有 catalog 页但是薄 API。`DatePicker` / `DataTable` 声明了 optional peer，实现尚未调用。

## 2. 阶段

| 切片 | 内容 | 状态 |
|------|------|------|
| S0 | 示例去品牌、provenance、scenario 真源 | 完成（`e57579c`） |
| S1 | 包契约、仓外 consumer、coverage / prepublish | 完成（`c525640`） |
| S2 | 类型驱动 docs / API / scenario、文档 IA | 完成（`eeb8c43`） |
| S3 | LayerCard、ScrollArea、SegmentControl、PageHeader、StatStrip、ConfirmDialog、TablePager | 完成（`6eed42f`） |
| S4 | Text、Field、Input、InputArea、Checkbox、Radio、Switch | 完成（`5e325a3`） |
| S5 | Select、Combobox、Autocomplete、SensitiveInput、DatePicker | 完成（`fe5c56a`） |
| S6 | Overlay、Toolbar、Tabs、CommandPalette、Sidebar / AppShell | 完成（`2193aed`） |
| S7 | Table / DataTable、TOC、Code、Flow、Grid、Pagination | 完成（`4b5a444`） |
| S8 | 图表 kit 与组合层 | 完成（`1af515b`） |
| S9 | Blocks、layout examples、全站自消费 | 完成（`429399a`） |
| S10 | 文档页、审计、release-ready | 完成（`6a9c214`） |

## 3. Catalog（101，与 `catalog.ts` 一致）

100 ready，1 planned（`maps`）。页状态由「有 docs + 有 hero example」生成，不是手写名单。

| 类 | 条目 | 状态 |
|----|------|------|
| Docs | Installation、Contributing、Colors、Accessibility、Figma Resources、CLI、Design skill、Registry、Changelog | 全部 ready |
| Components | Button、LinkButton、Text、Label、Separator、ScrollArea、Link、Tooltip、ThemeToggle、LayerCard、BasaltMark、Field、Input、InputArea、InputGroup、SensitiveInput、Checkbox、Radio、Switch、Select、Combobox、Autocomplete、DatePicker、Slider、Toggle、ToggleGroup、SegmentControl、Badge、Banner、Empty、Loader、SkeletonLine、Meter、Toast、ClipboardText、Code、CodeBlock、Avatar、Accordion、Dialog、AlertDialog、ConfirmDialog、Popover、DropdownMenu、ContextMenu、HoverCard、Sheet、CommandPalette、Tabs、Table、DataTable、Pagination、Collapsible、Breadcrumbs、NavigationMenu、MenuBar、Toolbar、TableOfContents、Grid、Sidebar、Flow、StatStrip、TablePager、ThemeProvider、LinkProvider | 全部 ready |
| Charts | Charts、Colors、Timeseries、Custom Chart、StatCard、SlotBarChart、BarChart、LineChart、AreaChart、DonutChart、GroupedBarChart、StackedBarChart、Sparkline、HeatmapCalendar、Gauge、RadarChart、FunnelChart、BulletChart、Timeline、Sankey、ItemList、DateNavigation、ChartPalette | 全部 ready |
| Charts | Maps | planned |
| Blocks | Page Header、Resource List、Delete Resource | 全部 ready |

包内另有 `AppShell` / `AppHeader` / `LoadingScreen`：有实现、不进根 barrel、无独立 catalog 页。`typeahead-field` 是 Combobox / Autocomplete 内部件，不单独上架。

Code 的 catalog 显示名是 CodeHighlighted；实现与出口是 `Code` / `CodeBlock`（`./components/code`）。

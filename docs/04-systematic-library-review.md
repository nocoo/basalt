# 04 — Basalt 控件库系统审查与迁移稳定性评估

> 审查基线：2026-09-06，Basalt `2.0.3`，提交 `e61efc1`。第 1–8 节保留该基线的问题与证据，不能当作修复后的现状。
>
> 实施授权：2026-09-06，用户要求由现有 Herdr pi pane 按本文分阶段实施、原子化提交，主 agent 验收及维护状态，并新增复杂 Skeleton 与 Table Library 展示。执行范围、阶段和最新状态见第 9、12 节。实现完成不等于已发布。
>
> 对照：本机 `/Users/nocoo/workspace/references/kumo`，Cloudflare Kumo `2.12.0`，提交 `1159868`。下游重点：pew `44351912`、zhe `120a012`，以及上级目录中声明 Basalt 依赖的项目。下游按当前本地源码审查，不代表已经上线的行为。

## 1. 结论与优先级

Basalt 已有清楚的视觉语言、较完整的基础控件、严格的包产物校验和大量单测。`LayerCard` 的表面层级、应用框架的职责划分、细粒度导出、原生表单语义的建设，以及仓外 tarball 消费测试，都值得保留。

当前成熟度不均衡。`ready` 只证明页面有文档和至少一个例子，部分组件仍有可复现的行为缺陷；文档生成、公共出口、浏览器质量门与发布流程也没有形成完整约束。继续扩大迁移前，应先处理会改变调用行为、破坏布局或使质量门误放行的问题，再扩充控件数量。

| 优先级 | 本文含义 | 首批事项 |
|---|---|---|
| P1 | 应先于进一步扩大迁移或依赖该能力发布解决 | 质量门失效、复制即无法编译的代码、公共出口边界、禁用/表单/焦点契约、standalone 尺寸、基础文本对比度 |
| P2 | 应在对应模块迁移前补齐 | 文档与 agent 入口、版本兼容约定、复杂数据接口、Example 功能与响应式、可访问性和动效一致性 |
| P3 | 持续维护与精修 | 工具链统一、过期豁免清理、次要示例密度和呈现调整 |

证据分为三类：**复现**表示实际执行脚本或浏览器操作；**源码**表示可直接从当前实现确认；**建议**表示面向复用和维护的设计取舍。能力缺口不等于现有功能发生故障，本文分别标注。

建议先处理这些问题组：

| 问题组 | 编号 | 影响 |
|---|---|---|
| 质量与发布门 | Q01–Q04 | 失败的 build/coverage 可能通过 pre-push；CI 跳过完整类型检查；包接入门仍靠手工；tag 部署不等待同一提交 CI |
| 安装与公共接口 | D02、D05、D06 | 四个安装示例生成非法 import；内部文件成为公共子路径；默认几何变更缺少明确兼容政策 |
| 组件行为 | C01–C07 | 禁用链接仍执行、表单 reset 失效、Tab 焦点被拉回、弹层被裁剪、模态与焦点归还不完整 |
| 基础视觉 | C02、C12、E01、E04、E05 | 无 Tailwind 时尺寸错误、小字对比度不足、移动端文档截断、Chat 挤压、Network 图表高度塌缩 |
| 复用路线 | R01–R08 | 优先提炼筛选、上传、目录导航和图表能力；扩大现有组件的可组合性 |

## 2. 审查范围与实际验证

从 [INTEGRATION.md](../INTEGRATION.md) 开始，交叉检查根 README、包 README、`CLAUDE.md`、编号文档、catalog、组件实现、生成脚本、测试配置、hooks、CI/CD 和下游源码。Kumo 作为工程组织与组件契约的参照，不要求改用它的配色、图标、底层 primitive 或全部 API。

### 2.1 已执行的检查

| 检查 | 结果及范围 |
|---|---|
| `bun run typecheck` | 通过；包含 catalog 检查和应用/脚本 TypeScript 检查 |
| `bun run lint` | 通过；773 个文件，无自动修复 |
| `bun run build` | 展示站生产构建通过 |
| `bun run test:coverage` | 173 个测试文件、1,428 个测试通过 |
| 包 `build` | 通过；113 个 JS/声明入口，根入口依赖闭包校验通过 |
| 包 `types:check` | Bundler、NodeNext 两种声明消费检查通过 |
| 包 `pack:check` | 通过；343 个打包文件，109 对通配子路径产物 |
| 包 `publint` | strict 检查通过 |
| `consumer:tailwind` / `consumer:standalone` | 仓外安装 tarball、类型/构建/CSS 存在性检查通过 |
| `consumer:next` | 21 个浏览器门相关测试通过；Next 消费端 hydration、按钮、主题切换、toast portal 检查通过 |
| `consumer:heavy` | 图表、DatePicker、DataTable 的细粒度消费检查通过 |
| OSV | 扫描 `bun.lock` 的 390 个包，无命中；报告 9 条未使用的 ignore |
| Gitleaks | 对 `git archive HEAD` 导出的已提交源码快照扫描，无命中；不是完整历史扫描 |

四项覆盖率为 statements **97.44%**、branches **95.26%**、functions **97.87%**、lines **97.60%**。这是配置范围内的**汇总覆盖率**，不是每个组件都达到 95%，也不是浏览器行为覆盖率。

预发布清单中的命令已逐项验证；未执行 npm publish、部署、push 或 release。实际环境为 Bun 1.4.0、Node 26.7.0，和仓库声明的工具版本存在差异，见 Q06。

### 2.2 浏览器与目录覆盖

- 展示站使用生产构建，通过 Playwright Chromium 检查 **275 个路由/配置组合**：桌面浅色 125、移动端浅色 125、桌面深色 25。桌面为 1440×1000，移动端为 390×844。
- 覆盖 24 个 Example 页面、`/ui` 索引和全部 100 个 catalog 路由；对 24 个 Example 的桌面、移动端首屏进行截图审阅，深色也做了路由与自动可访问性检查。
- catalog 实际为 **100 项：99 ready、1 planned（Maps）**；有 **246 个注册 scenario**，其中 166 个独立 `.tsx` 示例模块，其余内联在 family 文件；48 个条目只有一个 scenario。
- API 生成文件覆盖 **72 项**；另有 27 个 ready 条目使用手写文档。手写并非天然有问题，缺少完整性约束才是问题。
- axe-core 4.11.0 在 272 个组合中报告问题，主要是公共导航/配色与代码滚动区重复命中，不能理解为 272 个独立组件缺陷。`/loading` 的无可见文字是设计行为，已使用正确的 status 选择器复检，无路由失败。
- 对禁用、Tab、reset、模态、焦点恢复、Storage 拒绝、reduced motion、实际 CSS 尺寸等另做了最小浏览器用例。

以上不是全浏览器认证：没有运行真实移动设备、Firefox/WebKit、屏幕阅读器、全部交互状态或所有下游的登录后页面，也没有测量动画帧率。相关建议不会表述为已证实的性能问题。

## 3. 文档完备程度、agent 集成与接口稳定性

### D01 · P2 · 当前入口文档定位不一致【源码】

**位置：**[根 README](../README.md)、[包 README](../packages/basalt/README.md)、[INTEGRATION.md](../INTEGRATION.md)、[03 台账](./03-maturity-program.md)。

根 README 仍把项目介绍为「fully functional personal finance dashboard」，称 17 页、12 个 shadcn 控件，并列出 `/records`、`/targets`、`/stats`、`/help` 等已不存在的路由。包 README 只有短接入说明，没有链接到完整集成手册或版本迁移说明。

`INTEGRATION.md` 对框架、Sidebar、移动端、surface 和页面组织写得细，适合统一应用外壳；它还不能独立承担整个库的接入手册。缺少完整 Next.js/React 19 client boundary、SSR 主题初始化、表单库适配、可选依赖决策、旧风格到包的迁移路径和兼容承诺。

03 文档中的 101 项、100 ready、9 个文档占位页等数字属于历史台账；`CLAUDE.md` 已说明 01–03 是历史资料，2.0.3 也主动移除了占位文档页。问题在于没有新的、可自动更新的当前能力总览接替它，而不是要求重写历史记录。

**建议与验收：**入口区分「安装」「框架集成」「组件 API」「迁移」「贡献与质量门」；README 中每条路由和版本声明均可核对；一个只拿到 npm 包和 README 的新项目可以完成 Vite、Next、standalone 三种接入。

### D02 · P1 · 四个安装代码片段无法编译【复现＋源码】

**位置：**[UiPlaceholderPage.tsx](../src/pages/ui/UiPlaceholderPage.tsx#L149)、[catalog.ts](../src/pages/ui/catalog.ts)。

`ReadyDoc` 用展示名 `entry.name` 拼接导入符号，页面与 Copy page 同时生成：

```ts
import { Custom Chart } from "@nocoo/basalt/charts/custom-chart";
import { Page Header } from "@nocoo/basalt/components/page-header";
import { Resource List } from "@nocoo/basalt/components/resource-list";
import { Delete Resource } from "@nocoo/basalt/components/delete-resource";
```

实际导出分别是 `CustomChart`、`PageHeader`、`ResourceList`、`DeleteResource`。本次对 ready 条目的生成 import 与包产物导出做了核对；现有 catalog freshness 检查不会捕获这种语法错误。

**建议与验收：**分开 `displayName`、`exportName`、`importPath`；安装、Usage、Copy page 共用结构化来源。把复制出的代码放入仓外 TypeScript 消费端编译，覆盖所有公开条目，禁止靠展示文字推导符号。

### D03 · P2 · API 文档的完整性约束不够【源码＋统计】

**位置：**[generated/catalog-api](../src/pages/ui/generated/catalog-api)、[feedback family](../src/pages/ui/catalog-content/families/feedback.tsx#L38)、[overlay family](../src/pages/ui/catalog-content/families/overlay.tsx)、[Button API](../src/pages/ui/generated/catalog-api/button.ts)。

已有类型抽取、生成结果 freshness 检查和 example 源码绑定，这是可靠的基础。缺口集中在两处：

1. 部分手写 API 仍由通用 helper 回退为 `className`。例如 Slider、Empty、Meter 的关键业务 props 没有出现在完整参考中；Accordion、Sheet 等也没有系统列出 compound surfaces、受控状态和事件。不能把 BasaltMark 这类本来就只有 `className` 的组件计作缺陷。
2. 生成器能够抽取类型，但生成内容取决于源码元数据。Button 的 `variant`、`size`、`loading` 等没有生成默认值和描述，尽管实现中有明确默认值。Chat 的部分 API 与 Usage 字符串仍人工维护，容易与实现脱节。

另外，100 个 catalog 条目不是整个公共出口的完整清单：`AppHeader`、`AppShell`、`LoadingScreen`、`AccentProvider` 等主要在集成文档中出现；内部 chart helper 却因通配出口可被导入。需要一张覆盖公共 symbol、子组件、hook、provider、CSS 的统一清单。

**建议与验收：**生成每个公开 surface 的类型、默认值、说明、事件和 ref 目标；明确原生继承 props 的文档策略；对手写豁免建立显式列表。新增公开 API 必须有文档归属，不能用一个通用 `className` 表格换取 ready。

### D04 · P2 · agent 获取的是工作区知识，缺少随版本交付的知识【源码＋Kumo 对照】

**位置：**[CLAUDE.md](../CLAUDE.md)、[catalog-source.ts](../src/pages/ui/catalog-source.ts#L38)、[包 files/exports](../packages/basalt/package.json)。

已有 `CLAUDE.md`、内部 TypeScript registry、页面源码出处和 Copy page，agent 并非完全无文档可用。但当前仓库没有项目级 `AGENTS.md` 入口，也没有发布 `llms.txt`、可拉取的 JSON/Markdown registry、随 npm 包分发的使用指南或可安装的设计 skill。包只携带 dist、README、LICENSE；组件源码链接固定指向 `main`，和调用方已安装的版本可能不同。

Kumo 的可借鉴点是 [AI Usage Guide](../../../references/kumo/packages/kumo/ai/USAGE.md)、[registry 生成器](../../../references/kumo/packages/kumo/scripts/component-registry/index.ts)、[llms.txt 路由](../../../references/kumo/packages/kumo-docs-astro/src/pages/llms.txt.ts) 和 [design skill 生成脚本](../../../references/kumo/packages/kumo-docs-astro/scripts/generate-design-skill.mjs)。本次检查的是这些源码与发布结构；未把未构建 clone 中不存在的 registry JSON 当作已验证产物。

**建议与验收：**先交付跨 agent 的短入口和版本化使用指南，再把现有 registry 输出成稳定机器接口。内容至少包含精确导入、CSS 合约、provider 边界、禁用/表单规则、成熟度和升级说明。CLI 是可选分发方式，不必为追平 Kumo 先造一套 CLI。agent 在一个空白消费端按已安装版本完成页面，复制代码可编译，并能识别 experimental 能力。

### D05 · P1 · 内部文件通过通配出口成为公共 API【源码＋产物检查】

**位置：**[package.json](../packages/basalt/package.json#L38)、[包构建入口](../packages/basalt/vite.config.ts#L11)、[typeahead-field.tsx](../packages/basalt/src/components/typeahead-field.tsx)、[charts/sample.ts](../packages/basalt/src/charts/sample.ts)。

构建会纳入全部非测试 TS/TSX 文件，再由 `./components/*`、`./providers/*`、`./charts/*` 对外开放。于是 `components/typeahead-field`、`components/overlay`、`charts/sample` 等实现细节和样例数据也可被导入。历史台账称 TypeaheadField 为内部共核，包却没有执行这个边界。

当前 verify-dist/verify-pack 严格验证「通配路径和产物相符」，没有验证「哪些路径应当允许被用户依赖」。文件重命名或拆分因此可能变成意外的公共 API 变更。

**建议与验收：**建立显式公共 manifest，构建、exports、catalog 和类型基线从它派生；公共 chart kit helper 可保留，但必须有明确归属。对已经发布的子路径先调查消费者、建立 deprecated 兼容转发，再按版本政策收窄，不能把本次建议理解为立刻删除所有通配路径。

### D06 · P2 · 默认布局与行为尚未纳入明确的版本兼容政策【历史差异＋源码】

**位置：**[CHANGELOG.md](../CHANGELOG.md)、[LayerCard](../packages/basalt/src/components/layer-card.tsx)、[Dialog](../packages/basalt/src/components/dialog.tsx)。

比较 `v2.0.0..v2.0.3`：LayerCard 默认 padding 从 `none` 变为 `md`，表面引擎和 Primary/Secondary 语义改变；Dialog padding 从 `p-8` 改为 `p-6`，footer 增加 `mt-6`。这些调整有设计意图，也符合旧计划允许视觉改进的方向；同时它们会改变已迁移应用的实际布局。

当前没有公共类型/CSS 默认值基线、弃用期和对应的迁移说明门，无法清楚区分兼容修复、增加能力和默认行为改变。不能用「类型仍能编译」代表升级没有影响，也不应把所有颜色微调一律定为 major。

**建议与验收：**写明稳定 API 包括 props、事件、ref、DOM/ARIA、表单提交值以及约定的默认尺寸/间距；规定 patch/minor/major 的判断边界。对默认几何调整给出 before/after 与保留旧布局的方法，用两种真实消费端验证。新能力先标实验性，经过实际项目验证后再承诺稳定。

## 4. Components：行为、专业接口与可组合性

### 4.1 与 Kumo 对照应采用的标准

| 维度 | Basalt 现状 | Kumo 中可借鉴的具体机制 |
|---|---|---|
| 变体与类型 | CVA、原生/Radix props、部分 JSDoc；默认值元数据不均衡 | [Button](../../../references/kumo/packages/kumo/src/components/button/button.tsx) 的 variants/defaults 元数据、派生类型、icon-only 可访问名称约束 |
| 组件契约 | 基础输入和 Radix 包装较完整，部分自制控件的焦点/表单组合失效 | 统一 controlled/uncontrolled、ref、键盘和 primitive 使用方式；无需整体更换 Radix |
| 模板与块 | ResourceList 固定两列；DeleteResource 接口较薄 | [ResourceListPage](../../../references/kumo/packages/kumo/src/blocks/resource-list/resource-list.tsx) 的组合式页面壳；[DeleteResource](../../../references/kumo/packages/kumo/src/blocks/delete-resource/delete-resource.tsx) 的确认/错误反馈接口 |
| 发布面 | 小根入口值得保留，通配子路径边界过宽 | 显式 exports、[changeset 校验](../../../references/kumo/ci/scripts/validate-kumo-changeset.ts) |
| 文档与 agent | 内部生成能力较强，对外分发不足 | registry/schema、Markdown、AI guide、版本一致的发布链 |
| 质量标准 | jsdom/覆盖率强，真实控件浏览器契约弱 | [browser config](../../../references/kumo/packages/kumo/vitest.browser.config.ts)、[variant lint](../../../references/kumo/packages/kumo/lint/enforce-variant-standard.js) |

专业程度应按契约、可组合性、可访问性、状态完整性、版本维护判断，不能只按「有没有同名组件」或代码行数判断。Kumo 也有自己的历史包袱，不宜照搬全部实现。

### C01 · P1 · `Button asChild` 丢失禁用与 loading 语义【复现】

**位置：**[button.tsx:69](../packages/basalt/src/components/button.tsx#L69)。

`<Button asChild disabled loading><a href="#activated">…</a></Button>` 仍触发点击回调并修改 hash，输出节点没有 `aria-disabled`、`aria-busy`。普通 button 分支正确禁用，asChild 分支却在解构后丢弃了这些属性；ref 类型仍固定为 HTMLButtonElement。

**建议与验收：**定义 button/link/asChild 各自的禁用与 ref 契约；禁用时鼠标、Enter、程序触发均不得执行动作或导航，loading 不产生重复提交。优先利用已有 LinkButton 明确链接语义，避免用类型允许、运行时忽略的 props 模拟支持。

### C02 · P1 · standalone CSS 依赖宿主 reset，默认尺寸失真【复现】

**位置：**[standalone 构建脚本](../scripts/build-basalt-standalone.ts)、[Button](../packages/basalt/src/components/button.tsx)、[Input](../packages/basalt/src/components/input.tsx)、[接入说明](../INTEGRATION.md#L85)。

在只导入 standalone、没有 Tailwind/全局 reset 的 320px 容器中实测：Input 是 **346×54px**，`box-sizing: content-box`；default Button 保留 **2px outset 原生边框**与浏览器字体；一个 `w-full p-4` 容器变成 352px。现有 `consumer:standalone` 仍通过，因为只检查构建/CSS 字符串。

「不注入全局 Preflight」是明确且合理的约束，但组件仍需承担自身盒模型、原生边框和字体继承的基础样式，或明确声明额外宿主要求。现在接入说明仅强调高度设置，不足以保证展示站的尺寸契约。

**建议与验收：**为组件根和原生控件设置有作用范围的 base styles；避免为修复尺寸而意外重置整个宿主站点。两个 CSS 合约都在浏览器断言宽高、边框、字体、颜色及 portal 内部控件，不以「CSS 非空」替代几何验证。

### C03 · P1 · Combobox/Autocomplete 在 LayerCard 内被裁剪【复现＋源码】

**位置：**[typeahead-field.tsx](../packages/basalt/src/components/typeahead-field.tsx#L286)、[LayerCard 根样式](../packages/basalt/src/components/layer-card.tsx)。

TypeaheadField 的列表是本地 absolute 元素，没有 portal、碰撞处理和最大高度；LayerCard 根有 `overflow-hidden`。在卡片内打开 Combobox，首个选项已超出卡片底部，选项中心位置的 `elementFromPoint` 命中 HTML，无法实际点击。

**建议与验收：**建立统一浮层定位方式，支持滚动容器、Dialog、卡片和视口边缘；限制菜单高度、允许内部滚动。关闭、选中、Escape 和 outside click 的焦点行为需和表单逻辑一起验证。

### C04 · P1 · Autocomplete 提交自由文本时阻止正常 Tab 离开【复现】

**位置：**[typeahead-field.tsx](../packages/basalt/src/components/typeahead-field.tsx#L130)。

输入不在选项中的 `Free text` 后按 Tab，值已提交，但焦点仍是原输入框。blur 提交经过 `commitValue`，它在输入失焦时无条件调用 `focus()`，把焦点从下一个控件拉回。

**建议与验收：**区分「选项点击后归还焦点」和「blur/Tab 仅提交值」；覆盖 Tab、Shift+Tab、鼠标离开、Enter、清空与中文输入法确认，避免由同步值的共用函数决定焦点去向。

### C05 · P1 · DatePicker 的外部 ref 与原生表单契约冲突【复现】

**位置：**[date-picker.tsx](../packages/basalt/src/components/date-picker.tsx#L559)。

隐藏 input 先设置 `ref={hiddenRef}`，随后 spread 的 `formRest` 可以带入用户 ref 并覆盖它。无外部 ref 时，默认日期 `2026-09-01` 改为 09-02 后 reset 能还原；提供外部 ref 时 reset 后仍为 **09-02**，内部通过 hiddenRef 绑定的 reset 监听失效。

另一个原生表单问题：空值且 required 时提交被正确阻止，但浏览器把焦点给了 **1×1px、aria-hidden 的 date input**，而非可见触发按钮，也没有可见错误反馈。

**建议与验收：**合并内部/外部 ref，明确 ref 指向隐藏字段还是可见交互节点；通过可见触发器表达 invalid 和焦点。覆盖 FormData、required、reset、disabled/readOnly、受控/非受控、外部 ref、range 提交值，且测试真实表单提交而非只检查回调。

### C06 · P1 · Dock overlay 声明模态，背景仍能交互【复现】

**位置：**[dock.tsx](../packages/basalt/src/components/dock.tsx#L225)。

overlay 设置 `role="dialog"`、`aria-modal=true`，遮罩却局限在所在的相对定位区域，背景没有完整的 inert/可访问树隔离。打开后点击父区域以外的背景按钮，回调照常执行，焦点也移到了背景。

**建议与验收：**明确这是全局模态还是区域面板。全局模态应复用成熟的模态 primitive；区域面板应采用对应的非模态语义。push 模式可以继续保留。覆盖背景点击、Tab/Shift+Tab、嵌套浮层、Escape、焦点归还和移动端遮罩范围。

### C07 · P2 · `useConfirm` 路径关闭后焦点落到 BODY【复现】

**位置：**[confirm-dialog.tsx:118](../packages/basalt/src/components/confirm-dialog.tsx#L118)。

`onCloseAutoFocus` 总是 preventDefault，再聚焦可选的 triggerRef。`useConfirm` 的独立调用方式没有 trigger 节点，点击外部按钮打开并取消后，Promise 返回 false，但 activeElement 是 BODY。

**建议与验收：**无显式 trigger 时保存打开前的 activeElement，关闭后恢复到仍在文档中的合理目标。ConfirmDialog 的 loading/关闭由调用方控制是现有设计，不必改成自动代管；但 `void onConfirm()` 的错误归属应写清楚。DeleteResource 捕获异常后没有错误呈现，也应提供 error/retry 的表达方式。

### C08 · P2 · Slider 暴露了未完整实现的底层契约【浏览器＋源码】

**位置：**[slider.tsx](../packages/basalt/src/components/slider.tsx)。

props 完整继承 Radix Root，但实现只渲染一个 Thumb。`defaultValue={[20,80]}` 的实际页面只有一个滑块，值为 20，第二端点无法操作。单值场景把 `aria-label="Volume"` 传给 Root，内部 `role=slider` 的 Thumb 没有可访问名称；`/ui/slider` 在桌面和移动端均被 axe 命中。

**建议与验收：**明确仅支持单值并收窄类型，或按值数组完整渲染多个 Thumb；让名称落在真实交互节点，并支持各端点不同名称。用键盘操作单值/范围、disabled、步长和越界值，结合可访问树验证。

### C09 · P2 · Empty 接受 children，却静默丢弃 action【复现】

**位置：**[empty.tsx](../packages/basalt/src/components/empty.tsx)、[LayerCard.Empty](../packages/basalt/src/components/layer-card.tsx)。

Empty 继承 HTMLAttributes，类型允许 children，但渲染内部 title/description 覆盖了 spread 进来的 children。`<Empty title="No items"><button>Create first item</button></Empty>` 没有按钮。下游 ai-arsenal 已在 Empty 外部追加操作来补齐这个能力。

**建议与验收：**增加明确的 action/children slot，并区分首次空状态、筛选无结果、错误与重试。扩展已有 Empty/LayerCard.Empty，避免再造一个同职责 EmptyState。每个允许的 slot 都应有真实消费例子。

### C10 · P2 · DatePicker 的日历可访问性和本地化不完整【源码】

**位置：**[date-picker.tsx:650](../packages/basalt/src/components/date-picker.tsx#L650)。

已有方向键移动、禁用日期、范围、时区与原生提交值处理；这些是有效能力。当前日历仍是 div/span/button 网格，缺少完整的 grid/row/gridcell 关系和月份切换播报；Home/End/PageUp/PageDown 等日历导航契约未实现。locale 影响日期格式，但 `Pick a date`、`Prev`、`Next`、calendar 等文案仍硬编码英文。

**建议与验收：**明确支持的日历键盘模型和语言接口，按 WAI-ARIA 日历交互方式验证；补受控月份、标签与错误信息的本地化。采用自制实现或 date primitive 都可，但应以行为完整性为选择依据，不能因声明了 react-day-picker peer 就认为已获得它的能力。

### C11 · P2 · ThemeProvider 的持久化与宿主边界过窄【复现＋源码】

**位置：**[providers/theme.tsx](../packages/basalt/src/providers/theme.tsx#L13)。

localStorage 的 get/set 没有异常处理。浏览器模拟 Storage 拒绝访问时，Provider 抛出 `SecurityError`，内容为空。固定键名 `theme`、直接修改 documentElement，以及固定 server snapshot，也限制了已有主题系统和 SSR 初始化的整合。

**建议与验收：**明确是否支持 Storage 不可用环境；提供可靠的内存回退，并考虑 `storageKey`、初始主题、禁用持久化或外部受控主题适配。测试 system 切换、跨标签同步、SSR 首屏、存储拒绝及宿主已有主题，不要求每个应用都移除自己的主题策略。

### C12 · P1 · 公共文字与强调色存在对比度缺口【axe＋颜色计算】

**位置：**[tokens.css](../packages/basalt/src/styles/tokens.css)、[AccentProvider](../packages/basalt/src/providers/accent.tsx)、Button/Badge/导航文字。

| 典型组合 | 约计对比度 | 问题 |
|---|---|---|
| 浅色 muted 文本 `#737373` / L0 `#eeeff2` | 4.12:1 | 常用于小字，低于 4.5:1 |
| 同一文本 / L1 `#f6f7f8` | 4.42:1 | 边界仍不足 |
| 深色 muted 文本 `#7a7a7a` / L2 `#1f1f1f` | 3.84:1 | 小字不达标 |
| 同一文本 / L1 `#1b1b1b` | 4.01:1 | 小字不达标 |
| 白字 / primary `#3c83f6` | 3.63:1 | 默认按钮等普通字号文字不足 |

这些来自默认主题本身，公共 chrome 在许多路由重复触发 axe。低 opacity 的 Login 辅助文字还会进一步下降。不能因为大标题满足 3:1，就把同一颜色用于所有小字。

**建议与验收：**按「文字/填充/边线」用途区分强调色，保留层次感并调整文本对比；对浅深主题、L0–L3、可选 accent、hover/focus/selected 做成有限配对矩阵。disabled 的例外与装饰图形单独处理，不用一条规则机械加深全部颜色。

### C13 · P2 · 图表的可访问性被统一降为图片标签【源码】

**位置：**[charts/frame.tsx:31](../packages/basalt/src/charts/frame.tsx#L31)、[heatmap-calendar.tsx](../packages/basalt/src/charts/heatmap-calendar.tsx)。

ChartFrame 强制 clone 子图表为 `accessibilityLayer: false`，外层只有 role=img 和 aria-label；调用者即使请求 Recharts 的交互层也会被覆盖。多数默认 label 是泛称，不能传达趋势或数据；HeatmapCalendar 的每日 tooltip 触发元素不可键盘聚焦。

**建议与验收：**提供摘要/数据表 slot，保留可选的键盘探索能力；热力图支持聚焦和日期/数值朗读。展示图可以保持非交互，但必须有足够的文本替代，不能要求屏幕阅读器用户从「Line chart」推断内容。

### C14 · P2 · DataTable 与 ResourceList 的能力边界不足以承接大型列表【能力缺口】

**位置：**[data-table.tsx](../packages/basalt/src/components/data-table.tsx)、[resource-list.tsx](../packages/basalt/src/components/resource-list.tsx)。

DataTable 已有本地排序、筛选、分页、选择、loading/empty 和较严谨的行标识测试，适合中小型客户端数据集。当前排序完全内部持有，没有完整的服务端排序/总数/分页模式；列宽、可见性、固定列、虚拟化和可访问名称/说明的扩展面有限。大量行 ID 与任意数值排序实现，也增加了长期维护成本。

ResourceList 只接受 `{name,status}[]`，固定英文两列，没有 create、filter、bulk action、error、loading 或自定义行结构。它难以作为 Kumo ResourceListPage 所代表的组合式资源页模板；Kumo 的价值在于页面组合边界，不是替应用包办查询逻辑。

**建议与验收：**明确轻量 DataTable 的适用范围，服务端列表采用受控状态或可选 adapter；ResourceList 以 PageHeader、工具区、结果/状态区、分页区组合。不要一次塞入所有表格能力，也不要把尚未使用的 `@tanstack/react-table` peer 当作已实现能力。

### C15 · P2 · XY 图表接口把业务数据压缩为三个固定系列【能力缺口＋下游证据】

**位置：**[charts/series.ts](../packages/basalt/src/charts/series.ts)、[pew 动态模型系列图](../../pew/packages/web/src/components/dashboard/device-model-trend-chart.tsx)。

`XYSeriesKey` 只有 `y | y2 | y3`，XYPoint 同样固定字段。pew 的 modelKeys 来自数据，需要任意数量、任意 key 的系列、百分比堆叠、坐标域、单位格式、模型渐变与组合 tooltip；Fundly 也有多系列、左右轴等需求。迁移到现有组件会出现字段重映射、能力丢失或再次维护自定义图表。

**建议与验收：**扩展现有 ChartFrame/config/palette/legend/tooltip kit，允许类型安全的数据 key、series descriptor、formatter/domain/stack 配置与自定义 content。保留简单包装组件的易用默认值；用真实多系列、空值、负值和动态增删系列验证。不要按每个业务仪表盘再增加一套同名图表。

### 4.2 全部 catalog 家族覆盖表

下表按当前 family manifest 归组，覆盖全部 99 个 ready 条目及 Maps。数量是文档/例子覆盖数据，不是通过专业认证的数量。

| 家族 | 条目与注册 scenario | 涵盖条目 | 审查判断 |
|---|---|---|---|
| Foundation | 12 项 / 35 例；10 项生成 API | Button、LinkButton、Text、Label、Separator、ScrollArea、Link、ThemeToggle、LayerCard、BasaltMark、ThemeProvider、LinkProvider | 视觉与框架基础可保留；优先 C01/C02/C11、D03/D06 |
| Forms | 16 项 / 69 例；13 项生成 API | Field、Input、InputArea、InputGroup、SensitiveInput、Checkbox、Radio、Switch、Select、Combobox、Autocomplete、DatePicker、Slider、Toggle、ToggleGroup、SegmentControl | 普通输入状态相对丰富；复合输入的焦点、原生表单、浮层契约需补 C03–C05、C08/C10 |
| Overlay | 11 项 / 23 例；5 项生成 API | Tooltip、Accordion、Dialog、AlertDialog、ConfirmDialog、Popover、DropdownMenu、ContextMenu、HoverCard、Sheet、Collapsible | Radix 基础可靠；文档深度不均，独立 confirm 和复杂嵌套要验证 C07 |
| Feedback | 11 项 / 44 例；2 项生成 API | Badge、Banner、Empty、Loader、SkeletonLine、Meter、Toast、ClipboardText、Code、CodeBlock、Avatar | Toast/Badge/Banner 例子不少；API 表格和空/错/重试组合不足，见 C09、D03 |
| Navigation | 9 项 / 20 例；6 项生成 API | CommandPalette、Tabs、Pagination、Breadcrumbs、NavigationMenu、MenuBar、Toolbar、TableOfContents、Sidebar | Sidebar 与分页已有较完整控制接口；目录编辑、长导航和路由 adapters 是下游复用机会 |
| Data/Layout | 11 项 / 24 例；11 项生成 API | DescriptionList、Table、DataTable、Grid、SectionRule、Flow、StatStrip、TablePager、PageHeader、ResourceList、DeleteResource | 结构层级清楚；资源页能力和失败状态偏薄，见 C14/R05 |
| Chat | 6 项 / 8 例；2 项生成 API | Fab、Dock、ChatBubble、ChatComposer、ChatHeader、ChatInbox | 基础视觉存在；真实发送、流式、停止、错误及移动端组合不足，见 C06/E03/E04/E07 |
| Charts | 23 项 / 23 例；全部生成 API | Charts、Colors、Timeseries、CustomChart、StatCard、SlotBar、Bar、Line、Area、Donut、GroupedBar、StackedBar、Sparkline、HeatmapCalendar、Gauge、Radar、Funnel、Bullet、Timeline、Sankey、ItemList、DateNavigation、Palette | API 生成齐全但每项只有一例；数据扩展、可访问性与容器组合需 C13/C15/E05 |
| Planned | 1 项 / 0 例 | Maps | 已明确排除，不把它列为应立即补齐的缺陷 |

`CodeHighlighted` 已提供基于正则的基础高亮，Code/CodeBlock 提供排版；文档应明确各自职责、语言范围和复制操作的组合方法。

## 5. 6DQ：实际落地与缺口

沿用 [01 文档 §11](./01-plan-2-0.md#11-6dq) 的六个维度：**L1、L2、L3、G1、G2、文档**。不另造 G3，也不把静态展示站没有 HTTP API 当成缺少 API E2E。

### 5.1 执行矩阵

| 维度 | 当前实际执行 | 结论 |
|---|---|---|
| L1：单元/行为 | pre-commit 跑 test；pre-push 与 CI 跑 coverage；包代码在分母内，四项汇总 95% 门槛 | 本次全部通过；jsdom 很难证明布局、原生焦点和实际渲染正确 |
| L2：集成 | HTTP API 对本站为 N/A；组件库仍有 exports、tarball、CSS、types、optional peers 的集成责任 | 仓外 A/B/C/D 和声明检查已实现，主要在手工 prepublish 路径 |
| L3：真实浏览器 | `consumer:next` 和浏览器门相关测试；未进入普通 CI/hook | 对一个最小 Next fixture 有真实证明，对全部控件和 Examples 仍不足 |
| G1：静态分析 | pre-commit 有完整 typecheck+lint；CI 有 Biome、catalog/build，显式跳过 typecheck | 类型门没有在不可绕过的远端路径落地 |
| G2：安全 | pre-commit gitleaks staged；pre-push OSV；固定 SHA 的共享 CI 默认启用两项扫描 | 机制存在，本次本地扫描通过；豁免与版本管理需要维护 |
| 文档 | catalog API、page-status、content freshness 自动检查；编号文档与 INTEGRATION 人工约束 | 能拦生成内容过期，不能证明复制代码可编译、文档完整或随版本发布 |

已读取 CI 固定引用的 [base-ci 工作流源码](https://github.com/nocoo/base-ci/blob/aec4adc1a817c56790d1698329ef9398a15a754a/.github/workflows/bun-quality.yml)，确认默认 lint、安全扫描、Bun latest 以及 L3 默认关闭；没有仅凭名称推断共享 CI 的职责。

### Q01 · P1 · pre-push 可在 build/coverage 失败后返回成功【故障注入复现】

**位置：**[.husky/pre-push](../.husky/pre-push)。

```sh
bun run build && bun run test:coverage && bun run lint
osv-scanner scan --lockfile=bun.lock --config=osv-scanner.toml
```

Husky 用 `sh -e` 执行，但 AND-list 中间失败不触发预期的立即退出，下一行 OSV 成功会成为整个脚本的退出状态。使用临时 PATH stub、按相同 shell 方式执行，得到：

| 注入故障 | 故障命令退出码 | hook 最终退出码 |
|---|---|---|
| build 失败，OSV 成功 | 41 | **0** |
| coverage 失败，OSV 成功 | 41 | **0** |
| lint 失败 | 41 | 41 |

没有执行真实 push。**验收：**每个步骤单独失败时 hook 都非零退出，后续成功不得覆盖失败；同时在 CI 保留独立门，不能只依赖本机 hook。

### Q02 · P1 · CI 主动把完整类型检查替换成 `true`【源码】

**位置：**[ci.yml](../.github/workflows/ci.yml#L16)。

`typecheck-command: "true"` 跳过 tsc。Vite 构建负责转译；catalog API 检查只覆盖特定元数据，不等价于完整类型检查。pre-commit 的本机检查无法覆盖禁用 hooks、不同机器或不同提交来源。

**验收：**在 PR/主分支同一提交上实际执行应用、脚本、包的类型检查；用一个仅 tsc 能发现的 fixture 证明门能拒绝，不要求在产品源码中留下故意错误。

### Q03 · P1 · 包质量门没有接进常规 CI，且 CSS 验收弱于原设计【源码＋复现】

**位置：**[根 scripts](../package.json)、[包 prepublishOnly](../packages/basalt/package.json)、[consumer-gate.ts](../scripts/consumer-gate.ts#L219)、[consumer-browser.ts](../scripts/consumer-browser.ts)。

包的 build、Bundler/NodeNext 声明、pack、publint、A/B/C/D 都已实现；`prepublishOnly` 也正确指向总门。这些是实质性的投入。但常规 CI 只构建展示站；手工 npm 流程先运行总门，再 `--ignore-scripts` 发布，缺少绑定到同一 tarball/提交的不可变证据。

A/B/D 主要证明 import、类型、构建和 CSS 包含 token/class；C 验证一个显式 client boundary 内的 Button、ThemeProvider、Toast。01 计划写过「Tailwind 与 standalone 断言 Button 宽高和颜色」，当前门没有落实到真实几何，因而 C02 能通过全部现有接入检查。

**验收：**CI 对包变更运行相关包门；发布记录 tarball hash/提交与验证结果。A/B 增加真实尺寸、颜色和 portal 样式；C 增加表单、shell 和浮层组合；D 验证实际图形与容器。保留已有临时目录隔离、可选 peer 缺省、故障清理测试，不重写成更脆弱的仓内 alias 测试。

### Q04 · P1 · release 的文档限制没有成为程序限制【源码】

**位置：**[scripts/release.ts](../scripts/release.ts#L250)、[release.yml](../.github/workflows/release.yml)、[CLAUDE 发布规则](../CLAUDE.md#L95)。

CLAUDE 已明确提示生产不要使用当前 `bun run release`，直到它限制 main、等待 CI、只推指定 tag。脚本仍没有这些门，并使用 `git push --tags`。tag/手动部署路径只校验版本匹配和 site build，不等待该提交的 CI/包门。

main 持续部署已经 checkout `workflow_run.head_sha`，这一点是正确的；缺口主要在另一条 tag 路径及手工 npm 证据绑定。

**验收：**把文档规则落实到脚本；精确推送一个 tag；所有部署验证同一 SHA；失败或未完成的 CI 不得发布。使用 stub/sandbox 仓库测试分支、CI、tag、版本错误，不用真实生产部署来测试发布门。

### Q05 · P2 · 覆盖率与 ready 状态容易被误解为端到端质量【配置＋复现】

**位置：**[vitest.config.ts](../vitest.config.ts)、[biome.json](../biome.json)、[catalog-page-status.ts](../scripts/catalog-page-status.ts#L20)。

覆盖率分母包含包源码，但展示站 pages/layout/hooks 并非全在分母内；这是当前明确的范围约定，并非单纯调阈值能修复。DataTable 的复杂行 ID 单测很多，却无法发现移动端 API 截断；DatePicker 的覆盖率也不能替代外部 ref+原生 reset 的组合测试。Biome 还关闭了部分交互/键盘/语义规则，浏览器 axe 和视觉检查没有补到 CI。

`ready` 的条件只是 `docs && examples[0]`。应把「文档可展示」「行为契约验证」「迁移可用」分开记录。现有 Vitest 5 在 CI 默认 `allowOnly: false`，已能拒绝 `.only`；skip 的原因与治理规则可以另行补齐。

**验收：**保留合理覆盖率阈值，新增能捕获本文缺陷的契约测试和有限浏览器矩阵；为测试豁免、skip、可访问性规则关闭给出原因和复查机制，不用无意义的单测刷高分母。

### Q06 · P3 · 工具版本与安全豁免需要归一维护【源码＋扫描】

根 packageManager 固定 Bun 1.3.6，CD 使用 1.3.11，共享 CI 默认 latest，本次机器是 1.4.0。OSV 配置中的 9 条 ignore 全部被本次扫描报告为 unused；说明升级后旧豁免没有同步回收。CI 调用方未显式传 `osv-config`，本地却指定 `osv-scanner.toml`，也应核对同一规则集。

**位置：**[package.json](../package.json)、[release.yml](../.github/workflows/release.yml)、[osv-scanner.toml](../osv-scanner.toml)。**验收：**统一或明确验证工具版本矩阵；清理无效豁免，保留必要豁免的原因、责任人与复查条件；本机和 CI 的扫描结果可解释。

## 6. Examples：完备性、布局与动画

### E01 · P2 · 文档移动端 API 被截断，标题区缺少窄屏重排【复现】

**位置：**[UiPlaceholderPage.tsx:107](../src/pages/ui/UiPlaceholderPage.tsx#L107)、同文件 ReadyDoc header、[DocCode](../src/pages/ui/DocCode.tsx)。

390px 视口中，API 容器宽约 300px，但 PageHeader 表格内容宽 532px、DatePicker 539px、DataTable 596px；外层 `overflow-hidden` 让右侧内容不可见，也没有横向滚动。长组件名还会和 Copy page/GitHub 挤在一行。这里的问题发生在文档页 header，不代表 PageHeader 组件自身的响应式布局同样错误。

DocCode 的部分横向滚动区域无法被键盘聚焦，axe 多次报告 `scrollable-region-focusable`。

**验收：**API 采用可访问的滚动容器或窄屏纵向字段布局；代码区域可键盘滚动；长标题与操作区在 320/390px、200% 缩放、长类型/长文案下仍完整。

### E02 · P2 · hero 与第一个 scenario 重复挂载，产生重复 ID【复现】

**位置：**[ReadyDoc](../src/pages/ui/UiPlaceholderPage.tsx#L149)、Field/Input/InputArea 示例。

hero 渲染 `examples[0]`，下方又遍历全部 examples。因此一页内重复出现 `field-hint-email`、`field-hint-email-hint`、`ex-input-email`、`ex-input-email-hint`、`ex-notes` 等 ID。label/description 的归属可能指向另一份实例；有状态例子也运行了两份独立状态。

**验收：**采用每实例唯一 ID，或明确 hero 与示例列表的去重规则；整页扫描无重复 ID，点击第二份 label 不能把焦点交给第一份。保留多个独立实例本身可以，但 ID 和状态必须隔离。

### E03 · P2 · 部分“模板”只有外观，未演示完整交互闭环【源码＋浏览器】

**位置：**[ChatPage](../src/pages/ChatPage.tsx#L85)、[SettingsPage](../src/pages/SettingsPage.tsx#L439)、[DataPage](../src/pages/DataPage.tsx)、[FormsPage](../src/pages/FormsPage.tsx)。

- Chat 两处 `onSend={() => undefined}`；实测输入后 Enter 清空输入框，但没有新增消息。清空操作也没有完整演示。
- Settings 外观选项把 `aria-checked` 固定为 dark，点击 Light 不改变主题；页面本来处于 light 时仍显示 Dark 被选中。保存、改密、撤销会话等按钮主要是摆放示例。
- Data 的搜索框没有绑定数据，Filter 无动作。
- Forms 有 form 外观，却没有 submit/验证/失败流程；Button 默认 type=button，点击 Save 不提交；Browse files 没有文件选择器。

模板可以使用假数据和模拟服务，但应有可观察的成功/失败/取消路径，或明确标成静态布局样例。`InteractionShowcasePage` 已有真实本地表单状态、toast 和 dialog，可作为改造参考，无需接真实后端。

### E04 · P1 · Chat 的固定侧栏宽度破坏移动端组合【截图＋源码】

**位置：**[ChatPage.tsx](../src/pages/ChatPage.tsx)、[Dock](../packages/basalt/src/components/dock.tsx)、[ChatInbox](../packages/basalt/src/components/chat-inbox.tsx)。

移动端可用内容区域约 350px，push dock 固定 `20rem`，主栏只剩极窄的一条文字；另一个 inbox 模式使用固定 `w-56` 侧栏，消息区也被压缩。桌面的推入/覆盖两个概念清楚，窄屏却缺少模式切换。

**验收：**窄屏采用完整消息页、可返回的 master/detail 或合适的 overlay；关闭时焦点回到触发器，输入框在软键盘出现时仍可达。这里需要同时调整示例组合与公共容器的最小宽度/模式约定。

### E05 · P2 · Network 页面三个图表高度塌缩，Sankey 输出非法 SVG【复现】

**位置：**[NetworkOpsDashboardPage.tsx:114](../src/pages/NetworkOpsDashboardPage.tsx#L114)、[SankeyCard](../src/components/dashboard/SankeyCard.tsx)、[StackedBarCard](../src/components/dashboard/StackedBarCard.tsx)、[SankeyChart](../packages/basalt/src/charts/sankey.tsx)。

桌面稳定渲染后测得 Stacked engagement 图表容器高 **0px**，Sankey 与 Radar 仅 **30px**。Sankey rect 的高度出现 `-6.857142857…` 等负值，浏览器控制台报错，图形无法正确展示。浅色与深色均复现；移动端单列组合未出现同样的控制台错误。

**验收：**明确 grid/card/chart 的高度来源和最小高度，ResizeObserver 输入不足时不绘制非法几何；在桌面三列、移动单列、Sidebar 收放后断言图形存在且宽高有效。不能只隐藏控制台错误或把负高度钳为零而保留空图。

### E06 · P2 · 示例文案与页面规范有可见漂移【截图＋源码】

**位置：**[InteractivePage.tsx:173](../src/pages/InteractivePage.tsx#L173)、[DashboardPage](../src/pages/DashboardPage.tsx)、[AccountsPage](../src/pages/AccountsPage.tsx)、[SettingsPage](../src/pages/SettingsPage.tsx)。

Interactive 的四组 alert 标题/消息直接显示 `pages.interactive.alertInfoTitle` 等 **8 个翻译 key**。部分早期金融页和 Settings 没有内容区 PageHeader，而当前 INTEGRATION 约定每个首屏从 PageHeader 开始。示例仍混用旧 `bg-secondary`、`rounded-widget` 与当前包的 surface/布局方式，容易把旧写法传播回下游。

**验收：**英中文案键齐全，浏览器不显示原始 key；将可复制模板统一到当前规则。若某类紧凑概览有意不设 PageHeader，应写为明确例外，而非让规范与示例各自演进。

### E07 · P2 · 动画基础存在，状态与 reduced-motion 覆盖不一致【计算样式＋源码】

Sidebar、Dock、Fab、LoadingScreen、Loader 已考虑 reduced motion；Sidebar 实测从正常 `transition: all 0.3s` 变为 `transition-property: none`，不能误报为完全不支持无动画模式。多个图表主动关闭数据动画，也可能是合理的专业仪表盘选择。

缺口在于 [ChatBubble](../packages/basalt/src/components/chat-bubble.tsx#L48) 的 streaming caret：reduce 环境下仍以 `basalt-pulse`、2s、infinite 播放；Button 的 loading spinner 和 Interactive/Login 内的局部动画也缺少一致的 motion-reduce 约束。Gauge 与多数图表不共用同一动画配置，行为策略需要核对。

**验收：**统一进入/退出、展开/收起、loading、streaming 的时长/曲线/中断策略；展示可重放的发送→流式→停止→错误→重试过程。验证快速连续操作、中途关闭、内容增长、系统 reduce 切换和焦点恢复。是否使用 transform/opacity 或宽度过渡，应通过实际观感和性能证据决定；本次没有足够证据宣称某动画掉帧。

### 6.1 全部 24 个 Example 页面评估

“局部可交互”不表示有真实业务服务；“静态”也不必然是缺陷。关键在于页面是否清楚传达用途，以及复制后能否保留正确的控件契约。源文件均在 [src/pages](../src/pages)。

| 路由 / 源文件 | 完备性 | 布局、动效与建议 |
|---|---|---|
| `/` · DashboardPage | 金融假数据与组合图表 | 桌面层次、卡片网格成熟，移动堆叠清楚；补内容标题约定、数据状态和可访问摘要 |
| `/accounts` · AccountsPage | 余额显隐可用，资金操作为展示 | 银行卡比例与材质有完成度，移动布局合理；说明操作为模拟并补反馈 |
| `/progress-tracking` · ProgressTrackingPage | 静态预算/进度 | 条目密度与图表清楚；补超预算、零值、长名称和状态变化 |
| `/flow-comparison` · FlowComparisonPage | 静态流入流出对比 | 双图层级明确，移动单列可读；补负值/空值/时间范围与文本说明 |
| `/portfolio` · PortfolioPage | 静态资产概览 | 主图、配置与持仓组织良好；补大金额、长资产名、空组合、筛选 |
| `/components` · ComponentsPage | 可复用块展示墙 | 密度合理但多卡片仅有默认数据；与单组件文档的用途需清楚区分 |
| `/forms` · FormsPage | 外观为主 | 栅格与标签间距基本好；submit、验证、上传闭环缺失，见 E03 |
| `/navigation` · NavigationPage | 分页/stepper 有本地状态 | 移动长 breadcrumbs 出现拥挤换行；需长层级截断/返回模式，不只验证短标签 |
| `/interactive` · InteractivePage | toast、复制、loading、折叠等局部可用 | 状态展示较丰富；修复 8 个翻译 key 与局部动画策略 |
| `/data` · DataPage | 静态表格/状态/统计展示 | 卡片移动堆叠好；表头操作区紧凑，搜索/筛选未接数据 |
| `/layout` · LayoutPage | 当前 surface 结构示例 | 对 L1/L2/Well 解释清楚，可作推荐范本；补浮层与滚动组合 |
| `/dialogs` · DialogsPage | 多尺寸、表单、确认可打开 | Anatomy 与尺寸解释较完整；补 Promise 失败、触发器消失、嵌套浮层、长内容移动端 |
| `/chat` · ChatPage | Dock 开关/会话选择可用，发送为空操作 | 桌面概念清楚；移动端挤压，缺完整发送/流式/停止/失败演示 |
| `/settings` · SettingsPage | 分区导航、原生输入可用 | 桌面双栏和移动图标导航整洁；缺标题规范，主题选中硬编码，保存等无闭环 |
| `/palette` · PalettePage | accent 选择可用 | 有助于理解配色；增加文字配对对比度，而非只展示色块 |
| `/interactions` · InteractionShowcasePage | 有表单结果、toast、dialog 本地闭环 | 交互可观察，适合作为功能样例基线；继续复用公共状态组件 |
| `/health` · HealthPage | 健康假数据与时间/状态控件组合 | 统计、SlotBar、时间线布局丰富；日期控件与数据刷新关系需显式演示 |
| `/wearable` · WearableDashboardPage | 健康领域场景组合 | 与 Health 重复结构多；日期区窄屏标题拥挤，宜复用场景结构和状态 fixture |
| `/banking` · BankingDashboardPage | 金融场景组合 | 多图表网格完成度较高，是较好的组合参照；补无数据、单位与加载状态 |
| `/network` · NetworkOpsDashboardPage | 网络假数据 | 桌面三列图表高度错误与 SVG 报错，见 E05；需要稳定尺寸的组合范本 |
| `/login` · LoginPage | 登录视觉样例，非认证实现 | badge 卡片细节完整、移动居中良好；辅助文字过淡，状态灯 pulse 需 reduced motion |
| `/static-page` · StaticPage | 静态条款与返回入口 | 阅读宽度和移动留白合理；可补长文目录/打印示例，优先级较低 |
| `/loading` · LoadingPage | 独立加载状态 | 简洁，有 status 名称和 reduced-motion；无需为了“完整”添加假按钮 |
| `/404` · NotFound | 错误码与返回主页 | 目的明确、响应式正常；轻量页面不要求复杂动画 |

### 6.2 catalog Example 的下一步验收方式

目前的 246 个 scenario 足以证明库不是单一截图工程，但状态分布偏斜：表单有 69 例，23 个图表却每项只有一个；ChatComposer 只有 idle 例，DataTable 默认 hero 仅一列一行，难以代表真实迁移。

建议为每个家族选有意义的契约状态：基础动作覆盖 loading/disabled/icon-only；表单覆盖原生提交/reset/错误/受控；浮层覆盖键盘/嵌套/长内容；列表覆盖真实多列、排序分页选择、空/错/加载；图表覆盖动态 series、空/负/缺测值、容器 resize；Chat 覆盖发送、streaming、取消、失败和长文本。避免为每个组件机械穷举所有属性组合。

## 7. 上级目录消费者与公共控件提炼

### 7.1 使用关系盘点

按上级目录的 package.json 查得 **11 个声明依赖的工作目录**。Raven 与 raven-dev 是两个工作副本，不能算两份独立复用需求。扫描 `.ts/.tsx/.css` 字面量 import 后，10 个目录存在源码引用，Fundly 只有依赖声明。

| 工作目录 | 声明版本 | 研究结果与迁移阶段 |
|---|---|---|
| ai-arsenal | 2.0.3 | 已用 shell、基础组件；仍保留 EmptyState、删除确认、过滤等包装 |
| firefly | 2.0.3 | 主要接入管理端 shell/sidebar/CSS；媒体上传、过滤、确认仍在本地 |
| fundly | 2.0.3 | 未检出源码导入；有本地 FilterDropdown/FilterChips、图表、EmptyState，属于待实际接入 |
| gecko | 2.0.3 / dashboard `^2.0.3` | 已接入框架、主题、部分控件；本地 TagBadge 等仍有公共价值 |
| giraffe | 2.0.3 | 多路由直接组合 PageHeader、LayerCard、SectionRule、Table，可作为迁移后的验证样本 |
| lyre | 2.0.2 | 已有较多控件接入；文件夹侧栏、上传队列/对话框仍是独立实现 |
| neo | 2.0.3 | 已用 app-shell、主题和 LayerCard；保留 tools 列表、删除确认与本地 UI 包装 |
| noheir | 2.0.3 | 框架/providers 接入明显；统计、tag 配色、业务列表等仍在应用 |
| raven | 2.0.3 | analytics 等已较多直接使用；日期/模型/设备过滤、chip 与图表配置需求丰富 |
| raven-dev | 2.0.2 | Raven 的另一工作副本；用于观察版本差异，不重复计入候选组件的支持度 |
| surety | 2.0.3 | 部分框架、chart-card、CSS 已接入；策略过滤、空状态、上传进度仍在本地 |
| pew | 无包依赖 | [设计文档](../../pew/docs/01-plan.md) 明确采用 Basalt；动态图表、热力图、过滤器、榜单为重点迁移需求 |
| zhe | 无包依赖 | 本地 UI/CHANGELOG 记录 Basalt 风格；链接/标签/上传、树形任务、编辑面板为重点迁移需求 |

其他目录仅出现“Basalt”文字引用，不足以证明仍在使用，未计入以上消费者数量。不能把「已经安装包」「已经迁移框架」「全部 UI 统一到库」当作同一状态。

### 7.2 pew 与 zhe 的重点判断

**pew：应优先承接数据可视化底座。** 已研究 `period-selector`、`filter-dropdown`、`chart-tooltip`、`stat-card`、`device-model-trend-chart`、`working-hours-heatmap`、`goal-heatmap`、`heatmap-calendar` 等。动态 modelKeys、百分比域、时间单位、可组合 tooltip 和日/小时矩阵超出当前三个 XY 字段的包装能力。其 DashboardResponsiveContainer 已集中 resize 策略，Basalt 也已有相应共用配置，无需再新增一个重复 wrapper。榜单名次、模型身份、积分/成就和排行榜业务规则继续由 pew 持有。

**zhe：应优先承接资源管理与编辑交互。** 已研究 UploadZone/UploadItem/UploadList、LinkFilterBar、SidebarFolderItem、TodoTreeShell/TodoTreeRow、InlineEditArea、EditorSplit、TagColorPicker。TodoTreeShell 已将 react-arborist 放在单一受控边界，含虚拟化、父子移动、选择同步、触屏禁用拖拽；这是提炼 Tree adapter 的好来源。但完成状态、任务父子规则、截止时间、API 操作与 Todo 数据模型不应一起进入 Basalt。EditorSplit 当前是响应式双栏，并非已有成熟的可拖拽 SplitPane，后者只能列为后续扩展。

这些结论来自真实 UI 源码与组件组合研究；未登录和启动两者全部业务页面，不对其线上动画或真实大数据性能作未验证评价。

### 7.3 候选组件、依据与边界

| 编号 / 建议顺序 | 应吸收的公共能力 | 具体源码依据 | 应留在应用侧 |
|---|---|---|---|
| R01 · 优先 | Searchable MultiSelect/TagPicker、FilterChip、FilterBar、日期范围/预设的组合 | [zhe LinkFilterBar](../../zhe/components/dashboard/link-filter-bar.tsx)、[pew FilterDropdown](../../pew/packages/web/src/components/dashboard/filter-dropdown.tsx)、[pew PeriodSelector](../../pew/packages/web/src/components/dashboard/period-selector.tsx)、[raven FilterBar](../../raven/packages/dashboard/src/components/analytics/filter-bar.tsx)、[fundly FilterChips](../../fundly/apps/web/src/components/ui/filter-chips.tsx) | URL/router 状态、查询 key、服务端过滤含义、具体模型/文件夹接口 |
| R02 · 优先 | FileDropzone、UploadQueue/UploadItem：拖放、键盘选择、校验提示、预览、进度/取消/重试状态 | [zhe UploadZone](../../zhe/components/dashboard/upload-zone.tsx)、[zhe UploadItem](../../zhe/components/dashboard/upload-item.tsx)、[lyre UploadDialog](../../lyre/apps/web/src/components/upload-dialog.tsx)、[firefly ImageUploadZone](../../firefly/src/components/admin/image-upload-zone.tsx) | 上传 URL、鉴权、存储协议、并发/重试调度、业务文件大小限制 |
| R03 · 优先小件，Tree 后置 | EditableNavItem/FolderNavItem、IconPicker、行尾 action slot；随后可选 Tree adapter | [zhe SidebarFolderItem](../../zhe/components/sidebar-folder-item.tsx)、[zhe TodoTreeShell](../../zhe/components/dashboard/todos-page-parts/todo-tree-shell.tsx)、[lyre FolderSidebar](../../lyre/apps/web/src/components/layout/folder-sidebar.tsx) | Todo 模型、文件夹权限、后端移动与排序事务；重型 tree 依赖不得进入根入口 |
| R04 · 优先扩展现有 kit | 泛型 series、轴/单位格式、Tooltip.Row/Summary/Divider、HeatmapMatrix、ChartCard 状态 | [pew ChartTooltip](../../pew/packages/web/src/components/dashboard/chart-tooltip.tsx)、[pew ModelTrend](../../pew/packages/web/src/components/dashboard/device-model-trend-chart.tsx)、[pew WorkingHoursHeatmap](../../pew/packages/web/src/components/dashboard/working-hours-heatmap.tsx)、[fundly SeriesChart](../../fundly/apps/web/src/components/charts/series-chart.tsx) | 模型配色映射、货币/计费指标、业务聚合和专用图表标题 |
| R05 · 扩展现有组件 | Empty action/error/retry、Confirm/DeleteResource 的错误与确认内容、StatCard 的 tooltip/趋势/状态 slot | [ai-arsenal EmptyState](../../ai-arsenal/src/components/ui/empty-state.tsx)、[pew StatCard](../../pew/packages/web/src/components/dashboard/stat-card.tsx)、本库 Empty/ConfirmDialog/DeleteResource | 删除请求、权限、乐观更新、指标含义；避免新增平行 EmptyState/ConfirmModal/MetricCard |
| R06 · 次优先 | TagBadge 的语义色/确定性色板、可访问的 TagColorPicker | [gecko TagBadge](../../gecko/apps/web-dashboard/src/components/tag-badge.tsx)、[noheir tag-colors](../../noheir/src/lib/tag-colors.ts)、[zhe TagColorPicker](../../zhe/components/dashboard/tags-page-parts/tag-color-picker.tsx) | 标签实体、服务端颜色存储、业务分类体系；色板须符合 C12 |
| R07 · 次优先 | InlineEditable、ResponsiveMasterDetail；有第二个明确需求后再做可拖拽 SplitPane | [zhe InlineEditArea](../../zhe/components/dashboard/link-card-parts/inline-edit-area.tsx)、[zhe EditorSplit](../../zhe/components/dashboard/idea-editor-page-parts/editor-split.tsx)、本库 Chat/Dock 组合 | Markdown 引擎、编辑器数据保存、草稿同步、LLM 工具执行和具体业务表单 |
| R08 · 文档/模板优先 | 可安装或复制的 AppFrame、Login、ResourceList 场景 block，包含正确 provider 与移动端策略 | [INTEGRATION 框架 recipe](../INTEGRATION.md)、[firefly Shell](../../firefly/src/components/admin/shell.tsx)、[noheir AppShell](../../noheir/src/components/layout/app-shell.tsx)、[neo AppShell](../../neo/components/app-shell.tsx) | 路由配置、认证、菜单权限、组织/用户查询；不用单个巨型 AppShell 接管应用 |

候选进入公共库前至少满足：能指出真实消费者；抽离后不导入业务 model/viewmodel、路由和服务；有受控接口；根入口成本可控；在至少两个独立使用场景验证。只有 zhe 证明的高级 Tree/SplitPane 先做 adapter 或实验块，不能因为一个项目复杂就立刻冻结通用 API。

## 8. 后续设计细节与迁移原则

本节为待实施草案，不代表新 API 已获稳定承诺。

### 8.1 统一公共 manifest 与文档来源

建议一个 manifest 记录 `slug`、`displayName`、`exportName`、`importPath`、public surfaces、maturity、required peers、CSS 合约和版本。类型/默认值来自源码，scenario 的展示源码来自实际可编译模块。由此生成 exports 校验、catalog、机器 JSON、使用 Markdown 和兼容基线，避免再维护几份手工清单。

现有 `scripts/catalog-api.ts`、`catalog-content-manifest.ts`、`catalog-page-status.ts` 已能承担相当部分工作，应渐进扩展。先让生成结果正确、可编译，再考虑 CLI、skill 安装和站点在线 registry。

### 8.2 公共控件与业务状态的边界

| 能力 | 公共接口草案 | 稳定前必须确认 |
|---|---|---|
| 多选 | `items`、`value/defaultValue`、`onValueChange`、`query/onQueryChange`、loading/empty、label、disabled | 字符串 ID 与泛型 item 的取舍、异步搜索取消、受控 open、键盘及 chip 删除 |
| 上传 | Dropzone 发出 `File[]`；UploadItem 消费明确的 queued/uploading/success/error/cancelled 状态与回调 | 文件拒绝结果、预览 URL 释放责任、取消/重试语义；不持有 fetch 或业务 token |
| Tree | 受控 nodes/selection/expanded、renderRow、onMove/onRename；重型 adapter 走独立子路径 | 稳定 ID、虚拟化、键盘树导航、触屏替代动作、异步移动失败如何回滚 |
| Chart | 泛型 data 与 series descriptor、formatter/domain/stack、tooltip/legend/summary slot | 系列动态增删、null/NaN/负值、主题对比、resize、无障碍、与原简单 props 的兼容 |
| ResourceList | 标题/操作/筛选/结果/状态/分页 slots，可组合已有 DataTable 或业务列表 | 不规定后端数据形状；不把 URL 状态塞进基础组件；服务端与本地状态边界清楚 |

### 8.3 稳定迁移顺序

先冻结基线并修复契约，再在一个直接消费者与一个风格迁移者中验证。框架、CSS、基础输入、复杂列表/图表分别迁移，保留应用 adapter 作为兼容层。升级说明需回答：导入路径是否改变、默认几何是否改变、谁拥有状态、ref/事件是否改变、要删哪些旧样式。

不以一次性删除所有本地包装作为迁移成功标准。包装可能承载业务权限和状态，应该只移走重复视觉/交互实现。对于已公开内部路径的收窄以及默认尺寸改变，先遵守 D05/D06 的兼容政策，再实施重构。

## 9. 原子化提交计划

以下拆分已进入实施授权范围，按第 12 节阶段调度，不按表格顺序同时展开。每行表示一个独立提交；同组后缀表示相邻、可分别审阅的提交。每个功能提交携带对应的必要测试和文档。新 API 优先兼容扩展现有组件；Tree adapter 与可拖拽 SplitPane 仍按第 7 节后置，不纳入本轮稳定接口。验收修正单独提交，不改写已经审阅的历史。

| 顺序 | 建议提交 | 对应问题与验收 |
|---|---|---|
| 01 | `fix: propagate pre-push failures` | Q01；build/coverage/lint/OSV 各失败路径均非零 |
| 02a | `ci: enforce full type checking` | Q02；远端实际执行 tsc |
| 02b | `ci: validate package artifacts and consumers` | Q03；包门进入 CI，记录同一提交证据 |
| 03 | `fix: gate releases on validated commits` | Q04；main/CI/单 tag 校验与 dry-run 故障测试 |
| 04 | `docs: define public API and compatibility policy` | D01/D05/D06；先建立出口、默认值与兼容基线，不删除已发布路径 |
| 05 | `fix: generate compilable catalog imports` | D02；所有安装/Copy page 代码在消费端编译 |
| 06a | `docs: complete public API metadata` | D03；公开 surface 归属、默认值和完整性约束 |
| 06b | `docs: publish versioned agent guides` | D04；机器文档与安装版本一致 |
| 07 | `fix: scope standalone component base styles` | C02；Tailwind/standalone 两条几何与 portal 验证 |
| 08a | `fix: preserve button disabled semantics` | C01；鼠标、键盘、loading 与 asChild 契约 |
| 08b | `fix: position typeahead menus outside clipping ancestors` | C03；卡片、Dialog、滚动区和视口边缘 |
| 08c | `fix: preserve focus when committing autocomplete blur` | C04；Tab/Shift+Tab 提交不抢回焦点 |
| 09 | `fix: preserve date picker form refs and validity` | C05；ref/reset/FormData/required 真实浏览器验证 |
| 10a | `fix: align dock overlay semantics` | C06；背景交互与模态边界一致 |
| 10b | `fix: restore imperative confirm focus` | C07；无 trigger 的 Promise 路径也归还焦点 |
| 10c | `fix: preserve force mounting across overlay portals` | C16；内置 Portal 尊重既有 forceMount，正常开关及卸载清理保持正确 |
| 11a | `fix: complete slider values and accessible names` | C08；单值/范围、Thumb 数量及名称 |
| 11b | `fix: complete calendar keyboard navigation` | C10；日历导航、可访问树与本地化 |
| 12a | `fix: render empty state actions` | C09；明确 slot 并验证所有允许的 children |
| 12b | `fix: tolerate unavailable theme storage` | C11；回退与持久化行为 |
| 13a | `fix: improve semantic text contrast` | C12；主题与表面配对验证 |
| 13b | `feat: expose accessible chart alternatives` | C13；摘要、数据替代与键盘路径 |
| 13c | `fix: respect reduced motion across feedback states` | E07；spinner、caret、局部 pulse 与系统偏好 |
| 14a | `fix: make catalog tables and headers responsive` | E01；移动端信息完整、可键盘滚动 |
| 14b | `fix: isolate catalog example IDs` | E02；重复实例的 label/description 正确归属 |
| 14c | `fix: adapt chat panes to narrow viewports` | E04；移动 master/detail 与输入区可达 |
| 14d | `fix: preserve network chart dimensions` | E05；有效几何与 Sidebar resize |
| 14e | `fix: complete example translations` | E06；英中文案不显示原始 key |
| 14f | `docs: align example page structure with integration` | E06；内容标题规范及明确例外 |
| 15a | `feat: demonstrate settings state changes` | E03；主题、保存、错误与反馈 |
| 15b | `feat: demonstrate native form submission flows` | E03；提交、验证、成功与失败 |
| 15c | `feat: demonstrate chat streaming and cancellation` | E03/6.2；本地模拟发送、流式、停止、重试 |
| 16a | `feat: add searchable multi-selection` | R01；先验证选项、搜索、chip 与键盘契约 |
| 16b | `feat: compose reusable filter controls` | R01；FilterBar/Chip/日期预设组合，URL 状态在外部 |
| 16c | `feat: add file drop and upload state primitives` | R02；文件交互与受控上传状态，应用负责 transport |
| 17a | `feat: support dynamic chart series` | C15/R04；旧 props 兼容、任意系列和真实消费图表 |
| 17b | `feat: expose controlled data table state` | C14；按实际服务端列表需求设计 adapter |
| 17c | `feat: compose resource page regions` | C14/R05；页面 slots、状态与操作区 |
| 17d | `feat: showcase composed loading skeletons` | S01；Library 可发现的仪表盘、列表、详情组合，加载/内容切换与稳定几何 |
| 17e | `feat: showcase rich interactive tables` | S02；交互表头、格式化字段、语义色、行内电量/容量与趋势图、真实状态闭环 |
| 18a | `feat: add editable navigation rows` | R03；小控件先行，Tree adapter 后续单独设计 |
| 18b | `feat: standardize tag colors and selection` | R06；色板、主题、无障碍与调用方实体解耦 |
| 18c | `feat: add responsive master-detail composition` | R07；先验证窄屏与焦点，SplitPane 后续单独设计 |
| 18d | `docs: provide reusable application blocks` | R08；框架/登录/资源页 recipe 可安装或编译 |
| 19a | `chore: align supported toolchain versions` | Q06；本机和 CI 的版本策略一致 |
| 19b | `chore: retire stale vulnerability waivers` | Q06；豁免有效且扫描配置一致 |

## 10. 后续 6DQ 质量计划

| 维度 | 必需证明 | 防止的具体回归 |
|---|---|---|
| L1 | 受控/非受控、事件、表单值、异常、ref 合并、状态机；保留汇总阈值 | 禁用时执行动作、状态与 DOM 不一致、上传/删除错误被吞 |
| L2 | 从候选 tarball 安装；精确 exports/类型基线；Bundler/NodeNext；peer 缺省与选装；编译文档代码 | 源码 alias 掩盖包缺文件、内部出口意外变更、复制 import 失败 |
| L3 | 两种 CSS 合约；Next hydration；键盘焦点/原生表单/portal/Storage；390px 与桌面；少量关键视觉基线 | reset/ref、Tab、模态逃逸、尺寸错误、裁剪、图表塌缩 |
| G1 | CI 真实 tsc+Biome；公开 API 元数据/生成内容 freshness；关键 a11y 规则有明确豁免 | 手工文档漂移、类型门被跳过、无语义交互悄悄增长 |
| G2 | 源码/产物敏感信息检查、依赖扫描、有效豁免、版本/发布凭据边界 | 打包遗漏控制、无效扫描配置、未经验证的提交发布 |
| 文档 | 按版本发布安装、组件、迁移、agent 指南；scenario 状态矩阵；公共面变更说明 | ready 被误认成稳定、调用方读到 main 的不匹配 API |

视觉验证采用有限的高价值组合：默认/长内容、浅/深色、桌面/移动、普通/reduced motion；图表加容器 resize，交互控件加键盘路径。后续若引入截图基线，这是基于此次发现提出的新方案，不应倒过来把历史计划「不做全站像素 diff」说成未执行承诺。

新组件至少通过一个纯组件消费 fixture 和两个独立实际场景；Tree/SplitPane 等单一来源的能力可以先用实验 adapter 验证。正式发布前，验证记录应绑定提交和 tarball，包含变更级别及迁移说明。无需把所有下游仓库改造完成才发布，也不能只凭本站构建成功就宣布迁移安全。

## 11. 证据保留与交付边界

本机审查日志、浏览器 JSON、截图、最小用例和共享 CI 源码快照位于 `/tmp/basalt-review-20260906.vDgTqP`，属于临时调查材料；关键现象、输入、输出和源码位置已写入本文，不依赖临时目录长期存在。

初次审查交付为本编号文档及 docs 索引更新。后续实施已获授权，交付包含本仓库的修复、公共能力、展示和质量门。下游仓库作为只读设计参照，不在本轮批量迁移；npm 发布、生产部署及推送 main/tag 不属于本轮实施验收。

## 12. 已授权实施：阶段、展示设计与验收台账

### 12.1 调度与提交约束

- 当前分支：`main`，审查起点 `e61efc1`。按用户在 pi pane 中补充的「直接 main 做即可 / 或者合并」，主 agent 已把本地 main 快进至已完成的实现提交；后续继续在 main 原子提交。现有 Herdr pi pane：`w1R:p2`；主 agent 使用同一仓库，负责验收和本节状态，pi 不并行修改本文或索引。
- 同一时间只派发一个阶段。pi 完成该阶段的代码、必要文档、检查及原子提交后停下；主 agent 独立查看 diff 和实际行为，未通过则留在本阶段修正。
- 每个提交描述一个可独立审阅的变化，使用正常 hooks；不得跳过 hooks、降低覆盖率或放宽质量门来通过验收。只提交本阶段明确的文件。
- 监控每 45 秒采集 pi 状态、会话进展和 Git 状态。进入 blocked/unknown、进程退出或连续 5 分钟无会话进展时检查终端和子进程；长时间构建需要核对实际进度，不能仅凭时间强杀。即使 Herdr 显示 done，也检查最后一次 assistant stopReason；服务端错误结束单独报警，避免误判为完成。监控不自动接受审批、不替用户回答问题。
- 阶段状态采用「待调度 / 实施中 / 验收中 / 需修正 / 已验收」。完成记录绑定提交与本阶段新证据，不能沿用第 2 节的历史通过结果。

### 12.2 新增 Library 需求

#### S01 · 复杂骨架屏组合

来源：[pew DashboardSkeleton](../../pew/packages/web/src/components/dashboard/dashboard-skeleton.tsx)、[StatCardSkeleton](../../pew/packages/web/src/components/dashboard/stat-card-skeleton.tsx)、[ChartCardSkeleton](../../pew/packages/web/src/components/dashboard/chart-card-skeleton.tsx)、[LeaderboardSkeleton](../../pew/packages/web/src/components/leaderboard/leaderboard-skeleton.tsx)。参考的是内容密度与真实布局占位，不复制业务数据或整页样式。

在 Library 的 Skeleton 页面提供可发现、可复制的场景，至少包括：

1. **分析仪表盘**：统计卡网格、非对称主图/侧栏、趋势与环形图占位，390px 单列到桌面多列有完整布局。
2. **资源列表 / 榜单**：头像、名称/辅助信息、标签、数字列和操作位；表头与内容的列宽、行高一致。
3. **资源详情**：页头、元信息、正文与侧栏，覆盖文本段落、媒体或活动流占位。

每个场景可切换 loading/loaded；一处有名称的 `status`/`aria-busy` 表达整体加载，装饰占位不反复朗读；维持主要容器几何；reduced motion 关闭循环动效。可新增通用 Skeleton shape/group 或轻量组合，但保留 `SkeletonLine` 既有接口，业务布局留在 example/recipe。新组合应作为页面主展示，简单灰线例子继续用于入门说明。

#### S02 · 复杂 Table 与行内展示

来源：[surety SortHeader](../../surety/apps/web/src/components/ui/sort-header.tsx)、[surety Policies](../../surety/apps/web/src/app/policies/page.tsx)、[pew PricingTable](../../pew/packages/web/src/app/%28dashboard%29/model-prices/pricing-table.tsx)、[noheir Funds](../../noheir/src/app/funds/funds-client.tsx)、[noheir TopTransactionsTable](../../noheir/src/components/shared/top-transactions-table.tsx)。其中 surety 提供密度/卡片模式和排序，pew 提供定价/数量单位，noheir 提供丰富标签、货币与日期状态；电量和趋势图是本次新增展示要求，不声称这些来源均已实现。

扩展现有 `/ui/table` 与 `/ui/data-table` 页面，至少有两个独立、足够宽的真实组合场景，并能从 Library 找到：

- **设备 / 资源运营表**：名称与辅助信息、在线/离线/告警、容量或电量百分比、行内趋势、更新日期及动作菜单。
- **资产 / 订阅台账**：多层标签、对齐货币/百分比、正负变化、日期/到期状态、额度使用条、合计与分页。

交互表头必须真实改变排序，支持键盘、焦点和 `aria-sort`；需要列选择或过滤时，控件也必须改变结果。DataTable 增量支持受控排序/分页/总数及手动服务器模式，保留现有本地默认行为和 renderer。展示覆盖搜索/筛选、选择与行内操作的反馈，loading/empty/error/retry，以及至少一个本地异步服务器模拟；不连接业务后端。

格式化由 caller 或 cell renderer 拥有，原始值用于排序。语义颜色与文本/图标共同表达状态；数值采用 tabular alignment。行内 Sparkline/Meter 优先复用，若电量轮廓确有独立复用价值再新增轻量组件；图形带可访问名称/数值且不在根入口引入 Recharts。移动端保持可访问横向滚动或有信息等价的布局，不静默隐藏关键列。所有 copied examples 必须来自实际可编译模块。Table/DataTable 的主展示改用上述组合，preview 占满可用宽度；现有单行单列示例保留为后置的入门用法。

### 12.3 阶段计划与状态

| 阶段 | 范围 / 原子提交编号 | 必须独立验收的结果 | 状态 | 提交 / 证据 |
|---|---|---|---|---|
| P0 | 计划修订、S01/S02 设计、调度与监控 | 范围清楚、基线保留、任务只发给本仓库现有 pi | 已验收 | `40e831b`；正常 hooks 通过；129 个文档链接均存在；45 秒监控已启动 |
| P1 | 质量与发布门：01、02a/b、03、19a/b；Q01–Q04/Q06 | 失败注入、真正 tsc、包与消费门进入 CI、release 同 SHA/main/单 tag；不执行发布 | 已验收 | `987f99c`–`e99b4b1` 共 8 个实现提交；阶段末全门与独立失败注入通过，详见 12.4 |
| P2 | 公共接口与文档：04、05、06a/b；D01–D06 | 公开出口兼容基线、可编译安装代码、API 归属/默认值、随包 agent 指南与迁移策略 | 实施中 | `ef2bd65`–`ba42589`：公开基线、严格 import、入口文档 tarball 编译、97 页源码 API、provider 与非 catalog 正文、原生策略和类型保真已分组验收；继续复合接口缺项、全部 Library Usage/scenario 编译及版本化指南 |
| P3 | 基础样式与输入：07、08a/b/c、09；C01–C05 | standalone/ Tailwind 尺寸、disabled、portal、Tab、DatePicker ref/reset/required 浏览器证明 | 待调度 | — |
| P4 | 浮层与语义：10a/b/c、11a/b、12a/b；C06–C11/C16/R05 | Dock 模态、Confirm 焦点/异常、Portal forceMount、Slider 多值/名称/双轴几何、日历键盘、本地化、Empty action、Theme/Accent 组合下 Storage 拒绝 | 待调度 | — |
| P5 | 视觉/图表/动效：13a/b/c、17a；C12/C13/C15/E07/R04 | 主题对比、图表可访问替代、动态系列与 formatter/domain/stack、热力矩阵/tooltip 组合、统一 reduced motion | 待调度 | — |
| P6 | Library 骨架屏与 Table：17b/c/d/e；C14/S01/S02/R05 | 三类骨架屏；两类丰富 Table；受控状态、格式化/行内图表、四态、移动/深色/键盘 | 待调度 | — |
| P7 | Example 完备性：14a–f、15a–c；E01–E06 | 文档表格/ID、Chat 移动、Network 几何、翻译/页头；Settings、Forms、Data、Chat 可观察状态闭环 | 待调度 | — |
| P8 | 筛选与上传：16a/b/c；R01/R02 | 受控搜索多选与 chip、FilterBar、文件选择/拖放及队列状态；两个场景和纯包消费 | 待调度 | — |
| P9 | 小型复用控件与应用模板：18a/b/c/d；R03/R06/R07/R08 | EditableNav、Tag 色板/选择、InlineEditable/master-detail、可编译 AppFrame/Login/Resource recipes | 待调度 | — |
| P10 | 整体验收、兼容/迁移说明与台账收口；Q05 与全部问题追踪 | 新 HEAD 全套 6DQ、tarball/文档 freshness、关键浏览器组合、无未记录 API 破坏、干净工作区 | 待调度 | — |

P7 包含原提交表未单列的 Data 页面搜索/筛选闭环，按独立功能提交。P9 的 InlineEditable 按实际受控需求单独提交。任何新增公开 surface 同阶段补元数据、出口和文档，不能拖到收尾才补。

### 12.4 验收记录

第 2 节是审查前基线，后续证据逐阶段写入本节。最终收口需要列出 D/C/Q/E 编号的解决状态与暂缓理由，不能只用测试总数替代问题闭环。

#### P1 验收记录（已验收，2026-09-06）

| 问题 | 实现提交 | 主 agent 独立核验 |
|---|---|---|
| Q01 | `987f99c` | 在真实 `/bin/sh -e` 下，成功路径依序执行四项；build/coverage/lint/OSV 分别注入 exit 41，均原样非零退出且不执行后续命令 |
| Q02 | `b5cb086` | shared CI 明确运行 `bun run typecheck`，不再使用 `true` |
| Q03 | `b66f457` | 同一 CI workflow 的独立 job 包含 package build、双模块类型、pack、publint 与四类 consumer；Node 24、Chromium 系统依赖明确配置 |
| Q04 | `2881a59`、`a4418fd` | 正式 Vitest 命令下 19 个 release 测试通过；另以隔离 Git/GitHub 响应执行实际工作流 shell，13 个正负用例全部通过；验证精确 SHA、最新 CI、完整 tag ref、祖先/checkout/版本匹配和零实际发布 |
| Q06 | `fbc85b7`、`007cc8c`、`e99b4b1` | manifest 与全部 CI/CD Bun 均为 1.4.0；锁文件未变；过期 9 条豁免全部移除，扫描配置保持启用 |

发布验收包含等待期间 HEAD 变化、旧成功与新 pending 并存、错误分支/事件/SHA、缺少 CI、失败 CI、非法/不存在的 tag、tag 与 checkout 不匹配、不在 main 上等边界。`deploy-main` 另限定本仓库的 main push，避免仅凭来源分支名称判定。Actionlint 1.7.7 对工作流的语法检查通过。

阶段末在 `e99b4b1` 上重新执行：typecheck、lint（773 文件）、展示站 build、包 build（113 入口）、Bundler/NodeNext 类型检查、pack（343 文件 / 109 对通配产物）、strict publint、consumer A/B/C/D 全部通过。L1 为 173 文件、1,438 个测试；statements **97.44%**、branches **95.26%**、functions **97.87%**、lines **97.60%**。Next 门的 21 个浏览器门测试及真实 Chromium hydration/主题切换通过；OSV 扫描 390 个包，0 命中、0 未使用豁免。各实现提交均通过正常 pre-commit typecheck/lint/test/gitleaks。

主 agent 独立执行的证据包括 shell 失败注入、13 个实际工作流 shell 用例、SHA/等待/tag 绑定 probes、正式 Vitest release 19 测试、Actionlint 和最终 diff 审阅。临时验收材料位于 `/var/folders/hh/5b1tphh13wbg8hj9jj_bxbqr0000gn/T/basalt-04-implementation-20260906.jpwb8yyq`。完整内容中的关键结论已保留在本文。

上述是本地实现与隔离行为证据；本轮未推送远端，不能表述为 GitHub 上该分支的 CI 已运行成功。P1 仅关闭 Q01–Q04/Q06；Q05 的浏览器几何、组件交互与展示回归门继续随 P3–P10 实施。组织级 index-snapshot pre-commit、stdin-range pre-push 仍是既有后续项，没有在本阶段伪报完成。

#### P2 验收记录（实施中，2026-09-06）

首组 `ef2bd65` 建立原始 2.0.3 公共出口基线、类型/路径校验和随包兼容政策，并刷新入口文档。主 agent 对当前产物独立核验：110 个模块入口、572 个路径内导出符号（375 个运行时符号）及 3 个 CSS 入口全部保留，原始基线未被替换。

初次验收发现：不带包 `dist` 的隔离 checkout 中新测试 10 项有 5 项失败；最小包故障注入中，声明保留但 JavaScript 删除导出时未报错；新 DatePicker 文档示例混用了 `Date` 与实际 ISO string 接口。修正提交 `b35372f` 后，主 agent 复跑无 `dist` 的正式测试 **10/10 通过**，6 个最小包正负用例全部符合预期，DatePicker 示例也改为 ISO string。

继续验收时发现运行时遍历仍绕开实际 `exports`：把非原抽样入口 Slider 重定向到坏 re-export 模块，静态检查与运行时遍历仍通过，真实公共路径导入却失败。`40ab256` 改为对公开 specifier 解析与求值；主 agent 独立复验正常包 110 个模块 / 375 个运行时符号通过，重定向坏模块用例以预期的缺模块错误退出，此项关闭。

`f236245` 完成严格的 catalog 导入元数据：显示名、`exportName`、`importPath` 与根入口可用性分开，Installation 与 Copy page 共用生成函数。主 agent 独立比对原 catalog，显示名、导航、分类和顺序均保留；99 个 ready 页面对应的 99 条 granular / 34 条 barrel 声明与现有公开出口一致，四个原非法 import 已修正。

`abbb1d2` / `936f0db` 建立 `consumer:docs`，接入 CI package-gates 与 package:prepublish。三个入口文档的完整 TSX 模块从 Markdown 原文提取，应用相关节选明确分类；在仓外安装实际 npm tarball，以 strict TypeScript 编译 **8 个完整模块及 133 条安装导入**。旧的手抄 recipe / `typeof` 测试已移除，生成文件采用相互隔离的目录与唯一文件名。

主 agent 独立验收：8 段均为文档原文，包含两个 ProjectsPage；给其中一个 PageHeader 注入不存在的 prop，消费端以 TS2322 失败；删除 README 明确失败。另用文档 ID `catalog-snippets` 与不存在的 Slider 导出复现了原生成文件覆盖导致的假通过，`936f0db` 后同一真实 tarball 用例以 TS2305 正确失败。普通路径的 99 / 34 / 8 编译通过；该组正常 hooks 为 175 个测试文件、1,457 个测试通过，lint 778 文件无警告，gitleaks 无命中。

`414c794` 建立从实际 package exports 及 TypeScript 源码推导的 public surface 归属与 freshness 检查，接入既有 `catalog-api:check`，随 typecheck/build 执行。当前 110 个公开模块、572 个路径内符号（375 个 value / 197 个 type）及 3 个 CSS 入口均有明确归属；12 个非 catalog 模块单独登记，legacy/internal 模块的现有成员采用显式清单。共享源文件中的 LinkButton、CodeBlock 分别归入自己的页面，允许新增组件通过明确登记扩展，未改写 2.0.3 兼容基线。

主 agent 在该提交上复跑 **12/12** 个 source-only 隔离用例：未知 helper、根出口 helper、显式与通配新路径、实际 target 重定向、重命名通配路径、legacy 模块新增成员均按预期拒绝；`export *`、命名纯类型导出、null 覆盖和缺失/过期生成文件均得到正确结果。另逐项比对原始基线的路径、名称及 type/value 身份，零差异。该组正常 hooks 为 **176 个测试文件、1,471 个测试**，lint 781 文件无警告，typecheck/gitleaks 通过。证据为 `p2-surface-independent-root-final.log`、`p2-surface-current.json`。

`75f3315` 补齐 Button/LinkButton 的真实类型、默认值及说明，保留 CVA 的 `null` 联合类型；Button 明确默认 `type="button"`、`variant/size="default"`、`loading/asChild=false`。7 个原生封装 surface 的继承属性与 ref 策略由 Library 和 Copy page 共用，未编造 CodeBlock 的 language 或未发布的 ref 能力。

主 agent 的真实 Chromium 检查验证 Button、LinkButton、BasaltMark、Code、CodeBlock、Table 共 **6/6 页面**的可见参数表与生成数据一致。另发现原生豁免仅检查对象存在，空白理由仍会通过；独立修正 `d4bb86a` 要求非空说明、继承元素及显式布尔策略，`false` 仍合法。同一独立生成 probe **4/4 通过**，正式 Vitest 负例覆盖未知/删除登记、空白说明及不完整策略；正常 hooks 为 **176 文件、1,474 测试**通过。相关证据为 `p2-api-visible.json`、`p2-native-policy-probe.json`。

`f9ea3c6` 完成 Slider、Toggle 与 ToggleGroup 的源码派生参数表，包括受控状态、回调、范围、变体、默认值及实际 ref 目标。ToggleGroup 保留 single / multiple 判别联合，说明未指定 orientation 时的键盘轴行为，补齐 Usage 与示例漏掉的 ToggleGroupItem 导入。生成器对纯数据声明明确承担格式，解决长说明在生成与 Biome 之间反复失配的问题；该例外不作用于实现代码或类型检查。

主 agent 独立核验：真实 Library **3/3 页面**参数表与生成数据一致；以新构建的公开包声明编译 Radix 输入双向赋值、有效 JSX、CVA null 与三个错误单/多选组合，全部符合预期。75 份 API shard 的纯数据 AST 检查通过，原有 **72 页数据完全不变**，新增 3 页共 5 个 surface。该提交公共清单为 110 模块 / 578 符号（375 value / 203 type）/ 3 CSS，原始 2.0.3 基线未改写。正常 hooks 为 176 文件、1,474 测试通过。证据：`p2-b1-api-visible.json`、`p2-b1-api-semantic-diff.json`、`p2-b1-public-types.log`。

`dd47425` 完成 Badge、Empty、Loader、SkeletonLine 的参数表、真实默认值与原生属性/ref 说明，页面和 Copy 共用来源。保留 Badge 的 CVA null、Empty 当前忽略 children 的行为、Loader 的 size 优先级及 SkeletonLine 的确定性中点宽度；这些行为没有在文档阶段顺带修改。主 agent 在真实页面核对 **4/4**，79 份 API 数据解析通过、此前 **75 页不变**；将旧提交的四个源码类型与新构建包的公开声明作双向赋值检查，**4/4 兼容**。正常 hooks 为 176 文件、1,474 测试通过，提交后工作区干净。证据：`p2-b2a-api-visible.json`、`p2-b2a-api-semantic-diff.json`、`p2-b2a-public-types.log`。

`83b9b38` 完成 Meter、ClipboardText、Avatar 家族的 **5 个 surface、16 个参数、6 个默认值**，包括 AvatarImage 的 src/alt/加载回调、Fallback 未传 delayMs 时立即显示，以及准确的原生属性/ref 边界。Meter 明确由 Radix 验证可访问数值，避免把视觉宽度钳制误写为任意数字直接成为 ARIA 值。主 agent 真实页面核对 **3/3**，82 份 API 数据解析通过、原有 **79 页不变**；旧源码与新构建包声明的 **5/5** 组件双向赋值兼容。正常 hooks 为 176 文件、1,475 测试通过。证据：`p2-b2b-api-visible.json`、`p2-b2b-api-semantic-diff.json`、`p2-b2b-public-props.log`。

`2486252` 完成 Accordion 的 single / multiple 模式及 Item/Trigger/Content、HoverCard 的 Root/Trigger/Content，共 **8 个 surface**。修正只登记单选及子件参数表为空的问题，补齐默认值、事件与当前 Portal 挂载限制。主 agent 核验 **2/2 真实页面**、84 份 API 数据解析（此前 **82 页不变**），以及 **7 个组件**的旧源码与新包 props/ref 双向兼容；新增文档 Props 也与实际组件类型一致。两页实际显示的主 Usage 在新包公开声明下编译通过。正常 hooks 为 **176 文件、1,475 测试**。证据：`p2-c1a-api-visible.json`、`p2-c1a-api-semantic-diff.json`、`p2-c1a-public-props.log`、`p2-c1a-usage.log`。

`5974269` 修正空参数表的完整性门：零参数和仅 className 两类 surface 都要求有效的原生继承说明，空白说明、未知 surface 或缺少布尔策略会被拒绝。LayerCard.Primary 改为真实的 Well 参数来源，补 outlined 默认值；SelectGroup/Label 补 asChild 参数和准确 ref 目标；另外 **8 个**纯原生子件在页面和 Copy page 中显示继承与 ref 策略。主 agent 同一正反 probe 从 **3/5** 到 **5/5**，真实页面 **6/6**、实际剪贴板和页面的原生策略 **8/8** 通过；84 份 API 数据解析中其余 **82 页不变**，3 个组件的新旧 props/ref 及公开文档类型均兼容。证据：`p2-empty-policy-fixed.json`、`p2-native-api-visible.json`、`p2-native-visible-copy.json`、`p2-native-api-semantic-diff.json`、`p2-native-public-props.log`。

字符串生成器独立探针初始 **2/4**：双引号与换行组合生成非法 TypeScript，双引号与反斜杠组合丢失转义。`588c80a` 统一采用可靠的 JSON 字符串编码，并加入解析生成代码、核对原始值的正式回归。主 agent 对相同用例复验 **4/4**，79 页 API 数据全部不变；正常 hooks 为 176 文件、1,475 测试通过。证据：`p2-string-roundtrip-before.json`、`p2-string-roundtrip-fixed.json`、`p2-api-semantic-diff-fixed.json`。

`feda988` 完成 Dialog、AlertDialog、Sheet 共 **29 个 surface** 的源码派生 API，Root 状态、Content 尺寸/焦点/关闭回调、Portal 边界及原生 Header/Footer 各自归属清楚。Sheet 的主 Usage 与场景补齐导入及实际内容。主 agent 对 29 个组件的旧源码、新包公开 props/ref 和文档 Props 作双向检查，全部兼容；从真实页面提取的三页主 Usage 与 Sheet 场景 **4/4 编译通过**。该提交新增 3 份 API 数据，原有 84 份保持逐字不变。

验收另发现生成器把 @types/react/global.d.ts 中的全局 DOM 声明误判为 React 成员，输出不存在的 React.Element、React.DocumentFragment、React.HTMLButtonElement。`927a5da` 按声明所属 namespace 修正，仅改变 DialogPortal、AlertDialogPortal、Fab、HoverCard 的 **4 处类型文本**，87 份 API 数据中其余 **83 份不变**。同一真实 TypeScript 类型片段/公开组件契约检查从 **0/3** 到 **3/3**；修正后真实页面 **5/5** 通过，正式回归同时保留 React.ReactNode 和 React.MouseEventHandler 的正确限定。证据：`p2-c1b-public-props.log`、`p2-c1b-usage.log`、`p2-c1b-committed-shard-diff.json`、`p2-dom-type-before.json`、`p2-dom-type-fixed.json`、`p2-dom-type-semantic-diff.json`、`p2-c1b-dom-api-visible.json`。

两笔提交正常 hooks 为 **176 个文件、1,476 个测试**通过；typecheck/lint、包 build、Bundler/NodeNext 类型、pack、strict publint 和 gitleaks 通过。

参数兼容检查另加入新旧字段集合相等，避免结构赋值关系漏掉可选参数或 ref 的删除。对本阶段此前已修改的 **52 个组件**补查，props、ref 字段集合及双向类型关系全部通过；证据：`p2-retro-exact-props.log`。

`9fb4eb8` 完成 ContextMenu/MenuBar 的 **11 个 surface**。保留新版 ContextMenu 的受控 open，并说明首次触发前的定位边界；MenuBar Root 与 Content 分别记录真实的 loop 默认值，补齐 asChild、原生属性和 React 19 ref 转发。主 agent 核验 **89 份 API 数据、此前 87 份不变**；**11 个组件**的新旧参数、ref、字段集合及公开文档类型兼容；两页实际主 Usage **2/2 编译通过**。浏览器初查发现 MenuBar 场景漏导入而白屏，修正后同一检查 **2/2 通过**。正常 hooks 为 **176 文件、1,476 测试**，类型/lint/包 build/types/pack/publint/gitleaks 通过。证据：`p2-c2a-api-semantic-diff.json`、`p2-c2a-api-visible-before.json`、`p2-c2a-api-visible-fixed.json`、`p2-c2a-public-props.log`、`p2-c2a-usage.log`。

`9a6d0d8` 完成 NavigationMenu 的四个公开组件和 Breadcrumbs，共 **5 个 surface**。保留 React 19 ref、原生属性和 Radix 默认值；Breadcrumbs 明确 item 字段、仅最终无链接项为当前页，以及无 native rest/ref 的边界。主 agent 核验 **91 份 API 数据、原有 89 份不变**；**5 个组件**的参数、ref、字段集合和文档类型兼容；真实页面 **2/2**、复制的主 Usage **2/2 编译通过**。正常 hooks 为 **176 文件、1,476 测试**，typecheck/lint、包 build/types 通过。证据：`p2-c2b-api-semantic-diff.json`、`p2-c2b-api-visible.json`、`p2-c2b-public-props.log`、`p2-c2b-usage.log`。

`116d355` 完成 ChatBubble、ChatComposer、ChatHeader、ChatInbox 的源码 API。内部草稿与异步责任、item 字段、HTML 属性和 ref 边界均按实际实现说明。主 agent 对 **4 个组件**的公开参数/ref/字段集合及文档类型核验通过，运行时 AST **4/4 不变**；**95 份 API 数据中原有 91 份不变**，真实页面 **4/4**、主 Usage **4/4 编译通过**。正常 hooks 为 **176 文件、1,476 测试**，包 build/types/pack/publint、typecheck/lint 通过。证据：`p2-c3a-api-semantic-diff.json`、`p2-c3a-api-visible.json`、`p2-c3a-public-props.log`、`p2-c3a-usage.log`、`p2-c3a-runtime-source-diff.json`。C3B 的 provider/chrome/kit 正文单独交接，Chat 发送闭环留在 P7。

`ba42589` 完成 ThemeProvider/LinkProvider 的准确 API，以及 Accent、应用布局、图表 frame/legend/tooltip/config/series 与 legacy helper 的正文。render 参数只接受组件类型，省略时内部回退原生链接；AppHeader title、可变图例数组、默认 main id、颜色与 Tooltip 辅助函数均按实际声明和行为描述。新增 3 个公开类型，运行时 API 不变。主 agent 核验 **97 份 API、原有 95 份不变**；两个 provider 的公开参数/ref/字段及文档类型兼容，运行时 AST **2/2 不变**；两页实际 API **2/2**、主 Usage **2/2 编译通过**。

非 catalog 归属的缺失锚点修正后，独立检查从 **101/111** 到 **111/111**。文档文件和锚点校验接入生成与 freshness；主 agent 在隔离副本中执行原文对照、删除 10 个真实锚点和 3 份 owner 文档，**14/14** 符合预期。正式回归覆盖缺文件、缺锚点及 `checkSurfaceManifestFreshness` 传播失败；正文内容另外按源码人工审阅。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint、typecheck/lint 和真实 tarball `consumer:docs` 的 8 个 Markdown 模块通过。证据：`p2-c3b-owner-body.json`、`p2-c3b-owner-negative.json`、`p2-c3b-api-semantic-diff.json`、`p2-c3b-api-visible.json`、`p2-c3b-public-props.log`、`p2-c3b-usage.log`、`p2-c3b-runtime-source-diff.json`。

P2 后续范围细化如下，发现即登记，不把归属或编译机制已经建立等同于文档全部完成：

- D03b-C4 补已有页面遗漏的 overlay/command/sidebar/native 子件，以及 Banner/Toast 的准确来源。已定位 Tooltip 根仍只列 delayDuration、PopoverContent 只列 arrow、CollapsibleContent 只列 unstyled，需同时补齐这些既有表的非原生功能项。按 Tooltip/Popover、Collapsible/DropdownMenu、Command 分别交接；别名复用同一接口说明。Toast 现有手表把 Toaster/Toast 组件与 toast() 函数参数混在一起，需分别说明，实际 message 类型是 ReactNode。
- D02c 补全部 Library 主 Usage 的真实 tarball 编译。主 agent 从浏览器实际 registry 提取 99 页 Usage，在仓外按公开 package exports（本地包依赖、无源码 alias）诊断编译，初始 **91/99**。失败项为 Accordion、ConfirmDialog、LinkProvider、SegmentControl、Sheet、SlotBar、TablePager、ToggleGroup，原因包括缺必填属性、未声明状态或漏导入；ToggleGroup、Accordion、Sheet、LinkProvider 已修正。该诊断不是新 tarball 安装证明，关闭前仍需正式消费门及独立复验。
- D02d 将 Copy page 内的全部 scenario code 纳入同一真实 tarball 编译门。浏览器提取共 **99 页、246 个场景**；其中 175 个完整模块的初次仓外诊断为 **174/175 通过**，Sheet 漏导入已在 `feda988` 修正并独立编译，另 **71 段**缺少可独立复制的完整上下文（反馈类 40、其他家族 31）。完整示例必须保留真实 imports、状态和数据，测试 harness 不得注入隐式 import、any 或假全局来制造通过。先前一次混合片段编译因语法错误提前停止，其“未报错文件数”不作为通过数。证据：`p2-scenario-compile-before.json`；正式门尚待实施。
- 非 catalog 正文与归属已在 C3B 验收；D04 继续处理随版本交付和从包内独立读取的指南。

上述接受的是 D03a、D03b-A/B1/B2A/B2B/C1A/C1B/C2A/C2B/C3A/C3B、空参数原生策略及 DOM 类型命名修正。遗漏复合接口、全部 Usage/scenario 和版本化指南继续分组补齐，P2 尚未整体验收。pi 服务错误均在监控检查中发现，保留工作区并恢复原会话后按较小原子组续跑；模型和 pane 保持原配置，P3 未派发。

### 12.5 实施中追加的问题

#### C16 · P2 · 内置 Portal 截断 Content 的 forceMount 契约【浏览器＋源码；待 P4 修正】

源码类型继承了 Radix Content 的 `forceMount`，但包装组件没有把它交给外层 Portal。关闭时 Portal 先卸载，因此只在 Content 上传入 `forceMount` 无法保留内容，调用方的挂载或退场动画策略失效。

已复现的 9 个包装组件：[HoverCardContent](../packages/basalt/src/components/hover-card.tsx)、[DialogContent](../packages/basalt/src/components/dialog.tsx)、[AlertDialogContent](../packages/basalt/src/components/alert-dialog.tsx)、[SheetContent](../packages/basalt/src/components/sheet.tsx)、[PopoverContent](../packages/basalt/src/components/popover.tsx)、[TooltipContent](../packages/basalt/src/components/tooltip.tsx)、[DropdownMenuContent](../packages/basalt/src/components/dropdown-menu.tsx)、[ContextMenuPanel](../packages/basalt/src/components/context-menu.tsx)、[MenuBarContent](../packages/basalt/src/components/menu-bar.tsx)。主 agent 的真实 Chromium 对照共 **30 条**：9 条关闭后强制挂载失败，其余 21 条正常开关或裸组件对照通过，浏览器无错误。直接导出的 ContextMenuContent 三条均通过，不能把修正扩大为给裸组件增加 Portal。证据：`p2-portal-mount-before.json`、`p2-portal-mount-probe.mjs`。

P2 的复合 API 说明先明确当前限制；P4 用独立 10c 提交修正内置 Portal 的参数传递，并更新这些说明。保留默认关闭卸载、打开挂载及实际 ref/定位行为；验证外部动画结束并卸载后的焦点、背景和相邻浮层清理，说明使用 forceMount 时调用方承担的显隐与卸载责任。

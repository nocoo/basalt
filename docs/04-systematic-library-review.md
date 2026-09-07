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

## 9. 实施拆分与阶段提交计划

以下拆分已进入实施授权范围，按第 12 节阶段推进。P1–P5 按原子组提交；自 P6 起遵照用户新指示，由主 agent 直接实施并按大阶段提交。下表保留原始功能拆分用于追踪，后续同阶段的多行可合并为一次提交。每个功能提交携带对应的必要测试和文档。新 API 优先兼容扩展现有组件；Tree adapter 与可拖拽 SplitPane 仍按第 7 节后置，不纳入本轮稳定接口。验收修正单独提交，不改写已经审阅的历史。

| 顺序 | 建议提交 | 对应问题与验收 |
|---|---|---|
| 01 | `fix: propagate pre-push failures` | Q01；build/coverage/lint/OSV 各失败路径均非零 |
| 02a | `ci: enforce full type checking` | Q02；远端实际执行 tsc |
| 02b | `ci: validate package artifacts and consumers` | Q03；包门进入 CI，记录同一提交证据 |
| 03 | `fix: gate releases on validated commits` | Q04；main/CI/单 tag 校验与 dry-run 故障测试 |
| 04 | `docs: define public API and compatibility policy` | D01/D05/D06；先建立出口、默认值与兼容基线，不删除已发布路径 |
| 05 | `fix: generate compilable catalog imports` | D02；所有安装/Copy page 代码在消费端编译 |
| 06a | `docs: complete public API metadata` | D03；公开 surface 归属、默认值和完整性约束 |
| 06b1 | `docs: generate versioned package knowledge` | D04；随包 registry、实际源码/peer 归属及版本 freshness，包含隔离版本提升验证 |
| 06b2 | `docs: complete integration guides and recipes` | D01/D04；Vite/standalone/Next、真实表单 adapter、迁移步骤与原文编译 |
| 07 | `fix: scope standalone component base styles` | C02；Tailwind/standalone 两条几何与 portal 验证 |
| 08a | `fix: preserve button disabled semantics` | C01；鼠标、键盘、loading 与 asChild 契约 |
| 08b | `fix: position typeahead menus outside clipping ancestors` | C03；卡片、Dialog、滚动区和视口边缘 |
| 08c | `fix: preserve focus when committing autocomplete blur` | C04；Tab/Shift+Tab 提交不抢回焦点 |
| 09 | `fix: preserve date picker form refs and validity` | C05；ref/reset/FormData/required 真实浏览器验证 |
| 09q | `test: budget package registry integration validation` | Q05；为实测超过 5 秒的真实生成器用例设置独立预算，保留全部断言与覆盖率阈值 |
| 09b | `fix: respect cancelled native form resets` | C20；Typeahead、Checkbox.Group、Switch.Group 的普通与取消 reset 对照 |
| 09c | `fix: preserve group callback ref cleanup` | C21；两个 Group 的 React 19 ref cleanup、替换及卸载 |
| 10a | `fix: align dock overlay semantics` | C06；背景交互与模态边界一致 |
| 10b | `fix: restore imperative confirm focus` | C07；无 trigger 的 Promise 路径也归还焦点 |
| 10c | `fix: preserve force mounting across overlay portals` | C16；内置 Portal 尊重既有 forceMount，正常开关及卸载清理保持正确 |
| 10d | `fix: compose popover content slots` | C17；asChild 在有无箭头时均可挂载，保留子元素与 ref/事件合成 |
| 10e | `fix: honor toast icon suppression` | C18；四种状态通知的 icon=false 真正隐藏图标，保留默认及自定义图标 |
| 11a | `fix: complete slider values and accessible names` | C08；单值/范围、Thumb 数量及名称 |
| 11b | `fix: complete calendar keyboard navigation` | C10；日历导航、可访问树与本地化 |
| 11b2 | `feat: expose controlled calendar months and localized validation` | C10；受控月份、父级接纳/拒绝导航、可本地化验证反馈与键盘说明；与 11b 均验收后关闭 |
| 12a | `fix: render empty state actions` | C09；明确 slot 并验证所有允许的 children |
| 12b | `fix: tolerate unavailable theme storage` | C11；回退与持久化行为 |
| 13a | `fix: improve semantic text contrast` | C12；主题与表面配对验证 |
| 13b1 | `feat: expose accessible chart alternatives` | C13；图表框架及公开包装的摘要、数据替代与键盘路径 |
| 13b2 | `fix: make heatmap values keyboard accessible` | C13；日期/数值名称、单一 Tab 入口、方向键及局部横滚 |
| 13b3 | `feat: compose metric card states and explanations` | R05；现有 StatCard/LayerCard/ChartShell 的说明、趋势与状态插槽 |
| 13c | `fix: respect reduced motion across feedback states` | E07；spinner、caret、局部 pulse 与系统偏好 |
| 13d | `fix: restore mobile navigation focus` | E08；移动 Sheet 关闭回焦与滚动锁清理 |
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
| 17a-tooltip | `feat: add composable chart tooltip parts` | R04；行、分组分隔与总计，两个实际组合示例 |
| 17a-matrix | `feat: add reusable heatmap matrix` | R04；caller 行列标签、颜色域、空值与键盘导航 |
| 17a-heatmap-tests | `fix: preserve heatmap focus across data transitions` | C23 与 P5 热力日历/矩阵分支缺口；清空后加载回焦、键盘、读数及清理回归 |
| 17a-chart-tests | `test: cover chart rendering options` | P5 图表框架与包装选项的公共行为回归；不改四维 95% 门槛 |
| 17a-registry-perf | `perf: avoid redundant registry parsing` | Q08；减少单次 registry 校验中的重复解析，保留生成内容、跨调用 freshness 与既有时间预算 |
| 17a-generator-fixtures | `test: reuse compiler fixtures without weakening checks` | Q08 复核；减少只读清单与独立 callable 场景重复编译，保留所有断言与原时间预算 |
| 17a-transition-tests | `test: cover heatmap focus transition boundaries` | 数据缩短、矩阵直接清空与恢复的键盘焦点回归；保持既有公共实现和门槛 |
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

**2026-09-07 执行方式变更：**用户要求主 agent 直接完成 P6–P10，不再调度 pi，改为按大阶段正常提交。以下 pi 原子组流程保留为 P1–P5 的历史记录；后续由主 agent 实现、验证并维护台账，保持公共基线、四维 95% 门和正常 hooks。P6 前暂停已由本次继续指示解除。

- 当前分支：`main`，审查起点 `e61efc1`。按用户在 pi pane 中补充的「直接 main 做即可 / 或者合并」，主 agent 已把本地 main 快进至已完成的实现提交；后续继续在 main 原子提交。现有 Herdr pi pane：`w1R:p2`；主 agent 使用同一仓库，负责验收和本节状态，pi 不并行修改本文或索引。
- 同一时间只派发一个阶段中的一个原子组。pi 完成代码、必要文档和相关检查后先停下，不暂存或提交；主 agent 独立验收 diff、安装包与实际行为，保存文件哈希快照后才授权普通提交。提交通过正常 hooks 后再核对文件与快照；未通过则留在本组修正并重新验收。
- 每个提交描述一个可独立审阅的变化，使用正常 hooks；不得跳过 hooks、降低覆盖率或放宽质量门来通过验收。只提交本阶段明确的文件。
- 监控每 45 秒采集 pi 状态、会话进展和 Git 状态。进入 blocked/unknown、进程退出或连续 5 分钟无会话进展时检查终端和子进程；长时间构建需要核对实际进度，不能仅凭时间强杀。即使 Herdr 显示 done，也检查最后一次 assistant stopReason；服务端错误结束单独报警，避免误判为完成。监控不自动接受审批、不替用户回答问题。
- 阶段状态采用「待调度 / 实施中 / 验收中 / 需修正 / 已验收 / 暂停」。完成记录绑定提交与本阶段新证据，不能沿用第 2 节的历史通过结果。

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
| P2 | 公共接口与文档：04、05、06a/b1/b2；D01–D06 | 公开出口兼容基线、可编译安装代码、API 归属/默认值、随包 agent 指南与迁移策略 | 已验收 | `ef2bd65`–`2b8f088`：99 页 API、99 Usage、246 场景、随包 registry/指南及正式 tarball 编译门；120 项旧接口契约与 5 项真实 recipe 浏览器检查通过，详见 12.4 |
| P3 | 基础样式与输入：07、08a/b/c、09/q/b/c/d；C01–C05/C19–C21 | standalone/ Tailwind 尺寸、disabled、portal、Tab、DatePicker ref/reset/required、Group 原生事件与 ref 清理 | 已验收 | 运行时至 `b85649d`、行为回归 `026a958`；C01–C05/C19–C21 已关闭，177 文件 / 1,544 测试，四维覆盖率均 ≥95%；120 项旧接口与真实安装包验收通过 |
| P4 | 浮层与语义：10a/b/c/d/e、11a/b/b2/b3、12a/b/c/d；C06–C11/C16–C18/C22/Q07/R05 | Dock 非模态语义、Confirm 焦点/异常、Portal forceMount、Popover asChild、Toast 图标隐藏、Slider 多值/名称/双轴几何、日历键盘/受控月份/本地化、Empty action、Theme/Accent 组合下 Storage 拒绝 | 已验收 | 实现至 `781aadf`，C06–C11/C16–C18/C22/Q07 已关闭；177 文件 / 1,628 测试，四维覆盖率 97.45 / 95.26 / 98.22 / 97.53；最终包、Next 与文档消费通过，详见 12.4 |
| P5 | 视觉/图表/动效：13a/b1/b2/b3/c/d、17a 及 tooltip/matrix/回归/registry 子组；C12/C13/C15/C23/E07/E08/Q08/R04/R05 | 主题对比、导航回焦、图表替代、StatCard 状态、动态系列与 formatter/domain/stack、热力矩阵/tooltip 组合、reduced motion | 已验收 | 实施至 `236ac18`；183 文件 / 1,703 测试全部通过，四维覆盖率 97.24 / 95.05 / 98.50 / 97.43；C12/C13/C15/C23/E07/E08/Q08/R04 已关闭，详见 12.4 |
| P6 | Library 骨架屏与 Table：17b/c/d/e；C14/S01/S02/R05 | 三类骨架屏；两类丰富 Table；受控状态、格式化/行内图表、四态、移动/深色/键盘 | 已验收 | `462b43e`；三种骨架屏、两种丰富表格、BatteryMeter 与受控列表；1,719 项测试及四维 95% 门、真实包和浏览器检查通过 |
| P7 | Example 完备性：14a–f、15a–c；E01–E06 | 文档表格/ID、Chat 移动、Network 几何、翻译/页头；Settings、Forms、Data、Chat 可观察状态闭环 | 已验收 | `e5cb6de`；1,729 项测试、四维 95% 门及 fresh 生产构建浏览器检查通过 |
| P8 | 筛选与上传：16a/b/c；R01/R02 | 受控搜索多选与 chip、FilterBar、文件选择/拖放及队列状态；两个场景和纯包消费 | 已验收 | `55b9dba`；1,755 项测试、四维 95% 门、真实 tarball A/B/Next、文档与生产展示通过 |
| P9 | 小型复用控件与应用模板：18a/b/c/d；R03/R06/R07/R08 | EditableNav、Tag 色板/选择、InlineEditable/master-detail、可编译 AppFrame/Login/Resource recipes | 已验收 | `9d63226`；1,787 项测试、四维 95% 门、真实 tarball A/B/Next 与文档/生产展示通过 |
| P10 | D07 类型打印器；主色/图表双色板；生产域名；整体验收、兼容/迁移说明与台账收口 | 泛型/readonly/回调类型可编译；12 糖果主色及本地自定义色板；固定图表色板与 ring 衬底；basaltui.com / GitHub metadata；最终候选全套 6DQ、tarball/文档 freshness、无未记录 API 破坏 | 已验收 | 与本节同阶段提交；1,795 项测试、四维 95% 门、包质量、A/B/Next/heavy/docs 与 fresh showcase 全通过，详见 12.4 |

P7 包含原拆分表未单列的 Data 页面搜索/筛选闭环；P9 包含实际受控需求所需的 InlineEditable。两者均已按用户修订后的大阶段提交方式交付。新增公开 surface 同阶段补齐元数据、出口和文档。

**P10 追加设计与验收：**控件主色参考经典 Apple iMac 与 iPhone 5C 糖果色，演绎为 12 色，替换现有色板的视觉值；保留已发布入口与类型契约，对旧持久化选择明确迁移。Palette 页面支持编辑、自定义、应用与恢复色板，缓存于 localStorage，验证刷新、无存储权限、无效颜色与浅深主题。图表使用独立的固定 5C 风格色板，明确固定数量及对比度处理；主色切换和自定义不得改写图表系列颜色。逐类核对 chart 的文字、legend、tooltip、图形配色及 ring 未占用区域，改用适配主题的衬底并检查真实浏览器画面。生产链接统一为 `https://basaltui.com`，同步 GitHub homepage；保留 `basalt.dev.hexly.ai` 本地地址，Cloudflare 配置由用户完成，本轮不部署。上述与 D07、迁移文档及最终 6DQ 一并验收。

**当前执行点（2026-09-07）：P1–P10 已按本轮范围全部验收，P6–P10 由主 agent 直接实施并按大阶段提交。** pi 保持空闲，其监督定时器停止，本地 dev 服务保留。分类结果和后置边界见 12.6，页面导览见 12.7。以下阶段记录保留验收时的 2.0.3 版本；用户随后授权按 Y+1 发布 v2.1.0，并一并发布 npm。版本说明以 [CHANGELOG.md](../CHANGELOG.md) 与 [v2.1.0 Release](https://github.com/nocoo/basalt/releases/tag/v2.1.0) 为准。

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

#### P2 验收记录（已验收，2026-09-06）

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

`003af81` 完成 Tooltip/Popover 的 **10 个 surface**，补齐 Provider 继承、Root 状态、定位与关闭回调、原生属性和 ref。Tooltip 的 700ms 默认值归于 Provider，单个 Root 可覆盖；两种 Content 的 forceMount 限制和 Popover asChild 的 C17 崩溃如实说明，未在文档组改变行为。主 agent 核验 **97 份 API、原有 95 份不变**，**10 个组件**的新旧参数/ref/字段集合及文档类型兼容，运行时 AST **2/2 不变**，真实页面 **2/2**、主 Usage **2/2 编译通过**。已核对的源码与生成文件在提交前后哈希一致。正常 hooks 为 **176 文件、1,477 测试**，typecheck/lint、包 build/types/pack/publint/gitleaks 通过。证据：`p2-c4a1-api-semantic-diff.json`、`p2-c4a1-api-visible.json`、`p2-c4a1-public-props.log`、`p2-c4a1-runtime-source-diff.json`、`p2-c4a1-usage.log`、`p2-c4a1-acceptance.json`。

`0ea3541` 完成 Collapsible/DropdownMenu 共 **11 个 surface**，包括受控状态、键盘循环、定位与事件、Portal 和子组边界。Collapsible 明确公开类型不含 Root ref，以及 Content 的 asChild/unstyled 组合；DropdownMenu 区分公开与内部参数，并说明方向继承、内置 Portal 和未提供的子菜单/单选项出口。主 agent 核验 **97 份 API、此前 95 份不变**，**11 个组件**的参数/ref/字段集合及文档类型兼容，运行时 AST **2/2 不变**，真实页面 **2/2**、主 Usage **2/2 编译通过**。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint、typecheck/lint/gitleaks 通过。证据：`p2-c4a2-api-semantic-diff.json`、`p2-c4a2-api-visible.json`、`p2-c4a2-public-props.log`、`p2-c4a2-runtime-source-diff.json`、`p2-c4a2-usage.log`、`p2-c4a2-acceptance.json`。

`30c2ee4` 完成 CommandPalette 的 **9 个 surface**，包括根的直接子 Trigger 约束、Dialog 状态、Input 字符串回调、List 名称、Item 选择与 forceMount 继承；不把 cmdk 根未公开的能力写成 Basalt 接口。主 agent 核验 **97 份 API、此前 96 份不变**，**9 个组件**的参数/ref/字段集合及文档类型兼容，运行时 AST **1/1 不变**，真实页面与主 Usage **1/1 通过**。公开 manifest 为 **110 个模块、664 个符号（375 个运行时、289 个类型）、3 个 CSS 出口**；原始兼容基线保持不变。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint、typecheck/lint/gitleaks 通过。证据：`p2-c4a3-api-semantic-diff.json`、`p2-c4a3-api-visible.json`、`p2-c4a3-public-props.log`、`p2-c4a3-runtime-source-diff.json`、`p2-c4a3-usage.log`、`p2-c4a3-acceptance.json`。

`8d2775f` 完成 Sidebar 的 **12 个组件及 useSidebar 返回值**，共 **13 个 surface**。说明搜索按钮与快捷键标签、图标项名称责任、Group 的非受控边界、180–400px 初始宽度及 hook 的 Provider 依赖。主 agent 核验 **12 个组件**的参数/ref/字段集合及文档类型，以及 hook 签名和 **11 个返回字段**；运行时 AST **1/1 不变**，**97 份 API、此前 96 份不变**，真实页面与主 Usage **1/1 通过**。manifest 为 **674 个符号（375 个运行时、299 个类型）**，模块/CSS 出口和原始基线不变。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint、typecheck/lint/gitleaks 通过。证据：`p2-c4b-sidebar-api-semantic-diff.json`、`p2-c4b-sidebar-api-visible.json`、`p2-c4b-sidebar-public-props.log`、`p2-c4b-sidebar-hook.json`、`p2-c4b-sidebar-runtime-source-diff.json`、`p2-c4b-sidebar-usage.log`、`p2-c4b-sidebar-acceptance.json`。

`b0594bc` 完成 TableHeader/TableBody/TableFooter、GridItem 的原生接口，以及 RadioGroup/Radio.Group、ToolbarButton/Toolbar.Button、ToolbarInput/Toolbar.Input 的别名说明。主 agent 核验 **10 个组件/别名**的参数/ref/字段集合及文档类型，实际页面与主 Usage **4/4 通过**；**97 份 API、此前 95 份不变**，运行时 **2/2 不变**。验收脚本对 Biome 去除 JSX 调用冗余括号作等价归一，4 个对照证明仍能识别元素变化、属性丢失和可选链边界。manifest 为 **678 个符号（375 个运行时、303 个类型）**。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint、typecheck/lint/gitleaks 通过。证据：`p2-c4b-native-api-semantic-diff.json`、`p2-c4b-native-api-visible.json`、`p2-c4b-native-public-props.log`、`p2-c4b-native-runtime-source-diff.json`、`p2-c4b-native-usage.log`、`p2-c4b-native-acceptance.json`。

`b1eb8ae` 完成 Banner / Banner.Action 的 **2 个 surface、14 个自定义参数**，补齐 BannerAction 别名、原生属性和 ref 边界。说明 null 回退默认样式、structured children、紧凑 action 位置以及 Button 参数的上下文映射。主 agent 核验 **3 个组件/别名**的参数/ref/字段集合及文档类型，运行时 AST **1/1 不变**；**98 份 API、此前 97 份不变**，真实页面与主 Usage **1/1 通过**。manifest 为 **110 个模块、679 个符号（375 个运行时、304 个类型）、3 个 CSS 出口**，原始基线不变。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint 通过；提交后的 6 个已审文件与验收哈希一致。证据：`p2-c4c-banner-api-semantic-diff.json`、`p2-c4c-banner-api-visible.json`、`p2-c4c-banner-public-props.log`、`p2-c4c-banner-runtime-source-diff.json`、`p2-c4c-banner-usage.log`、`p2-c4c-banner-acceptance.json`。

`256e4cf` 完成 Toaster / Toast 别名的源码 API，保留 **21 个组件参数及 ref/key**。新增 ToasterProps、ToasterToastOptions、ToasterIcons、ToasterSwipeDirection 四个类型，避免把 Sonner 的容器选项与 Basalt ToastOptions 混为一谈。主 agent 核验 **2 个组件/别名**的参数/ref/字段集合，以及 **21 个生成类型表达**与实际参数的一致性；运行时 AST **1/1 不变**，**99 份 API、此前 98 份不变**，真实页面与主 Usage **1/1 通过**。说明单一无 id 容器、关闭按钮/图标/时长优先级及 C18 当前限制；库页面不重复挂载 Toaster。manifest 为 **683 个符号（375 个运行时、308 个类型）**，模块/CSS 出口和原始基线不变。正常 hooks 为 **176 文件、1,477 测试**，包 build/types/pack/publint 通过；6 个已审文件提交后哈希一致。证据：`p2-c4c-toaster-api-semantic-diff.json`、`p2-c4c-toaster-api-visible.json`、`p2-c4c-toaster-public-props.log`、`p2-c4c-toaster-documented-types.json`、`p2-c4c-toaster-runtime-source-diff.json`、`p2-c4c-toaster-usage.log`、`p2-c4c-toaster-acceptance.json`。

`68a3b54` 完成 toast 根调用及 success/error/warning/info/dismiss 的源码生成文档。新增等价的 ToastCallOptions，通知函数与 Toaster 组件参数分开，保留公开函数类型和运行时；说明无参 dismiss 的实际返回边界。主 agent 核验 **6 个公开函数契约、6 个生成签名、11 个参数和 31 条选项记录**，真实 TypeScript 编译全部通过；实际页面与 Copy **7/7**、隔离源码正负例 **9/9**。负例覆盖必填/可选变化、显式 undefined、新增选项/方法、文案变化、缺失出口及多签名，曾发现的两处 undefined 丢失已修正并复验。运行时 AST **1/1 不变**，**99 份 API、此前 98 份不变**；manifest 为 **684 个符号（375 个运行时、309 个类型）**。正常 hooks 为 **176 文件、1,478 测试**，包 build/types/pack/publint 通过；8 个已审文件提交后哈希一致，原始基线不变。证据：`p2-c4c-toast-functions-public-symbols.json`、`p2-c4c-toast-functions-documented-types.json`、`p2-c4c-toast-functions-freshness-final.json`、`p2-c4c-toast-functions-visible-final.json`、`p2-c4c-toast-functions-acceptance.json`。

`d7867a5` 补齐 ConfirmDialog、SegmentControl、SlotBarChart、TablePager 主 Usage 的实际导入、状态和数据。主 agent 从浏览器重新提取全部 **99 页**的原文，在仓库外通过 npm 安装实际 tarball 后，严格 TypeScript 编译 **99/99 通过**；无源码 alias、隐式导入或假全局。首次验证和正常 hook 均发现 SlotBarChart 的完整代码传错 helper 参数，修正后用同一已安装 tarball 复验通过。包源码未变，4 个已审文件提交后哈希一致，正常 hooks 为 **176 文件、1,478 测试**。证据：`p2-usage-independent-result.json`、`p2-usage-fixed-result.json`、`p2-usage-source-acceptance.json`。

`92319ff` 将 **99 个主 Usage** 接入正式 consumer:docs，保留 **8 个 Markdown 模块、99 个 granular 和 34 个 root 导入**。无监听端口的 Vite loader 从指定仓库的真实 registry/catalog/status 取得原文；每个模块独立写入实际 tarball 的仓外消费工程，CLI 真实 await 完成结果。主 agent 核验浏览器/SSR 原文 **99/99 逐字节一致**、隔离提取控制 **6/6**；直接在源码用法中删除 useState 导入、添加无效 TablePager 属性，正式门均因消费端 TypeScript 诊断失败，**2/2 负例通过**。`ec88324` 补入指定 root、空白保真、新 ready 纳入、缺记录与空/缺 Usage 的实际 loader 回归测试。正常 hooks 最终为 **176 文件、1,480 测试**，实现与测试提交均和已审哈希一致。证据：`p2-usage-gate-positive.json`、`p2-usage-loader-final-result.json`、`p2-usage-gate-source-negative-final-result.json`、`p2-usage-gate-acceptance.json`。

`29ceb8b` 和 `0ae7849` 将反馈类 **40 段**代码补为具有显式导入、实际内容与布局的独立模块，前者为 30 个非 Toast 场景，后者为 10 个 Toast 点击场景。主 agent 从浏览器提取原文后，使用已实际安装且包源码未变的 tarball 严格编译 **30/30、10/10 通过**；全库 **246 个场景 ID、99 个主 Usage** 均保持不变，反馈文件的 **40 个 render 函数原文也全部不变**。Toast 代码说明应用只挂一个全局 Toaster，本站未新增容器，C18 仍待 P4。两笔提交均经正常 hooks，**176 文件、1,480 测试**通过，已审哈希与提交一致。证据：`p2-feedback-static-result.json`、`p2-feedback-toast-result.json`、`p2-feedback-all-inventory-diff.json`、`p2-feedback-all-renderers.json`、`p2-feedback-static-acceptance.json`、`p2-feedback-toast-acceptance.json`。

`013cfe1` 补齐 Slider、Toggle、ThemeProvider、LinkProvider、Tabs、Breadcrumbs、Toolbar 的 **12 个场景**，显式提供导入、布局和所需上下文。主 agent 核验真实浏览器原文在已安装 tarball 中严格编译 **12/12 通过**；全库 **246 个场景 ID、99 个主 Usage** 保留，三个家族的 **17 个 render 函数**原文不变，4 个已审文件的哈希与提交一致。正常 hooks 为 **176 文件、1,480 测试**。证据：`p2-scenarios-b-navigation-result.json`、`p2-scenarios-b-navigation-inventory-diff.json`、`p2-scenarios-b-navigation-renderers.json`、`p2-scenarios-b-navigation-acceptance.json`。

`8dde9cb` 补齐剩余 **4 个 Chat、15 个浮层场景**。Dialog 代码同步保留实际标题关闭按钮、尺寸表格、警示图标、页脚操作、长文本截断和间距；Popover 方位示例保留居中布局。主 agent 再次从浏览器提取全库原文，使用实际安装且包源码未变的 tarball 严格编译，**99 个主 Usage、246 个场景全部通过**。B 组只改动计划内 **31 段**场景代码，所有 ID 和 Usage 不变；Chat/overlay 的 **23 个 render 函数**不变，3 个已审文件与提交哈希一致。正常 hooks 为 **176 文件、1,480 测试**。证据：`p2-scenarios-complete-result.json`、`p2-scenarios-b-final-inventory-diff.json`、`p2-scenarios-b-final-renderers.json`、`p2-scenarios-b-chat-overlay-acceptance.json`。

`c6395ac` 把全部场景接入正式 consumer:docs，`b4c2839` 整理旧测试限制和文件名碰撞回归。单个 Vite loader 从指定仓库的实际 ready 记录取得 Usage 与 scenario 原文，每段独立写入仓外消费工程；正式门编译 **8 个 Markdown 模块、99 个 Usage、246 个场景**，保留 **99 个 granular / 34 个 root 导入**。主 agent 实际运行正式 CLI，全部通过，浏览器与 SSR 的 **345 段代码逐字节一致**。

完整模块检查采用 TypeScript AST，接受函数、箭头、默认导出、类及包装组件，不强迫原生 JSX 组件添加多余 import。首轮独立控制 **18/25**，发现强制 import 拒绝 5 种合法写法、空导出/类型声明放过 2 种片段；修正后同一组 **25/25 通过**，覆盖新增页面/场景自动纳入、缺失/空代码、重复 ID 和文件名碰撞。主 agent 另在隔离仓库直接改写两个非首屏 Dialog 场景，漏 Button 导入和无效属性均由真实 tarball 的 tsc 拒绝，裸原生 JSX 回退由模块检查拒绝。两份最终文件的哈希与已审实现一致，正常 hooks 均为 **176 文件、1,484 测试**。证据：`p2-scenario-gate-positive.json`、`p2-scenario-loader-fixed-result.json`、`p2-scenario-gate-types-result.json`、`p2-scenario-gate-native-result.json`、`p2-scenario-gate-acceptance.json`。

`e198a8b` 完成随包版本化 registry、源码获取与 Library Source 查看页。registry 覆盖 **110 个公共模块、684 个符号（375 个运行时、309 个类型）、3 个 CSS 出口、99 个 catalog 条目与 241 个 API surface**，保留共享模块中的独立条目、Toast 函数及逐模块 peer 归属。包内提供当前 INTEGRATION 镜像和基础 agent 指南；源码通过 sourcemap 的 sourcesContent 或自动发现的纯转导出 source bundle 读取，Source 链接以源码指纹校验。根检查与包构建接入 metadata freshness，pack 检查覆盖版本、全部公开源码和冲突的 sourcesContent；release 在暂存前重新生成当前元数据，原始公开基线不变。

主 agent 在不含 dist 的隔离源码中验证 **17/17**，从新构建的真实 npm tarball 中核验 **441/441**（含 111 条包内文档引用、全部模块的 peer 和精确源码）；pack 的故障注入 **8/8** 通过。实际隔离提升到 9.8.7 后，6 个变更文件均正确生成并暂存，生成失败阻断暂存，基线逐字节不变；真实仓库仍为 2.0.3。真实 Library Source 链接、Copy、错误指纹拒绝和 390px 布局 **5/5**，另以延迟 raw 网络响应复现并修正旧请求覆盖新路由错误的问题。正式回归覆盖 metadata 缺失/漂移、包内锚点、模拟版本提升和源码异步竞态；正常 hooks 为 **177 文件、1,505 测试**，包 build/types/pack/publint 与 consumer:docs 通过。证据：`p2-registry-final-controls.json`、`p2-registry-final-artifact.json`、`p2-registry-pack-corrected.json`、`p2-registry-final-release-stage.json`、`p2-source-viewer-final.json`、`p2-source-viewer-race-final.json`、`p2-registry-commit-evidence.json`。

`2b8f088` 完成 Vite/Tailwind 与 standalone、Next 根布局/客户端边界/主题初始化、React Router adapter、原生表单及 React Hook Form 接入指南，原文镜像随包交付。日期控件使用现有 ISO string 契约；Controller 内的 Field 正确关联实际控件；P3/P4 尚未修正的 ref、required、blur 与存储边界明确记录。正式 consumer:docs 递归发现包内 AI Markdown，编译 **26 个完整文档模块、99 个 Usage、246 个场景**及 **99 个 granular / 34 个 root 导入**。

主 agent 从最终真实安装 tarball 独立编译浏览器提取的 **345 个 Usage/场景，全部通过**；再从安装包的指南原文提取 5 个 recipe，在 Chromium 中验证 RHF 必填/最短长度/提交/受控日期重置、原生 Input/Switch FormData 与 reset、真实路由切换、Vite 输入操作和 Next 客户端组件重置，**5/5 通过**。Next 根布局另经完整 TSX 编译与文件边界审查；此处不把 Vite 中的客户端组件检查称为 Next SSR 验收，整体验收仍包含正式 consumer:next。新增顶层及嵌套 AI 文档均自动发现；隔离仓库中新建嵌套 recipe 的错误 import 与无效 prop 均被实际 tarball 消费端 TypeScript 拒绝。初次浏览器 probe 的精确名称与同步路由读取得到两条工具断言失败，按实际含日期的可访问名称和异步路由状态修正 probe 后通过，未改动组件。证据：`p2-final-result.json`、`p2-guides-browser-manifest.json`、`p2-guides-browser-result.json`、`p2-guides-real-negative.json`。

阶段收尾对原始 `e61efc1` 的 **120 项 props/ref/key/文档类型契约全部通过**；最终指南提交未改变绑定的 **212 份库源码和 113 份声明**。原始 `ef2bd65` 公共基线逐字节保留，当前仍为 2.0.3。最终正常 hooks 为 **177 文件、1,506 测试**，typecheck/lint/gitleaks、包 build/types/pack/publint、consumer:docs 与根生产 build 均通过。证据：`p2-final-public-props.json`、`p2-final-public-props-final-binding.json`、`p2-guides-commit-evidence.json`。生成 standalone CSS 的最新完整同步由 P3/07 承接，不把当前已知尺寸问题计为通过。

P2 范围关闭如下：

- D03b-C4A1/A2/A3、C4B、C4C-Banner/Toaster/函数家族已验收；组件参数与通知参数分开，message、五个方法、选项和返回边界均已同源生成。隐藏图标的 C18 限制已说明，运行时修正留在 P4。
- D02c 已验收：主 Usage 全部修正，**99/99 实际 tarball 安装编译**进入正式 consumer:docs；无效属性、漏导入、缺失/空白 Usage 与新增 ready 纳入均已验证。
- D02d 已验收：原 175 个完整模块中的 Sheet 漏导入在 `feda988` 修正，其余 **71 个片段全部补齐**，现有 **246/246 场景严格 tarball 编译及完整模块检查**均进入正式 consumer:docs。真实源码负例和 **25 个独立控制**按上述结果通过，harness 不注入隐式 import、any 或假全局。早期混合片段导致语义检查中止的“未报错文件数”不作为通过数。历史诊断：`p2-scenario-compile-before.json`。
- 非 catalog 正文与归属已在 C3B 验收；D04 的 06b1 随包 registry/来源/版本 freshness 已在 `e198a8b` 验收，06b2 完整接入指南与可编译 recipes 已在 `2b8f088` 验收。

P2 的 D01–D06 已整体验收。C01–C18、Example 与新增公共能力按 P3–P10 继续，不把文档完整性验收等同于运行时问题已经解决。pi 服务错误与重复读取循环由监控识别，保留工作区并恢复原会话后按原子组续跑；模型和 pane 保持原配置。下一阶段为 P3。

#### P3 验收记录（已验收，2026-09-06）

07 的基础实现提交为 `8aa47f0`。Tailwind 与 standalone 共用低优先级 `.basalt-ui` base，由组件自身和 portal 表面携带 scope，修正 box sizing、原生控件字体/边框、链接、列表等默认样式。包内新增内部 `base.css`，三个公共 CSS 出口保持原契约。类名候选扫描改为 TypeScript AST，注释引号不再截断 JSX 与模板中的实际 utility；INTEGRATION 及随包镜像同步说明。

主 agent 使用真实安装 tarball 的两个仓外工程验证 **standalone 7/7、Tailwind 6/6**，其中共用 **6 组计算样式逐项一致**，覆盖表单控件、Button/asChild、Table/LayerCard、Accordion/MenuBar 和真实 Dialog Portal；standalone 另与无样式 iframe 比较原生宿主。Table 保留自身的 `border-separate` 与零 spacing，弹层测量等待入场动画结束。类名提取独立控制 **5/5**；Accordion/Tabs/Button/Toggle/Slider 对原始 `e61efc1` 的 props/ref/key 契约 **5/5**。提交后绑定的 **117 份实际 JS/CSS 产物全部不变**，公共基线与指南镜像验证通过。正常 hooks 为 **177 文件、1,509 测试**。

证据：`p3-css-steady-standalone.json`、`p3-css-steady-tailwind.json`、`p3-07-runtime-parity.json`、`p3-class-candidates-controls.json`、`p3-07-public-props-final.log`、`p3-07-runtime-final-binding.json`、`p3-07-base-commit-evidence.json`。这些是已执行的代表性独立验收。

`4a75211` 将真实控件浏览器回归接入正式 A/B consumer，保留原 root-only 入口、依赖与解析边界，另构建 granular 几何页面。主 agent 在独立源码快照上执行两条真实 CLI，包构建、tarball 安装、类型检查、生产构建及 Chromium 断言均通过，**39 项 Basalt 结果逐项一致**。实际给消费者 Input 注入 `content-box` 后，CLI 因 **346px ≠ 320px** 非零退出；浏览器、profile、临时目录与监听端口均已清理。检查脚本、fixture 等 **12 个文件**与最终提交哈希一致。正常 hooks 为 **177 文件、1,510 测试**。证据：`p3-07-consumer-result.json`、`p3-07-formal-negative.json`、`p3-07-consumer-final-binding.json`、`p3-07-consumer-commit-evidence.json`。现有 CI 的 A/B 命令会执行此门，本轮没有推送或远端 CI 结果。

扩大真实 tarball 抽查后，又确认 C02 的 styled surface 遗漏：320px 容器中的 Banner 宽 **352px**；Empty 高 **96px**，Tailwind 为 **44px**；PageHeader 高 **80px**，Tailwind 为 **56px**；DescriptionList 保留 `dd` 的 **40px** 左缩进，CodeBlock 的 `pre` 有 **14px** 上下外边距。修复前对照为 `p3-css-surfaces-before.json`。`d17310e` 为 **21 个组件模块**补齐自身 styled root 的作用域，并扩展 `pre/dl/dd/menu` 的 base 和两条正式 consumer；没有改动其交互、children 或公共参数。

进一步核对实际 `<Text as="h2">` 的默认 body 字重，发现 standalone 为 **700**、Tailwind 为 **400**，此前显式 heading variant 的样本没有覆盖这个分支。独立修正 `10bedff` 补 scoped heading 的字号/字重继承；正式 A/B 同时断言默认 body 为 400、显式 heading 保持 600。证据：`p3-css-surfaces-typography-current.json`。

最终 tarball 的两个实际安装工程通过 **8/8 扩展样式对照**（含默认/显式 heading 字重）与此前 **standalone 7/7、Tailwind 6/6** 几何回归，宿主原生样式和真实 Portal 同时通过；主 agent 查看了前后截图。绑定最终 `10bedff` 的 **230 份 JS/CSS/声明均一致**，其中 **113 份声明与 07 consumer 阶段逐字节不变**。两笔提交均经过正常 hooks，**177 文件、1,510 测试**、typecheck/lint/gitleaks 通过，扩展后的正式 A/B consumer 通过。证据：`p3-css-surfaces-typography-final.json`、`p3-css-surfaces-final-standalone.log`、`p3-css-surfaces-final-tailwind.log`、`p3-surfaces-final-binding.json`、`p3-07-surfaces-commit-evidence.json`、`p3-07-heading-commit-evidence.json`。

07 的 C02/C19 已关闭。这里的样式抽查不等同于 99 个组件的完整行为及可访问性验收；08a/b/c、09 和后续阶段继续按各自契约验证。

08a 提交为 `2e426ad`，关闭 C01。Button 的 asChild 禁用/loading 会覆盖子元素的冲突属性，阻止父子点击、捕获及键盘激活回调，提供 `aria-disabled`、busy 和禁用态视觉；真实 button 子元素设置原生 disabled。保留同一个 DOM/ref、可用时的 Slot 事件顺序，以及已聚焦后切换状态时的 Tab/Shift+Tab 离开能力。asChild loading 保留调用方 children，不插入内部 spinner；所有状态都要求子组件转发 props/ref，源码 API 文档与随包资料同步。

主 agent 使用实际安装包验证原有 **10/10** 与扩展 **12/12** 浏览器用例：包含原生按钮、anchor、转发 props/ref 的自定义 anchor、子属性覆盖、物理/程序/键盘激活、父容器点击不穿透、四种保留焦点的状态切换，以及可用状态的事件合成。扩展用例在修复前为 **2/12**；两项原始 `e61efc1` 公开 props/ref/键名契约通过。**117 份 JS/CSS** 与最终提交产物一致，**111 份源码**与构建 source map 对齐；仅 Button 声明的文档文字相对初测产物变化，最终类型另行复验。检查过的 **10 个文件**与提交哈希全部一致。证据：`p3-input-matrix-p3-08a-precheck.json`、`p3-button-edge-button-08a-precheck.json`、`p3-button-edge-button-transitions-before.json`、`p3-08a-public-props-final.log`、`p3-08a-final-artifact-source-binding.json`、`p3-08a-commit-evidence.json`。

正式 A/B 已加入 loading 激活、父子回调计数和 Tab 顺序回归，两条命令均通过。扩展交互曾使几何 fixture 的非模态 Dialog 正常关闭，误测到退出动画；fixture 改为受控打开，保留原 **36px** Portal Input 及所有旧尺寸断言。正常 hooks 通过 **177 文件、1,513 测试**；文档 freshness 和快照不一致均由 hooks 拦下并修正后重新提交，未绕过检查。08b/c、09 尚待验收。

08b 以 `70b7eba`、`30d80ff` 关闭 C03。Combobox/Autocomplete 改用已有 Radix Portal 与定位能力，保持触发器等宽、视口碰撞处理、可用高度约束和活动选项内部滚动；不改变公开参数及输入 DOM。补充修正受控 Root 的关闭同步，使保持输入焦点的外部点击也能关闭列表；指针激活只响应位置变化，避免程序滚动触发 hover，把键盘活动项从末项改回中间项。IME Escape 保持合成态。

主 agent 使用最终真实安装包通过卡片/Dialog/滚动容器及 resize/选择矩阵 **8/8**、视口边缘/末项/两级 Escape **6/6**、外部点击关闭 **2/2**、静止鼠标下的末项键盘确认 **2/2**。后两组修复前均为 **0/2**；末项修复后保持 `Option 39`、滚动量 **645px** 和输入焦点，并由 Enter 提交正确值。原始公开 props/ref/键名契约 **3/3** 通过，**230 份 JS/CSS/声明**与最终产物一致，**111 份源码**与 source map 对齐，原始公开基线不变。证据：`p3-input-matrix-typeahead-08b-pointer-matrix.json`、`p3-typeahead-edge-typeahead-08b-pointer-edge.json`、`p3-typeahead-dismiss-typeahead-dismiss-pointer-final.json`、`p3-typeahead-hover-typeahead-hover-final.json`、`p3-08b-public-props-final.log`、`p3-08b-final-artifact-source-binding.json`。

正式 A/B 两条消费门通过，40 项列表明确验证真实滚动、末项可见、静止鼠标、选项中心命中、实际选择和保留焦点的外部点击。独立给实际消费页面禁用选项的 `scrollIntoView` 后，正式 CLI 在末项可见条件非零失败；临时工程、浏览器 profile、进程和端口均清理完毕。证据：`p3-08b-formal-evidence.json`、`p3-08b-formal-scroll-negative.json`。两笔实现均经过正常 hooks，**177 文件、1,513 测试**，提交证据见 `p3-08b-portal-commit-evidence.json`、`p3-08b-dismiss-pointer-commit-evidence.json`。08c、09 继续按原子组调度。

08c 提交 `24421f0` 关闭 C04。内部提交函数分别决定值更新和焦点归还；blur 路径连同精确匹配已有 label/value 的路径都保留新的焦点目标，pointer 选择与 Enter 确认保留原行为，清理无效私有导航状态。源码 API、INTEGRATION 及包内兼容资料同步更新，DatePicker 的剩余限制仍明确保留。

最终实际安装包的原 Tab/Shift+Tab **2/2**、扩展边界 **11/11**（其中 blur **5/5**）、静止鼠标和外部关闭各 **2/2** 均通过；原始三项公开类型契约 **3/3**。**230 份产物**、**111 份源码**与提交一致。正式 A/B 新增真实受控输入的提交次数、值和焦点断言；几何 Dialog 通过 `onOpenChange` 关闭请求计数，验证首个 Escape 未向外层请求关闭。正常 hooks 通过 **177 文件、1,514 测试**，文档摘要快照在被拦下后同步并重新提交。证据：`p3-typeahead-edge-typeahead-08c-edge.json`、`p3-input-matrix-typeahead-08c-blur.json`、`p3-typeahead-hover-typeahead-08c-hover.json`、`p3-typeahead-dismiss-typeahead-08c-dismiss.json`、`p3-08c-final-artifact-source-binding.json`、`p3-08c-validation-evidence.json`、`p3-08c-commit-evidence.json`。P3 剩余 09 与阶段末综合验收。

**09 · DatePicker 原生表单与 ref**

`f559290` 合并外部 ref 与内部 input ref，保留原生 INPUT 目标，支持 object、普通 callback 与 React 19 cleanup 的替换/卸载。原生 `form` 归属在 `form=` 改变后重绑；readOnly 保留浏览器校验语义；空 required 将错误、关联说明与焦点放在可见 trigger，尊重调用方取消的 onInvalid。reset 在事件传播完成后检查取消状态，清理待执行任务，受控值由调用方持有。Booleanish `aria-invalid` 的两种 false 均不触发错误样式。

最终实际安装包 **20/20** 通过：核心 **5/5**、边界 **8/8**、动态 owner **2/2**、validity **3/3**、普通 ref **2/2**；原始 DatePicker props/ref/key/文档类型兼容。**230 份产物、111 份源码**与提交一致，13 个已审文件的提交哈希全部匹配。正式 A/B、实际 consumer:docs、包门通过；本阶段 Next 与根 build 的既有成功结果已留证。正常 hooks 为 **177 文件、1,517 测试**。证据：`p3-09-verified-browser-batch.json`、`p3-09-final-artifact-source-binding.json`、`p3-09-validation-evidence.json`、`p3-09-commit-evidence.json`。

P3 尚未整体验收。追加的调用方重渲染场景发现：onReset 更新父组件状态、重新创建 defaultRangeValue 对象时，range 的已接受重置会被 effect 清理取消；六个表单控件对照 **5/6**。这条同属 C20，随 09b 修正，不能把上述 20 项通过表述为所有 reset 边界已关闭。全量覆盖率另两次被同一真实 registry 生成用例的 5 秒预算拦下；单文件 coverage 仍耗时 5.66 秒。09q 仅调整该用例预算，保留全部断言与四维 95% 阈值，09b/c 后再做完整阶段检查。

**09q · 生成器集成测试执行预算**

`aa0dcd4` 只将真实版本同步用例的超时设为 15 秒，并记录实测 5.6–6.7 秒的依据。全部断言、隔离目录与 finally 清理保持原样，全局配置和四维覆盖率阈值未改。正常 hooks **177 文件、1,517 测试**通过；完整 coverage 仍待 09b/c 完成后验证。证据：`p3-09q-commit-evidence.json`。

**09b · 取消重置、受控值与父组件重新渲染**

`4965565` 关闭 C20。TypeaheadField、DatePicker 与两个 Group 的 reset 监听保存最新配置，等待事件传播完成后检查取消状态，避免普通父组件渲染清掉已接受的重置；实际 owner 切换和卸载仍清理计时器。两个 Group 在 reset capture 阶段协调 Radix Item 的同步回调，受控值、可见状态与 FormData 一致，取消重置不再额外触发 onValueChange。

最终真实安装包 **38/38** 通过：Typeahead **4**、Group 普通/取消 **4**、受控 **4**、父组件重渲染 **6**、DatePicker 既有边界 **20**。原始 **8 项**公开 props/ref/key 契约保持兼容。正式 A/B 包含真实选择后重置、回调计数、父组件渲染及日期范围正常/取消重置。**230 份产物、111 份源码、13 个已审文件**均与提交一致；正常 hooks **177 文件、1,520 测试**通过。证据：`p3-09b-final-browser-batch.json`、`p3-09b-public-props.log`、`p3-09b-final-validation-evidence.json`、`p3-09b-final-artifact-source-binding.json`、`p3-09b-commit-evidence.json`。P3 继续 09c 与阶段末覆盖率验收。

**09c · Group 的 React 19 ref 清理**

`b85649d` 关闭 C21。Checkbox.Group 与 Switch.Group 保留调用方返回的 cleanup，替换/卸载时先清内部 ref，再执行 cleanup；普通 callback 仍收到 null，object ref 清空。公开 FIELDSET 目标、组件签名及 09b 的 reset 实现保持不变。

最终真实安装包 **16/16** 通过：object/普通 callback/cleanup 的替换卸载 **6**、换 ref 后的正常/取消 reset **2**、既有普通/取消 reset **4**、受控 reset **4**。正式 A/B 使用两种 Group 的独立表单，验证同一 DOM、父组件渲染、UI/FormData/回调次数和真正卸载。原始 **120 项**公开参数/ref/key/文档类型检查通过；**230 份产物、111 份源码、9 个已审文件**与提交匹配。正常 hooks **177 文件、1,522 测试**通过。证据：`p3-09c-final-browser-batch.json`、`p3-phase-final-120.json`、`p3-09c-validation-evidence.json`、`p3-09c-final-artifact-source-binding.json`、`p3-09c-commit-evidence.json`。

完整阶段 coverage 的 **1,522 项测试全部通过**，但四项结果为 **96.8% / 94.44% / 97.52% / 96.91%**，分支低于 95%。因此 P3 尚未整体验收；追加独立测试组 **09d**，补 DatePicker/原生表单/输入行为的有效 L1 回归，保持实现、阈值与覆盖范围不变。证据：`p3-phase-coverage-before-regressions.log`。不把筛选测试的局部报告计为完整阶段结果。

**09d 与 P3 收尾。** `026a958` 仅补四个测试文件：DatePicker 的 object/callback ref、Booleanish 错误状态、受控单值/范围的正常与取消 reset、真实 FormData；DatePicker 与两个 Group 的动态 form 归属及旧 reset 任务清理；Autocomplete 的受控草稿 reset、IME、blur 和静止 pointer。范围快捷选择补充调用方不接受更新、禁用日期、结束日期越界，以及反向选择后有序提交。主 agent 审查测试实际交互与回调断言，未修改生产实现或质量配置。

中间完整报告分支为 **94.85%**。主 agent 用独立局部 JSON 定位到四个未命中的日期分支；定向补测后确认四个分支从零命中变为实际执行，再运行完整 `bun run test:coverage`。最终 **177 个文件、1,544 项测试全部通过**，statements / branches / functions / lines 为 **97.36% / 95.12% / 97.81% / 97.49%**，分支分母仍为 **2,214**。正常提交 hooks 同样通过，提交与四个已审测试文件一致；两处 FormData 格式化经原文还原校验，仅有换行变化。证据：`p3-09d-new-branches.json`、`p3-09d-full-coverage-final.json`、`p3-09d-commit-evidence.json`。

P3 的 **120 项旧公开 props/ref/key/文档类型契约**保持兼容；最终运行时的包 build/types/pack/publint、正式 A/B、主 agent 独立生产 build、consumer:next 与 consumer:docs 均已通过。最终真实包的 **230 份产物 / 111 份源码**与已验收实现绑定，09d 未改变这些内容；完整旧基线保持 `ef2bd65` 原文，版本仍为 **2.0.3**。P3 已整体验收，下一阶段为 P4。证据：`p3-phase-final-120.json`、`p3-phase-final-gates.json`、`p3-runtime-final-artifact-source-binding.json`。

#### P4 验收记录（已验收，2026-09-06–07）

**10a / C06。** `bdbede8` 将 Dock 区域 overlay 改为具名 region，移除错误的全局模态声明与 Tab 限制。原 push/overlay 宽度、遮罩、打开焦点、关闭 inert、Escape 和焦点归还保留；API 与 Library 说明同步。本组没有新增全局模态模式。

主 agent 对真实安装包检查 **6/6 通过**：背景点击与非模态焦点、Tab/Shift+Tab 跨面板、390px 遮罩尺寸、关闭 inert/焦点、嵌套 Popover/Dialog 的两次 Escape、push 尺寸。初次移动端 probe 的默认点击落在被面板覆盖的遮罩中心，改为实际露出的遮罩区域后通过，未修改组件或降低断言。旧 Dock/DockBody 公开契约 **2/2** 保持；**230 份产物、111 份源码、18 个已审文件**与提交一致。

正式 A/B 增加独立 Dock 页面与键盘/焦点回归，两条命令及包 build/types/pack/publint 均通过；原 geometry 检查保留。正常 hooks 为 **177 文件、1,544 测试**；文档摘要快照被 hooks 拦下后仅同步预期摘要，再正常提交。C06 已关闭，P4 其余组继续。证据：`p4-state-p4-10a-root-2.json`、`p4-dock-edge-p4-10a-fixed-probe.json`、`p4-10a-validation-evidence.json`、`p4-10a-final-artifact-source-binding.json`、`p4-10a-commit-evidence.json`、`p4-10a-acceptance.json`。

**10b / C07。** `42060a5` 在独立 ConfirmDialog 打开时记录 opener，并在 Radix 实际关闭回调中归还仍连接的焦点；保留显式 trigger 行为及 useConfirm 的替换、卸载 Promise 结算。DeleteResource 失败后保留弹窗，显示可访问的错误并恢复重试；新增可选 ReactNode / formatter 文案，公开契约保持兼容。

主 agent 对最终真实安装包复验 **5/5**：确认和取消回焦、替换请求分别结算、卸载结算、删除失败后重试成功；**2 项旧公开契约**通过，**230 份产物 / 111 份源码 / 27 个提交文件**绑定一致。包门、正式 A/B 与 docs consumer 通过，正常 hooks 为 **177 文件、1,546 测试**。证据：`p4-10b-final-browser-batch.json`、`p4-10b-final-public-props.log`、`p4-10b-final-artifact-source-binding.json`、`p4-10b-validation-evidence.json`、`p4-10b-core-commit-evidence.json`、`p4-10b-core-acceptance.json`。

补充提交 `182b9a2` 将独立取消的结算/回焦纳入正式 A/B，并提供可反复操作的删除失败、重试成功、重置 Library 示例；正文明确异步错误责任和可定制文案。主 agent 在 **1280px / 390px 两项真实页面检查**中验证完整闭环并查看截图，5 个补充文件与已审哈希一致；A/B 和 docs consumer 再次通过，正常 hooks 为 **177 文件、1,546 测试**。运行时未变，最终产物与源码绑定仍全部一致。C07 已关闭。证据：`p4-10b-library.json`、`p4-10b-supplement-validation-evidence.json`、`p4-10b-supplement-commit-evidence.json`、`p4-10b-accepted-artifact-source-binding.json`、`p4-10b-acceptance.json`。

**10c / C16。** `f11d74f` 为 9 个既有内置 Portal 透传 Content 的 forceMount，保留裸 ContextMenuContent 的直接挂载方式，普通开关、ref 和定位逻辑不变。文档说明外部动画的显隐与显式卸载责任，并区分有模态行为的浮层与 HoverCard、Tooltip、MenuBar。

主 agent 对真实安装包通过 **40/40 挂载与卸载对照、9/9 同页相邻 Dialog 焦点/背景恢复检查**；**10 项旧公开契约**保持兼容。最终 **117 份 JS/CSS、111 份源码**绑定一致；113 份声明中 112 份逐字节不变，MenuBar 仅删除一条不适用的 JSDoc，精确去掉该行后完全相同。机器注册表的 45 处变化仅为说明和源码哈希。正式 A/B 各包含 40 项 Portal 检查，使用明确的组件类型与逐次点击增量；包门与 docs consumer 通过，正常 hooks 为 **177 文件、1,546 测试**，32 个已审文件与提交一致。C16 已关闭。证据：`p4-10c-root-browser-batch.json`、`p4-10c-public-props.log`、`p4-10c-final-artifact-source-binding.json`、`p4-10c-declaration-doc-only.json`、`p4-10c-registry-review.json`、`p4-10c-validation-evidence.json`、`p4-10c-commit-evidence.json`、`p4-10c-acceptance.json`。

**10d / C17。** `bad6c25` 使用已有 Slottable 组合 PopoverContent 的调用方元素与箭头，保留默认 DOM、既有 Portal 和参数。真实安装包通过 **25/25** Content 组合检查（保留原 24 项，新增普通 Popover 隐藏箭头对照），asChild 的元素身份、ref、箭头数量与 child→content 点击顺序均正确；旧 PopoverContent 公开契约通过。

正式 A/B 的 Portal 回归扩展为各 **48 项**，包含两种 asChild 的正常开关、forceMount 和卸载；事件记录逐例重置，既有断言保留。包门、docs consumer 通过，正常 hooks 为 **177 文件、1,547 测试**；**230 份产物 / 111 份源码 / 9 个已审文件**与提交一致。C17 已关闭。证据：`p4-10d-root-browser-batch.json`、`p4-10d-public-props.log`、`p4-10d-final-artifact-source-binding.json`、`p4-10d-validation-evidence.json`、`p4-10d-commit-evidence.json`、`p4-10d-acceptance.json`。

**10e / C18。** `ab2cd97` 仅将明确 icon=false 的内部值转换为 Sonner 的隐藏语义 null，保留省略、null、自定义图标以及其他选项的现有处理；同步源码、机器 API 和 Library 说明。主 agent 的真实安装包 **18/18** 对照及 Library “No icon” **1/1** 通过，图标消失且关闭按钮保留，已查看入场动画完成后的截图。

**113 份公开声明**经 TypeScript AST 规范化后与 10d 完全一致；**230 份产物 / 111 份源码 / 19 个已审文件**与提交绑定。正式 A/B 各包含 18 项 Toast 检查，包门与 docs consumer 通过，正常 hooks 为 **177 文件、1,547 测试**。C18 已关闭。证据：`p4-10e-root-browser-batch.json`、`p4-toast-library.json`、`p4-10e-public-declarations.json`、`p4-10e-final-artifact-source-binding.json`、`p4-10e-validation-evidence.json`、`p4-10e-commit-evidence.json`、`p4-10e-acceptance.json`。

**11a / C08。** `abdafd4` 按受控数组或首次默认值渲染各端点，修正水平/纵向轨道与填充；新增可选 `labels`，单值的 aria-label/aria-labelledby 落到交互 Thumb，多值保留上下文或 Radix 默认名称。非受控默认数组变化不改写已初始化的 Thumb 数量，既有 Root ref、RTL、step/min/max、端点最小间距继续有效。

主 agent 的实际安装包 **14/14** 通过，包含原双轴几何与 12 项名称、受控数组变化、表单提交/reset、禁用和键盘边界。真实 Library 桌面/390px **2/2**：纵向轨道均为 **192×8px**，ArrowUp 从 50 增至 51，已查看截图；新增 Range、Vertical 场景与具名 Usage 可复制。旧 Slider props/ref 契约通过，仅增加 `labels`；最终补充说明后 **113 份声明的类型 AST 相同**，117 份运行时代码/CSS、111 份源码与 21 个已审提交文件匹配。正式 A/B、包门和最终 docs consumer 通过，正常 hooks 为 **177 文件、1,555 测试**。C08 已关闭。证据：`p4-11a-root-browser-batch.json`、`p4-11a-library.json`、`p4-11a-public-props.log`、`p4-11a-final-doc-only-declarations.json`、`p4-11a-final-artifact-source-binding.json`、`p4-11a-commit-evidence.json`、`p4-11a-acceptance.json`。

**11b / C10 日历核心。** `52e7e01` 补齐 table/grid、隐式 row/columnheader 与 gridcell 关系、月份 live region、单一 roving 焦点，以及 Home/End、PageUp/PageDown 和 Shift 跳年；月末落在有效日期。范围模式以 aria-selected 表达完整区间和未完成起点，端点与区间内部保留不同视觉。新增可选 `labels` 和公开 `DatePickerLabels`，中文 Library 场景、键盘说明及可编译语言配置模块同步交付。原 ISO 日期、原生 input ref 和表单契约保持兼容。

最终实际安装包 **26/26** 通过：日历核心 10、范围/语言/边界 8、原生表单/ref/reset/readOnly 回归 8；真实 Library 桌面/390px **2/2**，PageDown 聚焦 `2026-10-09` 并播报十月，弹层均为 **256×290px** 且在视口内，相关 ARIA 检查通过。**230 份产物 / 111 份源码 / 30 个已审提交文件**全部对应。正式 A/B 及包门通过，docs consumer 编译 **28 个文档模块、99 个 Usage、249 个场景**。正常 hooks 为 **177 文件、1,560 测试**，typecheck/lint/gitleaks 均通过。

审查撤回了为日历全局关闭的三条 Biome 规则，只保留 DatePicker 路径内两项 APG grid/roving 模型的例外及原因说明；冗余 row/columnheader 属性改用原生语义。提交 hook 检出的三个旧数量/场景断言按新增类型和中文场景同步后通过。证据：`p4-11b-final-browser-batch.json`、`p4-11b-library.json`、`p4-11b-public-props.log`、`p4-11b-final-artifact-source-binding.json`、`p4-11b-final-validation-evidence.json`、`p4-11b-commit-tree.json`、`p4-11b-commit-evidence.json`、`p4-11b-acceptance.json`。11b 提交时 C10 尚未关闭，受控月份、本地化验证与键盘说明配置由后续 11b2 完成。

**11b2 / C10 受控月份与完整语言接口。** `fa22f1f` 增加可选 `month/defaultMonth/onMonthChange`，月份视图与选中日期独立；`defaultMonth` 只在首次初始化使用。导航回调仅由用户操作触发，父级拒绝、重渲染或延迟接纳月份时保留正确日期焦点。`labels.validationMessage` 与 `labels.keyboardInstructions` 补齐中文原生验证反馈和关联弹层的键盘说明。保留原有正年份范围，包括 `10000` 年，不新增不兼容的上界。

主 agent 的最终真实安装包 **45/45** 通过：月份控制 14、语言与表单 5、既有日历 10、范围/边界 8、原生表单/ref/reset/readOnly 8。独立验收先发现两种空日期翻月后焦点回到月初的问题；修正自动同步条件后通过，正式 A/B 也加入对应回归。Library 桌面/390px **2/2**，弹层均为 **256×290px**，中文错误、实际预约提交及 reset 均通过，已查看截图。示例控制月份，日期值由原生 FormData 获取。

旧 DatePicker props/ref 契约兼容，**230 份产物 / 111 份源码 / 12 个已审提交文件**一致。包门、正式 A/B、最终文档消费通过；文档仍为 **28 个可编译模块、99 个 Usage、249 个场景**。正常 hooks 为 **177 文件、1,565 测试**。指南明确初始 fallback 和 `defaultMonth` 语义，AI 镜像与 API 数据同步。**C10 已由 11b 与 11b2 共同关闭。** 证据：`p4-11b2-fixed-browser-batch.json`、`p4-11b2-library.json`、`p4-11b2-public-props.log`、`p4-11b2-final-artifact-source-binding.json`、`p4-11b2-final-validation-evidence.json`、`p4-11b2-commit-tree.json`、`p4-11b2-commit-evidence.json`、`p4-11b2-acceptance.json`。

**12a / C09 Empty 子内容与操作。** `95a358e` 修正 `Empty` 与 `LayerCard.Empty` 丢弃 children 的问题，新增可选 `action`；结构化图标、标题、说明之后呈现自定义内容及操作，两种 slot 都保留数字 `0`。旧 props/ref、空标题与原生属性行为兼容。Library 新增首次创建、清除无结果搜索、失败→重试→加载→成功的本地组合；LayerCard 原有示例也有实际创建反馈，保留全部旧场景 ID。

独立实际安装包 **4/4**，旧公开类型契约 **2/2**；真实 Library 桌面/390px、浅/深主题 **4/4**。手机展示区宽 **252px**，无内部横向溢出，已查看完整浅深主题截图。正式 A/B 增加两种 Empty 的 children/action 键盘激活与属性检查；原始数字值检查要求两个 `0` 都保留，避免以包在元素中的文字或宽松 OR 条件掩盖缺陷。

**230 份产物 / 111 份源码 / 27 个已审提交文件**对应一致。包门、正式 A/B、文档消费通过，后者编译 **30 份文档模块（含 AI 镜像）、99 个 Usage、250 个场景**。正常 hooks 为 **177 文件、1,567 测试**；首次 hook 检出的旧场景总数断言从 249 同步到 250，保留其余验证后重试通过。**C09 已关闭。** 证据：`p4-12a-root-browser-batch.json`、`p4-12a-library.json`、`p4-12a-public-props.log`、`p4-12a-final-artifact-source-binding.json`、`p4-12a-final-validation-evidence.json`、`p4-12a-commit-tree.json`、`p4-12a-commit-evidence.json`、`p4-12a-acceptance.json`。

**12b / C11 Theme 与 Accent 的存储和宿主边界。** `16143b6` 为两个 Provider 增加可选 storageKey、默认值、persist、受控值/onChange 和 applyToDocument。默认键名及公开用法保持兼容；Storage getter/getItem/setItem 拒绝时保留内存选择，区分读取失败与实际缺值。受控变化由父级接纳，非持久化实例不参与同页同步；保留真实跨页 localStorage 更新，隔离 sessionStorage。SSR 使用稳定 server snapshot，宿主可禁用 root 写入。

主 agent 的最终实际安装包 **18/18** 通过，覆盖拒绝访问、写入失败后的旧值与裸事件、同页/跨页同步、关闭持久化、key/default/persist 切换、父级拒绝/接纳、卸载清理及真实 Node SSR hydration。首次独立 harness 的重新挂载完成信号有误，修正后保留全部行为断言并重新生成 SSR 记录，host 子组 **6/6**。Library 新增独立偏好、宿主控制两个组合；桌面/390px × 浅深主题 **4/4**，键盘操作不改变宿主 root、CSS 和 storage，两份实例互不影响，已查看截图。该手机结果仅验证展示区，不提前关闭 P7 的文档页布局问题。

旧 Provider props/ref/key/文档类型契约 **2/2** 兼容，**230 份产物 / 111 份源码 / 30 个已审提交文件**一致。包门与正式 A/B 通过；正常 hooks 为 **177 文件、1,589 测试**。新增 recipe 与 AI 镜像的完整编译留给 P4 阶段 consumer:docs，尚不计为已通过。当前公开面 **110 模块 / 687 符号（375 value、312 type）/ 3 CSS**，保留 **99 个 Usage、252 个场景**及原始 API 基线，版本仍为 **2.0.3**。**C11 已关闭。** 证据：`p4-12b-final-browser-batch.json`、`p4-12b-root-ssr.json`、`p4-12b-library.json`、`p4-12b-public-props.log`、`p4-12b-final-artifact-source-binding.json`、`p4-12b-final-validation-evidence.json`、`p4-12b-commit-tree.json`、`p4-12b-commit-evidence.json`、`p4-12b-acceptance.json`。

**P4 阶段覆盖率复核（待补回归）。** 12b 后完整 **177 文件、1,589 测试**均通过，但四维为 **94.21% / 91.77% / 97.81% / 94.27%**，语句、分支和行未达到 95%。原始 lcov 与失败日志已保留；主要缺口是 Provider 配置切换和日历新增导航边界。按独立测试提交补充对外行为回归，其后继续 build、Next 与文档消费；不降低阈值或缩小分母。证据：`p4-phase-coverage-before-regressions.json`、`p4-phase-coverage-before-regressions.lcov`。

**12c / Provider 行为回归。** `535d2e0` 仅修改两份 Provider 测试，补充 **22 项**配置、持久化与监听生命周期回归，两个文件共 **51 项**通过。覆盖 key/default/persist 真实重渲染、读取拒绝、存储删除/清空/非法值、重新启用后的失败恢复、受控回调次数、宿主写入切换和卸载；sessionStorage 使用实际实例，卸载验证同一监听器引用。复审修正了未实际变化的 default 参数和未验证后续事件的清理断言。正常 hooks **177 文件、1,611 测试**通过；**230 份产物 / 111 份源码**均未变，复用 12b 的实际包验收。完整覆盖率待日历回归后统一复核。证据：`p4-12c-validation-evidence.json`、`p4-12c-commit-tree.json`、`p4-12c-commit-evidence.json`、`p4-12c-runtime-artifact-source-binding.json`、`p4-12c-acceptance.json`。

**11b3 / 日历键盘回归与原生日期上限。** `9b75ac2` 以公历数值计算目标月天数，在原生日期范围外拒绝月份跳转，保留最后合法月份内的日期。新增 Home/End、PageUp/PageDown、年一边界、受控月份延迟接纳、禁用日期和上限正反例，日期单测共 **95 项**。正式 A/B 同时校验真实 Shift 组合键、焦点、月份、回调次数、FormData 和 Escape 回焦；新增检查保留全部旧场景。

最终新安装包 **55/55** 通过，其中原日历/表单组合 **45 项**、新边界组合 **10 项**；旧 DatePicker props/ref/key/文档类型兼容，前组已授权的四个可选参数保留。**230 份产物 / 111 份源码 / 7 个已审提交文件**一致。包 build/types/pack/publint、正式 A/B 均通过；正常提交首轮遇到 Q07 的格式化子进程超时，未改文件重试后 hooks **177 文件、1,620 测试**通过。**C22 已关闭，Q07 仍观察中。** 证据：`p4-11b3-root-browser-batch.json`、`p4-11b3-public-props.log`、`p4-11b3-final-artifact-source-binding.json`、`p4-11b3-final-validation-evidence.json`、`p4-11b3-commit-tree.json`、`p4-11b3-commit-evidence.json`、`p4-11b3-acceptance.json`。

**P4 第二轮完整覆盖率（12d 补强中）。** 11b3 后的首轮检查再次遇到 Q07；第二轮 **177 文件、1,620 测试全部通过**，四维为 **97.11% / 94.83% / 98.22% / 97.18%**。分支仍低于 95%，原始日志与 lcov 已保存。独立 12d 仅补 Provider 在 Storage/matchMedia 缺失、无关同页事件及非法 accent 下的对外行为回归，不改实现和质量门；通过后继续完整阶段验收。证据：`p4-stage-coverage-attempt-1.log`、`p4-stage-coverage-attempt-2.json`、`p4-stage-coverage-attempt-2.lcov`。

**12d / Provider 缺失 API 与事件隔离回归。** `c35fd84` 仅修改两份测试，新增 **6 项**，Provider 共 **57 项**通过。覆盖不存在的 localStorage、缺失 matchMedia、空 detail/其他 key 的同页事件及无效 accent；检查真实可见值、文档状态、存储和回调，临时环境在 finally 完整恢复；受控非法值以有效 teal 作前置对照。主 agent 的新真实包组合 **5/5**，**230 份产物 / 111 份源码**保持不变。正常 hooks **177 文件、1,626 测试**通过；待 Q07 独立修复后重新完整验收。证据：`p4-provider-missing-p4-12d-root.json`、`p4-12d-runtime-artifact-source-binding.json`、`p4-12d-validation-evidence.json`、`p4-12d-commit-tree.json`、`p4-12d-commit-evidence.json`、`p4-12d-acceptance.json`。

**Q07 / 固定本地 formatter 调用。** `781aadf` 通过当前脚本的依赖解析定位 Biome 2.5.12 CLI，以当前 Node/Bun 可执行程序直接运行，保留 **10 秒**预算、缓冲区和非零退出失败；未加入重试。原有 14 项 registry 回归完整保留，新增确定性格式化、非法 JSON 与故障 PATH 两项测试，共 **16 项**通过。root 的普通/故障 PATH 对照确认有效输入均成功、非法输入均拒绝；registry/sources/指南及原 API 基线保持原文，**230 份产物 / 111 份源码**未变。正常 hooks **177 文件、1,628 测试**通过，完整阶段检查继续。修正移除了额外执行器查找依赖，未声称已证实最初偶发超时机制。证据：`p4-q07-path-before.json`、`p4-q07-path-after.json`、`p4-q07-assets-unchanged.json`、`p4-q07-runtime-artifact-source-binding.json`、`p4-q07-validation-evidence.json`、`p4-q07-commit-tree.json`、`p4-q07-commit-evidence.json`、`p4-q07-acceptance.json`。

**P4 阶段最终验收。** 在 `781aadf` 上完整 **177 文件、1,628 测试**通过，覆盖率为语句 **97.45%**、分支 **95.26%**、函数 **98.22%**、行 **97.53%**，保持原分母和四维 95% 阈值。本轮未复现 formatter 超时。展示站生产构建、Next 门的 **21 项浏览器门测试**及真实水合/主题切换、正式文档消费均通过；文档门编译 **32 个文档模块、99 个 Usage、252 个场景**，核对 **99 个细粒度入口、34 个 root 名称**。

最终运行时是 11b3 的新包，包 build/types/pack/publint 与正式 A/B 已通过；12d/Q07 未改组件运行时或声明，保留 **230 份产物 / 111 份源码**绑定。**113 份声明产物**与已验收的 120 项旧接口检查完全一致，DatePicker 和 Provider 的专项旧契约另有验证。原始 `public-api-baseline.json` 仍为 `ef2bd65` 原文，版本保持 **2.0.3**。P4 已整体验收，下一阶段为 P5；后续不沿用本阶段数值冒充新实现的覆盖率。证据：`p4-stage-coverage-final.json`、`p4-stage-coverage-final.lcov`、`p4-stage-final-validation-evidence.json`、`p4-phase-final-types-binding.json`、`p4-q07-runtime-artifact-source-binding.json`、`p4-phase-acceptance.json`。

#### P5 验收记录（已验收，2026-09-07）

本阶段从 `90a4ebe` 开始。以下各组分别独立验收并正常提交；完整覆盖率与全部消费者在矩阵组完成后统一收口，不以单组 hooks 代替阶段验收。

**13a / 主题文字与强调色对比度。** `764a822` 共 **21 个已审文件**。实际安装包在双主题、24 accent、语义表面和 hover/focus 组合下 **7,032/7,032** 通过；正式 standalone/Tailwind A/B 各验证 **704 个文字配对、16 个焦点配对**。24 个 swatch 与 84 个图表 token 未变，3 个旧公开函数契约保持。Library 首次桌面 **6/6**，移动端发现 E08，另组修正；不能把首次运行记成全尺寸通过。

包与源码 **230/111** 绑定一致，正常 hooks **177 文件、1,629 测试**通过。**C12 已关闭。** 证据：`p5-13a-fixed-browser-batch.json`、`p5-13a-final-artifact-source-binding.json`、`p5-13a-final-validation-evidence.json`、`p5-13a-root-commit-final.json`。

**13d / 移动导航关闭回焦。** `2f7b20d` 只改 DashboardLayout 和相关测试两文件，关闭 Sheet 后回到仍存在的触发器并清理滚动锁。实际移动组合 **10/10**、Library 双主题双尺寸 **12/12**、相关 L1 **8 项**通过；正常 hooks **177 文件、1,632 测试**。包源码未变，沿用上组已验收的 **230 份产物 / 111 份源码**。**E08 已关闭。** 首版脚本误寻不存在的 Close 控件，改用真实 Collapse sidebar；原始结果保留。证据：`p5-13d-acceptance.json`、`p5-13d-mobile-final.json`、`p5-13d-library-final.json`。

**13b1 / 图表可访问替代。** `b84cc22` 共 **61 文件**，为图表框架和公开包装补摘要、数据替代、键盘读数等能力；48 个新 API 参数进入 16 页。真实安装包 **32/32**、Library **8/8**、旧契约 **18/18**；公开面为 **110 modules / 689 symbols（375 value、314 type）**，230 产物和 111 源码一致。正式 heavy/docs 通过，文档门 **99 Usage / 254 场景**，正常 hooks **178 文件、1,637 测试**。此时 C13 仍待日历部分，不提前关闭。证据：`p5-13b1-acceptance.json`。

**13b2 / 热力日历键盘读数。** `e6af539` 共 **17 文件**，补日期/数值名称、单一 Tab 入口、方向键、读数和移动横滚。实际包 **32/32**、Library **8/8**、旧契约 **1/1**；正式文档门 **99 Usage / 256 场景**，正常 hooks **178 文件、1,639 测试**。独立验收发现祖先滚动后焦点 tooltip 消失，已在提交前修正。焦点对比度首次采样早于有限 CSS 过渡结束，等待真实过渡后通过，保留原阈值。**C13 已关闭。** 证据：`p5-13b2-acceptance.json`。

**13b3 / 指标卡状态与说明组合。** `8d6b51f` 共 **16 文件**，StatCard 增加可选 action/status/trendContent/children，正确保留数值 0，保持既有默认布局。实际包 **24/24**、Library **8/8**、旧契约 **2/2**；验证异步重试、焦点和手机标题几何稳定。文档门 **99 Usage / 258 场景**，正常 hooks **178 文件、1,640 测试**。R05 的其他组合需求继续由 P6 承接。证据：`p5-13b3-acceptance.json`。

**13c / 减弱动效。** `32a7247` 共 **15 文件**，修正 Button loading 与 ChatBubble caret。实际包 **16/16**、Tailwind **8/8**、Library/Examples **16/16**；113 份声明和 CSS 原文不变，运行 JS 仅 Button/ChatBubble 改变。Gauge 在实际 Recharts **3.10.1** 的旧包验证 **8/8**，无需改源码；该证据不外推到所有兼容版本。

首次正常 hooks 因三份精确 scenario 清单漏同步而失败，修正后 **47 项**针对性回归通过；最终 hooks **178 文件、1,640 测试**及 gitleaks 通过，文档门 **99 Usage / 260 场景**。provider 错误妨碍提交调用后，由现有 pi pane 原生 shell 执行已审、锁定文件的 helper，仍经过正常 hooks。tarball SHA-256 为 `212d2170260e88c06b2d5d6cf64f703fcafb31c9afc01da5e99a201dc66986da`。**E07 已关闭。** 证据：`p5-13c-acceptance.json`、`p5-13c-approved-pi-commit.json`、`p5-13c-approved-commit-tree.json`。

**17a / 动态系列。** `4ebc863` 共 **47 个已审文件**，真实安装包类型 **20 正向 + 60 负向 + 32 旧契约 = 112 项**全部通过；十种图表的任意系列、空数据与尺寸 **56/56**，八种完整图表的 formatter/domain/tooltip/legend 与真实 stack 几何 **48/48**。保留旧 XYPoint 必填 y、各图表默认 y 系列及 Sparkline **112×40**、SlotBar **24px**；Sparkline/SlotBar 只扩展数据和 series。四个新公开类型使公共面达到 **110 modules / 693 symbols（375 value、318 type）**，轻量 root 仍不引入 Recharts。

Area 场景改用通用服务名称后，两个 Library 场景双主题双尺寸再次 **8/8**，系列筛选、配色、键盘读数、百分比合计、null 窗口、容器 resize 与无横溢出通过，已查看手机深色截图。指南明确任意命名字段须显式 series，省略或空 series 仍用各图表旧 y/y2/y3 fallback。两次早期独立探针分别因 Recharts 轴标签位置与 SVG tspan 分词修正，精确数值断言保持不变，原结果保留。

正式 heavy 的 **4/4** 组合真实验证曲线 **5→4→5**、图例 Space/Enter、tooltip **11:00 / 48ms → 12:00 / 52ms**、formatter/domain 实际刻度，以及不等总量的 absolute→expand→absolute 几何；未采用仅数按钮、只查 SVG 存在或只比 tooltip 标题的弱断言。正式文档门 **32 个文档模块 / 99 Usage / 262 场景**通过；137 项相关 L1、typecheck/lint 与正常 hooks **178 文件、1,641 测试**、gitleaks 通过，47 个提交文件哈希一致。

前序安装包的 **230 份产物 / 111 份源码**与最终运行时和声明全部一致，复用已通过的包 types/pack/publint；最终指南由新 tarball 的正式 docs gate 验证。安装包使用 Recharts **3.10.1**，SHA-256 为 `c16733fe5f8f6c41bc0202a7a267a5a4acfd49312a8b485188a78851032a734c`。**C15 已关闭；R04 的 tooltip 组合与热力矩阵继续两个独立原子组。** D07 泛型/readonly/递归打印器问题留 P10。

pi 曾提前运行完整 coverage，结果为 **178 文件中 175 通过 / 3 失败、1,641 测试中 1,638 通过 / 3 失败**：两项 5 秒超时和一项场景污染文案，没有有效覆盖率结果。文案已修正，两项测试在原预算的针对性检查及最终 hooks 均通过；完整四维覆盖率仍待矩阵组末统一验证。证据：`p5-17a-acceptance.json`、`p5-17a-types.json`、`p5-17a-dynamic.json`、`p5-17a-options-corrected.json`、`p5-17a-library-final-labels.json`、`p5-17a-final-artifact-source-binding.json`、`p5-17a-final-consumers-validation-evidence.json`、`p5-17a-final-commit-validation-evidence.json`、`p5-17a-final-commit-tree.json`。

**17a-tooltip / 可组合 tooltip。** `7af79f7` 共 **14 个已审文件**，新增 ChartTooltipRow、ChartTooltipSummary、ChartTooltipDivider 及三种 Props；分别以 div/div/hr 为宿主，透传原生属性、事件和 React 19 ref，明确使用命名插槽并排除 children。数值、单位、分组与合计在 Line/Area 的两个现有动态场景中实际使用，原场景 ID 和标题保留。公共面为 **110 modules / 699 symbols（378 value、321 type）**。

新真实安装包的组合、零值、空值、原生属性、ref 清理和窄屏长标签 **4/4**；旧 tooltip 的可见文字、几何与计算样式对照 **4/4**；**4 项旧类型契约、3 个新组件用法、5 项负向类型检查**通过。Library 双主题双尺寸 **8/8**，实际显示 SLA 上限、百分比行及吞吐合计，tooltip 保持在视口内；已查看手机深色截图。早期一次独立 resize 探针遇到临时缺失 DOM，补等待空值防护后复核，保持原尺寸阈值与错误检查，原结果保留。

正式 heavy **4/4** 验证 5 行数据、精确 **48ms→52ms** 和 **390ms** 合计，并保留前组全部曲线/堆叠检查。文档门 **32 模块 / 99 Usage / 262 场景**及 build/types/pack/publint、typecheck/lint 通过；新增 **8 项**行为回归，最终 tooltip L1 **21/21**，正常 hooks **178 文件、1,649 测试**和 gitleaks 通过。**230 产物 / 111 源码**与实际安装包一致；相对前包仅 tooltip.js 与 tooltip.d.ts 改变，CSS 和轻量 root 未变。tarball SHA-256 为 `e8d1d60551c335587372aec1695c85a7b5c77f5bc61dcdf021df6b8ef92ed56c`。证据：`p5-tooltip-acceptance.json`、`p5-tooltip-types.json`、`p5-tooltip-parts.json`、`p5-tooltip-legacy-final.json`、`p5-tooltip-library-final.json`、`p5-tooltip-final-artifact-source-binding.json`、`p5-tooltip-commit-validation-evidence.json`、`p5-tooltip-final-commit-tree.json`。R04 的热力矩阵与阶段全门继续。

**17a-matrix / 通用热力矩阵。** `43a4659` 共 **37 个已审文件**，新增独立 `@nocoo/basalt/charts/heatmap-matrix` 入口及 `/ui/heatmap-matrix` 页面，原 Calendar 三个场景保持不变。输入接受 readonly 行列标签与二维数值，区分零、缺失与非有限值；颜色域仅由可见有限数据推导，处理逆序、等界、空域与稀疏行。默认格子仍为 **16×16**，可选 `columnWidth` 让时间与服务标题完整可读。公开面为 **111 modules / 703 symbols（379 value、324 type）**。

真实安装包 **40/40**、两种 Library 场景在移动/桌面和浅深主题下 **8/8** 通过；类型验证包括 **4 项数据契约、3 个可编译用法、7 项负向检查**。独立验证覆盖 ARIA grid/行列头、单一 Tab 入口、方向键/Home/End/PageUp/PageDown、精确零值与缺失读数、Escape、缩小/清空后的焦点、原生事件取消及 React 19 ref 清理。提交前修复了空矩阵渲染循环、ref/事件合成、Escape 提示关闭及向左导航被固定行头遮挡的问题；固定行头后的 **23 个逐列返回位置**全部可见。已查看最终桌面深色与手机浅色截图。

正式 heavy **4/4** 保留前组强断言，并验证精确 **12ms / 0ms / —**、状态、提示关闭、每个目标列的焦点与左右可见边界。最终文档门 **32 模块 / 100 Usage / 264 场景**通过。**232 份产物 / 112 份源码**与安装包一致，相对 tooltip 组仅新增 Matrix JS/声明和所需 standalone 样式，旧 JS/声明无变化；tarball SHA-256 为 `69271107b29c86b28301111e67fc3aaa4537e6724d7d070373d89ceefd8780e4`。

第一次正常 hooks 拦下 **7 项失败**：遗漏的目录静态清单、计数/摘要及示例中性文案。补齐后 **179 项**相关回归通过，Library 再次 **8/8**，重新保存快照后普通提交，最终 hooks **179 文件 / 1,659 测试**及 gitleaks 通过。服务端错误在提交调用前被监控发现，改由原 pi pane 的原生 shell 执行已批准、锁定文件的 helper，正常 hooks 未跳过。另一次独立浏览器探针以单步鼠标跳跃触发 Radix pointer-grace 监听时序；诊断确认下一次 pointermove 即关闭，改为连续移动后 **40/40**，组件与安装包未改变，原始 **36/40** 记录保留。**R04 已关闭；P5 全阶段门继续。** 证据：`p5-matrix-acceptance.json`、`p5-matrix-runtime-final.json`、`p5-matrix-runtime-probe-correction.json`、`p5-matrix-library-hooks-final.json`、`p5-matrix-hooks-final-artifact-source-binding.json`、`p5-matrix-hooks-final-validation-evidence.json`、`p5-matrix-hooks-pi-commit.json`、`p5-matrix-hooks-final-commit-tree.json`。

**P5 首次完整覆盖率（未通过，待补回归）。** `43a4659` 上 **179 文件 / 1,659 测试**全部通过，语句 **95.71%**、分支 **91.99%（2,768/3,009）**、函数 **97.88%**、行 **95.96%**。覆盖率命令真实返回 **1**，未把单测全绿计为阶段通过。主要新缺口位于 HeatmapCalendar、HeatmapMatrix 与图表选项；浏览器验收不计入 L1 覆盖率，继续补可观察的公共行为测试。补充分为热力导航/状态和图表配置两个原子组，原分母、95% 阈值、测试预算与既有断言保持不变。证据：`p5-stage-coverage-final.json`、`p5-stage-coverage-final.lcov`、`p5-stage-coverage-gaps.json`；这些文件保留本次失败，不会覆盖为后续成功结果。

**热力回归 / C23 修复。** `f4182a9` 共 **6 文件**，仅 ValuesHeatmap 增加空态重新加载时的回焦处理；Matrix 仅补测试。真实安装包恢复焦点 **4/4**、外部焦点与滚动/Tab 所有权 **4/4**、原日历 **32/32**、矩阵 **40/40** 均通过。**232 份产物 / 112 份源码**绑定，**114 份声明与全部 CSS 不变**。补足真实键盘焦点、空态切换、读数、图例、横向滚动和 ref 清理；相关 L1 **19/19**，正常 hooks **179 文件 / 1,665 测试**及 gitleaks 通过，提交与 root 预审快照完全一致。正式 heavy 与 docs（**32 模块 / 100 Usage / 264 场景**）通过。最初 heavy 的空 region 名称断言与既有 fixture 不一致，修正预期后重跑通过，原失败保留。局部覆盖诊断为热力两文件 **269/300 分支**，只用于定位，**不是完整仓库 95% 门通过证据**；下一原子组继续补图表选项。证据：`p5-heatmaps-acceptance.json`、`p5-heatmaps-package-delta.json`、`p5-heatmaps-docs-final.json`、`p5-heatmaps-reviewed-commit-tree.json`。

**图表选项回归。** `c563508` 共 **10 个测试文件**，补充图例、轴格式化/显式值域、键盘 Tooltip、Gauge 量程/颜色/插槽与描述关联、ChartFrame 属性优先级、Tooltip 省略标签、图例形状及系列颜色归属。相关 L1 **11 文件 / 76 测试**，root 独立复跑 **24/24**；Gauge 真实安装包在 390/1280px、深浅主题下 **4/4**。**232 份产物 / 112 份源码**保持一致，公开 API 与原有断言保留。预审要求恢复被误替换的旧 Tooltip 属性透传测试，并保留 Gauge 前景弧形/颜色强断言；最终类型检查、lint、正常 hooks **183 文件 / 1,700 测试**及 gitleaks 均通过，提交与 root 快照一致。服务端错误发生在提交调用前，改由原 pi pane 执行已经批准的锁定 helper，未跳过 hooks。非法索引/非法 children 才能触达的防御分支未用伪造输入填充，P5 是否通过仍以完整覆盖率结果为准。证据：`p5-chart-options-acceptance.json`、`p5-chart-options-final-validation-evidence.json`、`p5-chart-options-independent-l1.json`、`p5-gauge-range-with-recharts.json`、`p5-chart-options-final-commit-tree.json`。

**完整覆盖率复验中的 Q08（待修正）。** `c563508` 两次完整运行均为 **1,699 通过 / 1 失败**；失败项是 registry 的 `passes asset freshness check on sync`，分别用时 **5,243ms / 5,181ms**，超过既有 **5,000ms** 预算。两次命令均返回 **1**，没有生成新覆盖率报告；不能沿用旧 lcov 或把测试组通过计为四维 95% 通过。单项诊断通过，完整命令约 **1.97 秒**；修正方向为减少同次生成/校验的重复解析，不延长超时。证据：`p5-stage-coverage-repaired.json`、`p5-stage-coverage-repaired-retry.json`、`p5-coverage-registry-timeout-diagnosis.json`、`p5-registry-before.json`。

**Q08 优化实施。** `6408548` 共 **2 文件**，源文件直接依赖解析和文档锚点解析改为一次调用内复用，freshness 检查共用本次推导的 manifest。root 独立 **9/9** 隔离与修改/恢复检查通过，相关 L1 **18/18**，生成文件、公开基线和 Vitest 配置哈希不变。三次基准中位数：文档校验 **162.57ms → 3.55ms**，完整 freshness **1,088.96ms → 555.33ms（下降约 49%）**；单独 registry 生成中位数 **472.96ms → 477.96ms**，未宣称该部分提速。正常 hooks **183 文件 / 1,702 测试**与 gitleaks 通过，提交与 root 快照一致。仓库回归覆盖 Markdown/JSON 多锚点的修改与恢复、同路径依赖修改、共享循环依赖和入口隔离；原预算及全部旧断言保留。Q08 在完整覆盖环境下的复核仍待结果。证据：`p5-registry-acceptance.json`、`p5-registry-performance-comparison.json`、`p5-registry-root-validation-binding.json`、`p5-registry-final-commit-tree.json`。

**Q08 完整复核与夹具后续。** `6408548` 的完整运行中，原 freshness 用例通过，但公共清单根导出追踪、新增依赖隔离回归和 callable 文档测试分别耗时 **5,645ms / 5,025ms / 5,751ms**，超出各自既有的 5 秒预算。结果为 **180 文件通过 / 3 文件失败、1,699 测试通过 / 3 测试失败**，命令返回 **1**，没有新的 lcov。后续原子组只整理测试夹具：真实只读清单复用、保持相同导出结构的依赖扫描复用真实 manifest、多个独立 callable 模块合并编译；保留全部断言、真实负例和各自预算，不改变生成器或通过拆分测试重置预算。证据：`p5-stage-coverage-after-registry.json`、`p5-stage-coverage-after-registry-run.log`。

**Q08 测试夹具修正。** `a74b8fa` 仅改 **3 个测试文件**：只读仓库清单由 3 次推导减为 1 次；callable 的四个独立正例合入一个真实 fixture，单个测试内的 TypeScript program 从 5 次减为 2 次，缺失导出仍走真实抛错路径；依赖回归在导出结构不变时复用真实 manifest，源码依赖仍逐次重新扫描。AST 比对确认 **693 条原断言完整保留**，增加源码恢复和第二个目录隔离的 2 条断言。相关检查 **35 项**、root 独立选定 **3/3**、类型检查和 lint 通过，正常 hooks **183 文件 / 1,702 测试**及 gitleaks 通过，提交与快照一致。**232 份产物 / 112 份源码**保持不变，没有放宽时间预算或拆分测试重置预算。服务端超时与连接中断后压缩原 pi 会话并续做，模型与 pane 保持不变。完整覆盖率复核仍待结果，本次仅开启失败时也输出报告的选项，测试范围、四维 95% 门槛、workers 与超时均未改变。证据：`p5-generator-acceptance.json`、`p5-generator-assertions-final.json`、`p5-generator-final-commit-tree.json`、`p5-generator-fixtures-provider-errors.json`。

**Q08 关闭与最新完整覆盖率。** `a74b8fa` 的完整运行 **183 文件 / 1,702 测试全部通过**，前述超时未再发生；**Q08 已关闭**。语句 **97.18%**、分支 **94.91%（2,858/3,011）**、函数 **98.50%**、行 **97.40%**。命令仍因分支不足 95% 返回 **1**，新 lcov 已保存；还需至少 3 个分支，继续单独补非空数据缩短、矩阵直接清空与焦点所有权等正常边界回归，P5 暂不关闭。证据：`p5-stage-coverage-after-fixtures.json`、`p5-stage-coverage-after-fixtures.lcov`。

**热力边界回归。** `236ac18` 仅改 **2 个测试文件**，保留全部旧代码和断言，补充非空数组缩短后的外部焦点所有权、矩阵从非零行列直接清空及恢复、空态键盘事件精确透传、2022 年的 365 个日期/53 个周列与 Home/End 年界导航。相关 L1 和 root 独立复跑均为 **20/20**，真实安装包在手机/桌面及浅深主题下 **8/8**。预审将 Tooltip 改为完整文本相等检查、键盘回调改为精确 key 列表、周列数改为精确 53，未放宽原断言。正常 hooks **183 文件 / 1,703 测试**与 gitleaks 通过，提交与快照一致；**232 份产物 / 112 份源码**不变。P5 最终完整覆盖率复核仍待结果。证据：`p5-transitions-acceptance.json`、`p5-transitions-independent-browser.json`、`p5-transitions-independent-l1.json`、`p5-transitions-final-commit-tree.json`。

**P5 阶段最终验收。** 在 `236ac18` 上完成完整覆盖率检查，**183 文件 / 1,703 测试全部通过**，语句 **97.24%（3,314/3,408）**、分支 **95.05%（2,862/3,011）**、函数 **98.50%（790/802）**、行 **97.43%（3,193/3,277）**，命令返回 **0**。四维 95% 阈值及覆盖范围保持不变，新 lcov 与命令日志均保存哈希；此前失败记录仍保留。

最终运行时的展示站 build、standalone/Tailwind、heavy、Next 及文档消费均已通过；文档门编译 **32 个文档模块、100 个 Usage、264 个场景**。这些门对应已验收的实际安装包，最终 **232 份产物 / 112 份源码**重新与 `236ac18` 绑定；后续测试与生成器优化没有改变组件运行时。**114 份声明**与矩阵阶段的已验收包逐字节相同，P4 以来变化的声明有逐项旧契约证明。原公共基线保持 `ef2bd65` 原文，第 1–8 节保持 `40e831b` 原文，根包、库包和实际导入的 APP_VERSION 均为 **2.0.3**。

P5 关闭 **C12、C13、C15、C23、E07、E08、Q08、R04**；R05 的剩余组合需求由 P6 承接，D07 通用类型打印器问题仍留 P10。按用户最新要求在 P6 前暂停，不继续派发后续阶段。本轮没有 push、publish 或 deploy；上述均为本地检查和安装包消费证据。证据：`p5-stage-coverage-final-transitions.json`、`p5-stage-coverage-final-transitions.lcov`、`p5-stage-postfocus-gates.json`、`p5-heatmaps-heavy-final-validation-evidence.json`、`p5-heatmaps-docs-final.json`、`p5-phase-final-runtime-artifact-source-binding.json`、`p5-phase-final-invariants.json`、`p5-phase-final-types-binding.json`、`p5-phase-acceptance.json`。

#### P6 验收记录（已验收，2026-09-07）

**资源列表与复杂展示。** DataTable 兼容扩展受控排序、手动过滤/排序/分页、总量、失败重试、列宽和表头内容；保留旧字符串 header、行身份与默认本地处理。ResourceList 增加工具栏、筛选、批量操作、四态与 footer 插槽，保留必需 data 和原 title/description 类型。新增轻量 BatteryMeter，具备数值语义、状态和不可用说明；不进入根入口、不引入图表依赖。

Library `/ui/skeleton-line` 提供 Dashboard、资源列表和详情三类加载/内容组合，保留原有简单示例；`/ui/data-table` 提供设备运维表，`/ui/table` 提供订阅表。两表包含可操作表头、头像/状态/格式化字段、行内趋势、分页筛选、跨页选择、批量与行操作、加载/空/失败/重试。宽展示与折叠源码减少横向挤压。复杂图表按需加载，原有 family 静态依赖边界保持不变。

**验证。** 最终完整覆盖率为 **186 文件 / 1,719 测试全部通过**：语句 **97.25%（3,334/3,428）**、分支 **95.16%（2,933/3,082）**、函数 **98.50%（793/805）**、行 **97.45%（3,212/3,296）**。原四维 95% 门和覆盖范围未变。package build、Bundler/NodeNext 类型、pack、strict publint、standalone/Tailwind 真实 tarball 消费和全部文档场景编译通过。旧 DataTable **9 正例 / 3 反例**、ResourceList **10 正例 / 3 反例**的实际新包类型对照全部符合预期，原始公共基线未修改。

新增 `test:showcase` 接入 CI 与 prepublish：使用 fresh 生产构建，在 390/1280px、浅深主题与 reduced motion 下验证三类骨架屏高度切换（差值 ≤ 1px）、实际 shimmer 停止、两表排序/筛选/四态/选择闭环及正尺寸图表；正式 A/B 同时验证资源组件与键盘横滚。已查看桌面表格、Dashboard 与手机详情截图。页面整体窄屏文档布局与 Example 行为由 P7 继续完成。

当前登记为 **102 catalog 项（101 ready，maps 仍 planned）、112 公开模块 / 706 符号、237 API targets、270 场景**，版本保持 **2.0.3**。**C14、S01、S02、R05 已关闭。** 证据：`p6-direct-coverage-final.json`、`p6-direct-package-types.json`、`p6-direct-pack.json`、`p6-direct-publint.json`、`p6-direct-standalone-corrected.json`、`p6-direct-tailwind-final.json`、`p6-direct-docs-final.json`、`p6-direct-showcase-complete.json`、`p6-datatable-after-types.json`、`p6-resource-list-after-types.json`。

#### P7 验收记录（已验收，2026-09-07）

Library 标题与 Copy/Source 操作在窄屏重排；API 表格和代码提供具名、可聚焦的局部横滚。Field/Input/InputArea/Checkbox/DatePicker 示例使用每实例 ID，保留 hero 与全部原场景，并验证 label、description、error 的实际归属。早期金融概览与 Settings 补齐 PageHeader；Interactive 八个缺失文案补齐英中，INTEGRATION 明确独立登录、加载、错误、落地页与 Library 文档布局例外。

Forms 使用原生提交、验证与 FormData，文件浏览显示选择结果；Settings 支持资料保存/取消/失败重试、真实主题与语言切换、改密反馈、偏好与会话撤销；Data 的搜索、状态、原始金额排序、分页、计数、空态与重置关联真实演示数据。Chat 发送立即追加消息，支持分段回复、停止、失败重试与清空；切换会话停止旧计时器，卸载清理；手机采用全宽 Dock 和可回焦的会话列表/详情切换。状态与定时器放在无 DOM 的 viewmodels，页面保留原生表单和焦点适配。

Network 为 StackedBar、Sankey、Radar 及同源问题的 StackedArea 提供明确 plot 高度。完整浏览器检查另外发现并修正 Navigation 面包屑/步骤条及 Data 标题工具栏的手机溢出。`test:showcase` 扩展为 24 路由桌面/手机冒烟、四个交互页与 Network 深浅主题/键盘/reduced-motion 回归、320/390/640 CSS px 文档重排、重复 ID 与键盘横滚。640 CSS px 对应 1280px 桌面在 200% 缩放后的布局宽度；不是用截图缩放代替重排。

最终 **187 文件 / 1,729 测试全部通过**，语句 **97.40%（3,490/3,583）**、分支 **95.30%（3,003/3,151）**、函数 **98.59%（841/853）**、行 **97.58%（3,348/3,431）**；四维 95% 门与覆盖范围保持不变。类型、lint、真实 tarball 文档编译及 fresh 生产构建 `test:showcase` 全部通过，浏览器无控制台或页面错误。已查看手机 Settings/Chat/Library 及修正后的 Network 桌面截图。组件运行时与原始公共基线未改变，**E01–E06 已关闭，P7 已验收**。证据：`p7-direct-workflow-unit.json`、`p7-direct-updated-scenarios.json`、`p7-direct-docs.json`、`p7-direct-coverage-final.json`、`p7-direct-showcase-final.json`。

#### P8 验收记录（已验收，2026-09-07）

新增四个 granular 模块、六个公开组件：MultiSelect；FilterBar/FilterChip；FileDropzone；UploadQueue/UploadItem。MultiSelect 支持受控与非受控 value/query/open、服务端搜索适配、禁用选项、键盘选择、chip 删除和原生重复表单字段，尊重正常/取消重置与外部 form 归属。FilterBar 只负责布局与清除请求；MultiSelect 可把 chip 展示交给 FilterBar，避免重复。FileDropzone 验证扩展名/MIME、大小和数量，给出逐文件拒绝原因；队列状态、transport、取消/重试和预览 URL 由调用方持有。

Library 新增八个可复制场景：文件夹组织、远程模型搜索、资源搜索/标签、统计日期范围/预设、文档接收、封面图片、可取消/失败/重试的本地上传、录音导入复核。展示使用宽布局和默认折叠源码；移动端重排，上传取消与移除图标区分。图片替换/移除/卸载释放 object URL，搜索和模拟传输在卸载时清理计时器，取消后不会继续推进。

完整 **192 文件 / 1,755 测试通过**；语句 **97.42%（3,664/3,761）**、分支 **95.46%（3,220/3,373）**、函数 **98.67%（894/906）**、行 **97.64%（3,490/3,574）**。类型、lint、包 build/types/pack/publint、真实 tarball A/B/Next 和 docs gate 全通过；新消费 fixture 验证键盘、焦点、重置、文件校验、真实 drop 与队列动作。fresh 生产构建的 showcase gate 包含原 P6/P7 全部检查及 P8 四页的手机/桌面、深浅主题交互，控制台/页面错误为零。浏览器探针修正了等待异步结果与 Radix 回焦的时机，并按组件作用域定位错误区域，保留 Next 自带的 route announcer。

当前 **106 catalog 项（105 ready，maps 仍 planned）、116 模块 / 722 符号、243 API targets、278 场景**；四个模块均不进入根 barrel。原公开基线、版本 2.0.3 与 docs/04 第 1–8 节保持原文。**R01/R02 已关闭，P8 已验收**。证据：`p8-direct-coverage-final.json`、`p8-direct-typecheck-final.json`、`p8-direct-standalone-complete.json`、`p8-direct-tailwind-complete.json`、`p8-direct-next-final.json`、`p8-direct-docs-complete.json`、`p8-direct-types-complete.json`、`p8-direct-pack-complete.json`、`p8-direct-publint-complete.json`、`p8-direct-showcase-complete.json`。

#### P9 验收记录（已验收，2026-09-07）

新增六个 granular 模块：InlineEditable 的异步保存、校验、失败重试与取消；EditableNavItem/FolderNavItem 的导航、计数、独立行操作与重命名；由调用方提供小图标集合的 IconPicker；稳定标签配色 TagBadge 与 TagColorPicker；ResponsiveMasterDetail 的桌面两栏、手机单活动 pane、返回回焦与草稿保留。Library 六页共 12 个可复制真实场景；标签十种颜色在浅深主题的文字对比度均 ≥4.5，实际最低约 7.05，且应用主题与操作系统相反时仍正确。

随包 `ai/RECIPES.md` 提供 AppFrame、Login、Resources 三个完整应用模块：手机导航与 skip link、原生登录验证/重复提交保护/AbortSignal 清理、资源搜索/错误重试/删除失败重试。A/B/Next 从实际安装 tarball 的 Markdown 原文生成模块，记录内容 hash 后编译并验证真实交互；docs gate 同时验证完整文档、111 个 ready 页 Usage 和 290 个场景。数据、路由、权限、认证及请求由应用负责。

完整 **199 文件 / 1,787 测试通过**；语句 **97.55%（3,830/3,926）**、分支 **95.71%（3,420/3,573）**、函数 **98.72%（932/944）**、行 **97.77%（3,640/3,723）**。类型、lint、包 build/types/pack/publint、正式 standalone/Tailwind/Next/docs 全通过。fresh showcase 覆盖原 P6–P8 门及新增六页四种宽度/主题组合。验收中发现并修正 C24 的 Next 生产压缩重复更新、picker 多行高度及 Tag 主题选择；不放宽任何门槛或预算。

当前 **112 catalog 项（111 ready，maps 仍 planned）、122 模块 / 741 符号、250 API targets、290 场景、125 包入口**。旧公共基线、2.0.3 版本与初审第 1–8 节保留。**R03 的小型控件、R06/R07/R08、C24 已关闭，P9 已验收**；Tree adapter、可拖拽 SplitPane 继续按原范围后置。证据：`p9-direct-coverage-accepted.json`、`p9-direct-typecheck-accepted.json`、`p9-direct-lint-accepted.json`、`p9-direct-next-fixed.json`、`p9-direct-docs-fixed.json`、`p9-direct-standalone-final.json`、`p9-direct-tailwind-final.json`、`p9-direct-types-final.json`、`p9-direct-pack-final.json`、`p9-direct-publint-final.json`、`p9-direct-showcase-complete.json`。

#### P10 验收记录（已验收，2026-09-07）

**类型文档。** D07 打印器使用 TypeScript 语法节点保留函数/构造函数/条件类型组合所需括号、readonly 数组与元组、泛型参数及约束/默认值；递归泛型 alias 保持引用，不展开 ReactNode。Library API 和 Copy page 同时显示泛型上下文。用实际 TypeScript 7 对生成文本与原始类型做双向赋值和负例验证，包含泛型继承的具体实例、真实 LineChart 与 HeatmapCalendar；原有 97 项生成器回归继续保留。旧文档丢失 readonly 的三个准确预期与 Copy page 两项预期同步纠正，没有放宽断言。

**双色板与自定义。** 控件主色替换为 Blue、Ice、Bondi、Green、Lime、Yellow、Tangerine、Strawberry、Pink、Grape、Blueberry、Pearl 共 12 个糖果色。原始 swatch 与符合文字/按钮对比度的 semantic primary 分离；AccentProvider 增加可选 paletteOverrides，老 ID 明确归一迁移。Palette 页可编辑每色的浅/深 hex 值、保存、重置草稿及恢复经典方案，以 basalt-palette-v1 缓存并跨标签页同步。无效数据回退；写入失败仍当次应用并提示；启动阶段也容忍 localStorage 被拒绝，避免初始化白屏。

Chart 固定为 Blue/Pink/Green/Yellow/Pearl 五色，与主色及自定义独立。旧 chart 属性和 24 个编号 token 保留别名；**CHART_COLORS 长度 24→5 与旧主色数量/值是明确记录的行为变更**，不能用冻结的导出符号基线宣称这些值没有变化。Gauge 使用浅灰/深灰中性轨道并采用共享静态动画设置；Values heatmap 与 Timeline 解除对 primary 的耦合，Timeline 可选 textColor 支持彩色事件背景的可读文字。折线、sparkline、面积及雷达轮廓接入既有 2px 线宽，雷达网格适配主题；SlotBar/Timeline 展示与负向图表语义使用固定色板。控件数值、显式 series.color、业务状态与原有入口保留。

**域名与接入说明。** 生产链接、两个 package.json homepage、页面 og:url 和 GitHub homepage 均为 https://basaltui.com；新域名 HTTP 200。CLAUDE.md 仅执行用户授权的生产域名替换。保留本地 basalt.dev.hexly.ai；未改 Cloudflare 配置。INTEGRATION、随包 USAGE/COMPATIBILITY/README 与 Unreleased changelog 说明 recipes、双色板、自定义责任、旧 ID 迁移及旧域名浏览器缓存不能自动跨 origin 转移。版本仍为 2.0.3，尚未发布。

**已通过验证。** 201 文件 / 1,795 项测试全部通过；语句 97.54%（3,889/3,987）、分支 95.70%（3,474/3,630）、函数 98.75%（950/962）、行 97.75%（3,696/3,781）。四维 95% 阈值及原覆盖范围未改变。类型、零警告 lint、包 build/types/pack/strict publint 与 OSV（390 包无命中）通过。

新增正式 showcase 配色门在 390/1280px 与明暗主题中覆盖 24 个 ready chart 页及 Palette，共 100 组页面组合；实际主题与模拟操作系统相反，并核对 class/data-mode 一致。检查 48 次真实 tooltip、1,164 个文字对照，最低 5.58:1；所检主线/扇区标记最低 3.51:1。Gauge 的 0/64/100% 读数、路径比例及两主题轨道通过，轨道分别为 rgb(215,218,224) / rgb(58,60,65)。刷新、跨页、自定义不改变图表、跨标签页、无效/损坏数据、拒绝读/写全部通过，浏览器无控制台或页面错误。已查看两主题 48 张 chart 预览及手机/桌面 Palette；原展示门的主题设置也改走真实 provider storage 契约，避免仅修改 .dark 造成混合主题。

**最终消费与展示。** standalone、Tailwind、Next 生产、heavy 和 docs 五条正式真实安装包消费门全部通过。A/B 分别覆盖 12 个主色及 legacy steel 迁移选择、双主题与相反操作系统偏好，**2,288/2,288 文字配对、52/52 键盘焦点状态**通过；原 84 个常规样本与 hover/focus 断言完整保留。heavy 加入 Gauge 72% 轨道与 ValuesHeatmap 对宿主 primary 改色的不变性。文档门编译 **37 个 Markdown 模块、111 页主 Usage、290 个场景**，并从安装包原文生成三个应用 recipes。

fresh 生产构建的完整 showcase 再次通过：保留 P6 三种骨架屏/两表、P7 共 72 项页面与工作流检查、P8 筛选/上传和 P9 六页/12 场景，再覆盖上述 P10 配色矩阵。复核中修正了验收脚本的旧样本总数，以及 Examples 首轮继承上一组主题的问题；最终主题切换遵循 provider 契约，未降低阈值或缩小矩阵。最终产物核对另纠正 README 的统计口径为 **122 个 JavaScript 入口 + 3 个 CSS 出口**；当前 **112 catalog 项、111 ready、250 API targets、741 个公开符号**，maps 仍 planned。

旧公共基线与初审第 1–8 节逐字核对通过；CLAUDE.md 除生产域名外无改动；INTEGRATION 随包镜像一致。源码和生成资料随本阶段正常提交，并保存候选文件哈希及提交绑定记录；不跳过 typecheck、lint、全量单测或 staged gitleaks。**D07 与 P10 已关闭；本轮 P1–P10 验收完成，组织治理及 Tree/SplitPane/maps 后置范围见 12.6。**

证据：`p10-catalog-printer-acceptance`、`p10-printer-copy-regression`、`p10-coverage-final-candidate`（含 lcov）、`p10-lint-accepted`、`p10-typecheck-final-candidate`、`p10-package-build-final`、`p10-package-types-final`、`p10-pack-final`、`p10-publint-final`、`p10-osv-final`、`p10-site-build-final`、`p10-standalone-accepted`、`p10-tailwind-accepted`、`p10-next-accepted`、`p10-heavy-accepted`、`p10-docs-accepted`、`p10-showcase-accepted`、`p10-visual-screenshots-final`、`p10-github-domain-metadata`、`p10-invariants-final`。以上均为本地命令与真实浏览器证据，不代表远端 CI 或生产发布已经执行。

### 12.5 实施中追加的问题

#### Q08 · P2 · registry 与生成器测试重复解析导致完整覆盖运行超时【已于 P5 修正】

在 `c563508` 的完整覆盖率运行中，`scripts/package-registry.test.ts` 的现有 freshness 检查连续两次超过 5 秒预算。生成器为不同公共入口重复解析共享依赖，文档校验则为同一份 registry 的各个锚点重复读入和解析 JSON；库增大后，这些重复工作侵占了校验预算。

修正限定为一次调用内部共享解析结果，输出和校验规则不变；不同仓库、后续文件编辑、循环/共享依赖、缺失文件或锚点仍需正确识别。保留 5 秒用例预算、完整覆盖范围、四维 95% 和所有旧断言。先保存生成内容哈希及前后性能数据，再独立验收并正常提交；不得通过持续重试、全局缓存或放宽门槛关闭此项。

#### C23 · P2 · 热力日历清空后重新加载丢失键盘焦点【已于 P5 修正】

`HeatmapCalendar values` 模式在单元格持有焦点时清空数组，能把焦点转到空态区域；随后重新加载非空数组，焦点却落到 `BODY`。实际安装包在 390px/1280px 与浅深主题 **4/4 复现**。`ValuesHeatmap` 的空态和非空态渲染树不同，恢复逻辑仅处理空数组及索引越界，遗漏空态恢复到有效索引的路径。

修正应在组件原本持有焦点时回到新的有效单元格；如果用户已经移到外部控件，重新加载必须保留外部焦点。公开接口、色板与默认读数保持兼容。证据：`p5-calendar-restore-before.json`、`p5-calendar-restore-before-acceptance-binding.json`。已在 `f4182a9` 修正：真实安装包恢复焦点 **4/4**，空态移出焦点、滚动与 Tab 离开后的所有权检查 **4/4**，原日历 **32/32**、矩阵 **40/40**；正式 heavy 纳入有数据 → 清空 → 重新加载的精确焦点/读数回归。**C23 已关闭**，阶段完整覆盖率另行验收。

#### C16 · P2 · 内置 Portal 截断 Content 的 forceMount 契约【已于 P4 修正】

源码类型继承了 Radix Content 的 `forceMount`，但包装组件没有把它交给外层 Portal。关闭时 Portal 先卸载，因此只在 Content 上传入 `forceMount` 无法保留内容，调用方的挂载或退场动画策略失效。

已复现的 9 个包装组件：[HoverCardContent](../packages/basalt/src/components/hover-card.tsx)、[DialogContent](../packages/basalt/src/components/dialog.tsx)、[AlertDialogContent](../packages/basalt/src/components/alert-dialog.tsx)、[SheetContent](../packages/basalt/src/components/sheet.tsx)、[PopoverContent](../packages/basalt/src/components/popover.tsx)、[TooltipContent](../packages/basalt/src/components/tooltip.tsx)、[DropdownMenuContent](../packages/basalt/src/components/dropdown-menu.tsx)、[ContextMenuPanel](../packages/basalt/src/components/context-menu.tsx)、[MenuBarContent](../packages/basalt/src/components/menu-bar.tsx)。主 agent 的真实 Chromium 对照共 **30 条**：9 条关闭后强制挂载失败，其余 21 条正常开关或裸组件对照通过，浏览器无错误。直接导出的 ContextMenuContent 三条均通过，不能把修正扩大为给裸组件增加 Portal。证据：`p2-portal-mount-before.json`、`p2-portal-mount-probe.mjs`。

P2 的复合 API 说明先明确当前限制；P4 用独立 10c 提交修正内置 Portal 的参数传递，并更新这些说明。保留默认关闭卸载、打开挂载及实际 ref/定位行为；验证外部动画结束并卸载后的焦点、背景和相邻浮层清理，说明使用 forceMount 时调用方承担的显隐与卸载责任。

#### C17 · P2 · PopoverContent 的 asChild 组合无法挂载【已于 P4 修正】

[PopoverContent](../packages/basalt/src/components/popover.tsx) 将传入的 children 与 Arrow/null 同时交给底层 Content。启用 `asChild` 后，Slot 收到多个子项，抛出 `Primitive.div failed to slot onto its children`，整块内容无法挂载；显式 `arrow={false}` 仍有同样问题。这是原有包装行为，P2 类型与文档补齐没有引入该变化。

主 agent 在 Chromium 中检查 11 种 Content 的默认与 asChild 组合，共 **24 条**：Popover 的两种箭头设置均崩溃，其余 21 条符合预期；另 1 条 CollapsibleContent 在默认 inset 模式下把属性/ref 放到内部 div，切换 `unstyled={true}` 后才作用于调用方子元素，该既有边界在 P2 文档说明。证据：`p2-content-aschild-before.json`。首轮 probe 在已打开的 ContextMenu 上重复执行右键，被内容遮挡而超时；移除不必要的重复打开步骤后得到上述完整结果，不把工具超时计为组件失败。

P4 以独立 10d 提交修正 Popover 的子元素组合，验证默认与 asChild、有无箭头、ref 和事件合成。P2 先准确记录限制；不扩大修改已通过的其他浮层，也不改变普通 Popover 的默认几何。

#### C18 · P2 · Toast 的隐藏图标选项在状态通知中无效【已于 P4 修正】

[toast.tsx](../packages/basalt/src/components/toast.tsx) 将 `icon: false` 原样传给 Sonner；当前 Sonner 会把 false 当作未指定图标，继续使用状态默认图标。`/ui/toast` 的 “No icon” 按钮实际仍显示绿色勾选图标，和该示例及原有接口说明不符。

主 agent 在真实 Library 上检查 **11 条**：实际 “No icon” 按钮及 success/error/warning/info 的 false 选项共 **5 条失败**；default 的 false 选项与五种自定义图标共 **6 条通过**，无页面错误。证据：`p2-toast-icon-before.json`、`p2-toast-hidden-icon-before.png`。P2 的 Toast 文档如实记录当前限制；P4 以独立 10e 修正传递到 Sonner 的隐藏值，验证默认、自定义、隐藏三种路径，不改变其他通知选项和函数签名。

#### C19 · P1 · 类名扫描受注释引号干扰，漏生成真实 standalone utility【已于 P3 修正】

[class-candidates.ts](../scripts/class-candidates.ts) 用简单引号正则扫描整个 TypeScript 源码，没有区分注释、JSX、字符串及模板片段。JSDoc 中的撇号、反引号或双引号可改变后续匹配边界，导致真实 className 中的类漏掉。P2 仅修改文档也会影响生成 CSS，除了额外无用类，还可能丢失已有样式。

主 agent 对 `ac5e5a0` 的 [CommandShortcut](../packages/basalt/src/components/command-palette.tsx) 实际源码调用该提取器：字面量中的 `ml-auto`、`tracking-widest` 均未提取。尝试改写前置 JSDoc 仍不能可靠修复，因此不采用修改正文或恢复旧生成文件的办法。证据：`p3-class-candidates-before.json`。P3/07 增加语法可靠的类名提取与回归，覆盖注释、JSX 属性、模板静态片段、插值内字符串及原有真实控件，重建后用实际消费 CSS 验证。

修复为 `8aa47f0`，持续浏览器回归为 `4a75211`：实际 CommandShortcut 的右对齐与 `letter-spacing = font-size × 0.1` 在两条生产 consumer 中通过；独立提取控制 5/5，仓库单测覆盖注释和模板片段，详见 12.4。

#### C20 · P1 · 原生 reset 监听早于调用方取消，仍修改组件值【已于 P3 修正】

[TypeaheadField](../packages/basalt/src/components/typeahead-field.tsx)、[Checkbox.Group](../packages/basalt/src/components/checkbox.tsx) 与 [Switch.Group](../packages/basalt/src/components/switch.tsx) 在原生 reset listener 内用微任务恢复默认值。真实 reset 按钮触发时，该任务可能早于 React 委托的 `onReset.preventDefault()`，导致调用方取消后仍丢失用户选择。Combobox/Autocomplete 和两个 Group 的普通 reset 均通过，四条取消 reset 均失败，合计 **4/8**。DatePicker 合并 ref 后也暴露同一时序问题，由 09 直接修正，其余由独立 09b 收口。

证据：`p3-typeahead-reset-typeahead-reset-before-corrected.json`、`p3-group-form-group-reset-before.json`。均使用实际安装 tarball、真实选择与点击，校验显示状态及 FormData；首版 Typeahead helper 未输入查询导致的超时不计为组件证据。修正必须等待取消事件传播完成，保留受控状态并清理待执行任务，正式 A/B 门加入普通和取消对照。

延迟 reset 同时要承受调用方重渲染。`p3-reset-rerender-reset-rerender-before.json` **5/6**：DatePicker range 在父组件 onReset 更新状态后未恢复默认范围，其余五条控制通过。09b 必须避免因 items/defaultRangeValue/defaultValue 数组对象换引用而取消已接受的 reset，仅在真正卸载或所属表单改变后清理失效任务。

两个 Group 还需协调底层 Radix Item 的原生 reset：当前依赖的 Trigger 无条件恢复初始 checked，并通过 Group 的 onCheckedChange 改值。只延后 Group 自己的监听不足以解决取消问题；回归必须保留取消前取消勾选 Alpha、勾选 Beta 的操作，同时检查最终 UI、FormData 与调用方 onValueChange 次数。

#### C21 · P2 · Group 合并 ref 丢弃 React 19 callback cleanup【已于 P3 修正】

Checkbox.Group 与 Switch.Group 的内部 `setRefs` 调用外部 callback，却未向 React 转交其返回的清理函数。替换 ref 和卸载时，调用方收到旧式 `ref(null)`，此前注册的 cleanup 不执行。实际安装包六条生命周期验证 **4/6**：两组 object ref 与普通 callback 的替换/卸载控制通过，两组 React 19 cleanup 失败。

证据：`p3-group-refs-group-refs-before.json`。09c 独立修正这两处合并逻辑，保留 FIELDSET 目标、普通 callback/object 行为及内部表单 ref；不新增公开 API。

#### D07 · P2 · 回调与 ReactNode 联合类型的文档丢失括号【已于 P10 修正】

P4/10b 新增的错误文案参数暴露出 [catalog-api.ts](../scripts/catalog-api.ts) 的类型打印边界：实际类型为 `React.ReactNode | ((error: unknown) => React.ReactNode)`，生成结果却是 `(error: unknown) => React.ReactNode | React.ReactNode`，变成了仅接受函数的类型。主 agent 从真实安装包取出原文，用 TypeScript 验证同一个字符串：公开参数接受，生成的文档类型以 **TS2322** 拒绝。证据：`p4-d07-union-docs-before.json`。

10b 使用明确的 `DeleteResourceErrorFormatter` 回调别名，使本组公开文档准确且参数兼容。通用打印器的优先级修正纳入 P10 阶段提交：保留联合中的函数/构造函数等必要括号，用实际可赋值性对照验证生成文本，并确认其他已生成 API 没有意外变化；不把当前别名方案计为通用缺陷已关闭。

P5 补充：HeatmapCalendarYear 的实际 `colorScale: readonly string[]` 被印为 `string[]`。安装包接受 const palette，文档类型以 **TS4104** 拒绝；证据：`p5-d07-readonly-corrected.json`。P10 同时保留 readonly 数组/元组语义。

17a 又发现泛型上下文丢失：真实包 `LineChartProps<Row>["legend"]` 接受字符串，生成的 `LineChartLegendRenderer<unknown> | React.ReactNode` 因 unknown 不满足 string 约束报 **TS2344**；data 印为 unknown[]，series 却残留自由 K，需统一泛型参数、约束与上下文。证据：`p5-d07-generic.json`。将 ReactNode 与 callback 整体包进泛型联合别名还会导致打印器递归溢出，证据：`p5-17a-catalog-api-probe-run.log`；本组以内联 ReactNode 联合和独立 callback alias 避开，通用递归边界仍在 P10 修正，不放宽实际 API。

#### C22 · P2 · 日历超出原生日期上限时跳回一月【已于 P4 修正】

P4 阶段补键盘回归时发现，日期为 `275760-09-13` 时 PageDown 错误聚焦 `275760-01-02`。月末超出 JavaScript Date 范围导致天数 NaN，随后 `utcDate` 的 `setUTCFullYear` 将 Invalid Date 恢复为当年一月。正常按钮已禁用 Next，键盘路径仍可能越界。修复纳入 11b3：拒绝无效月份目标，同时保留最后月份内仍合法日期的导航及原有扩展年份范围；重新执行真实包、类型与消费者验收。证据：`p4-calendar-regression-p4-11b3-native-before.json`、`p4-11b3-native-before-unit.log`。

#### Q07 · P2 · registry 格式化子进程偶发超时【已于 P4 修正调用并复核】

[package-registry.ts](../scripts/package-registry.ts) 通过 `bunx --no-install biome format` 格式化 registry/source JSON，子进程预算为 10 秒。P4 的组合子集验证曾两次遇到 `spawnSync bunx ETIMEDOUT`；11b3 正常提交及阶段首轮 coverage 再次被同类错误拦下，实际均为 **176 文件 / 1,619 测试通过，1 个 registry 版本同步测试超时**。未改文件重试通过不代表问题已关闭。将固定版本 formatter 调用和失败诊断前移至 P4 独立原子组，保持 10 秒预算和全部质量门。root 对真实 registry/sources 的两组调用对照文本一致，支持直接调用已安装的固定 CLI；该有限对照未复现超时，不能据此声称超时根因已确认。证据：`p4-12b-docs-batch-before.log`、`p4-11b3-commit-before-formatter-timeout.log`、`p4-stage-coverage-attempt-1.log`、`p4-q07-formatter-diagnostic.json`。

#### E08 · P2 · 移动导航关闭后焦点丢失【已于 P5 修正】

DashboardLayout 的移动 Sheet 关闭后焦点落到 BODY；390px 双主题 **2/2** 复现。由 `2f7b20d` 修复为回到原来仍存在的触发器，并清理背景滚动锁。独立移动路径 **10/10**、Library **12/12** 通过，详见 12.4 的 13d 记录。证据：`p5-13d-acceptance.json`。


#### C24 · P2 · 生产压缩内联默认函数导致选择指示器重复更新【已于 P9 修正】

Next 16.3.3 / Turbopack 生产消费页在挂载 TagColorPicker 时触发 React #185，Vite 与 Next webpack 开发模式不能复现。实际产物把 selection-indicator 的函数默认参数内联，导致每次 render 创建新的 mapGeometry，继而重跑 layout effect 和 setState。修正把默认函数选择移到稳定回调内部，依赖保留调用方的可选参数；不更改控件接口或禁用生产压缩。正式 Next gate 覆盖两个 picker、编辑、标签、导航及 master/detail 的手机/桌面与主题组合，作为持续回归。另补显式 hydration 就绪标记，避免将 SSR 可见但尚未绑定的按钮当成可交互。证据：p9-direct-next-diagnosis、p9-next-production-component-stack；最终通过记录见 P9 验收。


### 12.6 最终分类台账

第 1–8 节保留初审原文。下表反映 P1–P10 最终实施结果，不能把历史缺陷描述当作当前状态，也不能用阶段完成代替后置项的独立验收。对应的新证据见 12.4。

| 分类 / 编号 | 当前结果 | 阶段与核验位置 |
|---|---|---|
| 文档 D01–D06 | 已关闭：接入入口、可编译代码、完整 API 归属、随包 agent 知识、公开出口基线与兼容政策 | P2；INTEGRATION、ai/registry、USAGE、COMPATIBILITY、真实 tarball docs gate |
| 文档 D07 | 已关闭：类型打印器的泛型、readonly、回调优先级与递归别名修正；TypeScript 正反对照及完整文档门通过 | P10；catalog-type-printer.test.ts、Copy page 回归与生成 API |
| 控件 C01–C05 | 已关闭：禁用/loading、standalone 尺寸、输入弹层、Tab、DatePicker ref/表单 | P3；真实 A/B 包消费及原生 FormData、reset、焦点对照 |
| 控件 C06–C11 | 已关闭：Dock、Confirm、Slider、Empty、日历、主题存储 | P4；键盘、受控状态、异常、几何与 storage 拒绝 |
| 控件 C12–C13 | 已关闭：语义对比度、图表摘要/数据替代与热力图键盘路径；新增色板通过 P10 全矩阵验收 | P5/P10；文字及 hover/focus 对照、图表和日历消费门 |
| 控件 C14 | 已关闭：DataTable 手动/受控数据处理及 ResourceList 页面组合 | P6；设备运维表、订阅台账、旧 props 类型正反例 |
| 控件 C15 | 已关闭：动态图表 series、formatter/domain/stack 等配置 | P5；真实包图表与旧 y/y2/y3 输入兼容 |
| 控件 C16–C18、C22 | 已关闭：Portal forceMount、Popover asChild、Toast 隐藏图标、日历极端日期 | P4；默认/显式路径、卸载清理及原生日期上限 |
| 控件 C19–C21 | 已关闭：类名提取、取消 reset、Group callback ref cleanup | P3；编译 CSS、父级重渲染与 React 19 清理 |
| 控件 C23 | 已关闭：热力日历清空后重新加载的焦点恢复 | P5；空态恢复与外部焦点所有权，正式 heavy 持续回归 |
| 控件 C24 | 已关闭：Next 生产压缩下选择指示器重复更新 | P9；真实 Next 生产产物，稳定默认回调及 hydration 就绪 |
| 质量 Q01–Q04、Q06 | 已关闭：失败传播、真实 tsc、包/消费门接入、发布 SHA/main/tag 约束及工具/豁免归一 | P1；失败注入、工作流及 release 正反例；未触发远端发布 |
| 质量 Q05 | 本轮缺陷的契约、浏览器、几何与配色门已接入；组织级 skip 治理、既有 lint a11y 豁免复查仍后置，未宣称全面关闭 | P3–P10；保持原覆盖分母和四维 95%，ready 仅表示文档/示例可展示 |
| 质量 Q07–Q08 | 已关闭：formatter 固定调用与重复 registry/生成解析 | P4/P5；原时间预算、跨调用 freshness、完整生成内容与断言保留 |
| Example E01–E06 | 已关闭：移动文档、重复 ID、交互闭环、Chat 窄屏、Network 几何、文案/页头 | P7；24 个路由、320/390/640px 文档重排、手机/桌面与两主题工作流 |
| Example E07–E08 | 已关闭：reduced motion 覆盖与移动导航回焦 | P5；P6–P10 新场景继续使用正式 motion、键盘与清理检查 |
| 展示 S01–S02 | 已关闭：三种复杂骨架屏及两种丰富可交互表格 | P6；Library 主展示、复制代码、四态与 loading/loaded 几何 |
| 复用 R01–R02 | 已关闭：MultiSelect、FilterBar、FileDropzone、UploadQueue | P8；每项两个独立场景，纯包消费及取消/重试/清理 |
| 复用 R03 | 本轮小控件已验收：EditableNavItem/FolderNavItem、IconPicker、InlineEditable；Tree adapter 后置 | P9；保留调用方路由、树模型与持久化责任 |
| 复用 R04 | 已关闭：图表动态系列、tooltip 组合、HeatmapMatrix | P5；通用图形与业务数据分离 |
| 复用 R05 | 已关闭：指标卡说明/状态及资源页面 slots/四态 | P4–P6；StatCard、LayerCard、ChartShell、ResourceList |
| 复用 R06–R08 | 本轮已验收：标签颜色/选择、响应式 master/detail、三份应用 recipes；可拖拽 SplitPane 后置 | P9；小图标集合、手机返回回焦、安装包 Markdown 原文编译与交互 |
| P10 追加需求 | 已验收：12 糖果主色、自定义缓存、独立固定五色图表、中性 ring 轨道、新域名/GitHub homepage | 12.4 P10 记录及 COMPATIBILITY 迁移表 |

后置范围保持明确：Tree adapter 与可拖拽 SplitPane 需要独立的数据/拖动/键盘契约设计；maps 仍为唯一 planned catalog 页面。组织级 index-snapshot pre-commit、stdin-range pre-push、skip 检测及既有可访问性规则豁免复查未在本轮替换。当前提交仍执行正常 typecheck、lint、全量单测与 staged gitleaks；pre-push/CI 配置中的覆盖率与消费门继续保留。远端 CI 尚未为这些本地提交运行。

### 12.7 P6–P10 交付导览

以下路径均可在本地 `http://localhost:7003` 或 `https://basalt.dev.hexly.ai` 查看。v2.1.0 的生产入口为 https://basaltui.com，上线状态以 [Release workflow](https://github.com/nocoo/basalt/actions/workflows/release.yml) 的部署结果为准。

| 阶段 | 能直接看到的页面 | 实施前 → 当前实现 | 不做的影响 |
|---|---|---|---|
| P6 | `/ui/skeleton-line`、`/ui/data-table`、`/ui/table`、`/ui/battery-meter` | 几条占位线与简单表格 → 仪表盘/列表/详情加载组合；可排序、筛选、分页、选择的丰富表格，行内格式化金额/状态/电量/趋势及失败重试 | 大型项目仍需各自补骨架屏和列表状态，迁移时难以共享一致的数据契约 |
| P7 | `/forms`、`/settings`、`/data`、`/chat`、`/network`，手机 Library | 外观为主、窄屏挤压/截断 → 保存/取消/错误/重试可操作，Chat 流式/停止与返回列表可用，图表尺寸稳定、文档可键盘横滚 | 示例无法作为可工作的迁移起点，移动布局和焦点问题继续进入下游 |
| P8 | `/ui/multi-select`、`/ui/filter-bar`、`/ui/file-dropzone`、`/ui/upload-queue` | 下游重复实现筛选和文件流程 → 公共多选/筛选/拖放/队列，展示搜索、校验、进度、取消、失败重试 | 文件生命周期、原生表单和异步取消等边界需每个应用重复维护 |
| P9 | `/ui/inline-editable`、`/ui/editable-nav-item`、`/ui/icon-picker`、`/ui/tag-badge`、`/ui/tag-color-picker`、`/ui/responsive-master-detail`；随包 `ai/RECIPES.md` | 零散编辑/导航/标签与应用壳 → 可复用的小控件、手机主从视图及三份可编译 AppFrame/Login/Resources 模块 | 应用迁移仍依赖复制局部代码，容易遗漏回焦、草稿保留、请求取消和 SSR 生产差异 |
| P10 | `/palette`、`/ui/gauge`、`/ui/line`、`/ui/radar`、`/ui/timeline`，泛型控件 API/Copy page | 主色与 chart 共用旧色板、黑色 ring 剩余区、文档类型失真 → 12 糖果主色及本地自定义、独立固定五色图表、中性轨道、清晰文字/网格与正确泛型文档；生产链接切换为 basaltui.com | 主色更换会扰动图表系列，ring 观感与文字配色问题保留，按文档写类型仍可能无法编译，旧生产链接继续失效 |

### 12.8 P10 后续配色调整（已验收，2026-09-07）

用户追加要求：“图表也取一样的色板吧，只是灰色保留”“各种 chart，例如 bar、line，纯色填充，不带黑边框”。当前视觉规范以本节为准；12.4 的 P10 数值与截图保留为该阶段提交时的历史证据。

图表继续使用固定五色循环。Blue、Pink、Green、Yellow 在浅深主题中均与经典控件色板的原始色值完全一致；Gray 保留原有浅深值，控件自定义仍不改变图表颜色。旧公开入口、编号别名与五色数组长度保持。Palette 中英文说明、接入指南、随包迁移资料与 changelog 同步更新。

柱形、扇区、ring 使用纯色填充，折线使用单一系列颜色，面积图和雷达保留同色透明填充；不添加异色描边、黑边或阴影。Funnel 同时取消 Recharts 默认的白色描边，使填色规则一致。ring 的剩余区域继续使用明暗主题对应的中性灰色轨道。

这是对原图形对比度策略的明确调整：原始浅色糖果填色在浅底上可能低于 3:1，不再通过压暗色值或附加黑边补偿，也不沿用前次最低 3.51:1 的结论。浏览器门如实记录原始填色对比度，继续保留文字 ≥4.5:1、所检深色主题主线/扇区 ≥3:1、图表数据替代与交互检查，新增实际图形的纯色、无异色描边、无 filter/阴影验收。全局覆盖率阈值、覆盖范围和其他质量预算不变。

**已通过验证。** 正式包 build、heavy 实际安装包消费、docs 文档消费、typecheck 与零警告 lint 全部通过。fresh 生产构建的完整 showcase 保留 Library、Examples、筛选/上传、编辑与布局检查，并覆盖 24 个 ready chart 页及 Palette 在 390/1280px、浅深主题中的 100 组页面组合。684 个实际图形样本通过纯色、无异色描边及无 filter/阴影检查；48 次真实 tooltip、1,164 个文字对照通过，文字最低 5.58:1。所测主线/扇区的原始颜色最低为 1.26:1，深色主题样本最低 7.56:1；前者按本节明确记录，不宣称浅色图形均达到 3:1。ring 的 0/64/100% 路径和两主题轨道、全部色板缓存异常与同步检查继续通过，浏览器无页面或控制台错误。

桌面图表组合与手机 bar/line/ring 的实际截图已复核，手机截图等待图表完成响应尺寸更新后采样。公开基线、初审第 1–8 节、2.0.3 版本及 INTEGRATION 镜像核对通过。生产 TypeScript 仅为 Funnel 增加无描边属性，没有新的业务逻辑或覆盖范围变更；本次提交沿用 typecheck、lint、全量单测与 staged gitleaks 正常 hooks。

### 12.9 v2.1.0 发布门追补（2026-09-07）

用户授权 `/su-release Y+1` 并要求一并发布 npm，P1–P10、图表纯色调整及随后合并的品牌角楼图标统一收录于 v2.1.0。根包、库包、锁文件、前端版本和生成的包索引同步升级；旧公共基线及第 1–8 节继续保留。品牌提交中的分享图片地址同步改为 `basaltui.com`。

发布自动化补齐两项实际缺口：将已整理的 Unreleased 功能与迁移说明提升为正式 changelog / GitHub release notes；修复 Bun 忽略仅 workspace 版本变化时的锁文件同步，并在提交前复核实际版本。回归包含真实 Bun 冻结安装，以及“命令成功但版本仍旧”的发布阻断场景。

首次远端 Tailwind 消费者门与本地 npm 发布门均检出浅色 Teal Badge 白字对比度仅 **1.82:1**：装饰 Badge 仍复用了已改为糖果色的图表别名。Teal / Purple 现改用 Bondi / Grape 控件色及可读前景色，两个 CSS 模式共用成对 token。修正后的 Tailwind 门已通过 **2,288/2,288 对文字对比度及 52/52 个键盘焦点场景**，没有降低预算或跳过失败样本。完整消费者与生产部署结果以 [CI](https://github.com/nocoo/basalt/actions/workflows/ci.yml)、[Release](https://github.com/nocoo/basalt/releases/tag/v2.1.0) 和 [npm v2.1.0](https://www.npmjs.com/package/@nocoo/basalt/v/2.1.0) 为准。

Linux CI 另外检出文档/registry 全图扫描与大型页面查询共 19 项超时，以及 Health 示例在 390px 下的 13px 内容溢出。测试改为在 `beforeAll` 中解析一次只读导出图，各断言取得独立副本；源文件变更、循环引用、版本同步和 freshness 负面检查仍重新读取隔离目录。全图集成扫描单独设置 30 秒、双扫描同步设置 60 秒上限，普通交互仍为 5 秒，四维 95% 覆盖率和全部断言保留。页面查询限定在对应文档/过滤区域，相关 **5 文件 / 404 测试**通过。`SectionRule` 允许操作区换行并约束最大宽度，320/390/1280px 与三种字体配置的 **9 组**实际几何检查通过，桌面仍同行显示。HTML 标题按最终要求恢复为 **`basalt.`**。证据：`ci-timeout-focused`、`health-width-fixed`；最终发布继续受精确提交的远端 CI 约束。

证据：`chart-candy-generate`、`chart-candy-package-build`、`chart-candy-heavy`、`chart-candy-docs`、`chart-candy-typecheck`、`chart-candy-lint`、`chart-candy-showcase`、`chart-candy-visual-settled`、`chart-candy-invariants`、`chart-candy-candidate.json` 与 `chart-candy-commit`。本节与实现同批提交，验证均为本地结果。

所有示例仍使用本地模拟数据；查询、认证、权限、路由和上传 transport 属于应用。公共源码/元数据/随包指南保持同步，颜色数量和值的迁移属于明确记录的行为变化，发布版本仍须另行按兼容政策决定。

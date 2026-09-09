<p align="center">
  <img src="assets/brand/icon-rounded.png" width="128" height="128" alt="Basalt" />
</p>

<h1 align="center">Basalt</h1>

<p align="center">为 React 应用提供统一的控件、卡片、图表和页面布局。</p>

<p align="center">
  <a href="https://basaltui.com">站点</a> ·
  <a href="docs/README.en.md">English</a>
</p>

## 这是什么

Basalt 包含发布到 npm 的 [@nocoo/basalt](https://www.npmjs.com/package/@nocoo/basalt) 组件库，以及展示组件、API 和使用场景的网站。适合在 React 应用中统一表单、导航、数据展示与页面布局。

视觉上使用哑光表面和分层明度，将页面底色、内容区域和卡片区分开。示例站中的健康、财务、聊天和网络页面使用演示数据；组件库不提供业务后端或身份认证服务。

## 功能

- 提供按钮、输入、表单、弹层、表格、日期选择、侧栏、通知和复合卡片等 React 组件。
- 提供图表、统计区块与页面布局示例，并通过独立导入路径使用较大的控件或图表。
- 支持明暗主题、强调色和自定义色板；在同一套 tokens 下组织多层表面。
- 同时提供 Tailwind CSS v4 与预编译 standalone CSS 两种样式入口。
- 在 `/ui` 浏览组件目录、交互示例、属性说明和源代码；参考应用布局、登录页和资源管理的完整示例。
- 提供 Next.js 客户端边界、主题初始化和 SSR 集成说明。

## 使用

在已有的 React 19 / React DOM 19 应用中安装组件库与图标依赖：

```bash
bun add @nocoo/basalt lucide-react
```

<a id="css-setup"></a>

### 配置样式

使用 Tailwind CSS v4 时，在主样式文件中引入 tokens 和 Tailwind。下面的 `@source` 路径以样式文件位于 `src/` 为例，需按实际位置调整：

```css
@source "../node_modules/@nocoo/basalt/dist/**/*.{js,jsx,ts,tsx}";
@import "@nocoo/basalt/styles/tailwind";
@import "tailwindcss";

@layer base {
  html, body, #root {
    height: 100%;
  }
  body {
    @apply bg-basalt-background text-basalt-foreground antialiased;
  }
}
```

未使用 Tailwind 的应用可在入口导入预编译样式：

```ts
import "@nocoo/basalt/styles/standalone";
```

Standalone CSS 包含 tokens、控件样式和动画，不注入全局 reset；应用负责页面容器的高度与基础布局。

<a id="component-usage"></a>

### 使用组件

```tsx compile:readme-quickstart
import { Button, Input, LayerCard, ThemeProvider } from "@nocoo/basalt";
import { DatePicker } from "@nocoo/basalt/components/date-picker";

export function App() {
  return (
    <ThemeProvider>
      <LayerCard>
        <LayerCard.Header>
          <span className="font-semibold text-basalt-foreground">Overview</span>
        </LayerCard.Header>
        <LayerCard.Body>
          <Input placeholder="Project Name" aria-label="Project Name" />
          <DatePicker aria-label="Target Date" />
          <Button variant="default">Submit</Button>
        </LayerCard.Body>
      </LayerCard>
    </ThemeProvider>
  );
}
```

图表路径 `@nocoo/basalt/charts/*` 需要 Recharts 3。当前内置 DatePicker 和 DataTable 自行实现交互，不要求安装声明为可选 peer 的 react-day-picker 或 TanStack Table；直接集成这些库时再安装它们。Next.js 中应将交互组件放在 `"use client"` 模块内。

主题、路由适配、表单与 SSR 的完整示例见 [INTEGRATION.md](INTEGRATION.md)；应用布局示例见 [RECIPES.md](packages/basalt/ai/RECIPES.md)。

## 开发

仓库使用 Bun workspaces，`packageManager` 指定 Bun 1.4.0。Node.js 建议使用 24 或更新版本。

```bash
git clone https://github.com/nocoo/basalt.git
cd basalt
bun install --frozen-lockfile
bun run dev
```

示例站位于 `http://localhost:7003`，无需后端账号。站点代码在 `src/`，公开组件源码在 `packages/basalt/src/`；开发服务器直接引用工作区源码。

```bash
bun run typecheck
bun run lint
bun run build
bun run preview
bun run --cwd packages/basalt build
```

站点产物为根目录 `dist/`，组件库产物为 `packages/basalt/dist/`。站点使用 Cloudflare Workers 静态资源托管；`/api/live` 只存在于 Vite 开发服务器。根 package 是私有示例站，npm 包位于 `packages/basalt/`。

## 测试

| 测试层 / 场景 | 从仓库根目录执行 |
| --- | --- |
| 单元与组件测试 | `bun run test` |
| Tailwind / standalone 外部应用集成 | `bun run consumer:tailwind`、`bun run consumer:standalone` |
| Next.js SSR 与浏览器交互 | `bun run consumer:next` |
| 图表与可选依赖集成 | `bun run consumer:heavy` |
| 文档代码示例 | `bun run consumer:docs` |
| 示例站浏览器测试 | `bun run test:showcase` |

浏览器测试前执行 `bun run playwright:install`。外部应用测试会在临时目录打包、安装依赖和构建，需要 npm 与网络，并自行管理测试端口。执行 `consumer:docs` 前先运行 `bun run --cwd packages/basalt build`。可用 `bun run test:coverage` 生成单元测试报告；各类夹具说明见 [fixtures/README.md](fixtures/README.md)。

## 技术栈

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-149ECA?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?logo=radixui&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

| 部分 | 实现 |
| --- | --- |
| 组件库 | React、TypeScript、Radix UI、ESM 分路径导出 |
| 样式与图表 | CSS tokens、Tailwind CSS / standalone CSS、Recharts、Lucide |
| 示例站 | Vite、React Router、i18next、Cloudflare Workers 静态资源 |
| 开发与测试 | Bun、Biome、Vitest、Testing Library、Playwright、TypeScript 消费者夹具 |

## 文档

- [应用集成](INTEGRATION.md)
- [应用布局、登录与资源管理示例](packages/basalt/ai/RECIPES.md)
- [包使用说明](packages/basalt/README.md)
- [公开 API 与兼容性](packages/basalt/ai/COMPATIBILITY.md)
- [组件目录](https://basaltui.com/ui)
- [品牌资源](assets/brand/README.md)

## 许可证

[MIT](LICENSE) © 2026 Zheng Li

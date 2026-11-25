<!-- basalt:start -->
# Basalt Agent Instructions

Package: `@nocoo/basalt` · Catalog: https://basaltui.com · Setup: https://basaltui.com/setup.md

## Retrieval-Over-Memory Rules

- Fetch `https://basaltui.com/ui/<slug>.md` or read `node_modules/@nocoo/basalt/ai/registry.json` before writing component props or signatures.
- Fetch `https://basaltui.com/ui/overview/<category>.md` when choosing between components in a family.
- Fetch `https://basaltui.com/templates/<slug>.md` for complete single-file page compositions.
- Fetch `https://basaltui.com/md-catalog.json` to enumerate every Markdown documentation route.

## Design & Integration Invariants

- **Matte layered surfaces (L0–L3)**: Step surface luminance via `--basalt-background` (L0), `ContentIsland` (L1), `LayerCard` (L2), and `LayerCard.Well` / recessed wells (L1/L3). Never use glassmorphism or `backdrop-blur`.
- **Role-based spacing**: Control internals use `2/4/6/8px` (`--basalt-space-xs`..`lg`); cards and layout boundaries use `12/16/24/32px` (`--basalt-space-card-*` / `--basalt-space-layout-*`). Never enlarge control tokens.
- **CSS contracts**: Use Tailwind v4 (`@import "@nocoo/basalt/styles"; @import "tailwindcss";`) or standalone CSS (`import "@nocoo/basalt/styles/standalone";`). Optional self-hosted fonts: `@nocoo/basalt/fonts.css`.
- **Next.js App Router**: Keep interactive Basalt components in `"use client"` modules and adapt framework routing with `LinkProvider`.
- **Notifications**: Mount one global `<Toaster />` at the application root (without an `id`) and trigger notifications via `toast()`.

## Components (81)

| Name                     | Slug                       | Category  | Import                                              | Root            | Markdown                                            |
| ------------------------ | -------------------------- | --------- | --------------------------------------------------- | --------------- | --------------------------------------------------- |
| Button                   | `button`                   | action    | `@nocoo/basalt/components/button`                   | `@nocoo/basalt` | https://basaltui.com/ui/button.md                   |
| LinkButton               | `link-button`              | action    | `@nocoo/basalt/components/button`                   | subpath only    | https://basaltui.com/ui/link-button.md              |
| Text                     | `text`                     | primitive | `@nocoo/basalt/components/text`                     | `@nocoo/basalt` | https://basaltui.com/ui/text.md                     |
| Label                    | `label`                    | primitive | `@nocoo/basalt/components/label`                    | `@nocoo/basalt` | https://basaltui.com/ui/label.md                    |
| Separator                | `separator`                | layout    | `@nocoo/basalt/components/separator`                | `@nocoo/basalt` | https://basaltui.com/ui/separator.md                |
| Scroll Area              | `scroll-area`              | layout    | `@nocoo/basalt/components/scroll-area`              | `@nocoo/basalt` | https://basaltui.com/ui/scroll-area.md              |
| Link                     | `link`                     | primitive | `@nocoo/basalt/components/link`                     | `@nocoo/basalt` | https://basaltui.com/ui/link.md                     |
| Tooltip                  | `tooltip`                  | overlay   | `@nocoo/basalt/components/tooltip`                  | `@nocoo/basalt` | https://basaltui.com/ui/tooltip.md                  |
| ThemeToggle              | `theme-toggle`             | action    | `@nocoo/basalt/components/theme-toggle`             | `@nocoo/basalt` | https://basaltui.com/ui/theme-toggle.md             |
| Layer Card               | `layer-card`               | card      | `@nocoo/basalt/components/layer-card`               | `@nocoo/basalt` | https://basaltui.com/ui/layer-card.md               |
| Description List         | `description-list`         | layout    | `@nocoo/basalt/components/description-list`         | `@nocoo/basalt` | https://basaltui.com/ui/description-list.md         |
| Field                    | `field`                    | layout    | `@nocoo/basalt/components/field`                    | `@nocoo/basalt` | https://basaltui.com/ui/field.md                    |
| Input                    | `input`                    | action    | `@nocoo/basalt/components/input`                    | `@nocoo/basalt` | https://basaltui.com/ui/input.md                    |
| Textarea                 | `textarea`                 | action    | `@nocoo/basalt/components/textarea`                 | `@nocoo/basalt` | https://basaltui.com/ui/textarea.md                 |
| InputGroup               | `input-group`              | action    | `@nocoo/basalt/components/input-group`              | subpath only    | https://basaltui.com/ui/input-group.md              |
| Sensitive Input          | `sensitive-input`          | action    | `@nocoo/basalt/components/sensitive-input`          | subpath only    | https://basaltui.com/ui/sensitive-input.md          |
| Checkbox                 | `checkbox`                 | primitive | `@nocoo/basalt/components/checkbox`                 | `@nocoo/basalt` | https://basaltui.com/ui/checkbox.md                 |
| Radio                    | `radio`                    | primitive | `@nocoo/basalt/components/radio`                    | subpath only    | https://basaltui.com/ui/radio.md                    |
| Switch                   | `switch`                   | primitive | `@nocoo/basalt/components/switch`                   | `@nocoo/basalt` | https://basaltui.com/ui/switch.md                   |
| Select                   | `select`                   | action    | `@nocoo/basalt/components/select`                   | subpath only    | https://basaltui.com/ui/select.md                   |
| Autocomplete             | `autocomplete`             | action    | `@nocoo/basalt/components/autocomplete`             | subpath only    | https://basaltui.com/ui/autocomplete.md             |
| Date Picker              | `date-picker`              | action    | `@nocoo/basalt/components/date-picker`              | subpath only    | https://basaltui.com/ui/date-picker.md              |
| Slider                   | `slider`                   | primitive | `@nocoo/basalt/components/slider`                   | subpath only    | https://basaltui.com/ui/slider.md                   |
| Toggle                   | `toggle`                   | action    | `@nocoo/basalt/components/toggle`                   | subpath only    | https://basaltui.com/ui/toggle.md                   |
| ToggleGroup              | `toggle-group`             | action    | `@nocoo/basalt/components/toggle-group`             | subpath only    | https://basaltui.com/ui/toggle-group.md             |
| Segment Control          | `segment-control`          | action    | `@nocoo/basalt/components/segment-control`          | `@nocoo/basalt` | https://basaltui.com/ui/segment-control.md          |
| Badge                    | `badge`                    | inline    | `@nocoo/basalt/components/badge`                    | `@nocoo/basalt` | https://basaltui.com/ui/badge.md                    |
| Banner                   | `banner`                   | banner    | `@nocoo/basalt/components/banner`                   | subpath only    | https://basaltui.com/ui/banner.md                   |
| Empty                    | `empty`                    | card      | `@nocoo/basalt/components/empty`                    | subpath only    | https://basaltui.com/ui/empty.md                    |
| Loader                   | `loader`                   | primitive | `@nocoo/basalt/components/loader`                   | subpath only    | https://basaltui.com/ui/loader.md                   |
| Skeleton                 | `skeleton`                 | primitive | `@nocoo/basalt/components/skeleton`                 | `@nocoo/basalt` | https://basaltui.com/ui/skeleton.md                 |
| Meter                    | `meter`                    | primitive | `@nocoo/basalt/components/meter`                    | `@nocoo/basalt` | https://basaltui.com/ui/meter.md                    |
| Toast                    | `toast`                    | banner    | `@nocoo/basalt/components/toast`                    | `@nocoo/basalt` | https://basaltui.com/ui/toast.md                    |
| Clipboard Text           | `clipboard-text`           | action    | `@nocoo/basalt/components/clipboard-text`           | subpath only    | https://basaltui.com/ui/clipboard-text.md           |
| CodeHighlighted          | `code`                     | card      | `@nocoo/basalt/components/code`                     | subpath only    | https://basaltui.com/ui/code.md                     |
| CodeBlock                | `code-block`               | card      | `@nocoo/basalt/components/code`                     | subpath only    | https://basaltui.com/ui/code-block.md               |
| Avatar                   | `avatar`                   | primitive | `@nocoo/basalt/components/avatar`                   | `@nocoo/basalt` | https://basaltui.com/ui/avatar.md                   |
| Accordion                | `accordion`                | layout    | `@nocoo/basalt/components/accordion`                | subpath only    | https://basaltui.com/ui/accordion.md                |
| Dialog                   | `dialog`                   | overlay   | `@nocoo/basalt/components/dialog`                   | `@nocoo/basalt` | https://basaltui.com/ui/dialog.md                   |
| AlertDialog              | `alert-dialog`             | overlay   | `@nocoo/basalt/components/alert-dialog`             | `@nocoo/basalt` | https://basaltui.com/ui/alert-dialog.md             |
| Confirm Dialog           | `confirm-dialog`           | overlay   | `@nocoo/basalt/components/confirm-dialog`           | `@nocoo/basalt` | https://basaltui.com/ui/confirm-dialog.md           |
| Popover                  | `popover`                  | overlay   | `@nocoo/basalt/components/popover`                  | `@nocoo/basalt` | https://basaltui.com/ui/popover.md                  |
| Dropdown                 | `dropdown-menu`            | overlay   | `@nocoo/basalt/components/dropdown-menu`            | `@nocoo/basalt` | https://basaltui.com/ui/dropdown-menu.md            |
| ContextMenu              | `context-menu`             | overlay   | `@nocoo/basalt/components/context-menu`             | subpath only    | https://basaltui.com/ui/context-menu.md             |
| HoverCard                | `hover-card`               | overlay   | `@nocoo/basalt/components/hover-card`               | subpath only    | https://basaltui.com/ui/hover-card.md               |
| Sheet                    | `sheet`                    | overlay   | `@nocoo/basalt/components/sheet`                    | `@nocoo/basalt` | https://basaltui.com/ui/sheet.md                    |
| Command Palette          | `command-palette`          | overlay   | `@nocoo/basalt/components/command-palette`          | `@nocoo/basalt` | https://basaltui.com/ui/command-palette.md          |
| Tabs                     | `tabs`                     | layout    | `@nocoo/basalt/components/tabs`                     | `@nocoo/basalt` | https://basaltui.com/ui/tabs.md                     |
| Table                    | `table`                    | layout    | `@nocoo/basalt/components/table`                    | subpath only    | https://basaltui.com/ui/table.md                    |
| DataTable                | `data-table`               | layout    | `@nocoo/basalt/components/data-table`               | subpath only    | https://basaltui.com/ui/data-table.md               |
| Collapsible              | `collapsible`              | layout    | `@nocoo/basalt/components/collapsible`              | `@nocoo/basalt` | https://basaltui.com/ui/collapsible.md              |
| Breadcrumbs              | `breadcrumbs`              | layout    | `@nocoo/basalt/components/breadcrumbs`              | subpath only    | https://basaltui.com/ui/breadcrumbs.md              |
| Toolbar                  | `toolbar`                  | layout    | `@nocoo/basalt/components/toolbar`                  | `@nocoo/basalt` | https://basaltui.com/ui/toolbar.md                  |
| Table of Contents        | `table-of-contents`        | layout    | `@nocoo/basalt/components/table-of-contents`        | subpath only    | https://basaltui.com/ui/table-of-contents.md        |
| Grid                     | `grid`                     | layout    | `@nocoo/basalt/components/grid`                     | subpath only    | https://basaltui.com/ui/grid.md                     |
| Section Rule             | `section-rule`             | layout    | `@nocoo/basalt/components/section-rule`             | subpath only    | https://basaltui.com/ui/section-rule.md             |
| Sidebar                  | `sidebar`                  | layout    | `@nocoo/basalt/components/sidebar`                  | `@nocoo/basalt` | https://basaltui.com/ui/sidebar.md                  |
| Table Pager              | `table-pager`              | action    | `@nocoo/basalt/components/table-pager`              | `@nocoo/basalt` | https://basaltui.com/ui/table-pager.md              |
| Fab                      | `fab`                      | primitive | `@nocoo/basalt/components/fab`                      | subpath only    | https://basaltui.com/ui/fab.md                      |
| Dock                     | `dock`                     | overlay   | `@nocoo/basalt/components/dock`                     | subpath only    | https://basaltui.com/ui/dock.md                     |
| ThemeProvider            | `theme-provider`           | layout    | `@nocoo/basalt/providers/theme`                     | `@nocoo/basalt` | https://basaltui.com/ui/theme-provider.md           |
| LinkProvider             | `link-provider`            | layout    | `@nocoo/basalt/providers/link`                      | `@nocoo/basalt` | https://basaltui.com/ui/link-provider.md            |
| Searchable Multi Select  | `multi-select`             | action    | `@nocoo/basalt/components/multi-select`             | subpath only    | https://basaltui.com/ui/multi-select.md             |
| Filter Bar               | `filter-bar`               | layout    | `@nocoo/basalt/components/filter-bar`               | subpath only    | https://basaltui.com/ui/filter-bar.md               |
| File Dropzone            | `file-dropzone`            | card      | `@nocoo/basalt/components/file-dropzone`            | subpath only    | https://basaltui.com/ui/file-dropzone.md            |
| Upload Queue             | `upload-queue`             | card      | `@nocoo/basalt/components/upload-queue`             | subpath only    | https://basaltui.com/ui/upload-queue.md             |
| Inline Editable          | `inline-editable`          | action    | `@nocoo/basalt/components/inline-editable`          | subpath only    | https://basaltui.com/ui/inline-editable.md          |
| Editable Navigation      | `editable-nav-item`        | layout    | `@nocoo/basalt/components/editable-nav-item`        | subpath only    | https://basaltui.com/ui/editable-nav-item.md        |
| Icon Picker              | `icon-picker`              | action    | `@nocoo/basalt/components/icon-picker`              | subpath only    | https://basaltui.com/ui/icon-picker.md              |
| Tag Badge                | `tag-badge`                | inline    | `@nocoo/basalt/components/tag-badge`                | subpath only    | https://basaltui.com/ui/tag-badge.md                |
| Tag Color Picker         | `tag-color-picker`         | action    | `@nocoo/basalt/components/tag-color-picker`         | subpath only    | https://basaltui.com/ui/tag-color-picker.md         |
| Responsive Master Detail | `responsive-master-detail` | layout    | `@nocoo/basalt/components/responsive-master-detail` | subpath only    | https://basaltui.com/ui/responsive-master-detail.md |
| Chart                    | `chart`                    | layout    | `@nocoo/basalt/components/chart`                    | subpath only    | https://basaltui.com/ui/chart.md                    |
| StatCard                 | `stat-card`                | card      | `@nocoo/basalt/components/stat-card`                | `@nocoo/basalt` | https://basaltui.com/ui/stat-card.md                |
| Page Header              | `page-header`              | block     | `@nocoo/basalt/components/page-header`              | subpath only    | https://basaltui.com/ui/page-header.md              |
| Resource List            | `resource-list`            | block     | `@nocoo/basalt/components/resource-list`            | subpath only    | https://basaltui.com/ui/resource-list.md            |
| Spinner                  | `spinner`                  | primitive | `@nocoo/basalt/components/spinner`                  | `@nocoo/basalt` | https://basaltui.com/ui/spinner.md                  |
| Kbd                      | `kbd`                      | inline    | `@nocoo/basalt/components/kbd`                      | `@nocoo/basalt` | https://basaltui.com/ui/kbd.md                      |
| Progress                 | `progress`                 | primitive | `@nocoo/basalt/components/progress`                 | `@nocoo/basalt` | https://basaltui.com/ui/progress.md                 |
| Pagination               | `pagination`               | action    | `@nocoo/basalt/components/pagination`               | `@nocoo/basalt` | https://basaltui.com/ui/pagination.md               |
| Combobox                 | `combobox`                 | action    | `@nocoo/basalt/components/combobox`                 | `@nocoo/basalt` | https://basaltui.com/ui/combobox.md                 |

## Templates (7)

| Title               | Slug                  | Category   | Markdown                                              |
| ------------------- | --------------------- | ---------- | ----------------------------------------------------- |
| Agent workspace     | `agent-workspace`     | workspaces | https://basaltui.com/templates/agent-workspace.md     |
| Ops inbox           | `ops-inbox`           | workspaces | https://basaltui.com/templates/ops-inbox.md           |
| Workspace settings  | `workspace-settings`  | workspaces | https://basaltui.com/templates/workspace-settings.md  |
| Executive dashboard | `executive-dashboard` | dashboards | https://basaltui.com/templates/executive-dashboard.md |
| Visitor login       | `visitor-login`       | standalone | https://basaltui.com/templates/visitor-login.md       |
| Document page       | `document-page`       | standalone | https://basaltui.com/templates/document-page.md       |
| Error 404           | `not-found`           | standalone | https://basaltui.com/templates/not-found.md           |
<!-- basalt:end -->

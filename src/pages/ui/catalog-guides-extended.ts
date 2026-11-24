export interface CatalogComponentGuide {
	useWhen: string;
	avoidWhen: string;
	instead?: string;
	placement: string;
}

export const CATALOG_GUIDES_EXTENDED: Readonly<Record<string, CatalogComponentGuide>> = {
	"layer-card": {
		useWhen:
			"Grouping a coherent content block on an L2 surface with optional structured Header, Title, Description, Body, Well, and Footer slots or collapsible headers.",
		avoidWhen:
			"Displaying a single KPI metric with trend or sparkline, or wrapping an entire page or region heading in another card.",
		instead: "stat-card",
		placement:
			"Inside L1 ContentIsland sections separated by 24px gaps; compose Header asChild on CollapsibleTrigger with Body inside unstyled CollapsibleContent, and use LayerCard.Well for recessed L1 sub-surfaces.",
	},
	empty: {
		useWhen:
			"Communicating an empty collection, zero-result search, or unconfigured region with an icon, title, description, and optional next-step action.",
		avoidWhen:
			"Showing a transient status update, persistent warning notice, or active loading placeholder.",
		instead: "banner",
		placement:
			"Inside an L2 LayerCard, LayerCard.Empty, or a DataTable empty slot on the same surface boundary where populated content appears.",
	},
	code: {
		useWhen:
			"Rendering syntax-highlighted multi-line source snippets (CodeHighlighted) with the built-in tokenizer, file header, copy button, and optional line numbers, or inline Code spans.",
		avoidWhen:
			"Displaying plain unhighlighted terminal output, raw logs, or copyable single-line values without syntax coloring.",
		instead: "code-block",
		placement:
			"Inside an L2 LayerCard or as a direct child of unstyled CollapsibleContent using `attached` so CodeHighlighted owns its 16px/12px panel insets without double padding.",
	},
	"code-block": {
		useWhen:
			"Presenting plain monospace source, config, or log output with an optional header title, copy control, line-number gutter, and `attached` card-edge mode.",
		avoidWhen: "Needing syntax-highlighted code panels (CodeHighlighted) or inline code snippets.",
		instead: "code",
		placement:
			"Inside L2 content regions or directly inside unstyled CollapsibleContent with `attached` so the panel owns its horizontal/vertical insets and scroll containment.",
	},
	"file-dropzone": {
		useWhen:
			"Accepting keyboard-accessible file browsing or drag-and-drop uploads with extension/MIME, byte-size, and count validation plus structured rejection reasons.",
		avoidWhen:
			"Tracking per-file upload progress, cancellation, retry, and completion states after files are queued.",
		instead: "upload-queue",
		placement:
			"Inside an L2 LayerCard or form section, paired with an application ViewModel that owns File objects, object URLs, and upload transport.",
	},
	"upload-queue": {
		useWhen:
			"Displaying application-owned queued, uploading, success, error, and cancelled upload states via UploadItem rows with progress bars and cancel, retry, or remove actions.",
		avoidWhen: "Capturing initial file selection via drag-and-drop or file picker browsing.",
		instead: "file-dropzone",
		placement:
			"Inside an L2 LayerCard below or beside a FileDropzone, driven by application ViewModel state rather than internal network logic.",
	},
	"stat-card": {
		useWhen:
			"Presenting dashboard KPIs and compact metrics with a title, 24px tabular value, optional trend or status slot, heading icon cue, and compact supporting chart.",
		avoidWhen:
			"Building general content cards with hand-built LayerCard.Header/Body splits or full analytical charts with axes.",
		instead: "layer-card",
		placement:
			"Arranged in a StatGrid inside L1 ContentIsland sections, keeping comparison text next to the primary numeral before any compact 4rem trend plot.",
	},
	separator: {
		useWhen:
			"Drawing a thin horizontal or vertical hairline rule to separate adjacent groups inside a panel, toolbar, menu, or sidebar.",
		avoidWhen:
			"Introducing a named page section or separating major L2 LayerCard islands that already use layout gaps.",
		instead: "section-rule",
		placement:
			"Between sibling item groups inside L2 cards, floating menus, or horizontal toolbars without adding extra outer padding.",
	},
	"scroll-area": {
		useWhen:
			"Bounding an overflowing list, sidebar rail, or wide panel inside a keyboard-accessible vertical, horizontal, or bidirectional scroll viewport.",
		avoidWhen:
			"Scrolling an entire page or wrapping natural-height prose or code panels that should hand off vertical scrolling to the page.",
		instead: "the natural document or ContentIsland flow",
		placement:
			"Inside fixed-height panes, sidebars, or constrained L2 card regions where a single scroll owner is required.",
	},
	"description-list": {
		useWhen:
			"Displaying stacked key-value metadata pairs (such as resource status, plan, or timestamps) without full table columns.",
		avoidWhen:
			"Comparing multi-column records across rows or presenting sortable, selectable datasets.",
		instead: "table",
		placement:
			"Inside an L2 LayerCard.Body or Sheet/Dialog detail panel; it is not a painted surface on its own.",
	},
	field: {
		useWhen:
			"Wrapping a form control with an accessible Label, optional indicator, label tooltip, supporting hint text, and validation error message.",
		avoidWhen:
			"Adding outer form margins or labeling a standalone control that needs no hint, optional, or error wiring.",
		instead: "label",
		placement:
			"Inside form stacks (16px layout gaps between related fields, 24px between sections) inside L2 LayerCards or Dialog forms.",
	},
	accordion: {
		useWhen:
			"Organizing a vertical group of related expandable sections with shared item dividers, roving keyboard focus, and single or multiple open modes.",
		avoidWhen:
			"Toggling a single standalone disclosure, an attached code panel, or a collapsible LayerCard.",
		instead: "collapsible",
		placement:
			"Inside an L2 LayerCard or FAQ/settings region; do not nest full LayerCards inside individual AccordionItems.",
	},
	tabs: {
		useWhen:
			"Switching between distinct full content panels in place using underline-only active tabs with an animated bottom indicator.",
		avoidWhen:
			"Filtering a single collection or toggling a compact view mode inside a toolbar or card header.",
		instead: "segment-control",
		placement:
			"On L1 ContentIsland above regional content or inside an L2 LayerCard to partition parallel views.",
	},
	table: {
		useWhen:
			"Rendering static or custom-markup tabular data with full control over TableHeader, TableRow, TableHead, TableCell, striping, and compact/default density.",
		avoidWhen:
			"Needing built-in column sorting, row selection, pagination orchestration, or standardized loading, error, and empty states.",
		instead: "data-table",
		placement:
			'Direct child of an L2 LayerCard using `ps-basalt-table-edge`/`pe-basalt-table-edge` (or `data-edge="attached"`) so rows span edge-to-edge without `p-0` Body overrides.',
	},
	"data-table": {
		useWhen:
			"Displaying structured record collections requiring sorting, row selection, manual server pagination, staggered loading skeletons, error retry, and Empty states.",
		avoidWhen:
			"Showing a small static table or custom multi-line layout without interactive data state.",
		instead: "table",
		placement:
			'Spanning full column width inside an L2 LayerCard with `edge="attached"` or inside ResourceList, paired with TablePager when paginated.',
	},
	collapsible: {
		useWhen:
			"Toggling a single disclosure region, composing a collapsible LayerCard (`Collapsible asChild`), or revealing attached code (`CollapsibleContent unstyled`).",
		avoidWhen:
			"Managing a multi-item group of disclosures that share dividers and roving arrow-key navigation.",
		instead: "accordion",
		placement:
			"Wrap LayerCard with `Collapsible asChild`, slot `LayerCard.Header asChild` onto CollapsibleTrigger, and place LayerCard.Body or `attached` code inside `CollapsibleContent unstyled`.",
	},
	breadcrumbs: {
		useWhen:
			"Showing hierarchical ancestor links leading to the current non-linked `aria-current` route inside a shell header or PageHeader.",
		avoidWhen:
			"Switching between peer sections at the same hierarchy level or rendering primary app navigation.",
		instead: "tabs",
		placement:
			"At the top of the app shell header or inside PageHeader's `breadcrumbs` prop on L1 ContentIsland, scrolling horizontally on narrow viewports.",
	},
	toolbar: {
		useWhen:
			"Grouping explicit compact actions and an inline search input (`Toolbar.Input`, `Toolbar.Button`) into one cohesive control strip.",
		avoidWhen:
			"Composing wrapping multi-facet filter controls with date ranges, presets, and removable filter chips.",
		instead: "filter-bar",
		placement:
			"Above a table, editor, or ResourceList results region, keeping internal buttons and inputs on the compact control scale.",
	},
	"table-of-contents": {
		useWhen:
			"Providing an on-this-page anchor list (`TableOfContentsItem` with `active` state) for long documentation or multi-section reading views.",
		avoidWhen: "Navigating between separate application pages or routes.",
		instead: "sidebar",
		placement:
			"In a sticky secondary rail beside long-form L1/L2 document content, keeping the panel's background and inset on the panel itself.",
	},
	grid: {
		useWhen:
			"Arranging cards, fields, or dashboard panels in responsive columns using Basalt's layout gap scale (`sm`/`md`/`lg`/`xl`, defaulting to 16px `md`).",
		avoidWhen: "Aligning a single inline row of compact buttons, icons, or badges.",
		instead: "a flex row with control spacing",
		placement:
			"Inside L1 ContentIsland sections or L2 LayerCard bodies to lay out StatCards, cards, or multi-column panels.",
	},
	"section-rule": {
		useWhen:
			'Introducing a page or card region with either a compact uppercase label plus dashed rule (`variant="label"`) or a sentence-case 18px h2 heading (`variant="heading"`).',
		avoidWhen: "Rendering the top-level page title or drawing a plain divider without a heading.",
		instead: "page-header",
		placement:
			"Directly on L1 ContentIsland between 24px-separated sections (or inside L2 cards for subsection labels), never wrapping content in a redundant card.",
	},
	sidebar: {
		useWhen:
			"Building the persistent application navigation shell (`SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarNav`, `SidebarGroup`, `SidebarItem`, `ContentIsland`, `SidebarDrawer`).",
		avoidWhen: "Rendering in-page anchor links or horizontal view tabs.",
		instead: "table-of-contents",
		placement:
			"At the application root on the L0 shell flanking L1 ContentIsland, using SidebarGroup disclosures and SidebarDrawer on mobile viewports.",
	},
	"theme-provider": {
		useWhen:
			"Supplying `system`/`light`/`dark` theme state and document synchronization at the app root (or scoped previews with `persist={false}` and `applyToDocument={false}`).",
		avoidWhen: "Rendering the user-facing button that cycles theme modes.",
		instead: "theme-toggle",
		placement:
			"Once at the application root wrapping the shell and portals, or isolated around embedded theme preference demos.",
	},
	"link-provider": {
		useWhen:
			"Injecting your framework router's link component so all Basalt Link, LinkButton, Breadcrumbs, and Sidebar items navigate natively.",
		avoidWhen: "Rendering an individual inline hyperlink inside prose.",
		instead: "link",
		placement: "Once near the application root above Sidebar, Breadcrumbs, and page routes.",
	},
	"filter-bar": {
		useWhen:
			"Composing wrapping search, multi-select, date-range, preset, and removable FilterChip controls for page-owned filtering and URL state.",
		avoidWhen: "Placing a simple single-row search input alongside one or two action buttons.",
		instead: "toolbar",
		placement:
			"Inside an L2 LayerCard or ResourceList `filters` slot (or directly on L1 as a top-level non-card filter strip; revealed filter forms belong in LayerCard).",
	},
	"editable-nav-item": {
		useWhen:
			"Rendering sidebar or folder navigation items that combine route links, caller icons, inline rename editing, and trailing action menus.",
		avoidWhen: "Editing an isolated text field outside a navigation list.",
		instead: "inline-editable",
		placement:
			"Inside SidebarNav or a master-list navigation rail, backed by LinkProvider and application-owned rename persistence.",
	},
	"responsive-master-detail": {
		useWhen:
			"Coordinating a split list/detail workspace that shows two columns from 768px and switches between inert panes with focus restoration on mobile.",
		avoidWhen:
			"Displaying a single-column list or opening a temporary detail panel over the current page.",
		instead: "sheet",
		placement:
			"Inside a bounded ContentIsland workspace (`h-full min-h-0`), keeping selection, routing, and draft state in the ViewModel.",
	},
	chart: {
		useWhen:
			"Framing Recharts, ECharts, or custom SVG visualizations with engine-agnostic ChartFrame, ChartTooltip, ChartLegend, summary text, and accessible data alternatives.",
		avoidWhen:
			"Showing a single headline KPI number with a compact 4rem sparkline inside a metric grid.",
		instead: "stat-card",
		placement:
			"Inside an L2 LayerCard with an explicit height preset (`sm`/`md`/`lg`) and numbered chart tokens; keep full-axis charts out of StatCard.",
	},
	tooltip: {
		useWhen:
			"Showing a short, non-interactive hint or accessible label clarification on hover or keyboard focus (wrapped in TooltipProvider).",
		avoidWhen:
			"Containing links, buttons, forms, rich multi-line previews, or critical instructions users must read before acting.",
		instead: "popover",
		placement:
			"Portal-mounted via `TooltipTrigger asChild` on interactive triggers such as icon-only buttons or SectionRule info icons.",
	},
	dialog: {
		useWhen:
			"Focusing user attention on a rich modal task, multi-field form, or review panel (`sm`/`md`/`lg`/`xl` widths) that renders background content inert.",
		avoidWhen:
			"Interrupting for a simple urgent binary choice or destructive deletion confirmation.",
		instead: "alert-dialog",
		placement:
			"Portal-mounted L1 floating surface (`data-basalt-floating`) over `--basalt-scrim`, triggered via `DialogTrigger asChild` with DialogHeader and DialogFooter.",
	},
	"alert-dialog": {
		useWhen:
			"Requiring an explicit modal decision for an urgent interruption or irreversible action that cannot be dismissed by clicking outside.",
		avoidWhen:
			"Collecting form inputs, showing rich content, or running an async confirmation flow with built-in loading and `useConfirm()` helpers.",
		instead: "confirm-dialog",
		placement:
			"Portal-mounted modal alert triggered via `AlertDialogTrigger asChild` with explicit AlertDialogCancel and AlertDialogAction buttons.",
	},
	"confirm-dialog": {
		useWhen:
			"Confirming a consequential or destructive resource operation with controlled open/loading state, focus restoration, or the Promise-based `useConfirm()` hook.",
		avoidWhen: "Presenting a multi-field creation form or non-confirming informational modal.",
		instead: "dialog",
		placement:
			"Controlled at the feature or page root alongside async ViewModel handlers that surface failures without silently closing.",
	},
	popover: {
		useWhen:
			"Anchoring an interactive floating panel with controls, mini-forms, or PopoverTitle/PopoverDescription next to a trigger (arrow off by default).",
		avoidWhen: "Rendering a brief non-interactive hover hint or a keyboard-roved action menu.",
		instead: "dropdown-menu",
		placement:
			"Portal-mounted `--basalt-popover` panel anchored to `PopoverTrigger asChild`; opt into `arrow` only when directional anchor attribution is needed.",
	},
	"dropdown-menu": {
		useWhen:
			"Exposing a button-triggered list of commands, checkable options, radio groups, nested submenus, shortcuts, and destructive items with roving focus.",
		avoidWhen: "Selecting a single form field value or hosting arbitrary form controls.",
		instead: "select",
		placement:
			"Portal-mounted `--basalt-popover` menu anchored to `DropdownMenuTrigger asChild` in headers, toolbars, or table row action buttons.",
	},
	"context-menu": {
		useWhen:
			"Providing secondary-click (right-click) or long-press contextual commands on a canvas, card row, or workspace item.",
		avoidWhen:
			"Serving as the only discoverable trigger for primary actions, or opening from a standard left-click button.",
		instead: "dropdown-menu",
		placement:
			"Wrapping an interactive target region via `ContextMenuTrigger asChild`, mirroring actions available in visible menus or toolbars.",
	},
	"hover-card": {
		useWhen:
			"Revealing a rich, non-modal preview card (such as user details or linked record summary) when hovering or focusing a link or trigger.",
		avoidWhen:
			"Showing a concise one-line text hint or hosting interactive form controls that need click persistence.",
		instead: "tooltip",
		placement:
			"Portal-mounted floating card anchored to `HoverCardTrigger asChild` inside lists, tables, or inline references.",
	},
	sheet: {
		useWhen:
			"Opening a modal edge-anchored side drawer (`top`/`right`/`bottom`/`left`) with backdrop scrim and modal focus handling for inspection or editing.",
		avoidWhen:
			"Keeping a persistent, non-modal assistant or inspector rail open alongside active main-column work.",
		instead: "dock",
		placement:
			"Portal-mounted floating L1 drawer (`data-basalt-floating`) triggered via `SheetTrigger asChild` with SheetHeader and footer actions.",
	},
	"command-palette": {
		useWhen:
			"Offering keyboard-first fuzzy search across pages, records, and commands (`CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`) in a unified floating frame.",
		avoidWhen: "Filtering and selecting options inline inside a form field.",
		instead: "combobox",
		placement:
			"Mounted at the app shell or feature root and opened via CommandPaletteTrigger or global keyboard shortcut (such as ⌘K).",
	},
	dock: {
		useWhen:
			"Mounting a persistent right utility rail in `push` mode (shrinking the main column) or local `overlay` mode (non-modal region scrim with Escape dismissal).",
		avoidWhen:
			"Requiring a modal focus-trapped drawer that blocks interaction across the entire viewport.",
		instead: "sheet",
		placement:
			"Beside the main content column inside an app workspace for `push` mode, or inside a `relative` local container for `overlay` mode.",
	},
	"page-header": {
		useWhen:
			"Rendering the top heading of an application page with `breadcrumbs`, one 24px `h1` `title`, 65ch `description`, right-aligned `actions` (create button last), and optional `filters`.",
		avoidWhen: "Labeling an internal section below the page heading or titling an L2 LayerCard.",
		instead: "section-rule",
		placement:
			"Directly on the L1 ContentIsland rail as the first element of a page (or composed by ShowcasePage / ResourceList), never wrapped in a LayerCard.",
	},
	"resource-list": {
		useWhen:
			"Scaffolding a standard resource index page combining PageHeader, toolbar, filters, bulkActions, DataTable (or custom children) with loading/empty/error states, and footer.",
		avoidWhen:
			"Embedding a standalone table inside an existing card or building a bespoke multi-pane workspace that does not follow the standard index-page scaffold.",
		instead: "data-table",
		placement:
			"Inside ContentIsland (L1), keeping business queries, selection state, and mutations in the page ViewModel.",
	},
};

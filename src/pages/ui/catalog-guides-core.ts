export interface CatalogComponentGuide {
	useWhen: string;
	avoidWhen: string;
	instead?: string;
	placement: string;
}

export const CATALOG_GUIDES_CORE: Readonly<Record<string, CatalogComponentGuide>> = {
	badge: {
		useWhen:
			"Display non-interactive semantic status, counts, or short state labels in five tones (neutral, info, success, warning, danger), defaulting to soft (solid for high-emphasis counts, soft with dot in table status cells) or optional onDismiss chips.",
		avoidWhen:
			"Triggering actions, toggling filters, or assigning non-semantic categorical hues to user-created tags.",
		instead: "Button or Toggle for actions; TagBadge for non-semantic categorical hues",
		placement:
			"Inline beside the heading, row title, or table status cell it describes; never inside an extra padded container.",
	},
	"tag-badge": {
		useWhen:
			"Label items with user-defined categories or entity tags using deterministic tagColorFor(colorKey ?? name) hashing across six non-semantic hues (slate, blue, violet, teal, amber, rose) or explicit TagColor values.",
		avoidWhen:
			"Communicating system status severity, SLA alerts, or interactive toggleable filter buttons.",
		instead: "badge",
		placement:
			"Inline in resource cards, table cells, and tag lists using compact control spacing between adjacent tags.",
	},
	kbd: {
		useWhen:
			"Show keyboard shortcuts and keycap hints (sm 20px or md 24px monospace) inside command palette rows, sidebar search triggers, or tooltips.",
		avoidWhen: "Rendering inline code identifiers, CLI snippets, or clickable shortcut buttons.",
		instead: "code",
		placement:
			"Trailing inside menu items, command rows, sidebar search buttons, or inline beside keyboard documentation.",
	},
	button: {
		useWhen:
			"Trigger an operation, form submission, dialog action, or pressed-state control (aria-pressed or aria-current) across default, secondary, destructive, outline, ghost, and link variants.",
		avoidWhen: "Navigating to another route or external URL with an anchor element.",
		instead: "link-button",
		placement:
			'Form footers, toolbars, PageHeader actions (primary create action last), and LayerCard headers (size="sm" with -my-basalt-space-sm in compact headers).',
	},
	"link-button": {
		useWhen:
			"Render a navigation anchor (<a>) that needs full Button visual weight, variants, and action sizing (sm, md, lg, icon, icon-sm, tile).",
		avoidWhen:
			"Running an in-page mutation or placing a subtle inline text link inside body prose.",
		instead: "Button for operations; Link for inline prose navigation",
		placement:
			"Toolbar CTAs, empty-state navigation actions, and PageHeader or card footer links pointing to another URL.",
	},
	"theme-toggle": {
		useWhen:
			"Expose the shared header control that cycles system -> light -> dark -> system via ThemeProvider (useTheme), complete with current-mode icon and next-mode tooltip.",
		avoidWhen:
			"Building an explicit multi-option theme radio selector in settings or mounting outside ThemeProvider.",
		instead: "segment-control",
		placement: "Inside the top-right utility action slot of AppHeader.",
	},
	input: {
		useWhen:
			"Capture single-line text, numbers, search queries, or native input types (sm, md, lg) on the shared matte control surface, with passwordManagerIgnore for fields that should stay ignored by password managers.",
		avoidWhen:
			"Entering multi-line copy, secrets needing a reveal toggle, or values requiring inline prefixes, suffixes, or action buttons.",
		instead: "Textarea for multi-line; SensitiveInput for secrets; InputGroup for addons",
		placement:
			"Inside Field stacks with persistent Label and validation copy (8px label-to-control gap, 16px between related fields), or inline inside FilterBar and Toolbar.",
	},
	textarea: {
		useWhen:
			"Collect multi-line text such as notes, descriptions, or prompts, optionally using autoResize and maxRows so the field grows with content before scrolling internally.",
		avoidWhen: "Capturing single-line values or syntax-highlighted code editing.",
		instead: "input",
		placement:
			"Inside Field within forms, dialogs, or chat composers, keeping 16px layout gaps from neighboring fields.",
	},
	"input-group": {
		useWhen:
			"Combine one InputGroup.Input with leading/trailing InputGroup.Addon icons, InputGroup.Suffix units or domains, or InputGroup.Button actions under a single shared outer border and focus ring.",
		avoidWhen:
			"Rendering a plain single-line text field without addons, or toggling password visibility.",
		instead: "Input for plain fields; SensitiveInput for password reveal",
		placement:
			"Inside Field for URLs, currency or unit inputs, or inline search-with-clear controls.",
	},
	"sensitive-input": {
		useWhen:
			"Accept passwords, passphrases, or masked credentials that need an accessible reveal/hide toggle (revealLabel, hideLabel) sharing one compound control border.",
		avoidWhen:
			"Displaying ordinary unmasked text or read-only copyable values that do not require masking.",
		instead: "clipboard-text",
		placement:
			"Inside Field within login forms, credential configuration forms, and security settings panels.",
	},
	select: {
		useWhen:
			"Pick one option from a short, fixed list (~2-12 items) without search filtering, using Radix Select semantics and shared sm/md/lg trigger sizing.",
		avoidWhen:
			"Filtering long option lists, typing free-form queries, or selecting multiple values.",
		instead: "Combobox for searchable single select; MultiSelect for multiple values",
		placement: "Inside Field rows, FilterBar controls, or compact toolbar selectors.",
	},
	autocomplete: {
		useWhen:
			"Let users type directly into an Input to filter and pick from a suggestion list (items) with keyboard navigation, IME safety, and native form reset support.",
		avoidWhen:
			"Picking from a closed fixed list without free-text input or selecting multiple items.",
		instead: "combobox",
		placement:
			"Inside Field for address, tag-name, or entity lookup inputs where typing narrows suggestions.",
	},
	"date-picker": {
		useWhen:
			'Select a single ISO date (YYYY-MM-DD) or a date range (mode="range") with calendar grid navigation, optional presets, min/max bounds, and timeZone/locale formatting.',
		avoidWhen:
			'Choosing broad relative presets (such as "Last 7 days") without needing calendar day picking.',
		instead: "select",
		placement: "Inside Field in scheduling forms or inside FilterBar and PageHeader filter slots.",
	},
	toggle: {
		useWhen:
			"Expose a single two-state pressed button (pressed / onPressedChange) for toolbar formatting, pin/star states, or view flags (default or outline).",
		avoidWhen:
			"Toggling persistent boolean settings in a form or switching between mutually exclusive views.",
		instead: "Switch for immediate settings; SegmentControl for exclusive views",
		placement: "Inside Toolbar rows or compact action strips alongside related icon buttons.",
	},
	"toggle-group": {
		useWhen:
			'Group related toggle buttons for single-choice (type="single" with sliding accent indicator) or multi-choice (type="multiple") options in a compact pill track.',
		avoidWhen:
			"Building labeled view-mode switchers with an optional All segment or switching entire tab panels.",
		instead: "SegmentControl for labeled view switchers; Tabs for content panels",
		placement:
			"Inside Toolbar, FilterBar, or card headers for alignment, density, or multi-flag controls.",
	},
	"segment-control": {
		useWhen:
			"Switch between mutually exclusive views, scopes, or status filters using options, optional legend, and optional leading allOption (All by default) with a sliding primary indicator.",
		avoidWhen:
			"Allowing multiple active choices, zero active choices, or switching full tab content panels.",
		instead: "Tabs for content panels; ToggleGroup for multi-select toggles",
		placement:
			"In PageHeader filter slots, LayerCard headers, or chart toolbars where 2-6 exclusive modes fit horizontally.",
	},
	"clipboard-text": {
		useWhen:
			"Display a short read-only command, ID, or token in monospace with an attached copy button and screen-reader copy/error status announcement.",
		avoidWhen: "Displaying multi-line source snippets or editable text.",
		instead: "code-block",
		placement: "Inside LayerCard.Body, DescriptionList values, or onboarding and API key panels.",
	},
	"table-pager": {
		useWhen:
			"Pair a tabular range summary (Showing X-Y of Z or custom formatRange) with Pagination controls in a responsive bar beneath a Table or DataTable.",
		avoidWhen: "Paging non-tabular content where a row-range summary makes no sense.",
		instead: "pagination",
		placement: "Directly below a Table, DataTable, or ResourceList inside its LayerCard or footer.",
	},
	"multi-select": {
		useWhen:
			"Pick multiple options from a searchable popover list with optional removable chips (showChips), async query/filterOptions={false} support, and repeated native form entries.",
		avoidWhen: "Choosing only one value or picking from a tiny static set of 2-4 checkboxes.",
		instead: "Combobox for single select; Checkbox.Group for short static lists",
		placement:
			"Inside Field for multi-tag or assignee forms, or inside FilterBar (with showChips={false} when FilterBar renders its own chips).",
	},
	"inline-editable": {
		useWhen:
			"Edit a short committed string in place with click-to-edit, Enter to save, Escape to cancel, saveOnBlur, async onSave pending state, and inline validation.",
		avoidWhen: "Renaming sidebar navigation destinations or editing multi-field forms.",
		instead: "editable-nav-item",
		placement: "Inside LayerCard headers, PageHeader titles, or DescriptionList detail rows.",
	},
	"icon-picker": {
		useWhen:
			"Let users pick one icon from a small caller-supplied IconPickerOption subset inside a searchable popover grid.",
		avoidWhen: "Picking arbitrary text options or exposing an unbounded icon catalog.",
		instead: "select",
		placement: "Inside Field in category, workspace, or tag creation forms and dialogs.",
	},
	"tag-color-picker": {
		useWhen:
			"Choose a TagColor from Basalt's TAG_COLORS palette (or a restricted colors subset) in a responsive radio swatch grid paired with visible color names.",
		avoidWhen: "Picking arbitrary hex colors or semantic system status tones.",
		instead: "radio",
		placement:
			"Inside Field in tag creation or editing dialogs, paired with a tag name Input and TagBadge preview.",
	},
	pagination: {
		useWhen:
			"Navigate discrete page numbers (page, pageCount, onPageChange) with optional simple prev/next mode or showPageNumbers ellipsis mode inside one joined control frame.",
		avoidWhen:
			"Paging a data table that also needs a row-count range summary, or loading infinite streams.",
		instead: "table-pager",
		placement: "Centered or end-aligned below paginated lists, search results, or gallery grids.",
	},
	combobox: {
		useWhen:
			"Provide a searchable picker (cmdk filtering or async shouldFilter={false}) pairing Select trigger geometry with optional clearable, loading, and multiple modes.",
		avoidWhen:
			"Choosing from a tiny fixed list that needs no search, or allowing arbitrary unvalidated text entry.",
		instead: "Select for short fixed lists; Autocomplete for free-text input",
		placement:
			"Inside Field forms, FilterBar, or toolbars when options exceed ~10 items or require keyword search.",
	},
	banner: {
		useWhen:
			"Surface a persistent regional notice, warning, or error (tone: neutral, info, success, warning, danger) with optional title, description, icon, and <Banner.Action> CTAs.",
		avoidWhen: "Acknowledging brief, non-blocking completion events that can auto-dismiss.",
		instead: "toast",
		placement:
			"At the top of the affected region, form, or LayerCard (never as a replacement for field-level validation).",
	},
	toast: {
		useWhen:
			"Emit transient feedback (toast(), toast.success(), toast.danger(), toast.warning(), toast.info(), toast.loading(), toast.promise()) on --basalt-popover via a single root <Toaster />.",
		avoidWhen:
			"Displaying persistent warnings, required decisions, or actionable form errors that must remain visible.",
		instead: "banner",
		placement:
			"Mount <Toaster /> once near the app provider root and trigger toast.* imperatively from ViewModels or event handlers.",
	},
	text: {
		useWhen:
			"Render semantic prose, headings, or monospace spans (variant: body | heading | mono, size: xs-xl, tone: default | muted, as element) locked to Basalt's canonical type scale.",
		avoidWhen: "Labeling form controls or rendering navigational links.",
		instead: "Label for form controls; Link for navigation",
		placement: "Inside LayerCard.Body, DescriptionList, empty states, and prose regions.",
	},
	label: {
		useWhen:
			"Associate an accessible, clickable caption (htmlFor) with a form input or choice control, optionally displaying (optional) via showOptional or an info tooltip.",
		avoidWhen: "Rendering non-form section headings or plain body paragraphs.",
		instead: "text",
		placement:
			"Directly above or beside its associated control (8px gap) or managed automatically inside Field.",
	},
	link: {
		useWhen:
			"Render inline navigational text using --basalt-link that delegates client routing to the app's LinkProvider.",
		avoidWhen: "Triggering state mutations or needing button-sized CTA framing.",
		instead: "Button for actions; LinkButton for button-styled links",
		placement: "Inline within prose sentences, breadcrumbs, or secondary metadata lines.",
	},
	checkbox: {
		useWhen:
			'Toggle an independent boolean option (checked: boolean | "indeterminate") or pick multiple values in Checkbox.Group with Checkbox.Legend, Checkbox.Item, and error.',
		avoidWhen:
			"Applying an instant-effect system toggle or choosing one option from a mutually exclusive set.",
		instead: "Switch for instant settings; Radio for mutually exclusive choices",
		placement:
			"Inside Checkbox.Group in forms, table row selection columns, or inline beside a clickable Label.",
	},
	radio: {
		useWhen:
			"Select one mutually exclusive option from a small visible set (2-6 choices) using Radio.Group, Radio.Legend, Radio.Item, and error.",
		avoidWhen: "Picking from long option lists or allowing multiple selections.",
		instead: "select",
		placement:
			"Inside Radio.Group stacks in forms or dialogs where all options benefit from being visible together.",
	},
	switch: {
		useWhen:
			"Toggle an immediate binary setting on or off (18x32px md or 16x28px sm matte well track) standalone or in Switch.Group.",
		avoidWhen:
			"Requiring a form Submit button to commit the choice, or representing a tri-state selection.",
		instead: "checkbox",
		placement:
			"Beside a setting Label inside preference rows, LayerCard settings lists, or Switch.Group.",
	},
	slider: {
		useWhen:
			"Adjust a numeric value or bounded range (value/defaultValue array, min, max, step, orientation, labels) along a continuous matte well track.",
		avoidWhen: "Entering an exact arbitrary number where keyboard typing is faster.",
		instead: "input",
		placement: "Inside Field or inspector panels alongside a live numeric readout or Label.",
	},
	loader: {
		useWhen:
			"Indicate active, ongoing work with Basalt's 3x3 pixel-orbit status indicator, optional shimmer label, and automatic showElapsed timer after elapsedDelayMs (default 5s).",
		avoidWhen:
			"Showing a tiny inline spinner inside a button or representing known completion percentage.",
		instead: "Spinner for compact inline busy states; Progress for known completion",
		placement:
			"Inside pending LayerCard regions, async task banners, or LoadingScreen while work is actively running.",
	},
	skeleton: {
		useWhen:
			"Reserve layout geometry (line, block, circle with explicit width/height and reduced-motion-safe shimmer) while initial content loads.",
		avoidWhen:
			"Showing indeterminate action progress or reporting active streaming status with elapsed time.",
		instead: "loader",
		placement:
			"Inside LayerCard, DataTable loading rows (84% / 60% / 72% staggered widths), or card placeholders matching final content shape.",
	},
	meter: {
		useWhen:
			'Display a scalar measurement within a known 0..100 range (bar or 20-cell segmented variant, optional auto threshold tones warning >= 70 / danger >= 90) using role="meter".',
		avoidWhen: "Tracking an active task's completion over time or indeterminate loading.",
		instead: "progress",
		placement:
			"Inside quota cards, StatCard details, or resource usage rows with a clear label and customValue.",
	},
	avatar: {
		useWhen:
			"Represent a user or organization with Avatar + AvatarImage + AvatarFallback, or use AvatarInitials (sm 24px / md 36px) for deterministic two-letter colored fallbacks.",
		avoidWhen:
			"Displaying generic product icons, status dots, or clickable actions without an accessible interactive wrapper.",
		instead: "badge",
		placement:
			"In SidebarUser footers (36px), table assignee cells, comments, and ResourceList items.",
	},
	fab: {
		useWhen:
			'Pin a floating circular corner launcher (placement="fixed" or "absolute") that hides smoothly when open is true so a Dock can occupy the corner.',
		avoidWhen:
			"Replacing primary page-header create actions or placing standard buttons inside forms and cards.",
		instead: "button",
		placement:
			"Bottom-right corner of the viewport (fixed) or a bounded preview container (absolute), paired with Dock.",
	},
	spinner: {
		useWhen:
			'Show a lightweight rotating ring (sm, md, lg, role="status" unless aria-hidden) inside buttons, search inputs, or tight inline loading slots.',
		avoidWhen:
			"Indicating multi-second workspace work that benefits from a status label and elapsed timer, or known percentage completion.",
		instead: "Loader for labeled work with elapsed time; Progress for task completion",
		placement:
			"Inline inside busy buttons, Combobox search headers, or compact table/cell loading indicators.",
	},
	progress: {
		useWhen:
			"Track determinate task completion (value in 0..max) or indeterminate task execution (value omitted or null) across sm/md/lg tracks and semantic tones.",
		avoidWhen: "Measuring static capacity or utilization gauges like disk usage or CPU load.",
		instead: "meter",
		placement:
			"Inside UploadQueue rows, import/export dialogs, or task-status LayerCard panels with a visible label.",
	},
};

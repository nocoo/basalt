import { describe, expect, it } from "vitest";
import { generateCatalogApi } from "./catalog-api";
import { fixture, generateFixture, generateProductionApi } from "./catalog-api-test-helpers";

describe("catalog API generator contract 2/4", () => {
	it("fails when the tsconfig is missing", () => {
		expect(() =>
			generateCatalogApi({
				repoRoot: fixture({ "widget.ts": "export interface WidgetProps { a?: boolean }" }),
				tsconfigPath: "missing.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
				],
			}),
		).toThrow(/missing tsconfig missing.json/);
	});

	it("fails when the source file is missing", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "missing.ts", propsType: "WidgetProps", surface: "Widget" },
				],
			}),
		).toThrow(/missing source missing.ts/);
	});

	it("fails when the public props type is missing", () => {
		const root = fixture({
			"widget.ts": "export interface OtherProps { a?: boolean }",
		});
		expect(() => generateFixture(root)).toThrow(/missing type WidgetProps/);
	});

	it("fails on TypeScript diagnostics", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	broken: NotAType;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/TypeScript diagnostics/);
	});

	it("keeps one explicit public surface per production target", () => {
		const generated = generateProductionApi();
		expect(
			Object.fromEntries(
				Object.entries(generated).map(([slug, surfaces]) => [
					slug,
					surfaces.map((surface) => surface.name),
				]),
			),
		).toEqual({
			"inline-editable": ["InlineEditable"],
			"editable-nav-item": ["EditableNavItem", "FolderNavItem"],
			"icon-picker": ["IconPicker"],
			"tag-badge": ["TagBadge", "tagColorFor"],
			"tag-color-picker": ["TagColorPicker"],
			"responsive-master-detail": ["ResponsiveMasterDetail"],
			"multi-select": ["MultiSelect"],
			"filter-bar": ["FilterBar", "FilterChip"],
			"file-dropzone": ["FileDropzone"],
			"upload-queue": ["UploadQueue", "UploadItem"],
			button: ["Button"],
			"link-button": ["LinkButton"],
			text: ["Text"],
			label: ["Label"],
			separator: ["Separator"],
			"scroll-area": ["ScrollArea"],
			link: ["Link"],
			tooltip: ["Tooltip", "TooltipProvider", "TooltipTrigger", "TooltipContent"],
			"theme-toggle": ["ThemeToggle"],
			"layer-card": [
				"LayerCard",
				"LayerCard.Primary",
				"LayerCard.Secondary",
				"LayerCard.Header",
				"LayerCard.Body",
				"LayerCard.Well",
				"LayerCard.Footer",
				"LayerCard.Loading",
				"LayerCard.Empty",
			],
			"description-list": ["DescriptionList", "DescriptionList.Item"],
			"basalt-mark": ["BasaltMark"],
			field: ["Field"],
			input: ["Input"],
			"input-area": ["InputArea"],
			"input-group": [
				"InputGroup",
				"InputGroup.Input",
				"InputGroup.Addon",
				"InputGroup.Button",
				"InputGroup.Suffix",
			],
			"sensitive-input": ["SensitiveInput"],
			checkbox: ["Checkbox", "Checkbox.Group", "Checkbox.Legend", "Checkbox.Item"],
			radio: ["Radio", "Radio.Group", "Radio.Legend"],
			switch: ["Switch", "Switch.Group", "Switch.Legend", "Switch.Item"],
			"segment-control": ["SegmentControl"],
			"page-header": ["PageHeader"],
			"section-rule": ["SectionRule"],
			"stat-strip": ["StatStrip"],
			"confirm-dialog": ["ConfirmDialog", "useConfirm"],
			"context-menu": [
				"ContextMenu",
				"ContextMenuTrigger",
				"ContextMenuContent",
				"ContextMenuItem",
				"ContextMenuPanel",
			],
			"table-pager": ["TablePager"],
			fab: ["Fab"],
			dock: ["Dock", "DockBody"],
			select: [
				"Select",
				"SelectTrigger",
				"SelectValue",
				"SelectContent",
				"SelectGroup",
				"SelectItem",
				"SelectLabel",
			],
			combobox: ["Combobox"],
			autocomplete: ["Autocomplete"],
			"date-picker": ["DatePicker"],
			slider: ["Slider"],
			toggle: ["Toggle"],
			"toggle-group": ["ToggleGroup (Single)", "ToggleGroup (Multiple)", "ToggleGroupItem"],
			toolbar: ["Toolbar", "Toolbar.Button", "Toolbar.Input"],
			tabs: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"],
			"command-palette": [
				"CommandPalette",
				"CommandPaletteTrigger",
				"CommandInput",
				"CommandList",
				"CommandEmpty",
				"CommandGroup",
				"CommandSeparator",
				"CommandItem",
				"CommandShortcut",
			],
			sidebar: [
				"SidebarProvider",
				"Sidebar",
				"SidebarHeader",
				"SidebarBrand",
				"SidebarDrawer",
				"SidebarToggle",
				"SidebarSearch",
				"SidebarNav",
				"SidebarPartition",
				"SidebarItem",
				"SidebarIconItem",
				"SidebarGroup",
				"SidebarFooter",
				"SidebarUser",
				"ContentIsland",
				"useSidebar()",
			],
			popover: [
				"Popover",
				"PopoverTrigger",
				"PopoverClose",
				"PopoverContent",
				"PopoverTitle",
				"PopoverDescription",
			],
			"dropdown-menu": [
				"DropdownMenu",
				"DropdownMenuTrigger",
				"DropdownMenuGroup",
				"DropdownMenuPortal",
				"DropdownMenuSub",
				"DropdownMenuRadioGroup",
				"DropdownMenuContent",
				"DropdownMenuItem",
			],
			collapsible: ["Collapsible", "CollapsibleTrigger", "CollapsibleContent"],
			table: [
				"Table",
				"TableHeader",
				"TableBody",
				"TableFooter",
				"TableRow",
				"TableCaption",
				"TableHead",
				"TableCell",
				"TableSortableHeader",
			],
			"data-table": ["DataTable"],
			pagination: ["Pagination"],
			"table-of-contents": ["TableOfContents", "TableOfContentsItem"],
			code: ["Code", "CodeHighlighted"],
			"code-block": ["CodeBlock"],
			flow: ["Flow", "FlowNode"],
			grid: ["Grid", "GridItem"],
			line: ["LineChart"],
			bar: ["BarChart"],
			area: ["AreaChart"],
			donut: ["DonutChart"],
			sparkline: ["Sparkline"],
			gauge: ["Gauge"],
			"stat-card": ["StatCard", "StatGrid"],
			palette: ["ChartPalette"],
			"slot-bar": ["SlotBarChart", "SlotBarChart.Items"],
			"grouped-bar": ["GroupedBarChart"],
			"stacked-bar": ["StackedBarChart"],
			"heatmap-calendar": ["HeatmapCalendar", "HeatmapCalendar.Year"],
			"heatmap-matrix": ["HeatmapMatrix"],
			radar: ["RadarChart"],
			funnel: ["FunnelChart"],
			bullet: ["BulletChart"],
			timeline: ["Timeline", "Timeline.Events"],
			sankey: ["SankeyChart"],
			"item-list": ["ItemList"],
			"date-navigation": ["DateNavigation", "DateNavigation.Display"],
			charts: ["Charts"],
			"chart-colors": ["Colors"],
			timeseries: ["Timeseries"],
			"custom-chart": ["CustomChart"],
			"resource-list": ["ResourceList"],
			"delete-resource": ["DeleteResource"],
			banner: ["Banner", "Banner.Action"],
			toast: [
				"Toaster",
				"toast",
				"toast.success",
				"toast.error",
				"toast.warning",
				"toast.info",
				"toast.dismiss",
			],
			badge: ["Badge"],
			empty: ["Empty"],
			loader: ["Loader"],
			"prompt-bar": ["PromptBar"],
			"chat-message": ["ChatMessage"],
			"chat-markdown": ["ChatMarkdown"],
			"diff-table": ["DiffTable"],
			"context-cards": ["ContextCards"],
			"recommendation-card": ["RecommendationCard"],
			thinking: ["Thinking"],
			"approval-card": ["ApprovalCard"],
			"tool-chips": ["ToolChips"],
			"menu-bar": [
				"MenuBar",
				"MenuBarRoot",
				"MenuBarMenu",
				"MenuBarTrigger",
				"MenuBarContent",
				"MenuBarItem",
			],
			"skeleton-line": ["SkeletonLine"],
			"battery-meter": ["BatteryMeter"],
			meter: ["Meter"],
			"clipboard-text": ["ClipboardText"],
			avatar: ["Avatar", "AvatarImage", "AvatarFallback", "AvatarInitials"],
			accordion: [
				"Accordion (Single)",
				"Accordion (Multiple)",
				"AccordionItem",
				"AccordionTrigger",
				"AccordionContent",
			],
			"hover-card": ["HoverCard", "HoverCardTrigger", "HoverCardContent"],
			dialog: [
				"Dialog",
				"DialogTrigger",
				"DialogPortal",
				"DialogOverlay",
				"DialogContent",
				"DialogTitle",
				"DialogDescription",
				"DialogClose",
				"DialogHeader",
				"DialogFooter",
			],
			sheet: [
				"Sheet",
				"SheetTrigger",
				"SheetClose",
				"SheetTitle",
				"SheetDescription",
				"SheetContent",
				"SheetHeader",
				"SheetFooter",
			],
			"alert-dialog": [
				"AlertDialog",
				"AlertDialogTrigger",
				"AlertDialogPortal",
				"AlertDialogOverlay",
				"AlertDialogContent",
				"AlertDialogTitle",
				"AlertDialogDescription",
				"AlertDialogCancel",
				"AlertDialogAction",
				"AlertDialogHeader",
				"AlertDialogFooter",
			],
			"navigation-menu": [
				"NavigationMenu",
				"NavigationMenuList",
				"NavigationMenuItem",
				"NavigationMenuLink",
			],
			breadcrumbs: ["Breadcrumbs"],
			"chat-bubble": ["ChatBubble"],
			"chat-composer": ["ChatComposer"],
			"chat-header": ["ChatHeader"],
			"chat-inbox": ["ChatInbox"],
			"theme-provider": ["ThemeProvider"],
			"link-provider": ["LinkProvider"],
		});
	}, 60_000);

	it("documents brand and toggle props in the sidebar API", () => {
		const sidebar = generateProductionApi().sidebar;
		expect(
			sidebar.find((surface) => surface.name === "SidebarBrand")?.props.map((prop) => prop.name),
		).toEqual(expect.arrayContaining(["logo", "name", "version", "action"]));
		expect(
			sidebar.find((surface) => surface.name === "SidebarToggle")?.props.map((prop) => prop.name),
		).toEqual(expect.arrayContaining(["expandLabel", "collapseLabel"]));
	});

	it("extracts five InputGroup surfaces with wrapper defaults and an empty Suffix", () => {
		const generated = generateProductionApi();
		expect(Object.keys(generated)).toHaveLength(120);
		expect(generated["input-group"]).toEqual([
			{
				name: "InputGroup",
				props: [
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable the input and nested actions.",
					},
				],
			},
			{
				name: "InputGroup.Input",
				props: [
					{
						name: "type",
						type: "React.HTMLInputTypeAttribute",
						required: false,
						description: "The type of input control to render.",
					},
				],
			},
			{
				name: "InputGroup.Addon",
				props: [
					{
						name: "align",
						type: '"end" | "start"',
						required: false,
						default: "start",
						description: "Place the addon at the start or end of the group.",
					},
				],
			},
			{
				name: "InputGroup.Button",
				props: [
					{
						name: "variant",
						type: '"default" | "destructive" | "ghost" | "link" | "outline" | "secondary" | null',
						required: false,
						default: "ghost",
						description: "Visual style for the nested action.",
					},
					{
						name: "size",
						type: '"default" | "icon-sm" | "icon" | "lg" | "sm" | null',
						required: false,
						default: "icon",
						description: "Size for the nested action.",
					},
					{
						name: "asChild",
						type: "boolean",
						required: false,
						default: "false",
						description: "Render the nested action through its child element.",
					},
					{
						name: "loading",
						type: "boolean",
						required: false,
						default: "false",
						description: "Show a spinner and disable the nested action.",
					},
					{
						name: "icon",
						type: "React.ReactNode",
						required: false,
						description: "Icon rendered before the nested action label.",
					},
				],
			},
			{
				name: "InputGroup.Suffix",
				props: [],
			},
		]);
		expect(generated["input-group"]?.[2]?.props[0]?.type).not.toContain("className");
		expect(
			generated["input-group"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "children"),
			),
		).toBe(false);
		expect(
			generated["input-group"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "className"),
			),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
	}, 60_000);

	it("extracts SensitiveInput props from SensitiveInputProps as required reveal and hide labels", () => {
		const generated = generateProductionApi();
		expect(Object.keys(generated)).toHaveLength(120);
		expect(generated["sensitive-input"]).toEqual([
			{
				name: "SensitiveInput",
				props: [
					{
						name: "revealLabel",
						type: "string",
						required: true,
						description: "Accessible label for the reveal action.",
					},
					{
						name: "hideLabel",
						type: "string",
						required: true,
						description: "Accessible label for the hide action.",
					},
					{
						name: "size",
						type: "InputSize",
						required: false,
						default: "default",
						description: "The visual size of the field.",
					},
					{
						name: "passwordManagerIgnore",
						type: "boolean",
						required: false,
						default: "false",
						description: "Ignore password managers on this field.",
					},
				],
			},
		]);
		expect(generated["sensitive-input"]?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated["sensitive-input"]?.[0]?.props[1]).not.toHaveProperty("default");
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "type"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "aria-label"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "value"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultValue"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "name"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "autoComplete"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "required"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "disabled"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "className"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "children"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "ref"),
			),
		).toBe(false);
		expect(
			generated["sensitive-input"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "onChange"),
			),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.input?.[0]?.props.map((prop) => prop.name)).toEqual([
			"type",
			"size",
			"passwordManagerIgnore",
		]);
		expect(generated["input-area"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"rows",
			"size",
			"passwordManagerIgnore",
		]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 60_000);

	it("extracts Checkbox props from CheckboxProps as an optional checked union", () => {
		const generated = generateProductionApi();
		expect(Object.keys(generated)).toHaveLength(120);
		expect(generated.checkbox?.map((surface) => surface.name)).toEqual([
			"Checkbox",
			"Checkbox.Group",
			"Checkbox.Legend",
			"Checkbox.Item",
		]);
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated.checkbox?.[0]?.props).toEqual([
			{
				name: "checked",
				type: '"indeterminate" | boolean',
				required: false,
				description: "The controlled checked state of the checkbox.",
			},
			{
				name: "size",
				type: "CheckboxSize",
				required: false,
				default: "default",
				description: "The visual size of the checkbox.",
			},
		]);
		expect(generated.checkbox?.[1]?.props.map((prop) => prop.name)).toEqual([
			"value",
			"defaultValue",
			"onValueChange",
			"error",
			"disabled",
		]);
		expect(generated.checkbox?.[2]?.props).toEqual([]);
		expect(generated.checkbox?.[3]?.props.map((prop) => prop.name)).toEqual(["size", "value"]);
		expect(generated.checkbox?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "defaultChecked")).toBe(
			false,
		);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "onCheckedChange")).toBe(
			false,
		);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "required")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "name")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "value")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "form")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.checkbox?.[0]?.props.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated["sensitive-input"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"revealLabel",
			"hideLabel",
			"size",
			"passwordManagerIgnore",
		]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 60_000);

	it("extracts Radio props from RadioProps as a required string value", () => {
		const generated = generateProductionApi();
		expect(Object.keys(generated)).toHaveLength(120);
		expect(generated.radio?.map((surface) => surface.name)).toEqual([
			"Radio",
			"Radio.Group",
			"Radio.Legend",
		]);
		expect(generated.radio?.[0]?.props.map((prop) => prop.name)).toEqual(["value", "size"]);
		expect(generated.radio?.[1]?.props.map((prop) => prop.name)).toEqual([
			"value",
			"defaultValue",
			"onValueChange",
			"error",
			"disabled",
		]);
		expect(generated.radio?.[2]?.props).toEqual([]);
		expect(generated.radio?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "required")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "form")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.radio?.[0]?.props.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.radio).toHaveLength(3);
		expect(generated.radio?.[0]?.props).toHaveLength(2);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 60_000);

	it("extracts Switch props from SwitchProps as optional checked and size", () => {
		const generated = generateProductionApi();
		expect(Object.keys(generated)).toHaveLength(120);
		expect(generated.switch?.map((surface) => surface.name)).toEqual([
			"Switch",
			"Switch.Group",
			"Switch.Legend",
			"Switch.Item",
		]);
		expect(generated.switch?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated.switch?.[1]?.props.map((prop) => prop.name)).toEqual([
			"value",
			"defaultValue",
			"onValueChange",
			"error",
			"disabled",
		]);
		expect(generated.switch?.[2]?.props).toEqual([]);
		expect(generated.switch?.[3]?.props.map((prop) => prop.name)).toEqual(["size", "value"]);
		expect(generated.switch?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated.switch).toHaveLength(4);
		expect(generated.switch?.[0]?.props).toHaveLength(2);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "defaultChecked")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "onCheckedChange")).toBe(
			false,
		);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "required")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "name")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "value")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "form")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.switch?.[0]?.props.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.radio?.[0]?.props.map((prop) => prop.name)).toEqual(["value", "size"]);
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 60_000);

	it("extracts Select props from seven named types as twelve local rows", () => {
		const generated = generateProductionApi();
		expect(Object.keys(generated)).toHaveLength(120);
		expect(generated.select).toEqual([
			{
				name: "Select",
				props: [
					{
						name: "value",
						type: "string",
						required: false,
						description: "The controlled value of the select.",
					},
					{
						name: "defaultValue",
						type: "string",
						required: false,
						description: "The uncontrolled initial value of the select.",
					},
					{
						name: "onValueChange",
						type: "(value: string) => void",
						required: false,
						description: "Called when the selected value changes.",
					},
				],
			},
			{
				name: "SelectTrigger",
				props: [
					{
						name: "size",
						type: "SelectSize",
						required: false,
						default: "default",
						description: "The visual size of the trigger.",
					},
					{
						name: "loading",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable the trigger and mark it busy.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable the trigger.",
					},
				],
			},
			{
				name: "SelectValue",
				props: [
					{
						name: "placeholder",
						type: "React.ReactNode",
						required: false,
						description: "Content shown when no value is selected.",
					},
				],
			},
			{
				name: "SelectContent",
				props: [
					{
						name: "position",
						type: '"item-aligned" | "popper"',
						required: false,
						default: "popper",
						description: "The positioning mode for the select content.",
					},
					{
						name: "sideOffset",
						type: "number",
						required: false,
						default: "4",
						description: "The distance between the trigger and the select content.",
					},
				],
			},
			{
				name: "SelectGroup",
				props: [
					{
						name: "asChild",
						type: "boolean",
						required: false,
						default: "false",
						description:
							"Change the default rendered div element to the child element, merging props and behavior.\nGroup forwards ref to HTMLDivElement and inherits native div attributes.",
					},
				],
			},
			{
				name: "SelectItem",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The value associated with the select item.",
					},
				],
			},
			{
				name: "SelectLabel",
				props: [
					{
						name: "asChild",
						type: "boolean",
						required: false,
						default: "false",
						description:
							"Change the default rendered div element to the child element, merging props and behavior.\nLabel forwards ref to HTMLDivElement and inherits native div attributes.",
					},
				],
			},
		]);
		expect(generated.select).toHaveLength(7);
		expect(generated.select?.map((surface) => surface.name)).toEqual([
			"Select",
			"SelectTrigger",
			"SelectValue",
			"SelectContent",
			"SelectGroup",
			"SelectItem",
			"SelectLabel",
		]);
		expect(generated.select?.[0]?.props).toHaveLength(3);
		expect(generated.select?.[1]?.props).toHaveLength(3);
		expect(generated.select?.[2]?.props).toHaveLength(1);
		expect(generated.select?.[3]?.props).toHaveLength(2);
		expect(generated.select?.[4]?.props).toHaveLength(1);
		expect(generated.select?.[5]?.props).toHaveLength(1);
		expect(generated.select?.[6]?.props).toHaveLength(1);
		expect(generated.select?.[0]?.props[0]).not.toHaveProperty("default");
		expect(generated.select?.[2]?.props[0]).not.toHaveProperty("default");
		expect(generated.select?.[5]?.props[0]).not.toHaveProperty("default");
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultValue"),
			),
		).toBe(true);
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "onValueChange"),
			),
		).toBe(true);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "open")),
		).toBe(false);
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "defaultOpen"),
			),
		).toBe(false);
		expect(
			generated.select?.some((surface) =>
				surface.props.some((prop) => prop.name === "onOpenChange"),
			),
		).toBe(false);
		expect(
			generated.select
				?.find((surface) => surface.name === "SelectTrigger")
				?.props.some((prop) => prop.name === "disabled"),
		).toBe(true);
		expect(
			generated.select
				?.filter((surface) => surface.name !== "SelectTrigger")
				.some((surface) => surface.props.some((prop) => prop.name === "disabled")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "name")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "required")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "form")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "children")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "className")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "ref")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "aria-label")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "textValue")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "side")),
		).toBe(false);
		expect(
			generated.select?.some((surface) => surface.props.some((prop) => prop.name === "align")),
		).toBe(false);
		expect(generated.button?.[0]?.name).toBe("Button");
		expect(generated.switch?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated.radio?.[0]?.props.map((prop) => prop.name)).toEqual(["value", "size"]);
		expect(generated.checkbox?.[0]?.props.map((prop) => prop.name)).toEqual(["checked", "size"]);
		expect(generated["input-group"]?.map((surface) => surface.name)).toEqual([
			"InputGroup",
			"InputGroup.Input",
			"InputGroup.Addon",
			"InputGroup.Button",
			"InputGroup.Suffix",
		]);
	}, 60_000);

	it("extracts the controlled SegmentControl surface without inherited fieldset props", () => {
		const generated = generateProductionApi();
		expect(generated["segment-control"]).toEqual([
			{
				name: "SegmentControl",
				props: [
					{
						name: "value",
						type: "string",
						required: true,
						description: "The currently selected value.",
					},
					{
						name: "onValueChange",
						type: "(value: string) => void",
						required: true,
						description: "Called when the user selects a different segment.",
					},
					{
						name: "legend",
						type: "React.ReactNode",
						required: true,
						description: "The visible legend that names the control.",
					},
					{
						name: "options",
						type: "readonly SegmentControlOption[]",
						required: true,
						description: "The selectable segments shown after the optional All segment.",
					},
					{
						name: "allOption",
						type: "SegmentControlAllOption",
						required: false,
						description: "Add a leading unfiltered segment, labelled All by default.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every segment.",
					},
				],
			},
		]);
		expect(generated["segment-control"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"defaultValue",
		);
		expect(generated["segment-control"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"children",
		);
	}, 60_000);

	it("extracts the PageHeader surface without inherited header props", () => {
		const generated = generateProductionApi();
		expect(generated["page-header"]).toEqual([
			{
				name: "PageHeader",
				props: [
					{
						name: "size",
						type: '"lg" | "md" | "xl"',
						required: false,
						default: '"md"',
						description: "Page preset; all presets share the same title and description scale.",
					},
					{
						name: "title",
						type: "React.ReactNode",
						required: true,
						description: "The page title, rendered as the only heading.",
					},
					{
						name: "description",
						type: "React.ReactNode",
						required: false,
						description: "Supporting text below the title.",
					},
					{
						name: "breadcrumbs",
						type: "readonly PageHeaderBreadcrumb[]",
						required: false,
						description: "Trail of parent pages.",
					},
					{
						name: "actions",
						type: "React.ReactNode",
						required: false,
						description: "Right-side title-row actions. Put the create button last.",
					},
					{
						name: "filters",
						type: "React.ReactNode",
						required: false,
						description: "Own-row filters. Keep short filters in actions.",
					},
				],
			},
		]);
		expect(generated["page-header"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"className",
		);
		expect(generated["page-header"]?.[0]?.props.map((prop) => prop.name)).not.toContain("children");
	}, 60_000);

	it("extracts the SectionRule surface without inherited section props", () => {
		const generated = generateProductionApi();
		expect(generated["section-rule"]).toEqual([
			{
				name: "SectionRule",
				props: [
					{
						name: "variant",
						type: '"heading" | "label"',
						required: false,
						default: '"label"',
						description: "Compact label with a rule, or a reading-focused section heading.",
					},
					{
						name: "title",
						type: "React.ReactNode",
						required: true,
						description: "Section heading; the label variant includes a trailing rule.",
					},
					{
						name: "hint",
						type: "React.ReactNode",
						required: false,
						description: "Info tooltip beside the title.",
					},
					{
						name: "actions",
						type: "React.ReactNode",
						required: false,
						description: "Actions aligned to the end of the heading row.",
					},
				],
			},
		]);
		expect(generated["section-rule"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"className",
		);
		expect(generated["section-rule"]?.[0]?.props.map((prop) => prop.name)).not.toContain(
			"children",
		);
	}, 60_000);

	it("extracts the StatStrip surface without inherited dl props", () => {
		const generated = generateProductionApi();
		expect(generated["stat-strip"]).toEqual([
			{
				name: "StatStrip",
				props: [
					{
						name: "className",
						type: "string",
						required: false,
						description: "Additional classes for the definition list.",
					},
					{
						name: "items",
						type: "readonly StatStripItem[]",
						required: true,
						description: "The labelled values shown in the strip.",
					},
					{
						name: "loading",
						type: "boolean",
						required: false,
						default: "false",
						description: "Replace each value with a skeleton while keeping labels visible.",
					},
				],
			},
		]);
		expect(generated["stat-strip"]?.[0]?.props.map((prop) => prop.name)).not.toContain("children");
		expect(generated["stat-strip"]?.[0]?.props.map((prop) => prop.name)).not.toContain("id");
	}, 60_000);

	it("extracts ConfirmDialog and useConfirm surfaces without Radix or DOM inventory", () => {
		const generated = generateProductionApi();
		expect(generated["confirm-dialog"]?.map((surface) => surface.name)).toEqual([
			"ConfirmDialog",
			"useConfirm",
		]);
		expect(generated["confirm-dialog"]?.[0]?.props.map((prop) => prop.name)).toEqual([
			"open",
			"onOpenChange",
			"onCloseAutoFocus",
			"onConfirm",
			"title",
			"description",
			"confirmLabel",
			"cancelLabel",
			"variant",
			"loading",
			"trigger",
		]);
		expect(generated["confirm-dialog"]?.[1]?.props.map((prop) => prop.name)).toEqual([
			"title",
			"description",
			"confirmLabel",
			"cancelLabel",
			"variant",
		]);
		expect(
			generated["confirm-dialog"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "children"),
			),
		).toBe(false);
		expect(
			generated["confirm-dialog"]?.some((surface) =>
				surface.props.some((prop) => prop.name === "className"),
			),
		).toBe(false);
	}, 60_000);

	it("extracts logical table alignment and the flush sorter without native props", () => {
		const surfaces = generateProductionApi().table;
		for (const name of ["TableHead", "TableCell"]) {
			expect(surfaces?.find((surface) => surface.name === name)?.props).toContainEqual(
				expect.objectContaining({ name: "textAlign", type: "TableTextAlign", required: false }),
			);
		}
		const sorter = surfaces?.find((surface) => surface.name === "TableSortableHeader");
		expect(sorter?.props.map((prop) => prop.name)).toEqual([
			"children",
			"textAlign",
			"sorted",
			"className",
		]);
		expect(sorter?.props[0]).toEqual({ name: "children", type: "React.ReactNode", required: true });
		expect(sorter?.props[1]?.default).toBe('"start"');
		expect(sorter?.props[2]?.type).toBe("TableSortDirection");
	});

	it("extracts the TablePager surface without inherited DOM inventory", () => {
		const generated = generateProductionApi();
		expect(generated["table-pager"]).toEqual([
			{
				name: "TablePager",
				props: [
					{
						name: "page",
						type: "number",
						required: true,
						description: "1-based current page.",
					},
					{
						name: "pageSize",
						type: "number",
						required: true,
						description: "Number of rows on each page.",
					},
					{
						name: "totalCount",
						type: "number",
						required: true,
						description: "Total number of rows.",
					},
					{
						name: "onPageChange",
						type: "(page: number) => void",
						required: true,
						description: "Called with the next 1-based page.",
					},
					{
						name: "disabled",
						type: "boolean",
						required: false,
						default: "false",
						description: "Disable every pagination control while keeping the range visible.",
					},
					{
						name: "formatRange",
						type: "(range: TablePagerRange) => React.ReactNode",
						required: false,
						description: "Replace the default range copy with a custom node.",
					},
					{
						name: "className",
						type: "string",
						required: false,
						description: "Additional classes for the pager bar.",
					},
				],
			},
		]);
		expect(generated["table-pager"]?.[0]?.props.map((prop) => prop.name)).not.toContain("children");
		expect(generated["table-pager"]?.[0]?.props.map((prop) => prop.name)).not.toContain("id");
	}, 60_000);

	it("aggregates multiple surfaces for the same slug in declaration order", () => {
		const root = fixture({
			"root.ts": "export interface RootProps { open?: boolean }",
			"item.ts": "export interface ItemProps { value?: string }",
		});
		const generated = generateCatalogApi({
			repoRoot: root,
			tsconfigPath: "tsconfig.json",
			targets: [
				{ slug: "widget", sourceFile: "item.ts", propsType: "ItemProps", surface: "Item" },
				{ slug: "widget", sourceFile: "root.ts", propsType: "RootProps", surface: "Root" },
			],
		});
		expect(generated.widget?.map((surface) => surface.name)).toEqual(["Item", "Root"]);
		expect(generated.widget?.[0]?.props).toEqual([
			{ name: "value", type: "string", required: false },
		]);
		expect(generated.widget?.[1]?.props).toEqual([
			{ name: "open", type: "boolean", required: false },
		]);
	});

	it("reuses different source files and props types for one slug", () => {
		const root = fixture({
			"alpha.ts": "export interface AlphaProps { a?: number }",
			"beta.ts": "export interface BetaProps { b?: boolean }",
		});
		const generated = generateCatalogApi({
			repoRoot: root,
			tsconfigPath: "tsconfig.json",
			targets: [
				{ slug: "combo", sourceFile: "alpha.ts", propsType: "AlphaProps", surface: "Alpha" },
				{ slug: "combo", sourceFile: "beta.ts", propsType: "BetaProps", surface: "Beta" },
			],
		});
		expect(generated.combo).toEqual([
			{ name: "Alpha", props: [{ name: "a", type: "number", required: false }] },
			{ name: "Beta", props: [{ name: "b", type: "boolean", required: false }] },
		]);
	});

	it("fails on duplicate surfaces for the same slug", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "Widget" },
				],
			}),
		).toThrow(/duplicate surface Widget for widget/);
	});

	it("fails when a target omits the surface name", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{ slug: "widget", sourceFile: "widget.ts", propsType: "WidgetProps", surface: "" },
				],
			}),
		).toThrow(/missing surface for widget/);
	});

	it("emits an empty surface only when allowEmpty is declared", () => {
		const root = fixture({
			"dom.ts": "export interface Dom { className?: string }",
			"widget.ts": `import type { Dom } from "./dom";
export interface WidgetProps extends Dom {}
`,
		});
		expect(
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{
						slug: "widget",
						sourceFile: "widget.ts",
						propsType: "WidgetProps",
						surface: "Widget",
						allowEmpty: true,
					},
				],
			}).widget,
		).toEqual([{ name: "Widget", props: [] }]);
	});

	it("fails when allowEmpty is declared but local props exist", () => {
		const root = fixture({
			"widget.ts": "export interface WidgetProps { a?: boolean }",
		});
		expect(() =>
			generateCatalogApi({
				repoRoot: root,
				tsconfigPath: "tsconfig.json",
				targets: [
					{
						slug: "widget",
						sourceFile: "widget.ts",
						propsType: "WidgetProps",
						surface: "Widget",
						allowEmpty: true,
					},
				],
			}),
		).toThrow(/allowEmpty expired for widget surface Widget/);
	});
});

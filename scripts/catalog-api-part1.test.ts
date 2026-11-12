import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATALOG_API_TARGETS } from "./catalog-api";
import {
	fixture,
	fixtureProps,
	generateFixture,
	generateProductionProps,
} from "./catalog-api-test-helpers";

describe("catalog API generator contract 1/4", () => {
	it("imports compiler API from typescript-api and keeps official typescript at 7.0.2", () => {
		const source = readFileSync("scripts/catalog-api.ts", "utf8");
		const cli = readFileSync("scripts/catalog-api-cli.ts", "utf8");
		const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
			devDependencies: Record<string, string>;
			scripts: Record<string, string>;
		};
		expect(source).toContain('from "typescript-api"');
		expect(source).not.toMatch(/from ["']typescript["']/);
		expect(cli).not.toMatch(/from ["']typescript["']/);
		expect(pkg.devDependencies.typescript).toBe("7.0.2");
		expect(pkg.devDependencies["typescript-api"]).toBe("npm:typescript@5.9.3");
		expect(pkg.scripts["catalog-api:generate"]).toBe("bun scripts/catalog-api-cli.ts generate");
		expect(pkg.scripts["catalog-api:check"]).toBe("bun scripts/catalog-api-cli.ts check");
		expect(pkg.scripts.typecheck.startsWith("bun run catalog-api:check &&")).toBe(true);
		expect(pkg.scripts.build.startsWith("bun run catalog-api:check &&")).toBe(true);
		expect(pkg.scripts.build).not.toContain("catalog-api:generate");
		expect(pkg.scripts.typecheck).not.toContain("catalog-api:generate");
	});

	it("declares catalog targets without a per-component prop allowlist", () => {
		expect(CATALOG_API_TARGETS).toEqual([
			{
				slug: "inline-editable",
				sourceFile: "packages/basalt/src/components/inline-editable.tsx",
				propsType: "InlineEditableProps",
				surface: "InlineEditable",
			},
			{
				slug: "editable-nav-item",
				sourceFile: "packages/basalt/src/components/editable-nav-item.tsx",
				propsType: "EditableNavItemProps",
				surface: "EditableNavItem",
			},
			{
				slug: "editable-nav-item",
				sourceFile: "packages/basalt/src/components/editable-nav-item.tsx",
				propsType: "FolderNavItemProps",
				surface: "FolderNavItem",
			},
			{
				slug: "icon-picker",
				sourceFile: "packages/basalt/src/components/icon-picker.tsx",
				propsType: "IconPickerProps",
				surface: "IconPicker",
			},
			{
				slug: "tag-badge",
				sourceFile: "packages/basalt/src/components/tag-badge.tsx",
				propsType: "TagBadgeProps",
				surface: "TagBadge",
				callableExport: "tagColorFor",
			},
			{
				slug: "tag-color-picker",
				sourceFile: "packages/basalt/src/components/tag-color-picker.tsx",
				propsType: "TagColorPickerProps",
				surface: "TagColorPicker",
			},
			{
				slug: "responsive-master-detail",
				sourceFile: "packages/basalt/src/components/responsive-master-detail.tsx",
				propsType: "ResponsiveMasterDetailProps",
				surface: "ResponsiveMasterDetail",
			},

			{
				slug: "multi-select",
				sourceFile: "packages/basalt/src/components/multi-select.tsx",
				propsType: "MultiSelectProps",
				surface: "MultiSelect",
			},
			{
				slug: "filter-bar",
				sourceFile: "packages/basalt/src/components/filter-bar.tsx",
				propsType: "FilterBarProps",
				surface: "FilterBar",
			},
			{
				slug: "filter-bar",
				sourceFile: "packages/basalt/src/components/filter-bar.tsx",
				propsType: "FilterChipProps",
				surface: "FilterChip",
			},
			{
				slug: "file-dropzone",
				sourceFile: "packages/basalt/src/components/file-dropzone.tsx",
				propsType: "FileDropzoneProps",
				surface: "FileDropzone",
			},
			{
				slug: "upload-queue",
				sourceFile: "packages/basalt/src/components/upload-queue.tsx",
				propsType: "UploadQueueProps",
				surface: "UploadQueue",
			},
			{
				slug: "upload-queue",
				sourceFile: "packages/basalt/src/components/upload-queue.tsx",
				propsType: "UploadItemProps",
				surface: "UploadItem",
			},

			{
				slug: "button",
				sourceFile: "packages/basalt/src/components/button.tsx",
				propsType: "ButtonProps",
				surface: "Button",
			},
			{
				slug: "link-button",
				sourceFile: "packages/basalt/src/components/button.tsx",
				propsType: "LinkButtonProps",
				surface: "LinkButton",
			},
			{
				slug: "text",
				sourceFile: "packages/basalt/src/components/text.tsx",
				propsType: "TextProps",
				surface: "Text",
			},
			{
				slug: "label",
				sourceFile: "packages/basalt/src/components/label.tsx",
				propsType: "LabelProps",
				surface: "Label",
			},
			{
				slug: "separator",
				sourceFile: "packages/basalt/src/components/separator.tsx",
				propsType: "SeparatorProps",
				surface: "Separator",
			},
			{
				slug: "scroll-area",
				sourceFile: "packages/basalt/src/components/scroll-area.tsx",
				propsType: "ScrollAreaProps",
				surface: "ScrollArea",
			},
			{
				slug: "link",
				sourceFile: "packages/basalt/src/components/link.tsx",
				propsType: "LinkProps",
				surface: "Link",
			},
			{
				slug: "tooltip",
				sourceFile: "packages/basalt/src/components/tooltip.tsx",
				propsType: "TooltipProps",
				surface: "Tooltip",
			},
			{
				slug: "tooltip",
				sourceFile: "packages/basalt/src/components/tooltip.tsx",
				propsType: "TooltipProviderProps",
				surface: "TooltipProvider",
			},
			{
				slug: "tooltip",
				sourceFile: "packages/basalt/src/components/tooltip.tsx",
				propsType: "TooltipTriggerProps",
				surface: "TooltipTrigger",
			},
			{
				slug: "tooltip",
				sourceFile: "packages/basalt/src/components/tooltip.tsx",
				propsType: "TooltipContentProps",
				surface: "TooltipContent",
			},
			{
				slug: "theme-toggle",
				sourceFile: "packages/basalt/src/components/theme-toggle.tsx",
				propsType: "ThemeToggleProps",
				surface: "ThemeToggle",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardProps",
				surface: "LayerCard",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardWellProps",
				surface: "LayerCard.Primary",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Secondary",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardHeaderProps",
				surface: "LayerCard.Header",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Body",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardWellProps",
				surface: "LayerCard.Well",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardSectionProps",
				surface: "LayerCard.Footer",
				allowEmpty: true,
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardLoadingProps",
				surface: "LayerCard.Loading",
			},
			{
				slug: "layer-card",
				sourceFile: "packages/basalt/src/components/layer-card.tsx",
				propsType: "LayerCardEmptyProps",
				surface: "LayerCard.Empty",
			},
			{
				slug: "description-list",
				sourceFile: "packages/basalt/src/components/description-list.tsx",
				propsType: "DescriptionListProps",
				surface: "DescriptionList",
			},
			{
				slug: "description-list",
				sourceFile: "packages/basalt/src/components/description-list.tsx",
				propsType: "DescriptionListItemProps",
				surface: "DescriptionList.Item",
			},
			{
				slug: "basalt-mark",
				sourceFile: "packages/basalt/src/components/basalt-mark.tsx",
				propsType: "BasaltMarkProps",
				surface: "BasaltMark",
			},
			{
				slug: "field",
				sourceFile: "packages/basalt/src/components/field.tsx",
				propsType: "FieldProps",
				surface: "Field",
			},
			{
				slug: "input",
				sourceFile: "packages/basalt/src/components/input.tsx",
				propsType: "InputProps",
				surface: "Input",
			},
			{
				slug: "input-area",
				sourceFile: "packages/basalt/src/components/input-area.tsx",
				propsType: "InputAreaProps",
				surface: "InputArea",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupProps",
				surface: "InputGroup",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupInputProps",
				surface: "InputGroup.Input",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupAddonProps",
				surface: "InputGroup.Addon",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupButtonProps",
				surface: "InputGroup.Button",
			},
			{
				slug: "input-group",
				sourceFile: "packages/basalt/src/components/input-group.tsx",
				propsType: "InputGroupSuffixProps",
				surface: "InputGroup.Suffix",
				allowEmpty: true,
			},
			{
				slug: "sensitive-input",
				sourceFile: "packages/basalt/src/components/sensitive-input.tsx",
				propsType: "SensitiveInputProps",
				surface: "SensitiveInput",
			},
			{
				slug: "checkbox",
				sourceFile: "packages/basalt/src/components/checkbox.tsx",
				propsType: "CheckboxProps",
				surface: "Checkbox",
			},
			{
				slug: "checkbox",
				sourceFile: "packages/basalt/src/components/checkbox.tsx",
				propsType: "CheckboxGroupProps",
				surface: "Checkbox.Group",
			},
			{
				slug: "checkbox",
				sourceFile: "packages/basalt/src/components/checkbox.tsx",
				propsType: "CheckboxLegendProps",
				surface: "Checkbox.Legend",
				allowEmpty: true,
			},
			{
				slug: "checkbox",
				sourceFile: "packages/basalt/src/components/checkbox.tsx",
				propsType: "CheckboxItemProps",
				surface: "Checkbox.Item",
			},
			{
				slug: "radio",
				sourceFile: "packages/basalt/src/components/radio.tsx",
				propsType: "RadioProps",
				surface: "Radio",
			},
			{
				slug: "radio",
				sourceFile: "packages/basalt/src/components/radio.tsx",
				propsType: "RadioGroupProps",
				surface: "Radio.Group",
			},
			{
				slug: "radio",
				sourceFile: "packages/basalt/src/components/radio.tsx",
				propsType: "RadioLegendProps",
				surface: "Radio.Legend",
				allowEmpty: true,
			},
			{
				slug: "switch",
				sourceFile: "packages/basalt/src/components/switch.tsx",
				propsType: "SwitchProps",
				surface: "Switch",
			},
			{
				slug: "switch",
				sourceFile: "packages/basalt/src/components/switch.tsx",
				propsType: "SwitchGroupProps",
				surface: "Switch.Group",
			},
			{
				slug: "switch",
				sourceFile: "packages/basalt/src/components/switch.tsx",
				propsType: "SwitchLegendProps",
				surface: "Switch.Legend",
				allowEmpty: true,
			},
			{
				slug: "switch",
				sourceFile: "packages/basalt/src/components/switch.tsx",
				propsType: "SwitchItemProps",
				surface: "Switch.Item",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectProps",
				surface: "Select",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectTriggerProps",
				surface: "SelectTrigger",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectValueProps",
				surface: "SelectValue",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectContentProps",
				surface: "SelectContent",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectGroupProps",
				surface: "SelectGroup",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectItemProps",
				surface: "SelectItem",
			},
			{
				slug: "select",
				sourceFile: "packages/basalt/src/components/select.tsx",
				propsType: "SelectLabelProps",
				surface: "SelectLabel",
			},
			{
				slug: "combobox",
				sourceFile: "packages/basalt/src/components/combobox.tsx",
				propsType: "ComboboxProps",
				surface: "Combobox",
			},
			{
				slug: "autocomplete",
				sourceFile: "packages/basalt/src/components/autocomplete.tsx",
				propsType: "AutocompleteProps",
				surface: "Autocomplete",
			},
			{
				slug: "date-picker",
				sourceFile: "packages/basalt/src/components/date-picker.tsx",
				propsType: "DatePickerProps",
				surface: "DatePicker",
			},
			{
				slug: "slider",
				sourceFile: "packages/basalt/src/components/slider.tsx",
				propsType: "SliderProps",
				surface: "Slider",
			},
			{
				slug: "toggle",
				sourceFile: "packages/basalt/src/components/toggle.tsx",
				propsType: "ToggleProps",
				surface: "Toggle",
			},
			{
				slug: "toggle-group",
				sourceFile: "packages/basalt/src/components/toggle-group.tsx",
				propsType: "ToggleGroupSingleProps",
				surface: "ToggleGroup (Single)",
			},
			{
				slug: "toggle-group",
				sourceFile: "packages/basalt/src/components/toggle-group.tsx",
				propsType: "ToggleGroupMultipleProps",
				surface: "ToggleGroup (Multiple)",
			},
			{
				slug: "toggle-group",
				sourceFile: "packages/basalt/src/components/toggle-group.tsx",
				propsType: "ToggleGroupItemProps",
				surface: "ToggleGroupItem",
			},
			{
				slug: "segment-control",
				sourceFile: "packages/basalt/src/components/segment-control.tsx",
				propsType: "SegmentControlProps",
				surface: "SegmentControl",
			},
			{
				slug: "page-header",
				sourceFile: "packages/basalt/src/components/page-header.tsx",
				propsType: "PageHeaderProps",
				surface: "PageHeader",
			},
			{
				slug: "section-rule",
				sourceFile: "packages/basalt/src/components/section-rule.tsx",
				propsType: "SectionRuleProps",
				surface: "SectionRule",
			},
			{
				slug: "stat-strip",
				sourceFile: "packages/basalt/src/components/stat-strip.tsx",
				propsType: "StatStripProps",
				surface: "StatStrip",
			},
			{
				slug: "confirm-dialog",
				sourceFile: "packages/basalt/src/components/confirm-dialog.tsx",
				propsType: "ConfirmDialogProps",
				surface: "ConfirmDialog",
			},
			{
				slug: "confirm-dialog",
				sourceFile: "packages/basalt/src/components/confirm-dialog.tsx",
				propsType: "UseConfirmOptions",
				surface: "useConfirm",
			},
			{
				slug: "table-pager",
				sourceFile: "packages/basalt/src/components/table-pager.tsx",
				propsType: "TablePagerProps",
				surface: "TablePager",
			},
			{
				slug: "fab",
				sourceFile: "packages/basalt/src/components/fab.tsx",
				propsType: "FabProps",
				surface: "Fab",
			},
			{
				slug: "dock",
				sourceFile: "packages/basalt/src/components/dock.tsx",
				propsType: "DockProps",
				surface: "Dock",
			},
			{
				slug: "dock",
				sourceFile: "packages/basalt/src/components/dock.tsx",
				propsType: "DockBodyProps",
				surface: "DockBody",
			},
			{
				slug: "toolbar",
				sourceFile: "packages/basalt/src/components/toolbar.tsx",
				propsType: "ToolbarProps",
				surface: "Toolbar",
			},
			{
				slug: "toolbar",
				sourceFile: "packages/basalt/src/components/toolbar.tsx",
				propsType: "ToolbarButtonProps",
				surface: "Toolbar.Button",
			},
			{
				slug: "toolbar",
				sourceFile: "packages/basalt/src/components/toolbar.tsx",
				propsType: "ToolbarInputProps",
				surface: "Toolbar.Input",
			},
			{
				slug: "tabs",
				sourceFile: "packages/basalt/src/components/tabs.tsx",
				propsType: "TabsProps",
				surface: "Tabs",
			},
			{
				slug: "tabs",
				sourceFile: "packages/basalt/src/components/tabs.tsx",
				propsType: "TabsListProps",
				surface: "TabsList",
			},
			{
				slug: "tabs",
				sourceFile: "packages/basalt/src/components/tabs.tsx",
				propsType: "TabsTriggerProps",
				surface: "TabsTrigger",
			},
			{
				slug: "tabs",
				sourceFile: "packages/basalt/src/components/tabs.tsx",
				propsType: "TabsContentProps",
				surface: "TabsContent",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandPaletteProps",
				surface: "CommandPalette",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandPaletteTriggerProps",
				surface: "CommandPaletteTrigger",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandInputProps",
				surface: "CommandInput",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandListProps",
				surface: "CommandList",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandEmptyProps",
				surface: "CommandEmpty",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandGroupProps",
				surface: "CommandGroup",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandSeparatorProps",
				surface: "CommandSeparator",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandItemProps",
				surface: "CommandItem",
			},
			{
				slug: "command-palette",
				sourceFile: "packages/basalt/src/components/command-palette.tsx",
				propsType: "CommandShortcutProps",
				surface: "CommandShortcut",
				allowEmpty: true,
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarProviderProps",
				surface: "SidebarProvider",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarProps",
				surface: "Sidebar",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarHeaderProps",
				surface: "SidebarHeader",
				allowEmpty: true,
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarBrandProps",
				surface: "SidebarBrand",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarDrawerProps",
				surface: "SidebarDrawer",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarToggleProps",
				surface: "SidebarToggle",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarSearchProps",
				surface: "SidebarSearch",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarNavProps",
				surface: "SidebarNav",
				allowEmpty: true,
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarPartitionProps",
				surface: "SidebarPartition",
				allowEmpty: true,
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarItemProps",
				surface: "SidebarItem",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarIconItemProps",
				surface: "SidebarIconItem",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarGroupProps",
				surface: "SidebarGroup",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarFooterProps",
				surface: "SidebarFooter",
				allowEmpty: true,
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarUserProps",
				surface: "SidebarUser",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "ContentIslandProps",
				surface: "ContentIsland",
			},
			{
				slug: "sidebar",
				sourceFile: "packages/basalt/src/components/sidebar.tsx",
				propsType: "SidebarContextValue",
				surface: "useSidebar()",
			},
			{
				slug: "popover",
				sourceFile: "packages/basalt/src/components/popover.tsx",
				propsType: "PopoverProps",
				surface: "Popover",
			},
			{
				slug: "popover",
				sourceFile: "packages/basalt/src/components/popover.tsx",
				propsType: "PopoverTriggerProps",
				surface: "PopoverTrigger",
			},
			{
				slug: "popover",
				sourceFile: "packages/basalt/src/components/popover.tsx",
				propsType: "PopoverCloseProps",
				surface: "PopoverClose",
			},
			{
				slug: "popover",
				sourceFile: "packages/basalt/src/components/popover.tsx",
				propsType: "PopoverContentProps",
				surface: "PopoverContent",
			},
			{
				slug: "popover",
				sourceFile: "packages/basalt/src/components/popover.tsx",
				propsType: "PopoverTitleProps",
				surface: "PopoverTitle",
				allowEmpty: true,
			},
			{
				slug: "popover",
				sourceFile: "packages/basalt/src/components/popover.tsx",
				propsType: "PopoverDescriptionProps",
				surface: "PopoverDescription",
				allowEmpty: true,
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuProps",
				surface: "DropdownMenu",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuTriggerProps",
				surface: "DropdownMenuTrigger",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuGroupProps",
				surface: "DropdownMenuGroup",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuPortalProps",
				surface: "DropdownMenuPortal",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuSubProps",
				surface: "DropdownMenuSub",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuRadioGroupProps",
				surface: "DropdownMenuRadioGroup",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuContentProps",
				surface: "DropdownMenuContent",
			},
			{
				slug: "dropdown-menu",
				sourceFile: "packages/basalt/src/components/dropdown-menu.tsx",
				propsType: "DropdownMenuItemProps",
				surface: "DropdownMenuItem",
			},
			{
				slug: "collapsible",
				sourceFile: "packages/basalt/src/components/collapsible.tsx",
				propsType: "CollapsibleProps",
				surface: "Collapsible",
			},
			{
				slug: "collapsible",
				sourceFile: "packages/basalt/src/components/collapsible.tsx",
				propsType: "CollapsibleTriggerProps",
				surface: "CollapsibleTrigger",
			},
			{
				slug: "collapsible",
				sourceFile: "packages/basalt/src/components/collapsible.tsx",
				propsType: "CollapsibleContentProps",
				surface: "CollapsibleContent",
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableProps",
				surface: "Table",
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableHeaderProps",
				surface: "TableHeader",
				allowEmpty: true,
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableBodyProps",
				surface: "TableBody",
				allowEmpty: true,
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableFooterProps",
				surface: "TableFooter",
				allowEmpty: true,
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableRowProps",
				surface: "TableRow",
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableCaptionProps",
				surface: "TableCaption",
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableHeadProps",
				surface: "TableHead",
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableCellProps",
				surface: "TableCell",
			},
			{
				slug: "table",
				sourceFile: "packages/basalt/src/components/table.tsx",
				propsType: "TableSortableHeaderProps",
				surface: "TableSortableHeader",
			},
			{
				slug: "data-table",
				sourceFile: "packages/basalt/src/components/data-table.tsx",
				propsType: "DataTableProps",
				surface: "DataTable",
			},
			{
				slug: "pagination",
				sourceFile: "packages/basalt/src/components/pagination.tsx",
				propsType: "PaginationProps",
				surface: "Pagination",
			},
			{
				slug: "table-of-contents",
				sourceFile: "packages/basalt/src/components/table-of-contents.tsx",
				propsType: "TableOfContentsProps",
				surface: "TableOfContents",
			},
			{
				slug: "table-of-contents",
				sourceFile: "packages/basalt/src/components/table-of-contents.tsx",
				propsType: "TableOfContentsItemProps",
				surface: "TableOfContentsItem",
			},
			{
				slug: "code",
				sourceFile: "packages/basalt/src/components/code.tsx",
				propsType: "CodeProps",
				surface: "Code",
			},
			{
				slug: "code-block",
				sourceFile: "packages/basalt/src/components/code.tsx",
				propsType: "CodeBlockProps",
				surface: "CodeBlock",
			},
			{
				slug: "code",
				sourceFile: "packages/basalt/src/components/code.tsx",
				propsType: "CodeHighlightedProps",
				surface: "CodeHighlighted",
			},
			{
				slug: "flow",
				sourceFile: "packages/basalt/src/components/flow.tsx",
				propsType: "FlowProps",
				surface: "Flow",
			},
			{
				slug: "flow",
				sourceFile: "packages/basalt/src/components/flow.tsx",
				propsType: "FlowNodeProps",
				surface: "FlowNode",
			},
			{
				slug: "grid",
				sourceFile: "packages/basalt/src/components/grid.tsx",
				propsType: "GridProps",
				surface: "Grid",
			},
			{
				slug: "grid",
				sourceFile: "packages/basalt/src/components/grid.tsx",
				propsType: "GridItemProps",
				surface: "GridItem",
				allowEmpty: true,
			},
			{
				slug: "line",
				sourceFile: "packages/basalt/src/charts/line.tsx",
				propsType: "LineChartProps",
				surface: "LineChart",
			},
			{
				slug: "bar",
				sourceFile: "packages/basalt/src/charts/bar.tsx",
				propsType: "BarChartProps",
				surface: "BarChart",
			},
			{
				slug: "area",
				sourceFile: "packages/basalt/src/charts/area.tsx",
				propsType: "AreaChartProps",
				surface: "AreaChart",
			},
			{
				slug: "donut",
				sourceFile: "packages/basalt/src/charts/donut.tsx",
				propsType: "DonutChartProps",
				surface: "DonutChart",
			},
			{
				slug: "sparkline",
				sourceFile: "packages/basalt/src/charts/sparkline.tsx",
				propsType: "SparklineProps",
				surface: "Sparkline",
			},
			{
				slug: "gauge",
				sourceFile: "packages/basalt/src/charts/gauge.tsx",
				propsType: "GaugeProps",
				surface: "Gauge",
			},
			{
				slug: "stat-card",
				sourceFile: "packages/basalt/src/charts/stat-card.tsx",
				propsType: "StatCardProps",
				surface: "StatCard",
			},
			{
				slug: "stat-card",
				sourceFile: "packages/basalt/src/charts/stat-card.tsx",
				propsType: "StatGridProps",
				surface: "StatGrid",
			},
			{
				slug: "palette",
				sourceFile: "packages/basalt/src/charts/palette.tsx",
				propsType: "ChartPaletteProps",
				surface: "ChartPalette",
			},
			{
				slug: "slot-bar",
				sourceFile: "packages/basalt/src/charts/slot-bar.tsx",
				propsType: "SlotBarDataProps",
				surface: "SlotBarChart",
			},
			{
				slug: "slot-bar",
				sourceFile: "packages/basalt/src/charts/slot-bar.tsx",
				propsType: "SlotBarItemsProps",
				surface: "SlotBarChart.Items",
			},
			{
				slug: "grouped-bar",
				sourceFile: "packages/basalt/src/charts/grouped-bar.tsx",
				propsType: "GroupedBarChartProps",
				surface: "GroupedBarChart",
			},
			{
				slug: "stacked-bar",
				sourceFile: "packages/basalt/src/charts/stacked-bar.tsx",
				propsType: "StackedBarChartProps",
				surface: "StackedBarChart",
			},
			{
				slug: "heatmap-calendar",
				sourceFile: "packages/basalt/src/charts/heatmap-calendar.tsx",
				propsType: "HeatmapCalendarValuesProps",
				surface: "HeatmapCalendar",
			},
			{
				slug: "heatmap-calendar",
				sourceFile: "packages/basalt/src/charts/heatmap-calendar.tsx",
				propsType: "HeatmapCalendarYearProps",
				surface: "HeatmapCalendar.Year",
			},
			{
				slug: "heatmap-matrix",
				sourceFile: "packages/basalt/src/charts/heatmap-matrix.tsx",
				propsType: "HeatmapMatrixProps",
				surface: "HeatmapMatrix",
			},
			{
				slug: "radar",
				sourceFile: "packages/basalt/src/charts/radar.tsx",
				propsType: "RadarChartProps",
				surface: "RadarChart",
			},
			{
				slug: "funnel",
				sourceFile: "packages/basalt/src/charts/funnel.tsx",
				propsType: "FunnelChartProps",
				surface: "FunnelChart",
			},
			{
				slug: "bullet",
				sourceFile: "packages/basalt/src/charts/bullet.tsx",
				propsType: "BulletChartProps",
				surface: "BulletChart",
			},
			{
				slug: "timeline",
				sourceFile: "packages/basalt/src/charts/timeline.tsx",
				propsType: "TimelineItemsProps",
				surface: "Timeline",
			},
			{
				slug: "timeline",
				sourceFile: "packages/basalt/src/charts/timeline.tsx",
				propsType: "TimelineEventsProps",
				surface: "Timeline.Events",
			},
			{
				slug: "sankey",
				sourceFile: "packages/basalt/src/charts/sankey.tsx",
				propsType: "SankeyChartProps",
				surface: "SankeyChart",
			},
			{
				slug: "item-list",
				sourceFile: "packages/basalt/src/charts/item-list.tsx",
				propsType: "ItemListProps",
				surface: "ItemList",
			},
			{
				slug: "date-navigation",
				sourceFile: "packages/basalt/src/charts/date-navigation.tsx",
				propsType: "DateNavigationPickerProps",
				surface: "DateNavigation",
			},
			{
				slug: "date-navigation",
				sourceFile: "packages/basalt/src/charts/date-navigation.tsx",
				propsType: "DateNavigationDisplayProps",
				surface: "DateNavigation.Display",
			},
			{
				slug: "charts",
				sourceFile: "packages/basalt/src/charts/charts.tsx",
				propsType: "ChartsProps",
				surface: "Charts",
			},
			{
				slug: "chart-colors",
				sourceFile: "packages/basalt/src/charts/chart-colors.tsx",
				propsType: "ColorsProps",
				surface: "Colors",
			},
			{
				slug: "timeseries",
				sourceFile: "packages/basalt/src/charts/timeseries.tsx",
				propsType: "TimeseriesProps",
				surface: "Timeseries",
			},
			{
				slug: "custom-chart",
				sourceFile: "packages/basalt/src/charts/custom-chart.tsx",
				propsType: "CustomChartProps",
				surface: "CustomChart",
			},
			{
				slug: "resource-list",
				sourceFile: "packages/basalt/src/components/resource-list.tsx",
				propsType: "ResourceListProps",
				surface: "ResourceList",
			},
			{
				slug: "delete-resource",
				sourceFile: "packages/basalt/src/components/delete-resource.tsx",
				propsType: "DeleteResourceProps",
				surface: "DeleteResource",
			},
			{
				slug: "banner",
				sourceFile: "packages/basalt/src/components/banner.tsx",
				propsType: "BannerProps",
				surface: "Banner",
			},
			{
				slug: "banner",
				sourceFile: "packages/basalt/src/components/banner.tsx",
				propsType: "BannerActionProps",
				surface: "Banner.Action",
			},
			{
				slug: "toast",
				sourceFile: "packages/basalt/src/components/toast.tsx",
				propsType: "ToasterProps",
				surface: "Toaster",
				callableExport: "toast",
			},
			{
				slug: "badge",
				sourceFile: "packages/basalt/src/components/badge.tsx",
				propsType: "BadgeProps",
				surface: "Badge",
			},
			{
				slug: "empty",
				sourceFile: "packages/basalt/src/components/empty.tsx",
				propsType: "EmptyProps",
				surface: "Empty",
			},
			{
				slug: "loader",
				sourceFile: "packages/basalt/src/components/loader.tsx",
				propsType: "LoaderProps",
				surface: "Loader",
			},
			{
				slug: "skeleton-line",
				sourceFile: "packages/basalt/src/components/skeleton-line.tsx",
				propsType: "SkeletonLineProps",
				surface: "SkeletonLine",
			},
			{
				slug: "battery-meter",
				surface: "BatteryMeter",
				sourceFile: "packages/basalt/src/components/battery-meter.tsx",
				propsType: "BatteryMeterProps",
			},
			{
				slug: "meter",
				sourceFile: "packages/basalt/src/components/meter.tsx",
				propsType: "MeterProps",
				surface: "Meter",
			},
			{
				slug: "clipboard-text",
				sourceFile: "packages/basalt/src/components/clipboard-text.tsx",
				propsType: "ClipboardTextProps",
				surface: "ClipboardText",
			},
			{
				slug: "avatar",
				sourceFile: "packages/basalt/src/components/avatar.tsx",
				propsType: "AvatarProps",
				surface: "Avatar",
			},
			{
				slug: "avatar",
				sourceFile: "packages/basalt/src/components/avatar.tsx",
				propsType: "AvatarImageProps",
				surface: "AvatarImage",
			},
			{
				slug: "avatar",
				sourceFile: "packages/basalt/src/components/avatar.tsx",
				propsType: "AvatarFallbackProps",
				surface: "AvatarFallback",
			},
			{
				slug: "accordion",
				sourceFile: "packages/basalt/src/components/accordion.tsx",
				propsType: "AccordionSingleProps",
				surface: "Accordion (Single)",
			},
			{
				slug: "accordion",
				sourceFile: "packages/basalt/src/components/accordion.tsx",
				propsType: "AccordionMultipleProps",
				surface: "Accordion (Multiple)",
			},
			{
				slug: "accordion",
				sourceFile: "packages/basalt/src/components/accordion.tsx",
				propsType: "AccordionItemProps",
				surface: "AccordionItem",
			},
			{
				slug: "accordion",
				sourceFile: "packages/basalt/src/components/accordion.tsx",
				propsType: "AccordionTriggerProps",
				surface: "AccordionTrigger",
			},
			{
				slug: "accordion",
				sourceFile: "packages/basalt/src/components/accordion.tsx",
				propsType: "AccordionContentProps",
				surface: "AccordionContent",
			},
			{
				slug: "hover-card",
				sourceFile: "packages/basalt/src/components/hover-card.tsx",
				propsType: "HoverCardProps",
				surface: "HoverCard",
			},
			{
				slug: "hover-card",
				sourceFile: "packages/basalt/src/components/hover-card.tsx",
				propsType: "HoverCardTriggerProps",
				surface: "HoverCardTrigger",
			},
			{
				slug: "hover-card",
				sourceFile: "packages/basalt/src/components/hover-card.tsx",
				propsType: "HoverCardContentProps",
				surface: "HoverCardContent",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogProps",
				surface: "Dialog",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogTriggerProps",
				surface: "DialogTrigger",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogPortalProps",
				surface: "DialogPortal",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogOverlayProps",
				surface: "DialogOverlay",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogContentProps",
				surface: "DialogContent",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogTitleProps",
				surface: "DialogTitle",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogDescriptionProps",
				surface: "DialogDescription",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogCloseProps",
				surface: "DialogClose",
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogHeaderProps",
				surface: "DialogHeader",
				allowEmpty: true,
			},
			{
				slug: "dialog",
				sourceFile: "packages/basalt/src/components/dialog.tsx",
				propsType: "DialogFooterProps",
				surface: "DialogFooter",
				allowEmpty: true,
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetProps",
				surface: "Sheet",
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetTriggerProps",
				surface: "SheetTrigger",
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetCloseProps",
				surface: "SheetClose",
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetTitleProps",
				surface: "SheetTitle",
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetDescriptionProps",
				surface: "SheetDescription",
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetContentProps",
				surface: "SheetContent",
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetHeaderProps",
				surface: "SheetHeader",
				allowEmpty: true,
			},
			{
				slug: "sheet",
				sourceFile: "packages/basalt/src/components/sheet.tsx",
				propsType: "SheetFooterProps",
				surface: "SheetFooter",
				allowEmpty: true,
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogProps",
				surface: "AlertDialog",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogTriggerProps",
				surface: "AlertDialogTrigger",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogPortalProps",
				surface: "AlertDialogPortal",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogOverlayProps",
				surface: "AlertDialogOverlay",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogContentProps",
				surface: "AlertDialogContent",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogTitleProps",
				surface: "AlertDialogTitle",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogDescriptionProps",
				surface: "AlertDialogDescription",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogCancelProps",
				surface: "AlertDialogCancel",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogActionProps",
				surface: "AlertDialogAction",
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogHeaderProps",
				surface: "AlertDialogHeader",
				allowEmpty: true,
			},
			{
				slug: "alert-dialog",
				sourceFile: "packages/basalt/src/components/alert-dialog.tsx",
				propsType: "AlertDialogFooterProps",
				surface: "AlertDialogFooter",
				allowEmpty: true,
			},
			{
				slug: "context-menu",
				sourceFile: "packages/basalt/src/components/context-menu.tsx",
				propsType: "ContextMenuProps",
				surface: "ContextMenu",
			},
			{
				slug: "context-menu",
				sourceFile: "packages/basalt/src/components/context-menu.tsx",
				propsType: "ContextMenuTriggerProps",
				surface: "ContextMenuTrigger",
			},
			{
				slug: "context-menu",
				sourceFile: "packages/basalt/src/components/context-menu.tsx",
				propsType: "ContextMenuContentProps",
				surface: "ContextMenuContent",
			},
			{
				slug: "context-menu",
				sourceFile: "packages/basalt/src/components/context-menu.tsx",
				propsType: "ContextMenuItemProps",
				surface: "ContextMenuItem",
			},
			{
				slug: "context-menu",
				sourceFile: "packages/basalt/src/components/context-menu.tsx",
				propsType: "ContextMenuPanelProps",
				surface: "ContextMenuPanel",
			},
			{
				slug: "menu-bar",
				sourceFile: "packages/basalt/src/components/menu-bar.tsx",
				propsType: "MenuBarProps",
				surface: "MenuBar",
			},
			{
				slug: "menu-bar",
				sourceFile: "packages/basalt/src/components/menu-bar.tsx",
				propsType: "MenuBarRootProps",
				surface: "MenuBarRoot",
			},
			{
				slug: "menu-bar",
				sourceFile: "packages/basalt/src/components/menu-bar.tsx",
				propsType: "MenuBarMenuProps",
				surface: "MenuBarMenu",
			},
			{
				slug: "menu-bar",
				sourceFile: "packages/basalt/src/components/menu-bar.tsx",
				propsType: "MenuBarTriggerProps",
				surface: "MenuBarTrigger",
			},
			{
				slug: "menu-bar",
				sourceFile: "packages/basalt/src/components/menu-bar.tsx",
				propsType: "MenuBarContentProps",
				surface: "MenuBarContent",
			},
			{
				slug: "menu-bar",
				sourceFile: "packages/basalt/src/components/menu-bar.tsx",
				propsType: "MenuBarItemProps",
				surface: "MenuBarItem",
			},
			{
				slug: "navigation-menu",
				sourceFile: "packages/basalt/src/components/navigation-menu.tsx",
				propsType: "NavigationMenuProps",
				surface: "NavigationMenu",
			},
			{
				slug: "navigation-menu",
				sourceFile: "packages/basalt/src/components/navigation-menu.tsx",
				propsType: "NavigationMenuListProps",
				surface: "NavigationMenuList",
			},
			{
				slug: "navigation-menu",
				sourceFile: "packages/basalt/src/components/navigation-menu.tsx",
				propsType: "NavigationMenuItemProps",
				surface: "NavigationMenuItem",
			},
			{
				slug: "navigation-menu",
				sourceFile: "packages/basalt/src/components/navigation-menu.tsx",
				propsType: "NavigationMenuLinkProps",
				surface: "NavigationMenuLink",
			},
			{
				slug: "breadcrumbs",
				sourceFile: "packages/basalt/src/components/breadcrumbs.tsx",
				propsType: "BreadcrumbsProps",
				surface: "Breadcrumbs",
			},
			{
				slug: "chat-bubble",
				sourceFile: "packages/basalt/src/components/chat-bubble.tsx",
				propsType: "ChatBubbleProps",
				surface: "ChatBubble",
			},
			{
				slug: "chat-composer",
				sourceFile: "packages/basalt/src/components/chat-composer.tsx",
				propsType: "ChatComposerProps",
				surface: "ChatComposer",
			},
			{
				slug: "chat-header",
				sourceFile: "packages/basalt/src/components/chat-header.tsx",
				propsType: "ChatHeaderProps",
				surface: "ChatHeader",
			},
			{
				slug: "chat-inbox",
				sourceFile: "packages/basalt/src/components/chat-inbox.tsx",
				propsType: "ChatInboxProps",
				surface: "ChatInbox",
			},
			{
				slug: "theme-provider",
				sourceFile: "packages/basalt/src/providers/theme.tsx",
				propsType: "ThemeProviderProps",
				surface: "ThemeProvider",
			},
			{
				slug: "link-provider",
				sourceFile: "packages/basalt/src/providers/link.tsx",
				propsType: "LinkProviderProps",
				surface: "LinkProvider",
			},
			{
				slug: "thinking",
				sourceFile: "packages/basalt/src/components/thinking.tsx",
				propsType: "ThinkingProps",
				surface: "Thinking",
			},
			{
				slug: "approval-card",
				sourceFile: "packages/basalt/src/components/approval-card.tsx",
				propsType: "ApprovalCardProps",
				surface: "ApprovalCard",
			},
			{
				slug: "tool-chips",
				sourceFile: "packages/basalt/src/components/tool-chips.tsx",
				propsType: "ToolChipsProps",
				surface: "ToolChips",
			},
			{
				slug: "recommendation-card",
				sourceFile: "packages/basalt/src/components/recommendation-card.tsx",
				propsType: "RecommendationCardProps",
				surface: "RecommendationCard",
			},
			{
				slug: "context-cards",
				sourceFile: "packages/basalt/src/components/context-cards.tsx",
				propsType: "ContextCardsProps",
				surface: "ContextCards",
			},
			{
				slug: "diff-table",
				sourceFile: "packages/basalt/src/components/diff-table.tsx",
				propsType: "DiffTableProps",
				surface: "DiffTable",
			},
			{
				slug: "avatar",
				sourceFile: "packages/basalt/src/components/avatar.tsx",
				propsType: "AvatarInitialsProps",
				surface: "AvatarInitials",
			},
			{
				slug: "chat-markdown",
				sourceFile: "packages/basalt/src/components/chat-markdown.tsx",
				propsType: "ChatMarkdownProps",
				surface: "ChatMarkdown",
			},
			{
				slug: "chat-message",
				sourceFile: "packages/basalt/src/components/chat-message.tsx",
				propsType: "ChatMessageProps",
				surface: "ChatMessage",
			},
			{
				slug: "prompt-bar",
				sourceFile: "packages/basalt/src/components/prompt-bar.tsx",
				propsType: "PromptBarProps",
				surface: "PromptBar",
			},
		]);
		expect(CATALOG_API_TARGETS).toHaveLength(264);
		expect(
			CATALOG_API_TARGETS.filter((target) => target.allowEmpty === true).map(
				(target) => target.surface,
			),
		).toEqual([
			"LayerCard.Secondary",
			"LayerCard.Body",
			"LayerCard.Footer",
			"InputGroup.Suffix",
			"Checkbox.Legend",
			"Radio.Legend",
			"Switch.Legend",
			"CommandShortcut",
			"SidebarHeader",
			"SidebarNav",
			"SidebarPartition",
			"SidebarFooter",
			"PopoverTitle",
			"PopoverDescription",
			"TableHeader",
			"TableBody",
			"TableFooter",
			"GridItem",
			"DialogHeader",
			"DialogFooter",
			"SheetHeader",
			"SheetFooter",
			"AlertDialogHeader",
			"AlertDialogFooter",
		]);
		const source = readFileSync("scripts/catalog-api.ts", "utf8");
		expect(source).not.toMatch(/allowlist|propNames/);
		expect(source).not.toMatch(/Cloudflare|Kumo|Workers?\b/);
		expect(source).not.toMatch(/\bif\s*\([^)]*InputGroup|\bswitch\s*\([^)]*input-group/);
		expect(source).not.toMatch(/\bif\s*\([^)]*SensitiveInput|\bswitch\s*\([^)]*sensitive-input/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Checkbox|\bswitch\s*\([^)]*checkbox/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Radio|\bswitch\s*\([^)]*radio/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Switch|\bswitch\s*\([^)]*switch/);
		expect(source).not.toMatch(/\bif\s*\([^)]*Select|\bswitch\s*\([^)]*select/);
		expect(source).not.toMatch(/\bif\s*\([^)]*ScrollArea|\bswitch\s*\([^)]*scroll-area/);
		expect(source).not.toMatch(/\bif\s*\([^)]*SegmentControl|\bswitch\s*\([^)]*segment-control/);
		expect(source).not.toMatch(/\bif\s*\([^)]*PageHeader|\bswitch\s*\([^)]*page-header/);
		expect(source).not.toMatch(/\bif\s*\([^)]*StatStrip|\bswitch\s*\([^)]*stat-strip/);
		expect(source).not.toMatch(/\bif\s*\([^)]*ConfirmDialog|\bswitch\s*\([^)]*confirm-dialog/);
		expect(source).not.toMatch(/\bif\s*\([^)]*TablePager|\bswitch\s*\([^)]*table-pager/);
	});

	it("extracts Button props from ButtonProps in source order with CVA literals and null", () => {
		const generated = generateProductionProps();
		expect(Object.keys(generated)).toEqual([
			"inline-editable",
			"editable-nav-item",
			"icon-picker",
			"tag-badge",
			"tag-color-picker",
			"responsive-master-detail",
			"multi-select",
			"filter-bar",
			"file-dropzone",
			"upload-queue",
			"button",
			"link-button",
			"text",
			"label",
			"separator",
			"scroll-area",
			"link",
			"tooltip",
			"theme-toggle",
			"layer-card",
			"description-list",
			"basalt-mark",
			"field",
			"input",
			"input-area",
			"sensitive-input",
			"checkbox",
			"radio",
			"switch",
			"combobox",
			"autocomplete",
			"date-picker",
			"slider",
			"toggle",
			"toggle-group",
			"segment-control",
			"page-header",
			"section-rule",
			"stat-strip",
			"confirm-dialog",
			"table-pager",
			"fab",
			"dock",
			"toolbar",
			"tabs",
			"command-palette",
			"sidebar",
			"popover",
			"dropdown-menu",
			"collapsible",
			"table",
			"data-table",
			"pagination",
			"table-of-contents",
			"code",
			"code-block",
			"flow",
			"grid",
			"line",
			"bar",
			"area",
			"donut",
			"sparkline",
			"gauge",
			"stat-card",
			"palette",
			"slot-bar",
			"grouped-bar",
			"stacked-bar",
			"heatmap-calendar",
			"heatmap-matrix",
			"radar",
			"funnel",
			"bullet",
			"timeline",
			"sankey",
			"item-list",
			"date-navigation",
			"charts",
			"chart-colors",
			"timeseries",
			"custom-chart",
			"resource-list",
			"delete-resource",
			"banner",
			"toast",
			"badge",
			"empty",
			"loader",
			"skeleton-line",
			"battery-meter",
			"meter",
			"clipboard-text",
			"avatar",
			"accordion",
			"hover-card",
			"dialog",
			"sheet",
			"alert-dialog",
			"context-menu",
			"menu-bar",
			"navigation-menu",
			"breadcrumbs",
			"chat-bubble",
			"chat-composer",
			"chat-header",
			"chat-inbox",
			"theme-provider",
			"link-provider",
			"thinking",
			"approval-card",
			"tool-chips",
			"recommendation-card",
			"context-cards",
			"diff-table",
			"chat-markdown",
			"chat-message",
			"prompt-bar",
		]);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated.button).toEqual([
			{
				name: "variant",
				type: '"default" | "destructive" | "ghost" | "link" | "outline" | "secondary" | null',
				required: false,
				default: '"default"',
				description: "Visual style variant.",
			},
			{
				name: "size",
				type: '"default" | "icon-sm" | "icon" | "lg" | "sm" | null',
				required: false,
				default: '"default"',
				description: "Sizing preset.",
			},
			{
				name: "asChild",
				type: "boolean",
				required: false,
				default: "false",
				description:
					"Pass control to child element slot.\n\nNote: Child element must forward props and ref in all states. When disabled or loading,\nasChild suppresses click, keyboard activation (Enter/Space), and pointer handlers on both\nchild and parent while retaining browser default Tab navigation without trapping focus.\nTo preserve single DOM node layout and avoid unexpected child layout shifts, no internal\nspinner is inserted in asChild loading mode; visual disabled state is expressed via aria-disabled.",
			},
			{
				name: "type",
				type: '"button" | "reset" | "submit"',
				required: false,
				default: '"button"',
				description: "Button type attribute.",
			},
			{
				name: "loading",
				type: "boolean",
				required: false,
				default: "false",
				description: "Display loading spinner and disable interactions.",
			},
			{
				name: "icon",
				type: "React.ReactNode",
				required: false,
				description: "Optional leading icon slot.",
			},
		]);
	}, 60_000);

	it("extracts ScrollArea props without inherited Radix, DOM, event, or ARIA inventory", () => {
		const generated = generateProductionProps();
		expect(generated["scroll-area"]).toEqual([
			{
				name: "className",
				type: "string",
				required: false,
				description: "Classes applied to the non-scrolling root.",
			},
			{
				name: "orientation",
				type: "ScrollAreaOrientation",
				required: false,
				default: '"vertical"',
				description: "Axes that may scroll.",
			},
			{
				name: "viewportClassName",
				type: "string",
				required: false,
				description: "Classes applied to the actual scrolling viewport.",
			},
		]);
		for (const inherited of [
			"children",
			"onScroll",
			"tabIndex",
			"role",
			"aria-label",
			"id",
			"type",
			"scrollHideDelay",
		]) {
			expect(
				generated["scroll-area"]?.some((prop) => prop.name === inherited),
				inherited,
			).toBe(false);
		}
	}, 60_000);

	it("extracts LinkButton props from the same file without Button-only or DOM fields", () => {
		const generated = generateProductionProps();
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated["link-button"]).toEqual([
			{
				name: "variant",
				type: '"default" | "destructive" | "ghost" | "link" | "outline" | "secondary" | null',
				required: false,
				default: '"default"',
				description: "Visual style variant.",
			},
			{
				name: "size",
				type: '"default" | "icon-sm" | "icon" | "lg" | "sm" | null',
				required: false,
				default: '"default"',
				description: "Sizing preset.",
			},
			{
				name: "icon",
				type: "React.ReactNode",
				required: false,
				description: "Optional leading icon slot.",
			},
		]);
		expect(generated["link-button"]?.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated["link-button"]?.some((prop) => prop.name === "loading")).toBe(false);
		expect(generated["link-button"]?.some((prop) => prop.name === "href")).toBe(false);
		expect(generated["link-button"]?.some((prop) => prop.name === "className")).toBe(false);
	}, 60_000);

	it("extracts Text props from TextProps without HTML or Kumo-only fields", () => {
		const generated = generateProductionProps();
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.text).toEqual([
			{
				name: "variant",
				type: "TextVariant",
				required: false,
				default: '"body"',
				description: "Visual role. Does not infer document outline.",
			},
			{
				name: "size",
				type: "TextSize",
				required: false,
				description: "Type scale. Defaults by variant: body md, heading lg, mono sm.",
			},
			{
				name: "tone",
				type: "TextTone",
				required: false,
				default: '"default"',
				description: "Foreground tone.",
			},
			{
				name: "as",
				type: "TextElement",
				required: false,
				description: "Rendered HTML element. Defaults by variant: body p, heading/mono span.",
			},
			{
				name: "bold",
				type: "boolean",
				required: false,
				default: "false",
				description: "Apply semibold weight.",
			},
			{
				name: "truncate",
				type: "boolean",
				required: false,
				default: "false",
				description: "Ellipsize overflow on one line.",
			},
		]);
		expect(generated.text?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.text?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.text?.some((prop) => prop.name === "id")).toBe(false);
	}, 60_000);

	it("extracts Label props from LabelProps with JSDoc defaults and descriptions", () => {
		const generated = generateProductionProps();
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.label).toEqual([
			{
				name: "showOptional",
				type: "boolean",
				required: false,
				default: "false",
				description: "Show gray (optional) after the label.",
			},
			{
				name: "tooltip",
				type: "React.ReactNode",
				required: false,
				description: "Info icon with hover text.",
			},
		]);
		expect(generated.label?.some((prop) => prop.name === "htmlFor")).toBe(false);
		expect(generated.label?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.label?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.label?.some((prop) => prop.name === "asContent")).toBe(false);
	}, 60_000);

	it("extracts Separator props from SeparatorProps with JSDoc defaults and descriptions", () => {
		const generated = generateProductionProps();
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.separator).toEqual([
			{
				name: "orientation",
				type: '"horizontal" | "vertical"',
				required: false,
				default: "horizontal",
				description: "The orientation of the separator.",
			},
			{
				name: "decorative",
				type: "boolean",
				required: false,
				default: "true",
				description: "Whether the separator is purely decorative.",
			},
		]);
		expect(generated.separator?.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated.separator?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.separator?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.separator?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
	}, 60_000);

	it("extracts Link props from LinkProps as a single required href", () => {
		const generated = generateProductionProps();
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.link).toEqual([
			{
				name: "href",
				type: "string",
				required: true,
				description: "The link destination.",
			},
		]);
		expect(generated.link?.[0]).not.toHaveProperty("default");
		expect(generated.link?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "target")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "rel")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "download")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated.link?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
	}, 60_000);

	it("extracts Tooltip props from TooltipProps with open and duration controls", () => {
		const generated = generateProductionProps();
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
	}, 60_000);

	it("extracts ThemeToggle props from ThemeToggleProps as optional aria-label, tooltip and labels", () => {
		const generated = generateProductionProps();
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
		expect(generated["theme-toggle"]).toEqual([
			{
				name: "aria-label",
				type: "string",
				required: false,
				description:
					"Fixed accessible name. Defaults to the label of the theme the next click switches to.",
			},
			{
				name: "tooltip",
				type: "boolean",
				required: false,
				default: "true",
				description: "Show a bottom tooltip naming the theme the next click switches to.",
			},
			{
				name: "labels",
				type: "Partial<ThemeToggleLabels>",
				required: false,
				description:
					"Labels naming each next theme (`light`, `dark`, `system`); omitted keys keep the English\ndefaults.",
			},
		]);
		expect(generated["theme-toggle"]?.[0]).not.toHaveProperty("default");
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "type")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "variant")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "size")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "loading")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "icon")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "asChild")).toBe(false);
		expect(generated["theme-toggle"]?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
	}, 60_000);

	it("extracts LayerCard root props from LayerCardProps", () => {
		const generated = generateProductionProps();
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual([
			"className",
			"outlined",
			"padding",
		]);
		expect(generated["layer-card"]).toEqual([
			{
				name: "className",
				type: "string",
				required: false,
				description: "Additional classes for the card root.",
			},
			{
				name: "outlined",
				type: "boolean",
				required: false,
				default: "false",
				description: "Strengthen the default perimeter hairline.",
			},
			{
				name: "padding",
				type: '"lg" | "md" | "none" | "sm" | "xl"',
				required: false,
				default: '"md"',
				description: "Inner spacing for unstructured card content.",
			},
		]);
		expect(generated["layer-card"]?.[0]).not.toHaveProperty("default");
		expect(generated["layer-card"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "role")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated["layer-card"]?.some((prop) => prop.name === "data-kind")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
	}, 60_000);

	it("extracts BasaltMark props from BasaltMarkProps as a single optional className", () => {
		const generated = generateProductionProps();
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
		expect(generated["basalt-mark"]).toEqual([
			{
				name: "className",
				type: "string",
				required: false,
				description: "Additional classes for the mark.",
			},
		]);
		expect(generated["basalt-mark"]?.[0]).not.toHaveProperty("default");
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "role")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "strokeWidth")).toBe(false);
		expect(generated["basalt-mark"]?.some((prop) => prop.name === "absoluteStrokeWidth")).toBe(
			false,
		);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual([
			"className",
			"outlined",
			"padding",
		]);
	}, 60_000);

	it("extracts Field props from FieldProps in source order with required label and children", () => {
		const generated = generateProductionProps();
		expect(generated.field?.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"required",
			"labelTooltip",
			"className",
			"children",
		]);
		expect(generated.field).toEqual([
			{
				name: "label",
				type: "React.ReactNode",
				required: true,
				description: "Visible label.",
			},
			{
				name: "htmlFor",
				type: "string",
				required: false,
				description: "Associates the label and described-by ids.",
			},
			{
				name: "hint",
				type: "React.ReactNode",
				required: false,
				description: "Supporting text when there is no error.",
			},
			{
				name: "error",
				type: "FieldError",
				required: false,
				description: "Replaces the hint and marks the control invalid.",
			},
			{
				name: "required",
				type: "boolean",
				required: false,
				description: "When false, show (optional) after the label.",
			},
			{
				name: "labelTooltip",
				type: "React.ReactNode",
				required: false,
				description: "Info icon with hover text on the label.",
			},
			{
				name: "className",
				type: "string",
				required: false,
				description: "Additional classes for the field root.",
			},
			{
				name: "children",
				type: "React.ReactNode",
				required: true,
				description: "The control or content to render.",
			},
		]);
		expect(generated.field?.every((prop) => !("default" in prop))).toBe(true);
		expect(generated.field?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated.field?.some((prop) => prop.name === "style")).toBe(false);
		expect(generated.field?.some((prop) => prop.name === "onClick")).toBe(false);
		expect(generated.field?.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual([
			"className",
			"outlined",
			"padding",
		]);
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
	}, 60_000);

	it("extracts Input props from InputProps as type, size, and passwordManagerIgnore", () => {
		const generated = generateProductionProps();
		expect(generated.input?.map((prop) => prop.name)).toEqual([
			"type",
			"size",
			"passwordManagerIgnore",
		]);
		expect(generated.input).toEqual([
			{
				name: "type",
				type: "React.HTMLInputTypeAttribute",
				required: false,
				description: "The type of input control to render.",
			},
			{
				name: "size",
				type: "InputSize",
				required: false,
				default: "default",
				description: "The visual size of the input.",
			},
			{
				name: "passwordManagerIgnore",
				type: "boolean",
				required: false,
				default: "false",
				description: "Ignore password managers on this field.",
			},
		]);
		expect(generated.input?.[0]).not.toHaveProperty("default");
		expect(generated.input?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "name")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "value")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "defaultValue")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "placeholder")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "required")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "onChange")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated.input?.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual([
			"className",
			"outlined",
			"padding",
		]);
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
		expect(generated.field?.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"required",
			"labelTooltip",
			"className",
			"children",
		]);
	}, 60_000);

	it("extracts InputArea props from InputAreaProps as rows, size, and passwordManagerIgnore", () => {
		const generated = generateProductionProps();
		expect(generated["input-area"]?.map((prop) => prop.name)).toEqual([
			"rows",
			"size",
			"passwordManagerIgnore",
		]);
		expect(generated["input-area"]).toEqual([
			{
				name: "rows",
				type: "number",
				required: false,
				description: "The visible text row count.",
			},
			{
				name: "size",
				type: "InputAreaSize",
				required: false,
				default: "default",
				description: "The visual size of the text area.",
			},
			{
				name: "passwordManagerIgnore",
				type: "boolean",
				required: false,
				default: "false",
				description: "Ignore password managers on this field.",
			},
		]);
		expect(generated["input-area"]?.[0]).not.toHaveProperty("default");
		expect(generated["input-area"]?.some((prop) => prop.name === "className")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "id")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "name")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "value")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "defaultValue")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "placeholder")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "disabled")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "required")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "aria-label")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "onChange")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "children")).toBe(false);
		expect(generated["input-area"]?.some((prop) => prop.name === "ref")).toBe(false);
		expect(generated.button?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"asChild",
			"type",
			"loading",
			"icon",
		]);
		expect(generated["link-button"]?.map((prop) => prop.name)).toEqual(["variant", "size", "icon"]);
		expect(generated.text?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"tone",
			"as",
			"bold",
			"truncate",
		]);
		expect(generated.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(generated.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(generated.link?.map((prop) => prop.name)).toEqual(["href"]);
		expect(generated.tooltip?.map((prop) => prop.name)).toEqual([
			"children",
			"open",
			"defaultOpen",
			"onOpenChange",
			"delayDuration",
			"disableHoverableContent",
		]);
		expect(generated["theme-toggle"]?.map((prop) => prop.name)).toEqual([
			"aria-label",
			"tooltip",
			"labels",
		]);
		expect(generated["layer-card"]?.map((prop) => prop.name)).toEqual([
			"className",
			"outlined",
			"padding",
		]);
		expect(generated["basalt-mark"]?.map((prop) => prop.name)).toEqual(["className"]);
		expect(generated.field?.map((prop) => prop.name)).toEqual([
			"label",
			"htmlFor",
			"hint",
			"error",
			"required",
			"labelTooltip",
			"className",
			"children",
		]);
		expect(generated.input?.map((prop) => prop.name)).toEqual([
			"type",
			"size",
			"passwordManagerIgnore",
		]);
	}, 60_000);

	it("emits a locally quoted property name", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	"aria-label": string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "aria-label", type: "string", required: true }]);
	});

	it("filters DOM, event, ARIA, and className inheritance", () => {
		const root = fixture({
			"dom.ts": `export interface Dom {
	className?: string;
	onClick?: () => void;
	"aria-label"?: string;
}
`,
			"widget.ts": `import type { Dom } from "./dom";
export interface WidgetProps extends Dom {
	tone?: "a" | "b";
}
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "tone", type: '"a" | "b"', required: false }]);
	});

	it("sorts props by source declaration position, not name", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	zebra?: boolean;
	alpha?: boolean;
}
`,
		});
		expect(fixtureProps(root)?.map((prop) => prop.name)).toEqual(["zebra", "alpha"]);
	});

	it("strips top-level undefined and keeps null", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	value?: string | null | undefined;
	label: string | undefined;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "value", type: "string | null", required: false },
			{ name: "label", type: "string", required: true },
		]);
	});

	it("strips top-level undefined from required and optional Maybe aliases", () => {
		const root = fixture({
			"widget.ts": `type Maybe = string | undefined;
export interface WidgetProps {
	required: Maybe;
	optional?: Maybe;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "required", type: "string", required: true },
			{ name: "optional", type: "string", required: false },
		]);
	});

	it("copies available JSDoc onto generated props", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/** Enables the spinner. */
	loading?: boolean;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{
				name: "loading",
				type: "boolean",
				required: false,
				description: "Enables the spinner.",
			},
		]);
	});

	it("reads a single non-empty JSDoc default without mixing other tags into description", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/**
	 * Enables the spinner.
	 * @see https://example.test/spinner
	 * @example true
	 * @default false
	 */
	loading?: boolean;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{
				name: "loading",
				type: "boolean",
				required: false,
				default: "false",
				description: "Enables the spinner.",
			},
		]);
	});

	it("fails closed on an empty JSDoc default", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/**
	 * Count.
	 * @default
	 */
	count?: number;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/empty @default for count/);
	});

	it("fails closed on duplicate JSDoc defaults", () => {
		const root = fixture({
			"widget.ts": `export interface WidgetProps {
	/**
	 * Count.
	 * @default 0
	 * @default 1
	 */
	count?: number;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/duplicate @default for count/);
	});
});

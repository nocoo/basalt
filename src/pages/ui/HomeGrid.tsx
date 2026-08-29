import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link as BasaltLink } from "@nocoo/basalt/components/link";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { Text } from "@nocoo/basalt/components/text";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { CircleCheck, Plus, Search } from "lucide-react";
import { type ComponentType, useState } from "react";
import { Link } from "react-router";
import { CATALOG } from "./catalog";
import { UI_DEMOS } from "./demos";

const SHOWCASE: { name: string; slug: string }[] = [
	{ name: "Button", slug: "button" },
	{ name: "Input", slug: "input" },
	{ name: "Select", slug: "select" },
	{ name: "Toolbar", slug: "toolbar" },
	{ name: "Autocomplete", slug: "autocomplete" },
	{ name: "Combobox", slug: "combobox" },
	{ name: "Switch", slug: "switch" },
	{ name: "Input (with validation)", slug: "input" },
	{ name: "Dialog", slug: "dialog" },
	{ name: "Tooltip", slug: "tooltip" },
	{ name: "Dropdown", slug: "dropdown-menu" },
	{ name: "Collapsible", slug: "collapsible" },
	{ name: "Checkbox", slug: "checkbox" },
	{ name: "LayerCard", slug: "layer-card" },
	{ name: "Loader", slug: "loader" },
	{ name: "SkeletonLine", slug: "skeleton-line" },
	{ name: "CodeHighlighted", slug: "code" },
	{ name: "Banner", slug: "banner" },
	{ name: "Tabs", slug: "tabs" },
	{ name: "Badge", slug: "badge" },
	{ name: "Toast", slug: "toast" },
	{ name: "Pagination", slug: "pagination" },
	{ name: "InputArea", slug: "input-area" },
	{ name: "InputGroup", slug: "input-group" },
	{ name: "Meter", slug: "meter" },
	{ name: "DatePicker", slug: "date-picker" },
	{ name: "Breadcrumbs", slug: "breadcrumbs" },
	{ name: "ClipboardText", slug: "clipboard-text" },
	{ name: "Command Palette", slug: "command-palette" },
	{ name: "Flow", slug: "flow" },
	{ name: "Link", slug: "link" },
	{ name: "Empty", slug: "empty" },
	{ name: "Grid", slug: "grid" },
	{ name: "Label", slug: "label" },
	{ name: "Popover", slug: "popover" },
	{ name: "Radio", slug: "radio" },
	{ name: "SensitiveInput", slug: "sensitive-input" },
	{ name: "Table", slug: "table" },
	{ name: "TableOfContents", slug: "table-of-contents" },
	{ name: "Text", slug: "text" },
];

function HomeButton() {
	return (
		<div className="grid gap-3">
			<Button variant="outline" icon={<Plus />}>
				Create project
			</Button>
			<Button icon={<Plus />}>Create project</Button>
			<Button variant="outline" loading>
				Create project
			</Button>
		</div>
	);
}

function HomeInput() {
	return (
		<div className="grid w-[200px] gap-3">
			<Input placeholder="Type something..." />
			<Input defaultValue="Invalid!" className="border-destructive" />
		</div>
	);
}

function HomeSwitch() {
	const [on, setOn] = useState(true);
	return <Switch checked={on} onCheckedChange={setOn} aria-label="Notifications" />;
}

function HomeInputValidation() {
	return (
		<Field label="Email" htmlFor="home-email" error="Please enter a valid email.">
			<Input
				id="home-email"
				type="email"
				placeholder="name@example.com"
				defaultValue="name@example.com"
				className="border-destructive"
			/>
		</Field>
	);
}

function HomeTooltip() {
	return (
		<TooltipProvider>
			<div className="flex gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size="icon" variant="outline" aria-label="Add">
							<Plus />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Add</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button size="icon" variant="outline" aria-label="Search">
							<Search />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Search</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}

function HomeCheckbox() {
	const [checked, setChecked] = useState(true);
	return (
		<div className="flex items-center gap-2 text-sm">
			<Checkbox
				checked={checked}
				onCheckedChange={(value) => setChecked(value === true)}
				aria-label="Max bandwidth"
			/>
			<span>Max bandwidth</span>
		</div>
	);
}

function HomeLayerCard() {
	return (
		<LayerCard className="w-[200px]">
			<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
			<LayerCard.Primary>Hello</LayerCard.Primary>
		</LayerCard>
	);
}

function HomeBanner() {
	return <Banner className="max-w-[220px]" title="Update available" />;
}

function HomeInputGroup() {
	return (
		<InputGroup className="max-w-[220px]">
			<InputGroup.Input defaultValue="kumo" aria-label="Subdomain" />
			<InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
			<InputGroup.Addon align="end">
				<CircleCheck className="text-basalt-heatmap-green-3" />
			</InputGroup.Addon>
		</InputGroup>
	);
}

function HomeLink() {
	return (
		<LinkProvider>
			<div className="flex flex-col gap-2 text-sm">
				<BasaltLink href="#default">Default link</BasaltLink>
			</div>
		</LinkProvider>
	);
}

function HomeLabel() {
	return (
		<div className="flex flex-col gap-2">
			<Label>Default Label</Label>
			<Label htmlFor="home-optional">Optional Field</Label>
		</div>
	);
}

function HomeRadio() {
	return (
		<RadioGroup defaultValue="option1" className="grid gap-2" aria-label="Select option">
			<div className="flex items-center gap-2 text-sm">
				<Radio value="option1" aria-label="Option 1" />
				<span>Option 1</span>
			</div>
			<div className="flex items-center gap-2 text-sm">
				<Radio value="option2" aria-label="Option 2" />
				<span>Option 2</span>
			</div>
		</RadioGroup>
	);
}

function HomeText() {
	return (
		<div className="flex flex-col gap-1">
			<Text size="lg">Large Bold Text</Text>
			<Text>Regular text content</Text>
			<Text size="sm" tone="muted">
				Small subtle text
			</Text>
		</div>
	);
}

function HomeSensitiveInput() {
	return <SensitiveInput aria-label="API key" revealLabel="Show" hideLabel="Hide" />;
}

function HomeInputArea() {
	return <InputArea aria-label="Notes" placeholder="Enter your name" />;
}

function HomeSeparator() {
	return (
		<div className="w-[200px] space-y-3">
			<Text>Above</Text>
			<Separator />
			<Text>Below</Text>
		</div>
	);
}

function HomeThemeToggle() {
	return (
		<ThemeProvider>
			<ThemeToggle aria-label="Toggle theme" />
		</ThemeProvider>
	);
}

const HOME_DEMOS: Record<string, ComponentType> = {
	button: HomeButton,
	input: HomeInput,
	switch: HomeSwitch,
	tooltip: HomeTooltip,
	checkbox: HomeCheckbox,
	"layer-card": HomeLayerCard,
	banner: HomeBanner,
	"input-group": HomeInputGroup,
	link: HomeLink,
	label: HomeLabel,
	radio: HomeRadio,
	text: HomeText,
	"sensitive-input": HomeSensitiveInput,
	"input-area": HomeInputArea,
	separator: HomeSeparator,
	"theme-toggle": HomeThemeToggle,
};

const extraTiles = CATALOG.filter(
	(entry) => entry.category !== "docs" && !SHOWCASE.some((tile) => tile.slug === entry.slug),
).map((entry) => ({ name: entry.name, slug: entry.slug }));

const TILES = [...SHOWCASE, ...extraTiles];

function tileDemo(tile: { name: string; slug: string }): ComponentType | undefined {
	if (tile.name === "Input (with validation)") {
		return HomeInputValidation;
	}
	return HOME_DEMOS[tile.slug] ?? UI_DEMOS[tile.slug];
}

export function HomeGrid() {
	return (
		<ul className="grid auto-rows-min grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{TILES.map((tile) => {
				const Demo = tileDemo(tile);
				return (
					<li
						key={tile.name}
						className="relative flex aspect-square items-center justify-center overflow-hidden bg-white"
					>
						<Link
							to={`/ui/${tile.slug}`}
							className="absolute top-4 left-4 z-10 text-base font-medium text-muted-foreground hover:text-foreground"
						>
							{tile.name}
						</Link>
						<div className="flex w-full items-center justify-center p-8 pt-14">
							{Demo ? <Demo /> : null}
						</div>
					</li>
				);
			})}
		</ul>
	);
}

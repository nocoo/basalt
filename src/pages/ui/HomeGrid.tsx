import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
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
import { catalogNavName } from "./catalog";
import type { CatalogIndexGroup, CatalogIndexItem } from "./catalog-index";

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
			<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
			<InputGroup.Suffix>.example.com</InputGroup.Suffix>
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
			<Label showOptional>Optional Field</Label>
			<Label tooltip="More information about this field">With Tooltip</Label>
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

function itemDemo(item: CatalogIndexItem): ComponentType | undefined {
	if (item.pageStatus !== "ready") {
		return undefined;
	}
	return HOME_DEMOS[item.entry.slug] ?? item.hero.render;
}

export interface HomeGridProps {
	groups: readonly CatalogIndexGroup[];
}

export function HomeGrid({ groups }: HomeGridProps) {
	return (
		<div className="space-y-12">
			{groups.map((group) => (
				<section key={group.id} aria-labelledby={`catalog-group-${group.id}`} className="space-y-5">
					<div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
						<h2
							id={`catalog-group-${group.id}`}
							className="text-2xl font-semibold tracking-tight text-foreground"
						>
							{group.label}
						</h2>
						<span className="text-sm text-muted-foreground">{group.items.length} items</span>
					</div>
					<ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
						{group.items.map((item) => {
							const Demo = itemDemo(item);
							const title = catalogNavName(item.entry);
							const titleClass =
								"text-sm font-medium text-foreground underline-offset-4 hover:underline";
							return (
								<li
									key={item.entry.slug}
									data-catalog-card={item.entry.slug}
									className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-border bg-bright"
								>
									<div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
										{item.pageStatus === "ready" ? (
											<Link to={`/ui/${item.entry.slug}`} className={titleClass}>
												{title}
											</Link>
										) : (
											<span className="text-sm font-medium text-muted-foreground">{title}</span>
										)}
										<div className="flex items-center gap-1.5">
											<Badge variant="outline" data-release-status={item.releaseStatus}>
												{item.releaseStatus === "stable" ? "Stable" : "Catalog"}
											</Badge>
											<Badge
												variant={item.pageStatus === "ready" ? "success" : "secondary"}
												data-page-status={item.pageStatus}
											>
												{item.pageStatus === "ready" ? "Ready" : "Planned"}
											</Badge>
										</div>
									</div>
									<div className="flex min-h-36 flex-1 items-center justify-center p-6">
										{Demo ? <Demo /> : null}
									</div>
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
}

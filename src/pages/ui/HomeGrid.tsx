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
import { SectionRule } from "@nocoo/basalt/components/section-rule";
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
import { catalogCategoryPath } from "./catalog-categories";
import type { CatalogIndexGroup, CatalogIndexItem } from "./catalog-index";

function HomeButton() {
	return (
		<div className="grid gap-basalt-layout">
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
		<div className="grid w-[12.5rem] gap-basalt-layout">
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
			<div className="flex gap-basalt-space-lg">
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
		<div className="flex items-center gap-basalt-space-lg text-basalt-base">
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
		<LayerCard className="w-[12.5rem]">
			<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
			<LayerCard.Primary>Hello</LayerCard.Primary>
		</LayerCard>
	);
}

function HomeBanner() {
	return <Banner className="max-w-[13.75rem]" title="Update available" />;
}

function HomeInputGroup() {
	return (
		<InputGroup className="max-w-[13.75rem]">
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
			<div className="flex flex-col gap-basalt-space-lg text-basalt-base">
				<BasaltLink href="#default">Default link</BasaltLink>
			</div>
		</LinkProvider>
	);
}

function HomeLabel() {
	return (
		<div className="flex flex-col gap-basalt-space-lg">
			<Label>Default Label</Label>
			<Label showOptional>Optional Field</Label>
			<Label tooltip="More information about this field">With Tooltip</Label>
		</div>
	);
}

function HomeRadio() {
	return (
		<RadioGroup
			defaultValue="option1"
			className="grid gap-basalt-layout"
			aria-label="Select option"
		>
			<div className="flex items-center gap-basalt-space-lg text-basalt-base">
				<Radio value="option1" aria-label="Option 1" />
				<span>Option 1</span>
			</div>
			<div className="flex items-center gap-basalt-space-lg text-basalt-base">
				<Radio value="option2" aria-label="Option 2" />
				<span>Option 2</span>
			</div>
		</RadioGroup>
	);
}

function HomeText() {
	return (
		<div className="flex flex-col gap-basalt-space-sm">
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
		<div className="w-[12.5rem] space-y-basalt-space-lg">
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
		<div className="space-y-basalt-layout-lg">
			{groups.map((group) => (
				<SectionRule
					key={group.id}
					aria-label={group.label}
					title={group.label}
					actions={
						<div className="flex flex-wrap items-center gap-basalt-space-lg text-basalt-base">
							<Link
								to={catalogCategoryPath(group.id)}
								aria-label={`${group.label} overview`}
								className="text-basalt-primary hover:underline underline-offset-4"
							>
								Overview
							</Link>
							<span className="text-muted-foreground">{group.items.length} items</span>
						</div>
					}
				>
					<ul className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 2xl:grid-cols-3">
						{group.items.map((item) => {
							const Demo = itemDemo(item);
							const title = catalogNavName(item.entry);
							const titleClass =
								"text-basalt-base font-medium text-foreground underline-offset-4 hover:underline";
							return (
								<li key={item.entry.slug} data-catalog-card={item.entry.slug} className="min-w-0">
									<LayerCard className="h-full min-h-48">
										<LayerCard.Header className="flex-wrap">
											{item.pageStatus === "ready" ? (
												<Link to={`/ui/${item.entry.slug}`} className={titleClass}>
													{title}
												</Link>
											) : (
												<span className="text-basalt-base font-medium text-muted-foreground">
													{title}
												</span>
											)}
											<div className="flex items-center gap-basalt-space-md">
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
										</LayerCard.Header>
										<LayerCard.Body className="flex min-h-36 flex-1 items-center justify-center">
											{Demo ? <Demo /> : null}
										</LayerCard.Body>
									</LayerCard>
								</li>
							);
						})}
					</ul>
				</SectionRule>
			))}
		</div>
	);
}

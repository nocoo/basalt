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
				Add health record
			</Button>
			<Button icon={<Plus />}>Add health record</Button>
			<Button variant="outline" loading>
				Add health record
			</Button>
		</div>
	);
}

function HomeInput() {
	return (
		<div className="grid w-[12.5rem] gap-basalt-layout">
			<Input placeholder="Search health records" />
			<Input defaultValue="Invalid date" className="border-destructive" />
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
			<span>Share with care team</span>
		</div>
	);
}

function HomeLayerCard() {
	return (
		<LayerCard className="w-[12.5rem]">
			<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
			<LayerCard.Primary>Review care plan</LayerCard.Primary>
		</LayerCard>
	);
}

function HomeBanner() {
	return <Banner className="max-w-[13.75rem]" title="New lab results available" />;
}

function HomeInputGroup() {
	return (
		<InputGroup className="max-w-[13.75rem]">
			<InputGroup.Input defaultValue="primary" aria-label="Care provider" />
			<InputGroup.Suffix> clinic</InputGroup.Suffix>
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
				<BasaltLink href="#health-summary">View health summary</BasaltLink>
			</div>
		</LinkProvider>
	);
}

function HomeLabel() {
	return (
		<div className="flex flex-col gap-basalt-space-lg">
			<Label>Medication name</Label>
			<Label showOptional>Care notes</Label>
			<Label tooltip="Visible only to your care team">Care team notes</Label>
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
				<span>Today</span>
			</div>
			<div className="flex items-center gap-basalt-space-lg text-basalt-base">
				<Radio value="option2" aria-label="Option 2" />
				<span>This week</span>
			</div>
		</RadioGroup>
	);
}

function HomeText() {
	return (
		<div className="flex flex-col gap-basalt-space-sm">
			<Text size="lg">Health at a glance</Text>
			<Text>Regular check-in notes</Text>
			<Text size="sm" tone="muted">
				Updated a few minutes ago
			</Text>
		</div>
	);
}

function HomeSensitiveInput() {
	return (
		<SensitiveInput aria-label="Health record access code" revealLabel="Show" hideLabel="Hide" />
	);
}

function HomeInputArea() {
	return <InputArea aria-label="Health notes" placeholder="Add a note for your care team" />;
}

function HomeSeparator() {
	return (
		<div className="w-[12.5rem] space-y-basalt-space-lg">
			<Text>Symptoms</Text>
			<Separator />
			<Text>Care plan</Text>
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
		<div className="space-y-basalt-layout-xl">
			{groups.map((group) => (
				<SectionRule
					variant="heading"
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
					<ul className="grid min-w-0 grid-cols-1 border-t border-basalt-border md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
						{group.items.map((item) => {
							const Demo = itemDemo(item);
							const title = catalogNavName(item.entry);
							const titleClass =
								"text-basalt-base font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
							return (
								<li
									key={item.entry.slug}
									data-catalog-card={item.entry.slug}
									className="min-w-0 border-b border-basalt-border md:border-r md:max-lg:nth-[2n]:border-r-0 lg:max-2xl:nth-[3n]:border-r-0 2xl:nth-[4n]:border-r-0"
								>
									<div className="flex min-w-0 max-w-full min-h-48 flex-col gap-basalt-layout p-basalt-card">
										{item.pageStatus === "ready" ? (
											<Link to={`/ui/${item.entry.slug}`} className={titleClass}>
												{title}
											</Link>
										) : (
											<span className="text-basalt-base font-medium text-muted-foreground">
												{title}
											</span>
										)}
										<div className="flex min-w-0 max-w-full min-h-36 flex-1 items-center justify-center pt-basalt-space-lg [&>*]:max-w-full">
											{Demo ? <Demo /> : null}
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				</SectionRule>
			))}
		</div>
	);
}

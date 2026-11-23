import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Input } from "@nocoo/basalt/components/input";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Kbd } from "@nocoo/basalt/components/kbd";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link as BasaltLink } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { Progress } from "@nocoo/basalt/components/progress";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { Separator } from "@nocoo/basalt/components/separator";
import {
	Sidebar,
	SidebarBrand,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
	SidebarSearch,
	SidebarToggle,
} from "@nocoo/basalt/components/sidebar";
import { Spinner } from "@nocoo/basalt/components/spinner";
import { Switch } from "@nocoo/basalt/components/switch";
import { Text } from "@nocoo/basalt/components/text";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { toast } from "@nocoo/basalt/components/toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { ArrowUp, ChevronRight, CircleCheck, Home, Plus, Search, Users } from "lucide-react";
import { type ComponentType, useState } from "react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";
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
			<Input defaultValue="Invalid date" className="border-basalt-danger-solid" />
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
			<LayerCard.Header>Next Steps</LayerCard.Header>
			<LayerCard.Well>Review care plan</LayerCard.Well>
		</LayerCard>
	);
}

function HomeBanner() {
	return (
		<Banner
			title="New lab results available"
			description="Two visit summaries were added to your care timeline."
		/>
	);
}

function HomeToast() {
	return (
		<div className="flex flex-wrap items-center justify-center gap-basalt-space-lg">
			<Button variant="outline" onClick={() => toast("Care summary saved")}>
				Default
			</Button>
			<Button variant="outline" onClick={() => toast.success("Lab results synced")}>
				Success
			</Button>
			<Button variant="outline" onClick={() => toast.danger("Could not sync records")}>
				Danger
			</Button>
		</div>
	);
}

function HomeInputGroup() {
	return (
		<InputGroup className="max-w-[15rem]">
			<InputGroup.Input defaultValue="atlas-care" aria-label="Care portal" />
			<InputGroup.Suffix>.basalt.dev</InputGroup.Suffix>
			<InputGroup.Addon align="end">
				<CircleCheck className="text-basalt-success" />
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

function HomeTextarea() {
	return <Textarea aria-label="Health notes" placeholder="Add a note for your care team" />;
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

const HOME_SIDEBAR_DESTINATIONS = [
	{ label: "New chat", icon: Plus, href: "/ui/sidebar?destination=new-chat" },
	{ label: "Home", icon: Home, href: "/ui/sidebar?destination=home" },
	{ label: "Invite patients", icon: Users, href: "/ui/sidebar?destination=invite" },
] as const;

const HOME_SIDEBAR_CHATS = ["Patient records", "Follow-up notes", "Care plan review"] as const;

function HomeSidebar() {
	const [collapsed, setCollapsed] = useState(false);
	const [active, setActive] = useState("Home");
	return (
		<SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
			<Sidebar className="h-[19rem] max-w-full">
				<SidebarHeader>
					<SidebarBrand
						logo={
							<span aria-hidden="true" className="grid size-5 place-items-center font-semibold">
								BO
							</span>
						}
						name="Basalt Ops"
						version="v1.0"
						action={
							<SidebarToggle
								collapseLabel="Collapse navigation preview"
								expandLabel="Expand navigation preview"
							/>
						}
					/>
				</SidebarHeader>
				<SidebarNav aria-label="Preview care team navigation">
					<SidebarSearch onClick={() => setActive("Search")}>Search</SidebarSearch>
					{HOME_SIDEBAR_DESTINATIONS.map(({ label, icon: Icon, href }) =>
						collapsed ? (
							<SidebarIconItem
								key={label}
								href={href}
								active={active === label}
								aria-label={label}
								title={label}
								onClick={(event) => {
									event.preventDefault();
									setActive(label);
								}}
							>
								<Icon aria-hidden="true" />
							</SidebarIconItem>
						) : (
							<SidebarItem
								key={label}
								href={href}
								active={active === label}
								onClick={(event) => {
									event.preventDefault();
									setActive(label);
								}}
							>
								<Icon aria-hidden="true" />
								<span className="truncate">{label}</span>
							</SidebarItem>
						),
					)}
					{!collapsed && (
						<SidebarGroup label="Chats">
							{HOME_SIDEBAR_CHATS.map((label) => (
								<SidebarItem key={label} active={active === label} onClick={() => setActive(label)}>
									<span className="truncate">{label}</span>
								</SidebarItem>
							))}
						</SidebarGroup>
					)}
				</SidebarNav>
				<SidebarFooter>
					<Button variant="outline" size={collapsed ? "icon-sm" : "md"} aria-label="Upgrade">
						{collapsed ? <ArrowUp aria-hidden="true" /> : "Upgrade"}
					</Button>
				</SidebarFooter>
			</Sidebar>
		</SidebarProvider>
	);
}

function HomeLoader() {
	return <Loader label="Preparing care report" elapsedDelayMs={0} />;
}

function HomeThemeToggle() {
	return (
		<ThemeProvider>
			<ThemeToggle aria-label="Toggle theme" />
		</ThemeProvider>
	);
}

function HomeBadge() {
	return (
		<div className="flex flex-wrap items-center justify-center gap-basalt-space-lg">
			<Badge>Neutral</Badge>
			<Badge tone="info" dot>
				Syncing
			</Badge>
			<Badge tone="success" variant="outline">
				Active
			</Badge>
			<Badge tone="warning" variant="solid">
				Review
			</Badge>
		</div>
	);
}

function HomeKbd() {
	return (
		<div className="flex flex-wrap items-center justify-center gap-basalt-space-lg">
			<div className="flex items-center gap-basalt-space-xs">
				<Kbd>⌘</Kbd>
				<Kbd>K</Kbd>
			</div>
			<div className="flex items-center gap-basalt-space-xs">
				<Kbd>⌘</Kbd>
				<Kbd>⇧</Kbd>
				<Kbd>P</Kbd>
			</div>
			<Kbd size="md">Esc</Kbd>
		</div>
	);
}

function HomeProgress() {
	return (
		<div className="grid w-[12.5rem] gap-basalt-layout-sm">
			<Progress aria-label="Initial upload progress" value={25} size="sm" />
			<Progress aria-label="Verification progress" value={68} tone="warning" />
			<Progress aria-label="Release readiness" value={100} size="lg" tone="success" />
		</div>
	);
}

function HomeSpinner() {
	return (
		<div className="flex items-center gap-basalt-layout text-basalt-muted-foreground">
			<Spinner size="sm" label="Small loading spinner" />
			<Spinner size="md" label="Medium loading spinner" />
			<Spinner size="lg" label="Large loading spinner" className="text-basalt-foreground" />
		</div>
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
	toast: HomeToast,
	"input-group": HomeInputGroup,
	link: HomeLink,
	label: HomeLabel,
	radio: HomeRadio,
	text: HomeText,
	"sensitive-input": HomeSensitiveInput,
	textarea: HomeTextarea,
	separator: HomeSeparator,
	sidebar: HomeSidebar,
	loader: HomeLoader,
	"theme-toggle": HomeThemeToggle,
	badge: HomeBadge,
	kbd: HomeKbd,
	progress: HomeProgress,
	spinner: HomeSpinner,
};

function itemDemo(item: CatalogIndexItem): ComponentType | undefined {
	if (item.pageStatus !== "ready") {
		return undefined;
	}
	return HOME_DEMOS[item.entry.slug] ?? item.hero.render;
}

type GallerySpan = "compact" | "wide" | "full";

const CELL_BORDER_CLASS = "min-w-0 border-b border-r border-basalt-border";
const GROUP_CARD_CLASSES: Record<GallerySpan, string> = {
	compact: `${CELL_BORDER_CLASS} @[60rem]/island:col-span-2 @[84rem]/island:col-span-1`,
	wide: `${CELL_BORDER_CLASS} @[44rem]/island:col-span-2 @[60rem]/island:col-span-3 @[84rem]/island:col-span-2`,
	full: `${CELL_BORDER_CLASS} col-span-full`,
};
const TABLE_CARD_CLASS = CELL_BORDER_CLASS;
const WIDE_TABLE_CARD_CLASS = `${CELL_BORDER_CLASS} @[44rem]/island:col-span-2`;

const TABLE_CARD_SLUGS = ["table", "data-table", "table-pager"] as const;
const FULL_GALLERY_SLUGS = new Set(["table", "data-table", "skeleton"]);
const WIDE_GALLERY_SLUGS = new Set([
	"tag-badge",
	"multi-select",
	"tag-color-picker",
	"banner",
	"toast",
	"code",
	"code-block",
	"file-dropzone",
	"upload-queue",
	"stat-card",
	"grid",
	"filter-bar",
	"editable-nav-item",
	"responsive-master-detail",
	"chart",
	"sheet",
	"page-header",
	"resource-list",
]);
const STRETCH_PREVIEW_SLUGS = new Set([
	"table",
	"data-table",
	"skeleton",
	"tag-badge",
	"tag-color-picker",
	"banner",
	"code",
	"code-block",
	"file-dropzone",
	"upload-queue",
	"stat-card",
	"filter-bar",
	"responsive-master-detail",
	"chart",
	"page-header",
	"resource-list",
]);

function gallerySpan(slug: string): GallerySpan {
	if (FULL_GALLERY_SLUGS.has(slug)) return "full";
	if (WIDE_GALLERY_SLUGS.has(slug)) return "wide";
	return "compact";
}

interface CatalogCardProps {
	item: CatalogIndexItem;
	className: string;
}

function CatalogCard({ item, className }: CatalogCardProps) {
	const Demo = itemDemo(item);
	const title = catalogNavName(item.entry);
	const span = gallerySpan(item.entry.slug);
	const stretch = STRETCH_PREVIEW_SLUGS.has(item.entry.slug);
	const titleClass =
		"basalt-focus min-w-0 max-w-full text-basalt-base font-medium text-basalt-foreground [overflow-wrap:anywhere] underline-offset-4 hover:underline";
	return (
		<li data-catalog-card={item.entry.slug} data-gallery-span={span} className={className}>
			<div className="flex min-w-0 max-w-full min-h-48 flex-col gap-basalt-layout p-basalt-card">
				{item.pageStatus === "ready" ? (
					<Link to={`/ui/${item.entry.slug}`} className={titleClass}>
						{title}
					</Link>
				) : (
					<span className="text-basalt-base font-medium text-basalt-muted-foreground">{title}</span>
				)}
				<div
					data-gallery-preview=""
					className={cn(
						"flex min-h-36 min-w-0 max-w-full flex-1 items-center justify-start overflow-x-auto p-basalt-space-lg [&>*]:min-w-0 [&>*]:max-w-full sm:justify-center-safe",
						stretch && "[&>*]:w-full",
					)}
				>
					{Demo ? <Demo /> : null}
				</div>
			</div>
		</li>
	);
}

function partitionTableCards(groups: readonly CatalogIndexGroup[]): {
	tables: CatalogIndexItem[];
	componentGroups: CatalogIndexGroup[];
} {
	const tableSlugs = new Set<string>(TABLE_CARD_SLUGS);
	const bySlug = new Map(
		groups.flatMap((group) => group.items).map((item) => [item.entry.slug, item]),
	);
	const tables = TABLE_CARD_SLUGS.flatMap((slug) => {
		const item = bySlug.get(slug);
		return item ? [item] : [];
	});
	return {
		tables,
		componentGroups: groups
			.map((group) => ({
				...group,
				items: group.items.filter((item) => !tableSlugs.has(item.entry.slug)),
			}))
			.filter((group) => group.items.length > 0),
	};
}

export interface HomeGridProps {
	groups: readonly CatalogIndexGroup[];
}

export function HomeGrid({ groups }: HomeGridProps) {
	const { tables, componentGroups } = partitionTableCards(groups);
	return (
		<div className="space-y-basalt-layout-lg">
			{tables.length > 0 ? (
				<section className="min-w-0 max-w-full" aria-label="Tables">
					<LayerCard padding="none">
						<LayerCard.Header divided className="flex-wrap items-center">
							<div className="flex min-w-0 flex-wrap items-center gap-basalt-space-lg">
								<h2>Tables</h2>
								<Badge
									variant="outline"
									className="font-normal tabular-nums text-basalt-muted-foreground"
								>
									{tables.length} items
								</Badge>
							</div>
						</LayerCard.Header>
						<ul className="-mb-px -mr-px grid min-w-0 grid-cols-1 @[44rem]/island:grid-cols-2">
							{tables.map((item) => (
								<CatalogCard
									key={item.entry.slug}
									item={item}
									className={
										FULL_GALLERY_SLUGS.has(item.entry.slug)
											? WIDE_TABLE_CARD_CLASS
											: TABLE_CARD_CLASS
									}
								/>
							))}
						</ul>
					</LayerCard>
				</section>
			) : null}
			{componentGroups.map((group) => (
				<section key={group.id} className="min-w-0 max-w-full" aria-label={group.label}>
					<LayerCard padding="none">
						<LayerCard.Header divided className="flex-wrap items-center">
							<div className="flex min-w-0 flex-wrap items-center gap-basalt-space-lg">
								<h2>{group.label}</h2>
								<Badge
									variant="outline"
									className="font-normal tabular-nums text-basalt-muted-foreground"
								>
									{group.items.length} items
								</Badge>
							</div>
							<Link
								to={catalogCategoryPath(group.id)}
								aria-label={`${group.label} overview`}
								className="basalt-focus -my-basalt-space-xs inline-flex items-center gap-basalt-space-xs rounded-basalt-sm px-basalt-space-sm py-basalt-space-xs text-basalt-md font-medium tracking-normal text-basalt-muted-foreground no-underline transition-colors basalt-motion hover:bg-basalt-hover hover:text-basalt-foreground"
							>
								<span>Overview</span>
								<ChevronRight className="size-basalt-icon-sm shrink-0" aria-hidden="true" />
							</Link>
						</LayerCard.Header>
						<ul className="-mb-px -mr-px grid min-w-0 grid-cols-1 @[44rem]/island:grid-cols-2 @[60rem]/island:grid-cols-6 @[84rem]/island:grid-cols-4">
							{group.items.map((item) => (
								<CatalogCard
									key={item.entry.slug}
									item={item}
									className={GROUP_CARD_CLASSES[gallerySpan(item.entry.slug)]}
								/>
							))}
						</ul>
					</LayerCard>
				</section>
			))}
		</div>
	);
}

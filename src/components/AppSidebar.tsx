import { Avatar, AvatarFallback, AvatarImage } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { Separator } from "@nocoo/basalt/components/separator";
import {
	Sidebar,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
	SidebarPartition,
	SidebarSearch,
	SidebarUser,
} from "@nocoo/basalt/components/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@nocoo/basalt/components/tooltip";
import {
	Accessibility,
	Activity,
	AlignLeft,
	AppWindow,
	Award,
	BarChart3,
	Bell,
	BookOpen,
	Boxes,
	Calendar,
	CalendarDays,
	CalendarRange,
	ChartArea,
	ChartColumn,
	ChartColumnStacked,
	ChartLine,
	ChartPie,
	ChevronRight,
	ChevronsDown,
	ChevronsDownUp,
	ChevronsUpDown,
	Circle,
	Clipboard,
	Code,
	Columns3,
	Command,
	CreditCard,
	Download,
	Ellipsis,
	ExternalLink,
	Eye,
	EyeOff,
	FileCode,
	FileQuestion,
	FileText,
	Filter,
	FormInput,
	Gauge,
	GitBranch,
	GitFork,
	Globe,
	Hash,
	HeartHandshake,
	HeartPulse,
	History,
	IdCard,
	Inbox,
	Layers,
	LayoutDashboard,
	LayoutGrid,
	LayoutTemplate,
	LineChart,
	Link2,
	List,
	Loader,
	LogIn,
	LogOut,
	Megaphone,
	Menu,
	MessageCircle,
	MessageSquare,
	Minus,
	Mountain,
	MousePointer2,
	MousePointerClick,
	Navigation,
	Palette,
	PanelLeft,
	PanelRight,
	PanelTop,
	PenTool,
	PiggyBank,
	Radar,
	RectangleEllipsis,
	ScrollText,
	Search,
	Settings,
	SlidersHorizontal,
	Sparkles,
	Square,
	SquareCheck,
	Sun,
	SwatchBook,
	Table,
	Table2,
	Tag,
	Terminal,
	TextCursorInput,
	ToggleLeft,
	ToggleRight,
	Trash2,
	TrendingUp,
	TriangleAlert,
	Type,
	UserRound,
	Wallet,
	Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import {
	CATALOG,
	CATALOG_CATEGORIES,
	type CatalogEntry,
	catalogNavName,
	libraryDocEntries,
	libraryNavEntries,
} from "@/pages/ui/catalog";
import { type CatalogPageStatus, catalogPageStatus } from "@/pages/ui/catalog-page-status";

// ── Navigation data model ──

interface NavItem {
	titleKey?: string;
	title?: string;
	icon: React.ElementType;
	path: string;
	badge?: number;
	external?: boolean;
	catalogSlug?: string;
	pageStatus?: CatalogPageStatus;
}

interface NavGroup {
	labelKey?: string;
	label?: string;
	items: NavItem[];
	defaultOpen?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
	{
		labelKey: "nav.blocks",
		defaultOpen: true,
		items: [
			{ titleKey: "nav.dashboard", icon: LayoutDashboard, path: "/" },
			{ titleKey: "nav.components", icon: RectangleEllipsis, path: "/components" },
			{ titleKey: "nav.health", icon: HeartPulse, path: "/health" },
			{ titleKey: "nav.accounts", icon: Wallet, path: "/accounts" },
			{ titleKey: "nav.progressTracking", icon: PiggyBank, path: "/progress-tracking" },
			{ titleKey: "nav.flowComparison", icon: TrendingUp, path: "/flow-comparison" },
			{ titleKey: "nav.portfolio", icon: LineChart, path: "/portfolio" },
			{ titleKey: "nav.interactions", icon: Layers, path: "/interactions", badge: 3 },
		],
	},
	{
		labelKey: "nav.scenarios",
		defaultOpen: true,
		items: [
			{ titleKey: "nav.wearableHealth", icon: HeartPulse, path: "/wearable" },
			{ titleKey: "nav.bankingWealth", icon: Wallet, path: "/banking" },
			{ titleKey: "nav.networkOps", icon: LineChart, path: "/network" },
		],
	},
	{
		labelKey: "nav.controls",
		defaultOpen: true,
		items: [
			{ titleKey: "nav.interactive", icon: MousePointerClick, path: "/interactive" },
			{ titleKey: "nav.data", icon: Eye, path: "/data" },
			{ titleKey: "nav.forms", icon: FormInput, path: "/forms" },
			{ titleKey: "nav.navigation", icon: Navigation, path: "/navigation" },
		],
	},
	{
		labelKey: "nav.pages",
		defaultOpen: true,
		items: [
			{ titleKey: "nav.login", icon: LogIn, path: "/login", external: true },
			{ titleKey: "nav.badgeLogin", icon: IdCard, path: "/badge-login", external: true },
			{ titleKey: "nav.staticPage", icon: FileText, path: "/static-page", external: true },
			{ titleKey: "nav.loading", icon: Loader, path: "/loading", external: true },
			{ titleKey: "nav.notFoundPage", icon: FileQuestion, path: "/404", external: true },
		],
	},
	{
		labelKey: "nav.system",
		defaultOpen: true,
		items: [
			{ titleKey: "nav.layout", icon: LayoutGrid, path: "/layout" },
			{ titleKey: "nav.colorPalette", icon: Palette, path: "/palette" },
			{ titleKey: "nav.settings", icon: Settings, path: "/settings" },
		],
	},
];

const LIBRARY_HOME: NavItem = { titleKey: "nav.kitIndex", icon: BookOpen, path: "/ui" };

const CATALOG_ICONS: Record<string, React.ElementType> = {
	button: RectangleEllipsis,
	"link-button": ExternalLink,
	text: Type,
	label: Tag,
	separator: Minus,
	link: Link2,
	tooltip: MessageCircle,
	"theme-toggle": Sun,
	"layer-card": Square,
	"basalt-mark": Mountain,
	field: FormInput,
	input: TextCursorInput,
	"input-area": AlignLeft,
	"input-group": Columns3,
	"sensitive-input": EyeOff,
	checkbox: SquareCheck,
	radio: Circle,
	switch: ToggleLeft,
	select: ChevronsUpDown,
	combobox: ChevronsUpDown,
	autocomplete: Search,
	"date-picker": Calendar,
	slider: SlidersHorizontal,
	toggle: ToggleRight,
	"toggle-group": ToggleRight,
	badge: Award,
	banner: Megaphone,
	empty: Inbox,
	loader: Loader,
	"skeleton-line": Minus,
	meter: Gauge,
	toast: Bell,
	"clipboard-text": Clipboard,
	code: Code,
	"code-block": FileCode,
	avatar: UserRound,
	accordion: ChevronsDownUp,
	dialog: AppWindow,
	"alert-dialog": TriangleAlert,
	popover: MessageSquare,
	"dropdown-menu": Menu,
	"context-menu": MousePointer2,
	"hover-card": CreditCard,
	sheet: PanelRight,
	"command-palette": Command,
	tabs: Columns3,
	table: Table,
	"data-table": Table2,
	pagination: Ellipsis,
	collapsible: ChevronsDown,
	breadcrumbs: ChevronRight,
	"navigation-menu": Navigation,
	"menu-bar": PanelTop,
	toolbar: Wrench,
	"table-of-contents": List,
	grid: LayoutGrid,
	sidebar: PanelLeft,
	flow: GitBranch,
	"theme-provider": Palette,
	"link-provider": Link2,
	"stat-card": Hash,
	"slot-bar": BarChart3,
	bar: ChartColumn,
	line: ChartLine,
	area: ChartArea,
	donut: ChartPie,
	"grouped-bar": ChartColumnStacked,
	"stacked-bar": ChartColumnStacked,
	sparkline: Activity,
	"heatmap-calendar": CalendarDays,
	gauge: Gauge,
	radar: Radar,
	funnel: Filter,
	bullet: Minus,
	timeline: History,
	sankey: GitFork,
	"item-list": List,
	"date-navigation": CalendarRange,
	palette: SwatchBook,
	charts: BarChart3,
	timeseries: ChartLine,
	maps: Globe,
	"custom-chart": Sparkles,
	"page-header": LayoutTemplate,
	"resource-list": List,
	"delete-resource": Trash2,
	installation: Download,
	contributing: HeartHandshake,
	colors: Palette,
	accessibility: Accessibility,
	figma: PenTool,
	cli: Terminal,
	skill: Sparkles,
	registry: Boxes,
	changelog: ScrollText,
	"chart-colors": SwatchBook,
};

const CATALOG_PAGE_STATUS_BY_SLUG = new Map(
	CATALOG.map((entry) => [entry.slug, catalogPageStatus(entry.slug)]),
);

function catalogNavItem(entry: CatalogEntry, fallbackIcon: React.ElementType): NavItem {
	return {
		title: catalogNavName(entry),
		path: `/ui/${entry.slug}`,
		icon: CATALOG_ICONS[entry.slug] ?? fallbackIcon,
		catalogSlug: entry.slug,
		pageStatus: CATALOG_PAGE_STATUS_BY_SLUG.get(entry.slug),
	};
}

const LIBRARY_GROUPS: NavGroup[] = CATALOG_CATEGORIES.map((category) => ({
	label: category.label,
	defaultOpen: true,
	items: libraryNavEntries(category.id).map((entry) => catalogNavItem(entry, RectangleEllipsis)),
}));

const ALL_NAV_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), LIBRARY_HOME];

function itemTitle(item: NavItem, t: (key: string) => string) {
	return item.title ?? t(item.titleKey ?? "");
}

function groupLabel(group: NavGroup, t: (key: string) => string) {
	return group.label ?? t(group.labelKey ?? "");
}

function commandSearchMatches(value: string, query: string) {
	const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	const normalizedValue = value.toLocaleLowerCase();
	return tokens.every((token) => normalizedValue.includes(token));
}

function catalogCommandValue(entry: CatalogEntry) {
	return `${catalogNavName(entry)} ${entry.name} ${entry.slug}`;
}

function NavItemButton({ item, currentPath }: { item: NavItem; currentPath: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const isPlanned = item.pageStatus === "planned";
	return (
		<SidebarItem
			active={!isPlanned && !item.external && currentPath === item.path}
			disabled={isPlanned}
			data-catalog-slug={item.catalogSlug}
			onClick={
				isPlanned
					? undefined
					: () =>
							item.external
								? window.open(item.path, "_blank", "noopener,noreferrer")
								: navigate(item.path)
			}
		>
			<item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
			<span className="flex-1 truncate text-left">{itemTitle(item, t)}</span>
			{item.external ? (
				<span className="flex h-7 w-7 shrink-0 items-center justify-center">
					<ExternalLink className="h-3 w-3 text-basalt-muted-foreground" strokeWidth={1.5} />
				</span>
			) : null}
			{item.badge ? (
				<span className="flex h-7 w-7 shrink-0 items-center justify-center">
					<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-badge-red px-1.5 text-[11px] font-medium text-badge-red-foreground">
						{item.badge}
					</span>
				</span>
			) : null}
			{isPlanned ? (
				<Badge variant="outline" data-page-status="planned" className="ml-auto shrink-0">
					Planned
				</Badge>
			) : null}
		</SidebarItem>
	);
}

function NavGroupSection({ group, currentPath }: { group: NavGroup; currentPath: string }) {
	const { t } = useTranslation();
	return (
		<SidebarGroup label={groupLabel(group, t)} defaultOpen={group.defaultOpen ?? true}>
			{group.items.map((item) => (
				<NavItemButton key={item.path} item={item} currentPath={currentPath} />
			))}
		</SidebarGroup>
	);
}

function LibraryNav({ currentPath }: { currentPath: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	return (
		<div className="pb-3">
			<div className="mt-2 flex flex-col gap-0.5 px-3">
				<SidebarItem active={currentPath === "/ui"} onClick={() => navigate("/ui")}>
					<BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.5} />
					<span className="flex-1 text-left">{t("nav.kitIndex")}</span>
				</SidebarItem>
				{libraryDocEntries().map((entry) => (
					<NavItemButton
						key={entry.slug}
						item={catalogNavItem(entry, FileText)}
						currentPath={currentPath}
					/>
				))}
			</div>
			{LIBRARY_GROUPS.map((group) => (
				<NavGroupSection key={group.label} group={group} currentPath={currentPath} />
			))}
		</div>
	);
}

function CollapsedNavItem({ item, currentPath }: { item: NavItem; currentPath: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<SidebarIconItem
					active={!item.external && currentPath === item.path}
					onClick={() =>
						item.external
							? window.open(item.path, "_blank", "noopener,noreferrer")
							: navigate(item.path)
					}
				>
					<item.icon className="h-4 w-4" strokeWidth={1.5} />
					{item.badge ? (
						<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-badge-red px-1 text-[10px] font-medium text-badge-red-foreground">
							{item.badge}
						</span>
					) : null}
				</SidebarIconItem>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={8}>
				{itemTitle(item, t)}
			</TooltipContent>
		</Tooltip>
	);
}

// ── Main sidebar component ──

interface AppSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const handleSearchOpenChange = useCallback((open: boolean) => {
		setSearchOpen(open);
		if (!open) {
			setSearchQuery("");
		}
	}, []);

	// ⌘K / Ctrl+K shortcut
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				handleSearchOpenChange(!searchOpen);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleSearchOpenChange, searchOpen]);

	const handleSelect = useCallback(
		(path: string) => {
			setSearchOpen(false);
			setSearchQuery("");
			navigate(path);
		},
		[navigate],
	);
	const commandNavGroups = NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => commandSearchMatches(itemTitle(item, t), searchQuery)),
	})).filter((group) => group.items.length > 0);
	const commandLibraryHomeMatches = commandSearchMatches(t("nav.kitIndex"), searchQuery);
	const commandCatalogEntries = CATALOG.filter((entry) =>
		commandSearchMatches(catalogCommandValue(entry), searchQuery),
	);

	return (
		<Sidebar collapsed={collapsed}>
			{collapsed ? (
				<div className="flex h-screen w-[68px] flex-col items-center">
					<SidebarHeader className="justify-center px-0">
						<Mountain className="h-5 w-5 text-basalt-primary" strokeWidth={1.5} />
					</SidebarHeader>
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggle}
						aria-label={t("common.expandSidebar")}
						className="mb-1"
					>
						<PanelLeft aria-hidden="true" />
					</Button>
					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild>
							<SidebarIconItem
								className="mb-2"
								onClick={() => setSearchOpen(true)}
								aria-label={`${t("common.search")} (⌘K)`}
							>
								<Search aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
							</SidebarIconItem>
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={8}>
							{t("common.search")} (⌘K)
						</TooltipContent>
					</Tooltip>
					<SidebarNav className="w-full items-center gap-1 pt-1">
						{ALL_NAV_ITEMS.map((item) => (
							<CollapsedNavItem key={item.path} item={item} currentPath={pathname} />
						))}
					</SidebarNav>
					<SidebarFooter className="flex w-full justify-center px-0">
						<Tooltip delayDuration={0}>
							<TooltipTrigger asChild>
								<Avatar className="h-9 w-9 cursor-pointer">
									<AvatarImage src="https://avatar.vercel.sh/acme" alt="User" />
									<AvatarFallback className="text-xs">ZL</AvatarFallback>
								</Avatar>
							</TooltipTrigger>
							<TooltipContent side="right" sideOffset={8}>
								Zheng Li
							</TooltipContent>
						</Tooltip>
					</SidebarFooter>
				</div>
			) : (
				<div className="flex h-screen w-[260px] flex-col">
					<SidebarHeader>
						<div className="flex w-full items-center justify-between px-3">
							<div className="flex items-center gap-3">
								<Mountain className="h-5 w-5 text-basalt-primary" strokeWidth={1.5} />
								<span className="text-lg font-semibold text-basalt-foreground md:text-xl">
									basalt.
								</span>
								<span className="rounded-md bg-basalt-secondary px-1.5 py-0.5 text-[10px] leading-none font-medium text-basalt-muted-foreground">
									v{__APP_VERSION__}
								</span>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7"
								onClick={onToggle}
								aria-label={t("common.collapseSidebar")}
							>
								<PanelLeft aria-hidden="true" />
							</Button>
						</div>
					</SidebarHeader>
					<div className="px-3 pb-1">
						<SidebarSearch onClick={() => setSearchOpen(true)}>{t("common.search")}</SidebarSearch>
					</div>
					<SidebarNav className="pt-1">
						<SidebarPartition>{t("nav.examples")}</SidebarPartition>
						{NAV_GROUPS.map((group) => (
							<NavGroupSection key={group.labelKey} group={group} currentPath={pathname} />
						))}
						<Separator className="mx-6 my-3 w-auto" />
						<SidebarPartition>{t("nav.kit")}</SidebarPartition>
						<LibraryNav currentPath={pathname} />
					</SidebarNav>
					<SidebarFooter>
						<SidebarUser
							name="Zheng Li"
							email="zhengli@example.com"
							avatar={
								<Avatar className="h-9 w-9 shrink-0">
									<AvatarImage src="https://avatar.vercel.sh/acme" alt="User" />
									<AvatarFallback className="text-xs">ZL</AvatarFallback>
								</Avatar>
							}
							action={
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 shrink-0"
									aria-label={t("common.logOut")}
								>
									<LogOut aria-hidden="true" />
								</Button>
							}
						/>
					</SidebarFooter>
				</div>
			)}
			<CommandPalette open={searchOpen} onOpenChange={handleSearchOpenChange} shouldFilter={false}>
				<CommandInput
					placeholder={t("common.searchPages")}
					value={searchQuery}
					onValueChange={setSearchQuery}
				/>
				<CommandList>
					<CommandEmpty>{t("common.noResults")}</CommandEmpty>
					{commandNavGroups.map((group) => (
						<CommandGroup key={group.labelKey} heading={groupLabel(group, t)}>
							{group.items.map((item) => (
								<CommandItem
									key={item.path}
									value={itemTitle(item, t)}
									onSelect={() => handleSelect(item.path)}
									className="cursor-pointer gap-3"
								>
									<item.icon className="h-4 w-4 text-basalt-muted-foreground" strokeWidth={1.5} />
									<span>{itemTitle(item, t)}</span>
								</CommandItem>
							))}
						</CommandGroup>
					))}
					{commandLibraryHomeMatches || commandCatalogEntries.length > 0 ? (
						<CommandGroup heading={t("nav.kit")}>
							{commandLibraryHomeMatches ? (
								<CommandItem
									value={t("nav.kitIndex")}
									onSelect={() => handleSelect("/ui")}
									className="cursor-pointer gap-3"
								>
									<BookOpen className="h-4 w-4 text-basalt-muted-foreground" strokeWidth={1.5} />
									<span>{t("nav.kitIndex")}</span>
								</CommandItem>
							) : null}
							{commandCatalogEntries.map((entry) => {
								const isPlanned = CATALOG_PAGE_STATUS_BY_SLUG.get(entry.slug) === "planned";
								return (
									<CommandItem
										key={entry.slug}
										value={catalogCommandValue(entry)}
										disabled={isPlanned}
										data-catalog-slug={entry.slug}
										onSelect={isPlanned ? undefined : () => handleSelect(`/ui/${entry.slug}`)}
										className={isPlanned ? "gap-3" : "cursor-pointer gap-3"}
									>
										<span>{catalogNavName(entry)}</span>
										{isPlanned ? (
											<Badge
												variant="outline"
												data-page-status="planned"
												className="ml-auto shrink-0"
											>
												Planned
											</Badge>
										) : null}
									</CommandItem>
								);
							})}
						</CommandGroup>
					) : null}
				</CommandList>
			</CommandPalette>
		</Sidebar>
	);
}

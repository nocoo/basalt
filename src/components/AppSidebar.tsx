import { Tooltip, TooltipContent, TooltipTrigger } from "@nocoo/basalt/components/tooltip";
import {
	Activity,
	AlignLeft,
	AppWindow,
	Award,
	BarChart3,
	Bell,
	BookOpen,
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
	ChevronUp,
	Circle,
	Clipboard,
	Code,
	Columns3,
	Command,
	CreditCard,
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
	Hash,
	HeartPulse,
	History,
	IdCard,
	Inbox,
	Layers,
	LayoutDashboard,
	LayoutGrid,
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
	PiggyBank,
	Radar,
	RectangleEllipsis,
	Search,
	Settings,
	SlidersHorizontal,
	Square,
	SquareCheck,
	Sun,
	SwatchBook,
	Table,
	Table2,
	Tag,
	TextCursorInput,
	ToggleLeft,
	ToggleRight,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CATALOG, CATALOG_CATEGORIES } from "@/pages/ui/catalog";

// ── Navigation data model ──

interface NavItem {
	titleKey?: string;
	title?: string;
	icon: React.ElementType;
	path: string;
	badge?: number;
	external?: boolean;
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
};

const LIBRARY_GROUPS: NavGroup[] = CATALOG_CATEGORIES.map((category) => ({
	label: category.label,
	defaultOpen: true,
	items: CATALOG.filter((entry) => entry.category === category.id).map((entry) => ({
		title: entry.name,
		path: `/ui/${entry.slug}`,
		icon: CATALOG_ICONS[entry.slug] ?? RectangleEllipsis,
	})),
}));

const ALL_NAV_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), LIBRARY_HOME];

function navItemClass(active: boolean) {
	return cn(
		"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-normal transition-colors",
		active
			? "bg-accent text-foreground"
			: "text-muted-foreground hover:bg-accent hover:text-foreground",
	);
}

// ── Sub-components ──

function itemTitle(item: NavItem, t: (key: string) => string) {
	return item.title ?? t(item.titleKey ?? "");
}

function groupLabel(group: NavGroup, t: (key: string) => string) {
	return group.label ?? t(group.labelKey ?? "");
}

function NavGroupSection({ group, currentPath }: { group: NavGroup; currentPath: string }) {
	const [open, setOpen] = useState(group.defaultOpen ?? true);
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div className="px-3 mt-2">
				<CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2.5">
					<span className="text-sm font-normal text-muted-foreground">{groupLabel(group, t)}</span>
					<span className="flex h-7 w-7 shrink-0 items-center justify-center">
						<ChevronUp
							className={cn(
								"h-4 w-4 text-muted-foreground transition-transform duration-200",
								!open && "rotate-180",
							)}
							strokeWidth={1.5}
						/>
					</span>
				</CollapsibleTrigger>
			</div>
			<div
				className="grid overflow-hidden"
				style={{
					gridTemplateRows: open ? "1fr" : "0fr",
					transition: "grid-template-rows 200ms ease-out",
				}}
			>
				<div className="min-h-0 overflow-hidden">
					<div className="flex flex-col gap-0.5 px-3">
						{group.items.map((item) => (
							<button
								type="button"
								key={item.path}
								onClick={() =>
									item.external
										? window.open(item.path, "_blank", "noopener,noreferrer")
										: navigate(item.path)
								}
								className={navItemClass(!item.external && currentPath === item.path)}
							>
								<item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
								<span className="flex-1 truncate text-left">{itemTitle(item, t)}</span>
								{item.external && (
									<span className="flex h-7 w-7 shrink-0 items-center justify-center">
										<ExternalLink className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
									</span>
								)}
								{item.badge && (
									<span className="flex h-7 w-7 shrink-0 items-center justify-center">
										<span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-badge-red px-1.5 text-[11px] font-medium text-badge-red-foreground">
											{item.badge}
										</span>
									</span>
								)}
							</button>
						))}
					</div>
				</div>
			</div>
		</Collapsible>
	);
}

function PartitionLabel({ labelKey }: { labelKey: string }) {
	const { t } = useTranslation();
	return (
		<p className="px-6 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
			{t(labelKey)}
		</p>
	);
}

function LibraryNav({ currentPath }: { currentPath: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation();
	return (
		<div className="pb-3">
			<div className="mt-2 flex flex-col gap-0.5 px-3">
				<button
					type="button"
					onClick={() => navigate("/ui")}
					className={navItemClass(currentPath === "/ui")}
				>
					<BookOpen className="h-4 w-4 shrink-0" strokeWidth={1.5} />
					<span className="flex-1 text-left">{t("nav.kitIndex")}</span>
				</button>
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
				<button
					type="button"
					onClick={() =>
						item.external
							? window.open(item.path, "_blank", "noopener,noreferrer")
							: navigate(item.path)
					}
					className={cn(
						"relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
						!item.external && currentPath === item.path
							? "bg-accent text-foreground"
							: "text-muted-foreground hover:bg-accent hover:text-foreground",
					)}
				>
					<item.icon className="h-4 w-4" strokeWidth={1.5} />
					{item.badge && (
						<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-badge-red px-1 text-[10px] font-medium text-badge-red-foreground">
							{item.badge}
						</span>
					)}
				</button>
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

	// ⌘K / Ctrl+K shortcut
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setSearchOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleSelect = useCallback(
		(path: string) => {
			setSearchOpen(false);
			navigate(path);
		},
		[navigate],
	);

	return (
		<aside
			className={cn(
				"sticky top-0 flex h-screen shrink-0 flex-col bg-background transition-all duration-300 ease-in-out",
				collapsed ? "w-[68px] overflow-y-hidden" : "w-[260px] overflow-hidden",
			)}
		>
			{collapsed ? (
				/* ── Collapsed (icon-only) view ── */
				<div className="flex h-screen w-[68px] flex-col items-center">
					<div className="flex h-14 items-center justify-center">
						<Mountain className="h-5 w-5 text-primary" strokeWidth={1.5} />
					</div>

					<button
						type="button"
						onClick={onToggle}
						aria-label={t("common.expandSidebar")}
						className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-1"
					>
						<PanelLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
					</button>

					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={() => setSearchOpen(true)}
								aria-label={`${t("common.search")} (⌘K)`}
								className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mb-2"
							>
								<Search className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
							</button>
						</TooltipTrigger>
						<TooltipContent side="right" sideOffset={8}>
							{t("common.search")} (⌘K)
						</TooltipContent>
					</Tooltip>

					<nav className="flex-1 flex w-full flex-col items-center gap-1 overflow-y-auto pt-1">
						{ALL_NAV_ITEMS.map((item) => (
							<CollapsedNavItem key={item.path} item={item} currentPath={pathname} />
						))}
					</nav>

					<div className="py-3 flex justify-center w-full">
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
					</div>
				</div>
			) : (
				/* ── Expanded view ── */
				<div className="flex h-screen w-[260px] flex-col">
					<div className="px-3 h-14 flex items-center">
						<div className="flex w-full items-center justify-between px-3">
							<div className="flex items-center gap-3">
								<Mountain className="h-5 w-5 text-primary" strokeWidth={1.5} />
								<span className="text-lg md:text-xl font-semibold text-foreground">basalt.</span>
								<span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground leading-none">
									v{__APP_VERSION__}
								</span>
							</div>
							<button
								type="button"
								onClick={onToggle}
								aria-label={t("common.collapseSidebar")}
								className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
							>
								<PanelLeft className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
							</button>
						</div>
					</div>

					<div className="px-3 pb-1">
						<button
							type="button"
							onClick={() => setSearchOpen(true)}
							className="flex w-full items-center gap-3 rounded-lg bg-secondary px-3 py-1.5 transition-colors hover:bg-accent cursor-pointer"
						>
							<Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<span className="flex-1 text-left text-sm text-muted-foreground">
								{t("common.search")}
							</span>
							<span className="flex h-7 w-7 shrink-0 items-center justify-center">
								<kbd className="pointer-events-none hidden rounded-sm border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
									⌘K
								</kbd>
							</span>
						</button>
					</div>

					<nav className="flex-1 overflow-y-auto pt-1">
						<PartitionLabel labelKey="nav.examples" />
						{NAV_GROUPS.map((group) => (
							<NavGroupSection key={group.labelKey} group={group} currentPath={pathname} />
						))}
						<div className="mx-6 my-3 border-t border-border" />
						<PartitionLabel labelKey="nav.kit" />
						<LibraryNav currentPath={pathname} />
					</nav>

					<div className="px-4 py-3">
						<div className="flex items-center gap-3">
							<Avatar className="h-9 w-9 shrink-0">
								<AvatarImage src="https://avatar.vercel.sh/acme" alt="User" />
								<AvatarFallback className="text-xs">ZL</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground truncate">Zheng Li</p>
								<p className="text-xs text-muted-foreground truncate">zhengli@example.com</p>
							</div>
							<button
								type="button"
								aria-label={t("common.logOut")}
								className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
							>
								<LogOut className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Search command palette */}
			<CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
				<CommandInput placeholder={t("common.searchPages")} />
				<CommandList>
					<CommandEmpty>{t("common.noResults")}</CommandEmpty>
					{NAV_GROUPS.map((group) => (
						<CommandGroup key={group.labelKey} heading={groupLabel(group, t)}>
							{group.items.map((item) => (
								<CommandItem
									key={item.path}
									value={itemTitle(item, t)}
									onSelect={() => handleSelect(item.path)}
									className="gap-3 cursor-pointer"
								>
									<item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
									<span>{itemTitle(item, t)}</span>
								</CommandItem>
							))}
						</CommandGroup>
					))}
					<CommandGroup heading={t("nav.kit")}>
						<CommandItem
							value={t("nav.kitIndex")}
							onSelect={() => handleSelect("/ui")}
							className="gap-3 cursor-pointer"
						>
							<BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
							<span>{t("nav.kitIndex")}</span>
						</CommandItem>
						{CATALOG.map((entry) => (
							<CommandItem
								key={entry.slug}
								value={`${entry.name} ${entry.slug}`}
								onSelect={() => handleSelect(`/ui/${entry.slug}`)}
								className="gap-3 cursor-pointer"
							>
								<span>{entry.name}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</aside>
	);
}

import { AvatarInitials } from "@nocoo/basalt/components/avatar";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { Link } from "@nocoo/basalt/components/link";
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
	SidebarPartition,
	SidebarProvider,
	SidebarSearch,
	SidebarToggle,
	SidebarUser,
} from "@nocoo/basalt/components/sidebar";
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
	Ellipsis,
	ExternalLink,
	Eye,
	EyeOff,
	FileCode,
	FileQuestion,
	FileText,
	Filter,
	FolderInput,
	FormInput,
	Gauge,
	Hash,
	HeartPulse,
	Inbox,
	Keyboard,
	Layers,
	LayoutDashboard,
	LayoutGrid,
	LayoutTemplate,
	LineChart,
	Link2,
	List,
	Loader,
	Loader2,
	LogIn,
	type LucideIcon,
	Megaphone,
	Menu,
	MessageCircle,
	MessageSquare,
	Minus,
	MousePointer2,
	MousePointerClick,
	Navigation,
	Palette,
	PanelLeft,
	PanelRight,
	PiggyBank,
	RectangleEllipsis,
	Search,
	Settings,
	SlidersHorizontal,
	Sparkles,
	Square,
	SquareCheck,
	Sun,
	Table,
	Table2,
	Tag,
	TextCursorInput,
	ToggleLeft,
	ToggleRight,
	TrendingUp,
	TriangleAlert,
	Type,
	Upload,
	UserRound,
	Wallet,
	Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BasaltLogo } from "@/components/BasaltLogo";
import { APP_VERSION } from "@/lib/version";
import type { NavIconId, ShellNavGroup, ShellNavItem } from "@/models/navigation";
import { useShellNavigationViewModel } from "@/viewmodels/useShellNavigationViewModel";

const NAV_ICONS: Record<NavIconId, LucideIcon> = {
	activity: Activity,
	"align-left": AlignLeft,
	"app-window": AppWindow,
	award: Award,
	"bar-chart": BarChart3,
	bell: Bell,
	"book-open": BookOpen,
	calendar: Calendar,
	"chevron-right": ChevronRight,
	"chevrons-down": ChevronsDown,
	"chevrons-down-up": ChevronsDownUp,
	"chevrons-up-down": ChevronsUpDown,
	circle: Circle,
	clipboard: Clipboard,
	code: Code,
	columns: Columns3,
	command: Command,
	"credit-card": CreditCard,
	ellipsis: Ellipsis,
	"external-link": ExternalLink,
	eye: Eye,
	"eye-off": EyeOff,
	"file-code": FileCode,
	"file-question": FileQuestion,
	"file-text": FileText,
	filter: Filter,
	"folder-input": FolderInput,
	"form-input": FormInput,
	gauge: Gauge,
	hash: Hash,
	"heart-pulse": HeartPulse,
	inbox: Inbox,
	keyboard: Keyboard,
	layers: Layers,
	"layout-dashboard": LayoutDashboard,
	"layout-grid": LayoutGrid,
	"layout-template": LayoutTemplate,
	"line-chart": LineChart,
	link: Link2,
	list: List,
	loader: Loader,
	"loader-circle": Loader2,
	"log-in": LogIn,
	megaphone: Megaphone,
	menu: Menu,
	"message-circle": MessageCircle,
	"message-square": MessageSquare,
	minus: Minus,
	"mouse-pointer": MousePointer2,
	"mouse-pointer-click": MousePointerClick,
	navigation: Navigation,
	palette: Palette,
	"panel-left": PanelLeft,
	"panel-right": PanelRight,
	"piggy-bank": PiggyBank,
	"rectangle-ellipsis": RectangleEllipsis,
	search: Search,
	settings: Settings,
	sliders: SlidersHorizontal,
	sparkles: Sparkles,
	square: Square,
	"square-check": SquareCheck,
	sun: Sun,
	table: Table,
	"table-grid": Table2,
	tag: Tag,
	"text-cursor": TextCursorInput,
	"toggle-left": ToggleLeft,
	"toggle-right": ToggleRight,
	"trending-up": TrendingUp,
	"triangle-alert": TriangleAlert,
	type: Type,
	upload: Upload,
	"user-round": UserRound,
	wallet: Wallet,
	wrench: Wrench,
};

function NavItemButton({
	path,
	label,
	iconId,
	external,
	catalogSlug,
	currentPath,
}: {
	path: string;
	label: string;
	iconId: NavIconId;
	external?: boolean;
	catalogSlug?: string;
	currentPath: string;
}) {
	const Icon = NAV_ICONS[iconId];
	return (
		<SidebarItem
			href={path}
			active={!external && currentPath === path}
			data-catalog-slug={catalogSlug}
			target={external ? "_blank" : undefined}
			rel={external ? "noopener noreferrer" : undefined}
		>
			<Icon className="size-basalt-icon-lg shrink-0" />
			<span className="flex-1 truncate text-left">{label}</span>
			{external ? (
				<span className="flex size-basalt-icon-lg shrink-0 items-center justify-center">
					<ExternalLink className="size-basalt-icon-sm text-basalt-muted-foreground" />
				</span>
			) : null}
		</SidebarItem>
	);
}

function NavGroupSection({ group, currentPath }: { group: ShellNavGroup; currentPath: string }) {
	return (
		<SidebarGroup label={group.label} defaultOpen={group.defaultOpen}>
			{group.items.map((item) => (
				<NavItemButton
					key={item.path}
					path={item.path}
					label={item.label}
					iconId={item.iconId}
					external={item.external}
					currentPath={currentPath}
				/>
			))}
		</SidebarGroup>
	);
}

function LibraryNav({
	guideItems,
	categoryGroups,
	currentPath,
}: {
	guideItems: readonly ShellNavItem[];
	categoryGroups: ReturnType<typeof useShellNavigationViewModel>["libraryCategoryGroups"];
	currentPath: string;
}) {
	return (
		<div>
			<div className="flex flex-col gap-basalt-nav-gap">
				{guideItems.map((item) => (
					<NavItemButton
						key={item.path}
						path={item.path}
						label={item.label}
						iconId={item.iconId}
						external={item.external}
						currentPath={currentPath}
					/>
				))}
			</div>
			{categoryGroups.map((group) => (
				<SidebarGroup
					key={group.category}
					label={group.label}
					defaultOpen
					action={
						<Link
							href={group.overviewPath}
							aria-label={group.overviewTitle}
							aria-current={currentPath === group.overviewPath ? "page" : undefined}
							className="basalt-focus inline-flex shrink-0 items-center rounded-basalt-sm px-basalt-space-sm py-basalt-space-xs text-basalt-xs font-medium text-basalt-muted-foreground no-underline transition-colors basalt-motion hover:bg-basalt-hover hover:text-basalt-foreground aria-[current=page]:bg-basalt-selected aria-[current=page]:text-basalt-foreground"
						>
							Overview
						</Link>
					}
				>
					{group.items.map((item) => (
						<NavItemButton
							key={item.path}
							path={item.path}
							label={item.label}
							iconId={item.iconId}
							catalogSlug={item.slug}
							currentPath={currentPath}
						/>
					))}
				</SidebarGroup>
			))}
		</div>
	);
}

function CollapsedNavItem({ item, currentPath }: { item: ShellNavItem; currentPath: string }) {
	const Icon = NAV_ICONS[item.iconId];
	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger asChild>
				<SidebarIconItem
					href={item.path}
					active={!item.external && currentPath === item.path}
					aria-label={item.label}
					target={item.external ? "_blank" : undefined}
					rel={item.external ? "noopener noreferrer" : undefined}
				>
					<Icon className="size-basalt-icon-lg" />
				</SidebarIconItem>
			</TooltipTrigger>
			<TooltipContent side="right" sideOffset={8}>
				{item.label}
			</TooltipContent>
		</Tooltip>
	);
}

interface AppSidebarProps {
	collapsed: boolean;
	onToggle: () => void;
	resizable?: boolean;
	/** Rendered inside the mobile Sheet: the brand action closes the drawer instead of collapsing. */
	drawer?: boolean;
}

export function AppSidebar({
	collapsed,
	onToggle,
	resizable = true,
	drawer = false,
}: AppSidebarProps) {
	const navigate = useNavigate();
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const vm = useShellNavigationViewModel(searchQuery);

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

	return (
		<SidebarProvider collapsed={collapsed} onCollapsedChange={onToggle}>
			<Sidebar resizable={resizable}>
				<SidebarHeader>
					<SidebarBrand
						logo={
							<Link href="/" aria-label="Home" className="no-underline hover:no-underline">
								<BasaltLogo alt="" data-sidebar-brand-image="" className="object-contain" />
							</Link>
						}
						name="basalt."
						version={`v${APP_VERSION}`}
						action={
							drawer ? (
								<SidebarToggle
									data-sidebar-toggle=""
									mode="dismiss"
									dismissLabel="Close navigation menu"
									onDismiss={onToggle}
								/>
							) : (
								<SidebarToggle
									data-sidebar-toggle=""
									collapseLabel="Collapse sidebar"
									expandLabel="Expand sidebar"
								/>
							)
						}
					/>
				</SidebarHeader>
				<SidebarNav>
					<SidebarSearch onClick={() => setSearchOpen(true)}>Search</SidebarSearch>
					{collapsed ? (
						vm.collapsedNavItems.map((item) => (
							<CollapsedNavItem key={item.path} item={item} currentPath={vm.pathname} />
						))
					) : (
						<>
							<SidebarPartition>Examples</SidebarPartition>
							{vm.navGroups.map((group) => (
								<NavGroupSection key={group.id} group={group} currentPath={vm.pathname} />
							))}
							<Separator className="mx-basalt-row-x my-basalt-content-gap w-auto" />
							<SidebarPartition>Library</SidebarPartition>
							<LibraryNav
								guideItems={vm.libraryGuideItems}
								categoryGroups={vm.libraryCategoryGroups}
								currentPath={vm.pathname}
							/>
						</>
					)}
				</SidebarNav>
				<SidebarFooter>
					<SidebarUser
						name="Zheng Li"
						email="zhengli@example.com"
						avatar={<AvatarInitials name="Zheng Li" initials="ZL" />}
						onSignOut={() => {}}
						signOutLabel="Log out"
					/>
				</SidebarFooter>
				<CommandPalette
					open={searchOpen}
					onOpenChange={handleSearchOpenChange}
					shouldFilter={false}
				>
					<CommandInput
						placeholder="Search pages..."
						value={searchQuery}
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						{vm.commandResults.navGroups.map((group) => (
							<CommandGroup key={group.id} heading={group.label}>
								{group.items.map((item) => {
									const Icon = NAV_ICONS[item.iconId];
									return (
										<CommandItem
											key={item.path}
											value={item.label}
											onSelect={() => handleSelect(item.path)}
											className="cursor-pointer gap-basalt-space-lg"
										>
											<Icon className="size-basalt-icon-lg text-basalt-muted-foreground" />
											<span>{item.label}</span>
										</CommandItem>
									);
								})}
							</CommandGroup>
						))}
						{vm.commandResults.templates.length > 0 && (
							<CommandGroup heading="Templates">
								{vm.commandResults.templates.map((entry) => (
									<CommandItem
										key={entry.slug}
										value={`${entry.title} ${entry.slug}`}
										onSelect={() => handleSelect(`/view/${entry.slug}`)}
										className="cursor-pointer gap-basalt-space-lg"
									>
										<LayoutTemplate className="size-basalt-icon-lg text-basalt-muted-foreground" />
										<span>{entry.title}</span>
									</CommandItem>
								))}
							</CommandGroup>
						)}
						{vm.commandResults.libraryEntries.length > 0 ||
						vm.commandResults.catalogEntries.length > 0 ? (
							<CommandGroup heading="Library">
								{vm.commandResults.libraryEntries.map((item) => {
									const Icon = NAV_ICONS[item.iconId];
									return (
										<CommandItem
											key={item.path}
											value={`${item.label} ${item.path}`}
											onSelect={() => handleSelect(item.path)}
											className="cursor-pointer gap-basalt-space-lg"
										>
											<Icon className="size-basalt-icon-lg text-basalt-muted-foreground" />
											<span>{item.label}</span>
										</CommandItem>
									);
								})}
								{vm.commandResults.catalogEntries.map((entry) => (
									<CommandItem
										key={entry.slug}
										value={entry.searchValue}
										data-catalog-slug={entry.slug}
										onSelect={() => handleSelect(entry.path)}
										className="cursor-pointer gap-basalt-space-lg"
									>
										<span>{entry.name}</span>
									</CommandItem>
								))}
							</CommandGroup>
						) : null}
					</CommandList>
				</CommandPalette>
			</Sidebar>
		</SidebarProvider>
	);
}

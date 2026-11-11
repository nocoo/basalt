import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { ChevronUp, LogOut, PanelLeft, Search } from "lucide-react";
import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	createContext,
	type HTMLAttributes,
	type ReactNode,
	type PointerEvent as ReactPointerEvent,
	type RefObject,
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { NAV_ITEM_CLASS, NAV_LIST_CLASS, NAV_ROW_CLASS } from "../utils/navigation";
import { useHoverHighlight } from "../utils/use-hover-highlight";
import { Badge } from "./badge";
import { Button, type ButtonProps, LinkButton } from "./button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Dialog, DialogOverlay, DialogPortal } from "./dialog";
import { Link } from "./link";
import { FOCUS_INSET, OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	type SheetProps,
	SheetTitle,
} from "./sheet";
import { SkeletonLine } from "./skeleton-line";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export type SidebarSide = "left" | "right";

export interface SidebarContextValue {
	/**
	 * Whether the sidebar is currently collapsed.
	 */
	collapsed: boolean;
	/**
	 * Callback to update the collapsed state.
	 */
	setCollapsed: (next: boolean) => void;
	/**
	 * Which edge the sidebar occupies.
	 */
	side: SidebarSide;
	/**
	 * Whether the sidebar is currently displaying a loading skeleton.
	 */
	loading: boolean;
	/**
	 * Whether the sidebar rail expands on pointer hover.
	 */
	peek: boolean;
	/**
	 * Whether the sidebar is actively hovering in peek preview mode.
	 */
	peeking: boolean;
	/**
	 * Callback to update the peek preview state.
	 */
	setPeeking: (next: boolean) => void;
	/**
	 * Whether the sidebar is rendering as a modal overlay drawer instead of in-flow layout chrome.
	 */
	overlay: boolean;
	/**
	 * Current expanded width in pixels, clamped between 180 and 400.
	 */
	width: number;
	/**
	 * Callback to update the sidebar width. Value is clamped between 180 and 400 pixels.
	 */
	setWidth: (next: number) => void;
	/**
	 * Reference to the last active element that held focus before opening the sidebar drawer.
	 */
	lastFocusRef: RefObject<HTMLElement | null>;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Accesses the sidebar context value. Must be used within a `SidebarProvider`; throws an error if called outside.
 * Returns the active sidebar state and control callbacks.
 */
export function useSidebar(): SidebarContextValue {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within SidebarProvider");
	}
	return context;
}

export type SidebarProviderProps = {
	/**
	 * The controlled collapsed state.
	 */
	collapsed?: boolean;
	/**
	 * The uncontrolled initial collapsed state.
	 * @default false
	 */
	defaultCollapsed?: boolean;
	/**
	 * Called when the collapsed state changes.
	 */
	onCollapsedChange?: (collapsed: boolean) => void;
	/**
	 * Which edge the sidebar occupies.
	 * @default left
	 */
	side?: SidebarSide;
	/**
	 * Replace the nav with a loading skeleton.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Expand the collapsed rail on hover.
	 * @default false
	 */
	peek?: boolean;
	/**
	 * Render as an overlay instead of in-flow chrome.
	 * @default false
	 */
	overlay?: boolean;
	/**
	 * Initial expanded width in pixels, clamped between 180 and 400.
	 * @default {@link SIDEBAR_DEFAULT_WIDTH_PX}
	 */
	defaultWidth?: number;
	/**
	 * Sidebar chrome and page content.
	 */
	children: ReactNode;
};

export function SidebarProvider({
	collapsed,
	defaultCollapsed = false,
	onCollapsedChange,
	side = "left",
	loading = false,
	peek = false,
	overlay = false,
	defaultWidth = SIDEBAR_DEFAULT_WIDTH_PX,
	children,
}: SidebarProviderProps) {
	const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
	const [peeking, setPeeking] = useState(false);
	const [width, setWidthState] = useState(() => clampSidebarWidth(defaultWidth));
	const setWidth = useCallback((next: number) => {
		setWidthState(clampSidebarWidth(next));
	}, []);
	const lastFocusRef = useRef<HTMLElement | null>(null);
	const prevCollapsed = useRef(collapsed ?? defaultCollapsed);
	const prevOverlay = useRef(overlay);
	const resolved = collapsed ?? uncontrolled;
	useLayoutEffect(() => {
		if (
			overlay &&
			!resolved &&
			(prevCollapsed.current || !prevOverlay.current) &&
			document.activeElement instanceof HTMLElement
		) {
			lastFocusRef.current = document.activeElement;
		}
		prevCollapsed.current = resolved;
		prevOverlay.current = overlay;
	});
	const setCollapsed = useCallback(
		(next: boolean) => {
			if (!next && document.activeElement instanceof HTMLElement) {
				lastFocusRef.current = document.activeElement;
			}
			if (collapsed === undefined) {
				setUncontrolled(next);
			}
			onCollapsedChange?.(next);
		},
		[collapsed, onCollapsedChange],
	);
	return (
		<SidebarContext.Provider
			value={{
				collapsed: resolved,
				setCollapsed,
				side,
				loading,
				peek,
				peeking,
				setPeeking,
				overlay,
				width,
				setWidth,
				lastFocusRef,
			}}
		>
			{children}
		</SidebarContext.Provider>
	);
}

export type SidebarProps = HTMLAttributes<HTMLElement> & {
	/**
	 * Collapse the rail when no provider is present.
	 * @default false
	 */
	collapsed?: boolean;
	/**
	 * Show the resize handle for an expanded provider-backed sidebar.
	 * @default true
	 */
	resizable?: boolean;
};

function clampSidebarWidth(next: number) {
	return Math.min(400, Math.max(180, next));
}

/**
 * Default expanded sidebar width in pixels. Matches `--basalt-size-sidebar-width` (16.25rem at a 16px root).
 */
export const SIDEBAR_DEFAULT_WIDTH_PX = 260;

function SidebarResize({
	side,
	width,
	onWidth,
}: {
	side: SidebarSide;
	width: number;
	onWidth: (next: number) => void;
}) {
	const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		const startX = event.clientX;
		const startWidth = width;
		const target = event.currentTarget;
		const onMove = (move: PointerEvent) => {
			const delta = side === "right" ? startX - move.clientX : move.clientX - startX;
			onWidth(clampSidebarWidth(startWidth + delta));
		};
		const onUp = () => {
			target.removeEventListener("pointermove", onMove);
			target.removeEventListener("pointerup", onUp);
			target.removeEventListener("pointercancel", onUp);
		};
		target.addEventListener("pointermove", onMove);
		target.addEventListener("pointerup", onUp);
		target.addEventListener("pointercancel", onUp);
	};
	return (
		<div
			role="separator"
			aria-orientation="vertical"
			aria-valuenow={width}
			aria-valuemin={180}
			aria-valuemax={400}
			aria-label="Resize sidebar"
			tabIndex={0}
			className={cn(
				"absolute top-0 h-full w-basalt-1 cursor-col-resize bg-transparent",
				side === "right" ? "left-0" : "right-0",
			)}
			onPointerDown={onPointerDown}
			onKeyDown={(event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
					return;
				}
				event.preventDefault();
				const dir = event.key === "ArrowRight" ? 1 : -1;
				const delta = side === "right" ? -dir * 8 : dir * 8;
				onWidth(clampSidebarWidth(width + delta));
			}}
		/>
	);
}

export function Sidebar({
	collapsed: collapsedProp,
	resizable = true,
	className,
	children,
	onMouseEnter,
	onMouseLeave,
	style,
	...props
}: SidebarProps) {
	const context = useContext(SidebarContext);
	const collapsed = context
		? context.collapsed && !(context.peek && context.peeking)
		: (collapsedProp ?? false);
	const side = context?.side ?? "left";
	const overlay = context?.overlay ?? false;
	const width = context?.width ?? SIDEBAR_DEFAULT_WIDTH_PX;
	const body = context?.loading ? (
		<div
			className="flex flex-col gap-basalt-space-lg px-basalt-layout-lg py-basalt-space-lg"
			role="status"
			aria-live="polite"
		>
			<SkeletonLine />
			<SkeletonLine />
			<SkeletonLine />
		</div>
	) : (
		children
	);
	const resize =
		context && resizable && !collapsed ? (
			<SidebarResize side={side} width={context.width} onWidth={context.setWidth} />
		) : null;
	const frameClass = cn(
		BASALT_UI_CLASS,
		"relative flex shrink-0 flex-col bg-basalt-background text-basalt-base text-basalt-foreground",
		OVERLAY_MOTION,
		className,
	);
	if (overlay && context) {
		return (
			<Dialog open={!context.collapsed} onOpenChange={(open) => context.setCollapsed(!open)}>
				<DialogPortal>
					<DialogOverlay />
					<DialogPrimitive.Content
						data-basalt-sidebar=""
						aria-label="Sidebar"
						data-overlay=""
						data-side={side}
						aria-busy={context.loading || undefined}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						ref={(node) => {
							if (
								node &&
								document.activeElement instanceof HTMLElement &&
								!node.contains(document.activeElement)
							) {
								context.lastFocusRef.current = document.activeElement;
							}
						}}
						onOpenAutoFocus={(event) => {
							const from = "relatedTarget" in event ? event.relatedTarget : null;
							if (from instanceof HTMLElement) {
								context.lastFocusRef.current = from;
							}
							if (event.target instanceof HTMLElement) {
								event.preventDefault();
								event.target.focus();
							}
						}}
						onCloseAutoFocus={(event) => {
							event.preventDefault();
							context.lastFocusRef.current?.focus();
						}}
						className={cn(
							frameClass,
							OVERLAY_LAYER,
							"fixed inset-y-0 overflow-hidden shadow-md",
							side === "right" ? "right-0" : "left-0",
						)}
						style={{ width, ...style }}
						{...props}
					>
						{body}
						{resize}
					</DialogPrimitive.Content>
				</DialogPortal>
			</Dialog>
		);
	}
	return (
		<aside
			data-basalt-sidebar=""
			data-collapsed={collapsed ? "" : undefined}
			data-side={side}
			aria-busy={context?.loading || undefined}
			onMouseEnter={(event) => {
				if (context?.peek && context.collapsed) {
					context.setPeeking(true);
				}
				onMouseEnter?.(event);
			}}
			onMouseLeave={(event) => {
				if (context?.peek) {
					context.setPeeking(false);
				}
				onMouseLeave?.(event);
			}}
			className={cn(
				frameClass,
				"sticky overflow-hidden transition-[width] basalt-motion duration-basalt-normal ease-basalt",
				side === "right" ? "order-last" : undefined,
				collapsed && "w-basalt-rail",
			)}
			style={!collapsed ? { width, ...style } : style}
			{...props}
		>
			{body}
			{resize}
		</aside>
	);
}

const SIDEBAR_ROW_CLASS =
	"basalt-sidebar-row min-h-[calc(var(--basalt-line-row)+2*var(--basalt-space-lg))] py-basalt-space-lg [&>svg:first-child]:size-basalt-sidebar-brand-slot";

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
	return (
		<div
			data-slot="sidebar-header"
			className={cn(
				"flex h-basalt-14 shrink-0 items-center gap-basalt-row-gap px-basalt-layout-lg",
				className,
			)}
			{...props}
		/>
	);
}

const SIDEBAR_BRAND_LOGO_CLASS =
	"basalt-sidebar-brand-logo [&>a]:flex [&>a]:size-full [&>a]:items-center [&>a]:justify-center [&>a>img]:size-full [&>a>svg]:size-full [&>img]:size-full [&>svg]:size-full [&_img]:object-contain";

export interface SidebarBrandProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	/**
	 * Brand mark rendered in the fixed collapsed-rail slot. The slot sizes a direct
	 * `img`/`svg` child (or one wrapped in a single link) to `--basalt-size-sidebar-logo`
	 * and centers it on the rail axis; pass the mark without size classes.
	 */
	logo: ReactNode;
	/** Product or workspace name. */
	name: ReactNode;
	/** Optional version or release metadata, rendered as a secondary badge at the auxiliary type size. */
	version?: ReactNode;
	/** Optional trailing action, conventionally a `SidebarToggle`. */
	action?: ReactNode;
}

export function SidebarBrand({
	logo,
	name,
	version,
	action,
	className,
	...props
}: SidebarBrandProps) {
	return (
		<div
			data-slot="sidebar-brand"
			className={cn(
				"relative flex h-full min-w-0 flex-1 items-center gap-basalt-row-gap",
				className,
			)}
			{...props}
		>
			<span data-slot="sidebar-brand-logo" className={SIDEBAR_BRAND_LOGO_CLASS}>
				{logo}
			</span>
			<div
				data-slot="sidebar-brand-copy"
				className="flex min-w-0 flex-1 items-center gap-basalt-row-gap overflow-hidden whitespace-nowrap"
			>
				<span
					data-slot="sidebar-brand-name"
					className="min-w-0 truncate text-basalt-base font-semibold"
				>
					{name}
				</span>
				{version != null ? (
					<Badge
						data-slot="sidebar-brand-version"
						variant="secondary"
						className="shrink-0 text-basalt-muted-foreground"
					>
						{version}
					</Badge>
				) : null}
			</div>
			{action ? (
				<div data-slot="sidebar-brand-action" className="basalt-sidebar-brand-action">
					{action}
				</div>
			) : null}
		</div>
	);
}

export interface SidebarToggleProps
	extends Omit<ButtonProps, "children" | "size" | "aria-expanded"> {
	/** Accessible label while the sidebar is collapsed. @default "Expand sidebar" */
	expandLabel?: string;
	/** Accessible label while the sidebar is expanded. @default "Collapse sidebar" */
	collapseLabel?: string;
	/**
	 * `toggle` collapses or expands the sidebar through context and shows a tooltip.
	 * `dismiss` closes a drawer that hosts the sidebar (for example a mobile `Sheet`): it calls
	 * `onDismiss`, never changes the collapsed state and renders no tooltip, so a drawer that
	 * auto-focuses the button still closes on the first Escape.
	 * @default "toggle"
	 */
	mode?: "toggle" | "dismiss";
	/** Called on click in `dismiss` mode unless the click handler prevented default. */
	onDismiss?: () => void;
	/** Accessible label in `dismiss` mode. @default "Close navigation" */
	dismissLabel?: string;
}

export function SidebarToggle({
	"aria-label": ariaLabel,
	expandLabel = "Expand sidebar",
	collapseLabel = "Collapse sidebar",
	mode = "toggle",
	onDismiss,
	dismissLabel = "Close navigation",
	onClick,
	variant = "ghost",
	...props
}: SidebarToggleProps) {
	if (mode === "dismiss") {
		return (
			<Button
				{...props}
				data-slot="sidebar-toggle"
				data-mode="dismiss"
				variant={variant}
				size="icon-sm"
				aria-label={ariaLabel ?? dismissLabel}
				onClick={(event) => {
					onClick?.(event);
					if (!event.defaultPrevented) onDismiss?.();
				}}
			>
				<PanelLeft aria-hidden="true" />
			</Button>
		);
	}
	return (
		<SidebarCollapseToggle
			{...{ ariaLabel, expandLabel, collapseLabel, onClick, variant, props }}
		/>
	);
}

function SidebarCollapseToggle({
	ariaLabel,
	expandLabel,
	collapseLabel,
	onClick,
	variant,
	props,
}: {
	ariaLabel: string | undefined;
	expandLabel: string;
	collapseLabel: string;
	onClick: SidebarToggleProps["onClick"];
	variant: SidebarToggleProps["variant"];
	props: Omit<ButtonProps, "children" | "size" | "aria-expanded">;
}) {
	const { collapsed, setCollapsed, side } = useSidebar();
	const label = ariaLabel ?? (collapsed ? expandLabel : collapseLabel);
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						{...props}
						data-slot="sidebar-toggle"
						variant={variant}
						size="icon-sm"
						aria-expanded={!collapsed}
						aria-label={label}
						onClick={(event) => {
							onClick?.(event);
							if (!event.defaultPrevented) setCollapsed(!collapsed);
						}}
					>
						<PanelLeft aria-hidden="true" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side={side === "right" ? "left" : "right"}>{label}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

/**
 * Props for `SidebarSearch`. Renders a native `<button>` element and accepts all standard button HTML attributes and click handlers.
 */
export interface SidebarSearchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * Shortcut key display label rendered inside the trailing kbd tag. Note: this is a visual label only and does not register a global keyboard shortcut.
	 * @default "⌘K"
	 */
	shortcut?: string;
}

export function SidebarSearch({
	shortcut = "⌘K",
	className,
	children,
	...props
}: SidebarSearchProps) {
	const context = useContext(SidebarContext);
	const collapsed = Boolean(context?.collapsed && !(context.peek && context.peeking));
	const buttonRef = useRef<HTMLButtonElement>(null);
	// The tooltip only exists in the collapsed rail. Radix closes a hoverable tooltip from its
	// mounted content, so a hover that crossed the expanded row (no content) would otherwise
	// stay "open" and appear the moment the rail collapses. Reset on every rail transition:
	// only focus still on the button (keyboard users) carries the tooltip across.
	const [tooltipOpen, setTooltipOpen] = useState(false);
	useLayoutEffect(() => {
		setTooltipOpen(collapsed && buttonRef.current === document.activeElement);
	}, [collapsed]);
	const button = (
		<button
			type="button"
			data-slot="sidebar-search"
			data-basalt-hover-item={collapsed ? "" : undefined}
			data-sidebar-row={collapsed ? "" : undefined}
			data-hover-selected={collapsed ? "false" : undefined}
			className={cn(
				collapsed ? NAV_ITEM_CLASS : cn(BASALT_UI_CLASS, NAV_ROW_CLASS),
				SIDEBAR_ROW_CLASS,
				collapsed
					? "relative w-basalt-control justify-center"
					: "w-full cursor-pointer bg-basalt-secondary transition-colors basalt-motion hover:bg-basalt-hover",
				className,
			)}
			{...props}
			ref={buttonRef}
		>
			<Search className="text-basalt-foreground" strokeWidth={1.5} aria-hidden="true" />
			<span
				className={
					collapsed ? "sr-only" : "flex-1 text-left text-basalt-base text-basalt-foreground"
				}
			>
				{children}
				{collapsed && shortcut ? ` (${shortcut})` : null}
			</span>
			{!collapsed ? (
				<kbd className="pointer-events-none hidden rounded-basalt-sm border border-basalt-border bg-basalt-card px-basalt-space-md py-basalt-space-xs text-basalt-sm font-medium text-basalt-muted-foreground sm:inline-block">
					{shortcut}
				</kbd>
			) : null}
		</button>
	);
	return (
		<TooltipProvider>
			<Tooltip delayDuration={0} open={collapsed && tooltipOpen} onOpenChange={setTooltipOpen}>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				{collapsed ? (
					<TooltipContent side={context?.side === "right" ? "left" : "right"} sideOffset={8}>
						{children}
						{shortcut ? ` (${shortcut})` : null}
					</TooltipContent>
				) : null}
			</Tooltip>
		</TooltipProvider>
	);
}

export interface SidebarNavProps extends HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
	const highlightRef = useHoverHighlight(undefined, { restoreOnPointerLeave: false });
	return (
		<nav
			ref={highlightRef}
			data-slot="sidebar-nav"
			className={cn(
				NAV_LIST_CLASS,
				"basalt-sidebar-nav min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain",
				className,
			)}
			{...props}
		/>
	);
}

export interface SidebarPartitionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function SidebarPartition({ className, ...props }: SidebarPartitionProps) {
	return (
		<p
			data-slot="sidebar-partition"
			className={cn(
				"shrink-0 px-basalt-row-x pt-basalt-layout pb-basalt-space-lg text-basalt-sm font-semibold tracking-wide text-basalt-foreground uppercase",
				className,
			)}
			{...props}
		/>
	);
}

type SidebarRowProps = {
	/** Mark the item as the current page. @default false */
	active?: boolean;
	/** Item content. */
	children?: ReactNode;
	/** Additional CSS classes. */
	className?: string;
};

type SidebarButtonRowProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"children" | "className" | "disabled"
> &
	SidebarRowProps & {
		asChild?: false;
		disabled?: boolean;
		href?: never;
	};

type SidebarSlotRowProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"children" | "className" | "disabled"
> &
	SidebarRowProps & {
		/** Render the item onto its single enabled child element. */
		asChild: true;
		disabled?: never;
		href?: never;
	};

type SidebarLinkRowProps = Omit<
	AnchorHTMLAttributes<HTMLAnchorElement>,
	"children" | "className" | "href"
> &
	SidebarRowProps & {
		/** Application route interpreted by LinkProvider. */
		href: string;
		asChild?: never;
	};

export type SidebarItemProps = SidebarButtonRowProps | SidebarSlotRowProps | SidebarLinkRowProps;

function rejectDisabledAsChild(props: { asChild?: boolean; disabled?: boolean }) {
	if (props.asChild && props.disabled) {
		throw new Error("Sidebar asChild rows do not support disabled; use a native button row");
	}
}

export function SidebarItem(props: SidebarItemProps) {
	rejectDisabledAsChild(props);
	const rowClass = cn(
		NAV_ITEM_CLASS,
		SIDEBAR_ROW_CLASS,
		"w-full text-inherit no-underline hover:no-underline",
		props.className,
	);
	if (typeof props.href === "string") {
		const { href, active = false, children, className: _className, ...linkProps } = props;
		return (
			<Link
				{...linkProps}
				href={href}
				aria-current={active ? "page" : undefined}
				data-basalt-hover-item=""
				data-sidebar-row=""
				data-hover-selected={active}
				className={rowClass}
			>
				{children}
			</Link>
		);
	}
	const {
		asChild = false,
		type = "button",
		active = false,
		children,
		className: _className,
		...buttonProps
	} = props;
	const sharedProps = {
		"aria-current": active ? ("page" as const) : undefined,
		"data-basalt-hover-item": "",
		"data-sidebar-row": "",
		"data-hover-selected": active,
		className: rowClass,
	};
	if (asChild) {
		return (
			<Slot {...buttonProps} {...sharedProps}>
				{children}
			</Slot>
		);
	}
	return (
		<button {...buttonProps} type={type} {...sharedProps}>
			{children}
		</button>
	);
}

export type SidebarIconItemProps =
	| SidebarButtonRowProps
	| SidebarSlotRowProps
	| SidebarLinkRowProps;

export function SidebarIconItem(props: SidebarIconItemProps) {
	rejectDisabledAsChild(props);
	const rowClass = cn(
		NAV_ITEM_CLASS,
		SIDEBAR_ROW_CLASS,
		"relative w-basalt-control justify-center text-inherit no-underline hover:no-underline",
		props.className,
	);
	if (typeof props.href === "string") {
		const { href, active = false, children, className: _className, ...linkProps } = props;
		return (
			<Link
				{...linkProps}
				href={href}
				aria-current={active ? "page" : undefined}
				data-basalt-hover-item=""
				data-sidebar-row=""
				data-hover-selected={active}
				className={rowClass}
			>
				{children}
			</Link>
		);
	}
	const {
		asChild = false,
		type = "button",
		active = false,
		children,
		className: _className,
		...buttonProps
	} = props;
	const sharedProps = {
		"aria-current": active ? ("page" as const) : undefined,
		"data-basalt-hover-item": "",
		"data-sidebar-row": "",
		"data-hover-selected": active,
		className: rowClass,
	};
	if (asChild) {
		return (
			<Slot {...buttonProps} {...sharedProps}>
				{children}
			</Slot>
		);
	}
	return (
		<button {...buttonProps} type={type} {...sharedProps}>
			{children}
		</button>
	);
}

/**
 * Props for `SidebarGroup`. Uncontrolled collapsible section that accepts only the documented properties. It does not accept controlled open props or arbitrary DOM attributes.
 */
export interface SidebarGroupProps {
	/**
	 * Section label displayed on the group trigger.
	 */
	label: ReactNode;
	/**
	 * Uncontrolled initial open state for the collapsible group.
	 * @default true
	 */
	defaultOpen?: boolean;
	/**
	 * Navigation items rendered inside the group.
	 */
	children: ReactNode;
}

export function SidebarGroup({ label, defaultOpen = true, children }: SidebarGroupProps) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			data-slot="sidebar-group"
			className="shrink-0 pt-basalt-layout-sm"
		>
			<CollapsibleTrigger asChild>
				<button
					type="button"
					data-slot="sidebar-group-label"
					className={cn(
						"flex w-full cursor-pointer items-center justify-between gap-basalt-row-gap rounded-basalt-md px-basalt-row-x py-basalt-space-lg text-left text-basalt-sm font-semibold leading-basalt-row tracking-wide text-basalt-muted-foreground uppercase transition-colors basalt-motion hover:text-basalt-foreground",
						FOCUS_INSET,
					)}
				>
					<span className="min-w-0 truncate">{label}</span>
					<ChevronUp
						className={cn(
							"h-basalt-4 w-basalt-4 text-basalt-muted-foreground transition-transform basalt-motion duration-basalt-normal",
							OVERLAY_MOTION,
							!open && "rotate-180",
						)}
						strokeWidth={1.5}
					/>
				</button>
			</CollapsibleTrigger>
			<CollapsibleContent unstyled>
				<div className="flex flex-col gap-basalt-nav-gap pt-basalt-nav-gap">{children}</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
	return (
		<div
			data-slot="sidebar-footer"
			className={cn(
				"basalt-sidebar-footer shrink-0 gap-basalt-content-gap pt-basalt-space-lg pb-basalt-layout",
				className,
			)}
			{...props}
		/>
	);
}

export interface SidebarUserProps {
	/**
	 * User display name.
	 */
	name: ReactNode;
	/**
	 * Optional user email or secondary text.
	 */
	email?: ReactNode;
	/**
	 * Avatar element slot.
	 */
	avatar?: ReactNode;
	/**
	 * Trailing action slot (e.g. settings or logout button). Hidden on the collapsed rail.
	 */
	action?: ReactNode;
	/**
	 * Tooltip shown beside the avatar on the collapsed rail.
	 * @default name
	 */
	tooltip?: ReactNode;
	/**
	 * Renders the standard sign-out icon button (LogOut glyph, top tooltip) after `action` in the
	 * expanded row. Hidden on the collapsed rail.
	 */
	onSignOut?: () => void;
	/**
	 * Renders the standard sign-out control as a link to this URL (for example a Cloudflare Access
	 * logout endpoint). Takes precedence over `onSignOut`.
	 */
	signOutHref?: string;
	/**
	 * Accessible name and tooltip of the sign-out control.
	 * @default "Sign out"
	 */
	signOutLabel?: string;
	/**
	 * Additional CSS class name.
	 */
	className?: string;
}

function SidebarUserSignOut({
	href,
	onSignOut,
	label,
}: {
	href: string | undefined;
	onSignOut: (() => void) | undefined;
	label: string;
}) {
	const glyph = <LogOut aria-hidden="true" strokeWidth={1.5} />;
	const control =
		href !== undefined ? (
			<LinkButton
				data-slot="sidebar-user-sign-out"
				variant="ghost"
				size="icon-sm"
				href={href}
				aria-label={label}
				className="shrink-0 text-basalt-muted-foreground hover:text-basalt-foreground"
			>
				{glyph}
			</LinkButton>
		) : (
			<Button
				data-slot="sidebar-user-sign-out"
				type="button"
				variant="ghost"
				size="icon-sm"
				aria-label={label}
				className="shrink-0 text-basalt-muted-foreground hover:text-basalt-foreground"
				onClick={onSignOut}
			>
				{glyph}
			</Button>
		);
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>{control}</TooltipTrigger>
				<TooltipContent side="top" sideOffset={6}>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

/**
 * Footer identity row. Inside a collapsed `SidebarProvider` rail (and not peeking) it renders only
 * the avatar, with `tooltip` (default `name`) on hover, so apps do not branch on `collapsed`.
 * Pass `onSignOut` or `signOutHref` for the standard expanded-row sign-out button.
 */
export function SidebarUser({
	name,
	email,
	avatar,
	action,
	tooltip,
	onSignOut,
	signOutHref,
	signOutLabel = "Sign out",
	className,
}: SidebarUserProps) {
	const context = useContext(SidebarContext);
	const collapsed = Boolean(context?.collapsed && !(context.peek && context.peeking));
	if (collapsed) {
		if (!avatar) return null;
		return (
			<div
				data-slot="sidebar-user"
				data-collapsed=""
				className={cn("flex items-center", className)}
			>
				<TooltipProvider>
					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild>
							<span data-slot="sidebar-user-avatar" className="inline-flex shrink-0">
								{avatar}
							</span>
						</TooltipTrigger>
						<TooltipContent side={context?.side === "right" ? "left" : "right"} sideOffset={8}>
							{tooltip ?? name}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		);
	}
	return (
		<div
			data-slot="sidebar-user"
			className={cn("flex items-center gap-basalt-space-lg", className)}
		>
			{avatar}
			<div className="min-w-0 flex-1">
				<p className="truncate text-basalt-base font-medium text-basalt-foreground">{name}</p>
				{email ? (
					<p className="truncate text-basalt-sm text-basalt-muted-foreground">{email}</p>
				) : null}
			</div>
			{action}
			{signOutHref !== undefined || onSignOut ? (
				<SidebarUserSignOut href={signOutHref} onSignOut={onSignOut} label={signOutLabel} />
			) : null}
		</div>
	);
}

export interface SidebarDrawerProps {
	/**
	 * Controlled open state of the navigation drawer.
	 */
	open?: boolean;
	/**
	 * Called when the drawer open state changes.
	 */
	onOpenChange?: (open: boolean) => void;
	/**
	 * Sidebar chrome rendered inside a forced-expanded `SidebarProvider`.
	 * Conventionally a `Sidebar` with `resizable={false}` and a dismiss `SidebarToggle` in the brand action slot.
	 */
	children: ReactNode;
	/**
	 * Sheet content id for wiring `aria-controls` on the menu trigger.
	 */
	id?: string;
	/**
	 * Element to restore focus to when the drawer closes.
	 */
	returnFocusRef?: RefObject<HTMLElement | null>;
	/**
	 * Accessible sheet title rendered visually hidden.
	 * @default "Navigation"
	 */
	title?: ReactNode;
	/**
	 * Accessible sheet description rendered visually hidden.
	 * @default "Application navigation links and actions."
	 */
	description?: ReactNode;
	/**
	 * Whether the sheet is modal.
	 * @default true
	 */
	modal?: SheetProps["modal"];
}

/**
 * Mobile navigation drawer: a left `Sheet` hosting a forced-expanded `SidebarProvider` at the standard sidebar width.
 */
export function SidebarDrawer({
	open,
	onOpenChange,
	children,
	id,
	returnFocusRef,
	title = "Navigation",
	description = "Application navigation links and actions.",
	modal,
}: SidebarDrawerProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange} modal={modal}>
			<SheetContent
				id={id}
				data-slot="sidebar-drawer"
				side="left"
				className="basalt-sidebar-drawer max-h-dvh p-0 sm:p-0"
				onCloseAutoFocus={(event) => {
					if (returnFocusRef?.current) {
						event.preventDefault();
						returnFocusRef.current.focus();
					}
				}}
			>
				<SheetHeader className="sr-only">
					<SheetTitle>{title}</SheetTitle>
					<SheetDescription>{description}</SheetDescription>
				</SheetHeader>
				<SidebarProvider collapsed={false}>{children}</SidebarProvider>
			</SheetContent>
		</Sheet>
	);
}

export interface ContentIslandProps extends HTMLAttributes<HTMLDivElement> {
	/** Mobile surface treatment; desktop remains an inset L1 island. @default "inset" */
	mobileSurface?: "inset" | "edge-to-edge";
}

export function ContentIsland({
	mobileSurface = "inset",
	className,
	...props
}: ContentIslandProps) {
	return (
		<div
			data-basalt-surface-root=""
			data-basalt-island={mobileSurface}
			className={cn(
				"min-h-0 min-w-0 flex-1 bg-basalt-card text-basalt-card-foreground md:rounded-basalt-island md:p-basalt-layout-lg lg:px-basalt-layout-xl",
				mobileSurface === "inset"
					? "rounded-basalt-lg p-basalt-layout shadow-sm ring-1 ring-basalt-border/40"
					: "md:shadow-sm md:ring-1 md:ring-basalt-border/40",
				className,
			)}
			{...props}
		/>
	);
}

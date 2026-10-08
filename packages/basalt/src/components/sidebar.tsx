import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronUp, Search } from "lucide-react";
import {
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Dialog, DialogOverlay, DialogPortal } from "./dialog";
import { FOCUS_INSET, OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";
import { SkeletonLine } from "./skeleton-line";

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
	 * @default 260
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
	defaultWidth = 260,
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
};

function clampSidebarWidth(next: number) {
	return Math.min(400, Math.max(180, next));
}

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
	const width = context?.width ?? 260;
	const body = context?.loading ? (
		<div
			className="flex flex-col gap-basalt-space-lg p-basalt-space-lg"
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
		context && !collapsed ? (
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

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
	return (
		<div
			data-slot="sidebar-header"
			className={cn(
				"flex h-basalt-14 shrink-0 items-center gap-basalt-row-gap px-basalt-nav-inset",
				className,
			)}
			{...props}
		/>
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
	return (
		<button
			type="button"
			className={cn(
				BASALT_UI_CLASS,
				NAV_ROW_CLASS,
				"w-full cursor-pointer bg-basalt-secondary transition-colors basalt-motion hover:bg-basalt-hover",
				className,
			)}
			{...props}
		>
			<Search className="h-basalt-4 w-basalt-4 text-basalt-muted-foreground" strokeWidth={1.5} />
			<span className="flex-1 text-left text-basalt-base text-basalt-muted-foreground">
				{children}
			</span>
			<kbd className="pointer-events-none hidden rounded-basalt-sm border border-basalt-border bg-basalt-card px-basalt-space-md py-basalt-space-xs text-basalt-xs font-medium text-basalt-muted-foreground sm:inline-block">
				{shortcut}
			</kbd>
		</button>
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
				"min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain",
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

export type SidebarItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	/**
	 * Mark the item as the current page.
	 * @default false
	 */
	active?: boolean;
};

export function SidebarItem({ active = false, className, ...props }: SidebarItemProps) {
	return (
		<button
			type="button"
			aria-current={active ? "page" : undefined}
			data-basalt-hover-item=""
			data-hover-selected={active}
			className={cn(NAV_ITEM_CLASS, "w-full", className)}
			{...props}
		/>
	);
}

/**
 * Props for `SidebarIconItem`. Accepts standard button HTML attributes. The caller is responsible for providing accessible labeling via `aria-label` or `aria-labelledby` as icon buttons do not automatically generate accessible names.
 */
export interface SidebarIconItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * Mark the icon button as active page item.
	 * @default false
	 */
	active?: boolean;
}

export function SidebarIconItem({ active = false, className, ...props }: SidebarIconItemProps) {
	return (
		<button
			type="button"
			aria-current={active ? "page" : undefined}
			data-basalt-hover-item=""
			data-hover-selected={active}
			className={cn(
				NAV_ITEM_CLASS,
				"relative min-h-basalt-control w-basalt-control justify-center",
				className,
			)}
			{...props}
		/>
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
						"flex w-full cursor-pointer items-center justify-between gap-basalt-row-gap rounded-basalt-md px-basalt-row-x py-basalt-space-lg text-left text-basalt-xs font-semibold leading-[calc(var(--basalt-size-control)-2*var(--basalt-space-lg))] tracking-wide text-basalt-muted-foreground uppercase transition-colors basalt-motion hover:text-basalt-foreground",
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
				"flex shrink-0 flex-col gap-basalt-content-gap px-basalt-nav-inset py-basalt-nav-inset",
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
	 * Trailing action slot (e.g. settings or logout button).
	 */
	action?: ReactNode;
	/**
	 * Additional CSS class name.
	 */
	className?: string;
}

export function SidebarUser({ name, email, avatar, action, className }: SidebarUserProps) {
	return (
		<div className={cn("flex items-center gap-basalt-space-lg", className)}>
			{avatar}
			<div className="min-w-0 flex-1">
				<p className="truncate text-basalt-base font-medium text-basalt-foreground">{name}</p>
				{email ? (
					<p className="truncate text-basalt-sm text-basalt-muted-foreground">{email}</p>
				) : null}
			</div>
			{action}
		</div>
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

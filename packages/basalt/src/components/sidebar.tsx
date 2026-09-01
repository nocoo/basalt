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
	useRef,
	useState,
} from "react";
import { cn } from "../utils/cn";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { Dialog, DialogOverlay, DialogPortal } from "./dialog";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";
import { SkeletonLine } from "./skeleton-line";

export type SidebarSide = "left" | "right";

type SidebarContextValue = {
	collapsed: boolean;
	setCollapsed: (next: boolean) => void;
	side: SidebarSide;
	loading: boolean;
	peek: boolean;
	peeking: boolean;
	setPeeking: (next: boolean) => void;
	overlay: boolean;
	width: number;
	setWidth: (next: number) => void;
	lastFocusRef: RefObject<HTMLElement | null>;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
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
	 * Expanded width in pixels.
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
	const [width, setWidth] = useState(defaultWidth);
	const lastFocusRef = useRef<HTMLElement | null>(null);
	const resolved = collapsed ?? uncontrolled;
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
				"absolute top-0 h-full w-1 cursor-col-resize bg-transparent",
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
		<div className="flex flex-col gap-2 p-3" role="status" aria-live="polite">
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
		"relative flex h-screen shrink-0 flex-col bg-basalt-background text-sm text-basalt-foreground",
		OVERLAY_MOTION,
		className,
	);
	if (overlay && context) {
		return (
			<Dialog open={!context.collapsed} onOpenChange={(open) => context.setCollapsed(!open)}>
				<DialogPortal>
					<DialogOverlay />
					<DialogPrimitive.Content
						aria-label="Sidebar"
						data-overlay=""
						data-side={side}
						aria-busy={context.loading || undefined}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
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
				"sticky top-0 transition-all duration-300 ease-in-out",
				side === "right" ? "order-last" : undefined,
				collapsed ? "w-[68px] overflow-y-hidden" : "overflow-hidden",
			)}
			style={!collapsed ? { width, ...style } : style}
			{...props}
		>
			{body}
			{resize}
		</aside>
	);
}

export function SidebarHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("flex h-14 shrink-0 items-center px-3", className)} {...props} />;
}

export function SidebarSearch({
	shortcut = "⌘K",
	className,
	children,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { shortcut?: string }) {
	return (
		<button
			type="button"
			className={cn(
				"flex w-full cursor-pointer items-center gap-3 rounded-lg bg-basalt-secondary px-3 py-1.5 transition-colors hover:bg-basalt-accent",
				className,
			)}
			{...props}
		>
			<Search className="h-4 w-4 text-basalt-muted-foreground" strokeWidth={1.5} />
			<span className="flex-1 text-left text-sm text-basalt-muted-foreground">{children}</span>
			<kbd className="pointer-events-none hidden rounded-sm border border-basalt-border bg-basalt-card px-1.5 py-0.5 text-[10px] font-medium text-basalt-muted-foreground sm:inline-block">
				{shortcut}
			</kbd>
		</button>
	);
}

export function SidebarNav({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<nav className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)} {...props} />
	);
}

export function SidebarPartition({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p
			className={cn(
				"px-6 pt-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-basalt-muted-foreground uppercase",
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
			className={cn(
				"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-normal transition-colors",
				active
					? "bg-basalt-accent text-basalt-foreground"
					: "text-basalt-muted-foreground hover:bg-basalt-accent hover:text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function SidebarIconItem({
	active = false,
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
	return (
		<button
			type="button"
			aria-current={active ? "page" : undefined}
			className={cn(
				"relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
				active
					? "bg-basalt-accent text-basalt-foreground"
					: "text-basalt-muted-foreground hover:bg-basalt-accent hover:text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function SidebarGroup({
	label,
	defaultOpen = true,
	children,
}: {
	label: ReactNode;
	defaultOpen?: boolean;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div className="mt-2 px-3">
				<CollapsibleTrigger asChild>
					<button type="button" className="flex w-full items-center justify-between px-3 py-2.5">
						<span className="text-sm font-normal text-basalt-muted-foreground">{label}</span>
						<span className="flex h-7 w-7 shrink-0 items-center justify-center">
							<ChevronUp
								className={cn(
									"h-4 w-4 text-basalt-muted-foreground transition-transform duration-200",
									!open && "rotate-180",
								)}
								strokeWidth={1.5}
							/>
						</span>
					</button>
				</CollapsibleTrigger>
			</div>
			<CollapsibleContent unstyled>
				<div className="flex flex-col gap-0.5 px-3">{children}</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("px-4 py-3", className)} {...props} />;
}

export function SidebarUser({
	name,
	email,
	avatar,
	action,
	className,
}: {
	name: ReactNode;
	email?: ReactNode;
	avatar?: ReactNode;
	action?: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex items-center gap-3", className)}>
			{avatar}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-basalt-foreground">{name}</p>
				{email ? <p className="truncate text-xs text-basalt-muted-foreground">{email}</p> : null}
			</div>
			{action}
		</div>
	);
}

export function ContentIsland({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"min-h-0 flex-1 overflow-y-auto rounded-[16px] bg-basalt-card p-3 text-basalt-card-foreground shadow-sm ring-1 ring-basalt-border/40 md:rounded-basalt-island md:p-5",
				className,
			)}
			{...props}
		/>
	);
}

import { ChevronUp, Search } from "lucide-react";
import {
	type ButtonHTMLAttributes,
	createContext,
	type HTMLAttributes,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { cn } from "../utils/cn";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
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
	const resolved = collapsed ?? uncontrolled;
	const setCollapsed = useCallback(
		(next: boolean) => {
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

export function Sidebar({ collapsed: collapsedProp, className, children, ...props }: SidebarProps) {
	const context = useContext(SidebarContext);
	const collapsed = context
		? context.collapsed && !(context.peek && context.peeking)
		: (collapsedProp ?? false);
	const side = context?.side ?? "left";
	const overlay = context?.overlay ?? false;
	const width = context?.width ?? 260;
	return (
		<aside
			data-collapsed={collapsed ? "" : undefined}
			data-side={side}
			data-overlay={overlay ? "" : undefined}
			onMouseEnter={() => context?.peek && context.collapsed && context.setPeeking(true)}
			onMouseLeave={() => context?.peek && context.setPeeking(false)}
			className={cn(
				"relative sticky top-0 flex h-screen shrink-0 flex-col bg-basalt-background text-sm text-basalt-foreground motion-reduce:transition-none",
				overlay ? "absolute z-50 shadow-md" : "transition-all duration-300 ease-in-out",
				side === "right" ? "right-0" : "left-0",
				collapsed ? "w-[68px] overflow-y-hidden" : "overflow-hidden",
				className,
			)}
			style={!collapsed ? { width } : undefined}
			{...props}
		>
			{context?.loading ? (
				<div className="flex flex-col gap-2 p-3">
					<SkeletonLine />
					<SkeletonLine />
					<SkeletonLine />
				</div>
			) : (
				children
			)}
			{context && !collapsed ? (
				<button
					type="button"
					aria-label="Resize sidebar"
					className={cn(
						"absolute top-0 h-full w-1 cursor-col-resize bg-transparent",
						side === "right" ? "left-0" : "right-0",
					)}
					onPointerDown={(event) => {
						event.preventDefault();
						event.currentTarget.setPointerCapture(event.pointerId);
						const startX = event.clientX;
						const startWidth = context.width;
						const target = event.currentTarget;
						const onMove = (move: PointerEvent) => {
							const delta = side === "right" ? startX - move.clientX : move.clientX - startX;
							context.setWidth(Math.min(400, Math.max(180, startWidth + delta)));
						};
						const onUp = () => {
							target.removeEventListener("pointermove", onMove);
							target.removeEventListener("pointerup", onUp);
						};
						target.addEventListener("pointermove", onMove);
						target.addEventListener("pointerup", onUp);
					}}
				/>
			) : null}
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

export function SidebarItem({
	active = false,
	className,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
	return (
		<button
			type="button"
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

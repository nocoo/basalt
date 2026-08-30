import { ChevronUp, Search } from "lucide-react";
import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "../utils/cn";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

export function Sidebar({
	collapsed = false,
	className,
	...props
}: HTMLAttributes<HTMLElement> & { collapsed?: boolean }) {
	return (
		<aside
			data-collapsed={collapsed ? "" : undefined}
			className={cn(
				"sticky top-0 flex h-screen shrink-0 flex-col bg-basalt-background text-sm text-basalt-foreground transition-all duration-300 ease-in-out",
				collapsed ? "w-[68px] overflow-y-hidden" : "w-[260px] overflow-hidden",
				className,
			)}
			{...props}
		/>
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

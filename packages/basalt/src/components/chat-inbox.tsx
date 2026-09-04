import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";

export interface ChatInboxItem {
	/** Stable id for selection. */
	id: string;
	/** Thread title. */
	title: string;
	/** Last-message preview. */
	preview?: string;
	/** Timestamp label. */
	time?: string;
	/** Optional leading mark. */
	leading?: ReactNode;
}

export interface ChatInboxProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
	/**
	 * Threads to list.
	 */
	items: readonly ChatInboxItem[];
	/**
	 * Selected thread id.
	 */
	activeId?: string;
	/**
	 * Called when a thread is chosen.
	 */
	onSelect?: (id: string) => void;
}

export function ChatInbox({ items, activeId, onSelect, className, ...props }: ChatInboxProps) {
	return (
		<nav className={cn("flex min-h-0 flex-col gap-0.5 overflow-y-auto p-2", className)} {...props}>
			{items.map((item) => {
				const active = item.id === activeId;
				return (
					<Button
						key={item.id}
						type="button"
						variant="ghost"
						aria-current={active ? "true" : undefined}
						onClick={() => onSelect?.(item.id)}
						className={cn(
							"h-auto w-full justify-start gap-2 rounded-basalt-md px-2 py-2 text-left",
							active ? "bg-basalt-accent" : "",
						)}
					>
						{item.leading ? (
							<span className="flex h-8 w-8 shrink-0 items-center justify-center">
								{item.leading}
							</span>
						) : null}
						<span className="min-w-0 flex-1">
							<span className="flex items-baseline justify-between gap-2">
								<span className="truncate text-sm font-medium text-basalt-foreground">
									{item.title}
								</span>
								{item.time ? (
									<span className="shrink-0 text-[11px] text-basalt-muted-foreground">
										{item.time}
									</span>
								) : null}
							</span>
							{item.preview ? (
								<span className="mt-0.5 block truncate text-xs text-basalt-muted-foreground">
									{item.preview}
								</span>
							) : null}
						</span>
					</Button>
				);
			})}
		</nav>
	);
}

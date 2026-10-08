import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { NAV_ITEM_CLASS, NAV_LIST_CLASS } from "../utils/navigation";
import { useHoverHighlight } from "../utils/use-hover-highlight";

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

export interface ChatInboxProps
	extends Omit<HTMLAttributes<HTMLElement>, "onSelect" | "className"> {
	/**
	 * Threads to list ({ id: string, title: string, preview?: string, time?: string, leading?: ReactNode }[]).
	 */
	items: readonly ChatInboxItem[];
	/**
	 * Selected thread id.
	 */
	activeId?: string;
	/**
	 * Called when a thread is chosen.
	 */
	onSelect: (id: string) => void;
	/**
	 * Optional class name applied to the navigation element.
	 * Component inherits native nav HTMLAttributes on the root element but does not forward ref.
	 */
	className?: string;
}

export function ChatInbox({ items, activeId, onSelect, className, ...props }: ChatInboxProps) {
	const highlightRef = useHoverHighlight();
	return (
		<nav
			ref={highlightRef}
			className={cn(
				NAV_LIST_CLASS,
				"min-h-0 flex-col overflow-y-auto overscroll-y-contain",
				className,
			)}
			{...props}
		>
			{items.map((item) => {
				const active = item.id === activeId;
				return (
					<button
						key={item.id}
						type="button"
						aria-current={active ? "true" : undefined}
						data-basalt-hover-item=""
						data-hover-selected={active}
						onClick={() => onSelect(item.id)}
						className={cn(NAV_ITEM_CLASS, "w-full justify-start")}
					>
						{item.leading ? (
							<span className="flex h-basalt-8 w-basalt-8 shrink-0 items-center justify-center">
								{item.leading}
							</span>
						) : null}
						<span className="min-w-0 flex-1">
							<span className="flex items-baseline justify-between gap-basalt-row-gap">
								<span className="truncate text-basalt-base font-medium text-basalt-foreground">
									{item.title}
								</span>
								{item.time ? (
									<span className="shrink-0 text-basalt-xs text-basalt-muted-foreground">
										{item.time}
									</span>
								) : null}
							</span>
							{item.preview ? (
								<span className="mt-basalt-space-xs block truncate text-basalt-sm text-basalt-muted-foreground">
									{item.preview}
								</span>
							) : null}
						</span>
					</button>
				);
			})}
		</nav>
	);
}

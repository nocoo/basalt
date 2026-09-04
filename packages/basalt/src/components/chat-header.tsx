import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface ChatHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
	/**
	 * Conversation title.
	 */
	title: ReactNode;
	/**
	 * Secondary line under the title.
	 */
	subtitle?: ReactNode;
	/**
	 * Leading mark, usually an icon.
	 */
	leading?: ReactNode;
	/**
	 * Trailing actions.
	 */
	children?: ReactNode;
}

export function ChatHeader({
	title,
	subtitle,
	leading,
	children,
	className,
	...props
}: ChatHeaderProps) {
	return (
		<header
			className={cn(
				"flex items-center justify-between gap-2 border-b border-basalt-border/50 px-3 py-2.5",
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-2">
				{leading ? (
					<span className="flex h-8 w-8 items-center justify-center">{leading}</span>
				) : null}
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold tracking-tight">{title}</p>
					{subtitle ? (
						<p className="truncate text-[11px] text-basalt-muted-foreground">{subtitle}</p>
					) : null}
				</div>
			</div>
			{children ? <div className="flex items-center gap-1">{children}</div> : null}
		</header>
	);
}

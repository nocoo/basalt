import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export type ChatBubbleVariant = "assistant" | "system" | "user";

export interface ChatBubbleProps {
	/**
	 * Alignment and fill.
	 * @default "assistant"
	 */
	variant?: ChatBubbleVariant;
	/**
	 * Show a streaming caret after the body.
	 * @default false
	 */
	streaming?: boolean;
	className?: string;
	children: ReactNode;
}

export function ChatBubble({
	variant = "assistant",
	streaming = false,
	className,
	children,
}: ChatBubbleProps) {
	if (variant === "system") {
		return (
			<p className={cn("px-1 text-center text-[11px] text-basalt-muted-foreground", className)}>
				{children}
			</p>
		);
	}
	const user = variant === "user";
	return (
		<div className={cn("flex w-full", user ? "justify-end" : "justify-start")}>
			<div
				className={cn(
					"max-w-[92%] px-3.5 py-2 text-sm leading-5 shadow-sm",
					user
						? "rounded-2xl rounded-br-md bg-basalt-primary text-basalt-primary-foreground"
						: "rounded-2xl rounded-bl-md bg-basalt-secondary text-basalt-foreground ring-1 ring-basalt-border/50",
					className,
				)}
			>
				{children}
				{streaming ? (
					<span
						className="mt-1 inline-block h-3 w-1.5 animate-pulse rounded-sm bg-basalt-primary/70 align-middle"
						aria-hidden
					/>
				) : null}
			</div>
		</div>
	);
}

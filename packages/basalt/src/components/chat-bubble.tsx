import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

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
	/**
	 * Optional class name applied to the message bubble.
	 * Component only accepts variant, streaming, className, and children without native HTML rest forwarding or forwarded ref.
	 */
	className?: string;
	/**
	 * Message content.
	 */
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
			<p
				className={cn(
					BASALT_UI_CLASS,
					"px-basalt-space-sm text-center text-basalt-xs text-basalt-muted-foreground",
					className,
				)}
			>
				{children}
			</p>
		);
	}
	const user = variant === "user";
	return (
		<div className={cn(BASALT_UI_CLASS, "flex w-full", user ? "justify-end" : "justify-start")}>
			<div
				data-basalt-surface={user ? undefined : ""}
				className={cn(
					"max-w-[92%] px-basalt-panel-x py-basalt-panel-y text-basalt-base leading-[var(--basalt-line-body)] shadow-sm",
					user
						? "rounded-basalt-lg rounded-br-basalt-md bg-basalt-primary text-basalt-primary-foreground"
						: "rounded-basalt-lg rounded-bl-basalt-md text-basalt-foreground ring-1 ring-basalt-border/50",
					className,
				)}
			>
				{children}
				{streaming ? (
					<span
						className="mt-basalt-space-sm inline-block h-basalt-3 w-basalt-1_5 animate-pulse rounded-basalt-sm bg-basalt-primary/70 align-middle motion-reduce:animate-none"
						aria-hidden
					/>
				) : null}
			</div>
		</div>
	);
}

import { Check, Copy, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { ChatMarkdown } from "./chat-markdown";

export interface ChatMessageProps {
	variant: "user" | "assistant";
	content: string;
	streaming?: boolean;
	/** Thinking, tool calls and other trace content before the response. */
	trace?: ReactNode;
	/** Approval, sources or result cards after the response. */
	children?: ReactNode;
	author?: string;
	onEdit?: () => void;
	onRegenerate?: () => void;
	feedback?: "up" | "down";
	onFeedback?: (value: "up" | "down") => void;
	className?: string;
}

export function ChatMessage({
	variant,
	content,
	streaming,
	trace,
	children,
	author,
	onEdit,
	onRegenerate,
	feedback,
	onFeedback,
	className,
}: ChatMessageProps) {
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(false);
	return (
		<article
			aria-label={`${author || (variant === "user" ? "You" : "Assistant")} message`}
			className={cn("group min-w-0 space-y-basalt-2", className)}
		>
			<div className={cn("flex", variant === "user" ? "justify-end" : "justify-start")}>
				<div
					className={cn(
						"min-w-0 space-y-basalt-3",
						variant === "user"
							? "max-w-[90%] rounded-basalt-lg bg-basalt-accent px-basalt-3 py-basalt-2"
							: "w-full",
					)}
				>
					{trace}
					{content &&
						(variant === "user" ? (
							<p className="whitespace-pre-wrap break-words text-sm leading-[var(--basalt-line-relaxed)]">
								{content}
							</p>
						) : (
							<ChatMarkdown content={content} />
						))}
					{streaming && (
						<span
							aria-hidden="true"
							className="inline-block size-basalt-2 rounded-full bg-basalt-primary animate-pulse motion-reduce:animate-none"
						/>
					)}
					{children}
				</div>
			</div>
			{!streaming && content && (
				<div
					className={cn("flex items-center gap-basalt-0_5", variant === "user" && "justify-end")}
				>
					<Button
						size="icon"
						variant="ghost"
						aria-label={copied ? "Copied" : "Copy message"}
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(content);
								setCopied(true);
								setCopyError(false);
							} catch {
								setCopyError(true);
							}
						}}
					>
						{copied ? <Check /> : <Copy />}
					</Button>
					{onEdit && (
						<Button size="icon" variant="ghost" aria-label="Edit message" onClick={onEdit}>
							<Pencil />
						</Button>
					)}
					{onRegenerate && (
						<Button
							size="icon"
							variant="ghost"
							aria-label="Regenerate response"
							onClick={onRegenerate}
						>
							<RotateCcw />
						</Button>
					)}
					{onFeedback && (
						<>
							<Button
								size="icon"
								variant="ghost"
								aria-label="Helpful"
								aria-pressed={feedback === "up"}
								onClick={() => onFeedback("up")}
							>
								<ThumbsUp />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								aria-label="Not helpful"
								aria-pressed={feedback === "down"}
								onClick={() => onFeedback("down")}
							>
								<ThumbsDown />
							</Button>
						</>
					)}
					{copyError && (
						<span role="alert" className="text-xs text-basalt-danger">
							Could not copy
						</span>
					)}
				</div>
			)}
		</article>
	);
}

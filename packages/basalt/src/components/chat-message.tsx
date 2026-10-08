import {
	Check,
	Copy,
	ExternalLink,
	FileText,
	Pencil,
	RotateCcw,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";
import { useChatMessage } from "../viewmodels/use-chat-message";
import { Button } from "./button";
import { ChatMarkdown } from "./chat-markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";

export interface ChatMessageProps {
	variant: "user" | "assistant";
	content: string;
	streaming?: boolean;
	/** Thinking, tool calls and other trace content before the response. */
	trace?: ReactNode;
	/** Approval or result content after the response; use sources for citations. */
	children?: ReactNode;
	author?: string;
	onEdit?: () => void;
	onRegenerate?: () => void;
	feedback?: "up" | "down";
	onFeedback?: (value: "up" | "down") => void;
	/** Compact source disclosure beside message actions. No card wrapper is added. */
	sources?: readonly { id: string; name: string; type?: string; href?: string }[];
	/** Source disclosure label. @default "Sources" */
	sourcesLabel?: string;
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
	sources = [],
	sourcesLabel = "Sources",
}: ChatMessageProps) {
	const vm = useChatMessage(content, sources);
	return (
		<article
			aria-label={`${author || (variant === "user" ? "You" : "Assistant")} message`}
			className={cn("basalt-ui group min-w-0 space-y-basalt-content-gap", className)}
		>
			<div className={cn("flex", variant === "user" ? "justify-end" : "justify-start")}>
				<div
					data-basalt-surface={variant === "user" ? "" : undefined}
					className={cn(
						"min-w-0 space-y-basalt-content-gap",
						variant === "user"
							? "max-w-[90%] rounded-basalt-lg px-basalt-panel-x py-basalt-panel-y"
							: "w-full",
					)}
				>
					{trace}
					{content &&
						(variant === "user" ? (
							<p className="whitespace-pre-wrap break-words text-basalt-base leading-[var(--basalt-line-relaxed)]">
								{content}
							</p>
						) : (
							<ChatMarkdown content={content} streaming={streaming} />
						))}
					{streaming && (
						<span
							aria-hidden="true"
							className="inline-block size-basalt-2 rounded-basalt-full bg-basalt-primary animate-pulse motion-reduce:animate-none"
						/>
					)}
					{children}
				</div>
			</div>
			{!streaming && content && (
				<Collapsible className="space-y-basalt-content-gap">
					<div
						data-slot="chat-actions"
						className={cn(
							"flex flex-wrap items-center gap-basalt-space-xs text-basalt-muted-foreground",
							variant === "user"
								? "justify-end -mr-[calc((var(--basalt-size-action)-var(--basalt-size-icon))/2)]"
								: "-ml-[calc((var(--basalt-size-action)-var(--basalt-size-icon))/2)]",
						)}
					>
						<Button
							size="icon"
							variant="ghost"
							aria-label={vm.copied ? "Copied" : "Copy message"}
							onClick={() => void vm.copy((text) => navigator.clipboard.writeText(text))}
						>
							{vm.copied ? <Check strokeWidth={1.5} /> : <Copy strokeWidth={1.5} />}
						</Button>
						{onEdit && (
							<Button size="icon" variant="ghost" aria-label="Edit message" onClick={onEdit}>
								<Pencil strokeWidth={1.5} />
							</Button>
						)}
						{onRegenerate && (
							<Button
								size="icon"
								variant="ghost"
								aria-label="Regenerate response"
								onClick={onRegenerate}
							>
								<RotateCcw strokeWidth={1.5} />
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
									<ThumbsUp strokeWidth={1.5} />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									aria-label="Not helpful"
									aria-pressed={feedback === "down"}
									onClick={() => onFeedback("down")}
								>
									<ThumbsDown strokeWidth={1.5} />
								</Button>
							</>
						)}
						{vm.sources.length > 0 && (
							<CollapsibleTrigger
								aria-label={`${sourcesLabel} ${vm.sources.length}`}
								className="ml-basalt-control-gap min-h-basalt-action gap-basalt-control-gap rounded-basalt-sm px-basalt-space-sm text-basalt-sm font-normal text-basalt-muted-foreground hover:bg-basalt-hover"
							>
								<span className="flex items-center gap-basalt-control-gap">
									<FileText aria-hidden="true" className="size-basalt-icon" strokeWidth={1.5} />
									<span>{sourcesLabel}</span>
									<span className="tabular-nums">{vm.sources.length}</span>
								</span>
							</CollapsibleTrigger>
						)}
						{vm.copyError && (
							<span role="alert" className="text-basalt-sm text-basalt-danger">
								Could not copy
							</span>
						)}
					</div>
					{vm.sources.length > 0 && (
						<CollapsibleContent unstyled>
							<ul aria-label={sourcesLabel} className="space-y-basalt-space-xs">
								{vm.sources.map((source) => {
									const Source = source.href ? "a" : "span";
									return (
										<li key={source.id}>
											<Source
												href={source.href}
												target={source.href ? "_blank" : undefined}
												rel={source.href ? "noopener noreferrer" : undefined}
												className="flex min-w-0 items-center gap-basalt-row-gap rounded-basalt-sm px-basalt-row-x py-basalt-control-y text-basalt-sm leading-[var(--basalt-line-body)] text-basalt-muted-foreground outline-hidden hover:bg-basalt-hover focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-basalt-ring"
											>
												<FileText
													aria-hidden="true"
													className="size-basalt-icon shrink-0"
													strokeWidth={1.5}
												/>
												<span className="min-w-0 flex-1 break-words">{source.name}</span>
												{source.type && (
													<span className="shrink-0 font-mono text-basalt-xs">{source.type}</span>
												)}
												{source.href && (
													<ExternalLink
														aria-hidden="true"
														className="size-basalt-icon-sm shrink-0"
														strokeWidth={1.5}
													/>
												)}
											</Source>
										</li>
									);
								})}
							</ul>
						</CollapsibleContent>
					)}
				</Collapsible>
			)}
		</article>
	);
}

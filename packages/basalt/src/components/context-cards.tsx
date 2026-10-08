import { ExternalLink, FileText, TextAlignStart } from "lucide-react";
import { useId } from "react";
import type { ContextChunk } from "../models/context-cards";
import { cn } from "../utils/cn";
import { useContextCardsViewModel } from "../viewmodels/use-context-cards";
import { Badge } from "./badge";
import { Button } from "./button";
import { LayerCard } from "./layer-card";
import { SkeletonLine } from "./skeleton-line";

export type { ContextChunk } from "../models/context-cards";

export interface ContextCardsProps {
	/** Retrieved chunks with stable IDs and caller-owned source metadata. */
	chunks: readonly ContextChunk[];
	/** Heading for the chunk list. @default "All chunks" */
	title?: string;
	/** Total available chunks, when displaying a subset. Never smaller than the visible count. */
	totalCount?: number;
	loading?: boolean;
	error?: string;
	onRetry?: () => void;
	className?: string;
}

export function ContextCards({
	chunks,
	title = "All chunks",
	totalCount,
	loading = false,
	error,
	onRetry,
	className,
}: ContextCardsProps) {
	const vm = useContextCardsViewModel(chunks, totalCount);
	const id = useId();
	return (
		<section
			aria-labelledby={id}
			aria-busy={loading || undefined}
			className={cn(
				"basalt-ui min-w-0 space-y-basalt-content-gap leading-[var(--basalt-line-body)]",
				className,
			)}
		>
			<header className="flex items-center gap-basalt-content-gap">
				<h3 id={id} className="text-basalt-code font-medium">
					{title}
				</h3>
				<Badge variant="secondary" className="tabular-nums leading-[var(--basalt-line-compact)]">
					{vm.count}
				</Badge>
			</header>
			{loading ? (
				<LayerCard padding="sm">
					<div role="status" aria-label="Loading context" className="space-y-basalt-space-lg">
						<SkeletonLine />
						<SkeletonLine />
						<SkeletonLine />
					</div>
				</LayerCard>
			) : error ? (
				<LayerCard padding="sm">
					<p role="alert" className="text-basalt-base text-basalt-danger">
						{error}
					</p>
					{onRetry && (
						<Button size="sm" variant="outline" className="mt-basalt-space-lg" onClick={onRetry}>
							Try again
						</Button>
					)}
				</LayerCard>
			) : vm.chunks.length === 0 ? (
				<p
					role="status"
					className="py-basalt-space-lg text-basalt-base text-basalt-muted-foreground"
				>
					No context retrieved
				</p>
			) : (
				<ul className="space-y-basalt-content-gap">
					{vm.chunks.map((chunk) => (
						<li
							key={chunk.id}
							className="basalt-agent-reveal"
							style={{ animationDelay: `${chunk.delay}ms`, animationFillMode: "both" }}
						>
							<LayerCard padding="none" className="min-w-0 overflow-hidden">
								<div className="flex flex-wrap items-center justify-between gap-basalt-control-gap border-b border-basalt-border px-basalt-panel-x py-basalt-panel-y">
									<h4 className="inline-flex min-w-0 items-center gap-basalt-row-gap text-basalt-code leading-[var(--basalt-line-body)] font-medium">
										<TextAlignStart
											aria-hidden="true"
											className="size-basalt-icon shrink-0"
											strokeWidth={1.5}
										/>
										<span className="break-words">{chunk.title}</span>
									</h4>
									<span className="shrink-0 text-basalt-sm tabular-nums text-basalt-muted-foreground">
										{chunk.characters.toLocaleString("en-US")} characters
									</span>
								</div>
								<p className="whitespace-pre-wrap break-words px-basalt-panel-x py-basalt-panel-y text-basalt-code leading-[var(--basalt-line-body)] text-basalt-muted-foreground">
									{chunk.body}
								</p>
								<div className="flex min-w-0 px-basalt-panel-x pb-basalt-panel-y">
									{chunk.href ? (
										<a
											href={chunk.href}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex max-w-full items-center gap-basalt-control-gap py-basalt-space-xs text-basalt-sm text-basalt-foreground outline-hidden hover:bg-basalt-hover focus-visible:ring-2 focus-visible:ring-basalt-ring"
										>
											<FileText
												aria-hidden="true"
												className="size-basalt-icon shrink-0"
												strokeWidth={1.5}
											/>
											<span className="shrink-0 font-mono text-basalt-xs text-basalt-muted-foreground">
												{chunk.source.type}
											</span>
											<span className="truncate" title={chunk.source.name}>
												{chunk.source.name}
											</span>
											<ExternalLink
												aria-hidden="true"
												className="size-basalt-icon shrink-0"
												strokeWidth={1.5}
											/>
										</a>
									) : (
										<span className="inline-flex max-w-full items-center gap-basalt-control-gap py-basalt-space-xs text-basalt-sm">
											<FileText
												aria-hidden="true"
												className="size-basalt-icon shrink-0"
												strokeWidth={1.5}
											/>
											<span className="shrink-0 font-mono text-basalt-xs text-basalt-muted-foreground">
												{chunk.source.type}
											</span>
											<span className="truncate" title={chunk.source.name}>
												{chunk.source.name}
											</span>
										</span>
									)}
								</div>
							</LayerCard>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

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
			className={cn("min-w-0 space-y-basalt-2", className)}
		>
			<header className="flex items-center gap-basalt-2">
				<h3 id={id} className="text-[13px] font-semibold">
					{title}
				</h3>
				<Badge variant="secondary" className="tabular-nums">
					{vm.count}
				</Badge>
			</header>
			{loading ? (
				<LayerCard padding="sm">
					<div role="status" aria-label="Loading context" className="space-y-basalt-3">
						<SkeletonLine />
						<SkeletonLine />
						<SkeletonLine />
					</div>
				</LayerCard>
			) : error ? (
				<LayerCard padding="sm">
					<p role="alert" className="text-sm text-basalt-danger">
						{error}
					</p>
					{onRetry && (
						<Button size="sm" variant="outline" className="mt-basalt-2" onClick={onRetry}>
							Try again
						</Button>
					)}
				</LayerCard>
			) : vm.chunks.length === 0 ? (
				<p role="status" className="py-basalt-3 text-sm text-basalt-muted-foreground">
					No context retrieved
				</p>
			) : (
				<ul className="space-y-basalt-2">
					{vm.chunks.map((chunk) => (
						<li
							key={chunk.id}
							className="basalt-agent-reveal"
							style={{ animationDelay: `${chunk.delay}ms`, animationFillMode: "both" }}
						>
							<LayerCard padding="none" className="min-w-0 overflow-hidden">
								<div className="flex flex-wrap items-center justify-between gap-basalt-1_5 border-b border-basalt-border px-basalt-card-sm py-basalt-2">
									<h4 className="inline-flex min-w-0 items-center gap-basalt-1_5 text-[13px] font-medium">
										<TextAlignStart aria-hidden="true" className="size-basalt-icon-sm shrink-0" />
										<span className="break-words">{chunk.title}</span>
									</h4>
									<span className="shrink-0 text-xs tabular-nums text-basalt-muted-foreground">
										{chunk.characters.toLocaleString("en-US")} characters
									</span>
								</div>
								<p className="whitespace-pre-wrap break-words px-basalt-card-sm py-basalt-2 text-[13px] leading-[var(--basalt-line-relaxed)] text-basalt-muted-foreground">
									{chunk.body}
								</p>
								<div className="px-basalt-card-sm pb-basalt-card-sm">
									{chunk.href ? (
										<a
											href={chunk.href}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex max-w-full items-center gap-basalt-1_5 rounded-full bg-basalt-control px-basalt-2 py-basalt-1 text-xs text-basalt-foreground outline-hidden hover:bg-basalt-accent focus-visible:ring-2 focus-visible:ring-basalt-ring"
										>
											<FileText aria-hidden="true" className="size-basalt-icon shrink-0" />
											<span className="shrink-0 font-mono text-[11px] text-basalt-muted-foreground">
												{chunk.source.type}
											</span>
											<span className="truncate" title={chunk.source.name}>
												{chunk.source.name}
											</span>
											<ExternalLink aria-hidden="true" className="size-basalt-icon-sm shrink-0" />
										</a>
									) : (
										<span className="inline-flex max-w-full items-center gap-basalt-1_5 rounded-full bg-basalt-control px-basalt-2 py-basalt-1 text-xs">
											<FileText aria-hidden="true" className="size-basalt-icon shrink-0" />
											<span className="shrink-0 font-mono text-[11px] text-basalt-muted-foreground">
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

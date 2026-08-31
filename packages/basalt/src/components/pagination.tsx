import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { controlSurfaceClass } from "./control-surface";

const itemClass = cn(
	"relative h-full w-9 shrink-0 rounded-none border-0 bg-transparent shadow-none first:rounded-l-basalt-md last:rounded-r-basalt-md",
	"hover:bg-basalt-accent focus-visible:bg-basalt-accent active:bg-basalt-accent",
	"disabled:pointer-events-none disabled:opacity-100 disabled:text-basalt-muted-foreground",
);

export function Pagination({
	page,
	pageCount = 10,
	onPageChange,
	simple = false,
	className,
}: {
	page: number;
	pageCount?: number;
	onPageChange?: (page: number) => void;
	simple?: boolean;
	className?: string;
}) {
	const last = Math.max(1, pageCount);
	const current = Math.min(last, Math.max(1, page));
	const atStart = current <= 1;
	const atEnd = current >= last;

	return (
		<nav aria-label="Pagination" className={className}>
			<div
				className={controlSurfaceClass(
					cn(
						"inline-flex h-9 items-stretch",
						"[&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-basalt-border",
						"[&>:first-child]:rounded-l-basalt-md [&>:last-child]:rounded-r-basalt-md",
					),
				)}
			>
				{simple ? null : (
					<Button
						variant="ghost"
						size="icon"
						icon={<ChevronsLeft />}
						className={itemClass}
						aria-label="First page"
						disabled={atStart}
						onClick={() => onPageChange?.(1)}
					/>
				)}
				<Button
					variant="ghost"
					size="icon"
					icon={<ChevronLeft />}
					className={itemClass}
					aria-label="Previous page"
					disabled={atStart}
					onClick={() => onPageChange?.(Math.max(1, current - 1))}
				/>
				{simple ? null : (
					<span
						aria-current="page"
						className="flex h-full min-w-9 items-center justify-center px-3 text-sm font-medium tabular-nums text-basalt-foreground"
					>
						{current}
					</span>
				)}
				<Button
					variant="ghost"
					size="icon"
					icon={<ChevronRight />}
					className={itemClass}
					aria-label="Next page"
					disabled={atEnd}
					onClick={() => onPageChange?.(Math.min(last, current + 1))}
				/>
				{simple ? null : (
					<Button
						variant="ghost"
						size="icon"
						icon={<ChevronsRight />}
						className={itemClass}
						aria-label="Last page"
						disabled={atEnd}
						onClick={() => onPageChange?.(last)}
					/>
				)}
			</div>
		</nav>
	);
}

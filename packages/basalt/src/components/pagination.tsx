import { cn } from "../utils/cn";
import { Button } from "./button";

export function Pagination({
	page,
	pageCount = 10,
	onPageChange,
	className,
}: {
	page: number;
	pageCount?: number;
	onPageChange?: (page: number) => void;
	className?: string;
}) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Button variant="outline" size="sm" onClick={() => onPageChange?.(Math.max(1, page - 1))}>
				Previous
			</Button>
			<span className="text-sm text-basalt-muted-foreground">
				{page} / {pageCount}
			</span>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
			>
				Next
			</Button>
		</div>
	);
}

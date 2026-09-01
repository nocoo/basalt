import type * as React from "react";
import { cn } from "../utils/cn";
import { Pagination } from "./pagination";

export interface TablePagerRange {
	start: number;
	end: number;
	totalCount: number;
}

export interface TablePagerProps {
	/** 1-based current page. */
	page: number;
	/** Number of rows on each page. */
	pageSize: number;
	/** Total number of rows. */
	totalCount: number;
	/** Called with the next 1-based page. */
	onPageChange: (page: number) => void;
	/**
	 * Disable every pagination control while keeping the range visible.
	 * @default false
	 */
	disabled?: boolean;
	/** Replace the default range copy with a custom node. */
	formatRange?: (range: TablePagerRange) => React.ReactNode;
	/** Additional classes for the pager bar. */
	className?: string;
}

function defaultRangeText({ start, end, totalCount }: TablePagerRange) {
	if (totalCount === 0) {
		return "No results";
	}
	return `Showing ${start}–${end} of ${totalCount}`;
}

export function TablePager({
	className,
	disabled = false,
	formatRange,
	onPageChange,
	page,
	pageSize,
	totalCount,
}: TablePagerProps) {
	const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
	const current = Math.min(pageCount, Math.max(1, page));
	const range: TablePagerRange =
		totalCount === 0
			? { start: 0, end: 0, totalCount }
			: {
					start: (current - 1) * pageSize + 1,
					end: Math.min(current * pageSize, totalCount),
					totalCount,
				};

	return (
		<div
			className={cn(
				"flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
				className,
			)}
		>
			<p className="text-sm text-basalt-muted-foreground">
				{formatRange ? formatRange(range) : defaultRangeText(range)}
			</p>
			<Pagination
				page={page}
				pageCount={pageCount}
				disabled={disabled}
				onPageChange={onPageChange}
			/>
		</div>
	);
}

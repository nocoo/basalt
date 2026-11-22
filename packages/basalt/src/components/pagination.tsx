import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Ellipsis,
} from "../utils/internal-icons";
import { Button } from "./button";

const itemClass = cn(
	"relative basalt-action-inset w-basalt-control shrink-0 rounded-none border-0 bg-transparent shadow-none first:rounded-l-basalt-md last:rounded-r-basalt-md",
	"hover:bg-basalt-hover focus-visible:bg-basalt-hover active:bg-basalt-hover",
	"disabled:pointer-events-none disabled:opacity-100 disabled:text-basalt-muted-foreground",
);

type PaginationPageItem = number | "start-ellipsis" | "end-ellipsis";

function buildPaginationItems(
	current: number,
	pageCount: number,
	siblingCount: number,
): PaginationPageItem[] {
	const siblings = Math.max(0, Math.floor(siblingCount));
	const totalNumbers = siblings * 2 + 5;
	if (pageCount <= totalNumbers) {
		return Array.from({ length: pageCount }, (_, index) => index + 1);
	}

	const leftSibling = Math.max(current - siblings, 1);
	const rightSibling = Math.min(current + siblings, pageCount);
	const showLeftEllipsis = leftSibling > 2;
	const showRightEllipsis = rightSibling < pageCount - 1;

	if (!showLeftEllipsis && showRightEllipsis) {
		const leftCount = 3 + 2 * siblings;
		return [
			...Array.from({ length: leftCount }, (_, index) => index + 1),
			"end-ellipsis",
			pageCount,
		];
	}

	if (showLeftEllipsis && !showRightEllipsis) {
		const rightCount = 3 + 2 * siblings;
		const start = pageCount - rightCount + 1;
		return [
			1,
			"start-ellipsis",
			...Array.from({ length: rightCount }, (_, index) => start + index),
		];
	}

	return [
		1,
		"start-ellipsis",
		...Array.from({ length: rightSibling - leftSibling + 1 }, (_, index) => leftSibling + index),
		"end-ellipsis",
		pageCount,
	];
}

export interface PaginationProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
	/**
	 * Controlled 1-based page.
	 */
	page?: number;
	/**
	 * Uncontrolled initial page.
	 * @default 1
	 */
	defaultPage?: number;
	/**
	 * Last page number.
	 * @default 10
	 */
	pageCount?: number;
	/**
	 * Called when the page changes.
	 */
	onPageChange?: (page: number) => void;
	/**
	 * Hide first, last, and page number controls.
	 * @default false
	 */
	simple?: boolean;
	/**
	 * Render clickable numbered page buttons with ellipsis truncation instead of a single current-page badge.
	 * @default false
	 */
	showPageNumbers?: boolean;
	/**
	 * Number of sibling pages displayed on each side of the current page when `showPageNumbers` is enabled.
	 * @default 1
	 */
	siblingCount?: number;
	/**
	 * Disable every control.
	 * @default false
	 */
	disabled?: boolean;
}

/** Segmented page navigator supporting compact, simple, and numbered page modes. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
	{
		page,
		defaultPage = 1,
		pageCount = 10,
		onPageChange,
		simple = false,
		showPageNumbers = false,
		siblingCount = 1,
		disabled = false,
		className,
		"aria-label": ariaLabel,
		...props
	},
	ref,
) {
	const [uncontrolled, setUncontrolled] = useState(defaultPage);
	const last = Math.max(1, pageCount);
	const current = Math.min(last, Math.max(1, page ?? uncontrolled));
	const go = (next: number) => {
		if (page === undefined) {
			setUncontrolled(next);
		}
		onPageChange?.(next);
	};
	const atStart = current <= 1;
	const atEnd = current >= last;
	const startDisabled = disabled || atStart;
	const endDisabled = disabled || atEnd;
	const pageItems =
		showPageNumbers && !simple ? buildPaginationItems(current, last, siblingCount) : [];

	return (
		<nav
			ref={ref}
			data-slot="pagination"
			aria-label={ariaLabel ?? "Pagination"}
			className={className}
			{...props}
		>
			<div
				className={controlSurfaceClass(
					cn(
						"inline-flex min-h-basalt-control items-stretch",
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
						disabled={startDisabled}
						onClick={() => go(1)}
					/>
				)}
				<Button
					variant="ghost"
					size="icon"
					icon={<ChevronLeft />}
					className={itemClass}
					aria-label="Previous page"
					disabled={startDisabled}
					onClick={() => go(Math.max(1, current - 1))}
				/>
				{simple ? null : showPageNumbers ? (
					pageItems.map((item) =>
						typeof item === "number" ? (
							<Button
								key={item}
								variant="ghost"
								className={cn(
									itemClass,
									"min-w-basalt-control w-auto px-basalt-space-md font-medium tabular-nums",
									item === current && "basalt-choice text-basalt-foreground",
								)}
								aria-label={`Page ${item}`}
								aria-current={item === current ? "page" : undefined}
								disabled={disabled}
								onClick={() => {
									if (item !== current) {
										go(item);
									}
								}}
							>
								{item}
							</Button>
						) : (
							<span
								key={item}
								aria-hidden="true"
								className="flex w-basalt-control shrink-0 items-center justify-center text-basalt-muted-foreground"
							>
								<Ellipsis className="size-basalt-icon-sm" />
							</span>
						),
					)
				) : (
					<span
						aria-current="page"
						className="basalt-choice flex min-w-basalt-control items-center justify-center px-basalt-space-lg text-basalt-base font-medium tabular-nums text-basalt-foreground"
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
					disabled={endDisabled}
					onClick={() => go(Math.min(last, current + 1))}
				/>
				{simple ? null : (
					<Button
						variant="ghost"
						size="icon"
						icon={<ChevronsRight />}
						className={itemClass}
						aria-label="Last page"
						disabled={endDisabled}
						onClick={() => go(last)}
					/>
				)}
			</div>
		</nav>
	);
});

Pagination.displayName = "Pagination";

import type { HTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "../utils/cn";
import { LayerCard, type LayerCardProps } from "./layer-card";

export type GridColumnCount = 1 | 2 | 3 | 4 | 6 | 12;

export type ResponsiveGridColumns = {
	base?: GridColumnCount;
	sm?: GridColumnCount;
	md?: GridColumnCount;
	lg?: GridColumnCount;
	xl?: GridColumnCount;
};

export type GridSpan = 1 | 2 | 3 | 4 | 6 | 12 | "full";

export type ResponsiveGridSpan =
	| GridSpan
	| {
			base?: GridSpan;
			sm?: GridSpan;
			md?: GridSpan;
			lg?: GridSpan;
			xl?: GridSpan;
	  };

export type GridProps = {
	/**
	 * Number of equal columns or container-responsive column counts per breakpoint.
	 * @default 2
	 */
	columns?: number | ResponsiveGridColumns;
	/**
	 * When true and `columns` is a preset count (`2`, `3`, `4`, `6`, `12`), adapt columns at island container breakpoints (or viewport fallback outside islands).
	 * @default false
	 */
	responsive?: boolean;
	/** Space between layout items: 12, 16, 24 or 32px reference. @default "md" */
	gap?: "sm" | "md" | "lg" | "xl";
	/**
	 * Additional classes for the grid.
	 */
	className?: string;
	children?: ReactNode;
	/**
	 * Ref forwarded to the grid container element.
	 */
	ref?: Ref<HTMLDivElement>;
};

const GAP_CLASSES = {
	sm: "gap-basalt-layout-sm",
	md: "gap-basalt-layout",
	lg: "gap-basalt-layout-lg",
	xl: "gap-basalt-layout-xl",
} as const;

const RESPONSIVE_COLUMN_PRESETS: Record<number, ResponsiveGridColumns> = {
	1: { base: 1 },
	2: { base: 1, sm: 2 },
	3: { base: 1, sm: 2, md: 3 },
	4: { base: 1, sm: 2, lg: 4 },
	6: { base: 1, sm: 2, md: 3, lg: 6 },
	12: { base: 1, md: 6, lg: 12 },
};

function resolveResponsiveColumns(
	columns: number | ResponsiveGridColumns,
	responsive: boolean,
): ResponsiveGridColumns | null {
	if (typeof columns === "object") {
		return columns;
	}
	if (responsive) {
		return RESPONSIVE_COLUMN_PRESETS[columns] ?? null;
	}
	return null;
}

export function Grid({
	className,
	columns = 2,
	responsive = false,
	gap = "md",
	ref,
	style,
	...props
}: GridProps & HTMLAttributes<HTMLDivElement>) {
	const responsiveCols = resolveResponsiveColumns(columns, responsive);
	if (responsiveCols) {
		return (
			<div
				ref={ref}
				data-slot="grid"
				data-cols-base={responsiveCols.base ?? 1}
				data-cols-sm={responsiveCols.sm}
				data-cols-md={responsiveCols.md}
				data-cols-lg={responsiveCols.lg}
				data-cols-xl={responsiveCols.xl}
				className={cn("basalt-grid grid", GAP_CLASSES[gap], className)}
				style={style}
				{...props}
			/>
		);
	}
	return (
		<div
			ref={ref}
			data-slot="grid"
			className={cn("grid", GAP_CLASSES[gap], className)}
			{...props}
			style={{
				gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
				...style,
			}}
		/>
	);
}
Grid.displayName = "Grid";

export type GridItemProps = LayerCardProps & {
	/**
	 * Number of columns the grid item spans (`"full"` or responsive breakpoint map).
	 */
	colSpan?: ResponsiveGridSpan;
	/**
	 * Number of grid rows the item spans.
	 */
	rowSpan?: 1 | 2 | 3 | 4;
	/**
	 * Ref forwarded to the grid item surface element.
	 */
	ref?: Ref<HTMLDivElement>;
};

export function GridItem({ className, colSpan, rowSpan, style, ref, ...props }: GridItemProps) {
	const responsiveSpan = typeof colSpan === "object" && colSpan !== null ? colSpan : null;
	const scalarSpan = responsiveSpan === null ? colSpan : undefined;

	return (
		<LayerCard
			ref={ref}
			data-slot="grid-item"
			data-span-base={responsiveSpan?.base}
			data-span-sm={responsiveSpan?.sm}
			data-span-md={responsiveSpan?.md}
			data-span-lg={responsiveSpan?.lg}
			data-span-xl={responsiveSpan?.xl}
			className={cn(
				"flex items-center justify-center text-basalt-base",
				responsiveSpan && "basalt-grid-item",
				className,
			)}
			style={{
				...(scalarSpan !== undefined
					? {
							gridColumn:
								scalarSpan === "full" ? "1 / -1" : `span ${scalarSpan} / span ${scalarSpan}`,
						}
					: undefined),
				...(rowSpan !== undefined
					? {
							gridRow: `span ${rowSpan} / span ${rowSpan}`,
						}
					: undefined),
				...style,
			}}
			{...props}
		/>
	);
}
GridItem.displayName = "GridItem";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";

/** Logical inline alignment. Maps to CSS `text-align: start | end`. */
export type TableTextAlign = "start" | "end";
export type TableSortDirection = "asc" | "desc";

export type TableProps = {
	/**
	 * Additional classes for the table.
	 */
	className?: string;
};

export const Table = React.forwardRef<
	HTMLTableElement,
	TableProps & React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
	<table
		ref={ref}
		data-basalt-table=""
		className={cn(
			BASALT_UI_CLASS,
			"w-full border-separate border-spacing-0 caption-bottom text-start text-basalt-code leading-[var(--basalt-line-body)] text-basalt-foreground",
			className,
		)}
		{...props}
	/>
));
Table.displayName = "Table";

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = (props: TableHeaderProps) => <thead {...props} />;

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = (props: TableBodyProps) => <tbody {...props} />;

export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableFooter = (props: TableFooterProps) => <tfoot {...props} />;

export type TableRowVariant = "default" | "selected";

export type TableRowProps = {
	/**
	 * Highlight the row as selected.
	 * @default "default"
	 */
	variant?: TableRowVariant;
	/**
	 * Additional classes for the row.
	 */
	className?: string;
};

export const TableRow = ({
	className,
	variant = "default",
	...props
}: TableRowProps & React.HTMLAttributes<HTMLTableRowElement>) => (
	<tr
		{...props}
		aria-selected={variant === "selected" ? true : props["aria-selected"]}
		className={className}
	/>
);

function textAlignClass(textAlign?: TableTextAlign) {
	if (textAlign === "end") return "text-end tabular-nums";
	if (textAlign === "start") return "text-start";
}

export type TableHeadProps = {
	/**
	 * Additional classes for the header cell.
	 */
	className?: string;
	/**
	 * Logical inline alignment. Omitted headers keep `text-start` unless native `align` is set.
	 */
	textAlign?: TableTextAlign;
};

export const TableHead = ({
	className,
	textAlign,
	align,
	...props
}: TableHeadProps & React.ThHTMLAttributes<HTMLTableCellElement>) => (
	<th
		className={cn(
			"relative h-basalt-table-row whitespace-nowrap border-b border-basalt-border ps-basalt-table-x pe-basalt-table-x py-basalt-table-y align-middle text-basalt-sm font-medium text-basalt-muted-foreground",
			textAlignClass(textAlign) ?? (align == null ? "text-start" : undefined),
			className,
		)}
		align={align}
		{...props}
	/>
);

export type TableCellProps = {
	/**
	 * Additional classes for the cell.
	 */
	className?: string;
	/**
	 * Logical inline alignment. Omitted cells inherit from the table or row. Native HTML `align` is unchanged.
	 */
	textAlign?: TableTextAlign;
};

export const TableCell = ({
	className,
	textAlign,
	...props
}: TableCellProps & React.TdHTMLAttributes<HTMLTableCellElement>) => (
	<td
		className={cn(
			"relative h-basalt-table-row ps-basalt-table-x pe-basalt-table-x py-basalt-table-y align-middle",
			textAlignClass(textAlign),
			className,
		)}
		{...props}
	/>
);

export type TableCaptionProps = {
	/**
	 * Additional classes for the caption.
	 */
	className?: string;
};

export function TableCaption({
	className,
	...props
}: TableCaptionProps & React.HTMLAttributes<HTMLTableCaptionElement>) {
	return (
		<caption
			className={cn("mt-basalt-space-lg text-basalt-base text-basalt-muted-foreground", className)}
			{...props}
		/>
	);
}

export type TableSortableHeaderProps = {
	children: React.ReactNode;
	/**
	 * Logical control layout. `end` places the sort icon inward of the label.
	 * @default "start"
	 */
	textAlign?: TableTextAlign;
	/**
	 * Current sort direction when this column is sorted.
	 */
	sorted?: TableSortDirection;
	className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "className">;

function SortIcon({ sorted, trailing }: { sorted?: TableSortDirection; trailing: boolean }) {
	const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
	return (
		<Icon
			aria-hidden="true"
			className={cn(
				"size-basalt-icon-sm shrink-0",
				trailing && "ms-auto",
				!sorted &&
					"opacity-0 transition-opacity basalt-motion group-hover:opacity-60 group-focus-visible:opacity-60 motion-reduce:transition-none",
			)}
			strokeWidth={1.5}
		/>
	);
}

export const TableSortableHeader = React.forwardRef<HTMLButtonElement, TableSortableHeaderProps>(
	({ children, textAlign = "start", sorted, className, ...props }, ref) => {
		const label = (
			<span className="flex min-w-0 items-center gap-basalt-control-gap truncate">{children}</span>
		);
		const icon = <SortIcon sorted={sorted} trailing={textAlign !== "end"} />;
		return (
			<button
				type="button"
				ref={ref}
				className={cn(
					"group flex w-full cursor-pointer items-center gap-basalt-control-gap rounded-basalt-sm border-0 bg-transparent p-0 font-inherit text-inherit font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basalt-primary",
					textAlign === "end" ? "justify-end text-end" : "text-start",
					className,
				)}
				{...props}
			>
				{textAlign === "end" ? (
					<>
						{icon}
						{label}
					</>
				) : (
					<>
						{label}
						{icon}
					</>
				)}
			</button>
		);
	},
);
TableSortableHeader.displayName = "TableSortableHeader";

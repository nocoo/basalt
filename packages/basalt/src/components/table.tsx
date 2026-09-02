import * as React from "react";
import { cn } from "../utils/cn";

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
		className={cn(
			"w-full border-separate border-spacing-0 caption-bottom text-left text-sm text-basalt-foreground",
			className,
		)}
		{...props}
	/>
));
Table.displayName = "Table";

export const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
	<thead {...props} />
);
export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
	<tbody {...props} />
);
export const TableFooter = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
	<tfoot {...props} />
);

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
		className={cn(
			variant === "selected" ? "[&_td]:bg-basalt-accent" : "even:[&_td]:bg-basalt-secondary",
			className,
		)}
	/>
);

export type TableHeadProps = {
	/**
	 * Additional classes for the header cell.
	 */
	className?: string;
};

export const TableHead = ({
	className,
	...props
}: TableHeadProps & React.ThHTMLAttributes<HTMLTableCellElement>) => (
	<th
		className={cn(
			"border-b border-basalt-border bg-basalt-card p-3 text-left font-semibold first:rounded-tl-basalt-md last:rounded-tr-basalt-md",
			className,
		)}
		{...props}
	/>
);

export type TableCellProps = {
	/**
	 * Additional classes for the cell.
	 */
	className?: string;
};

export const TableCell = ({
	className,
	...props
}: TableCellProps & React.TdHTMLAttributes<HTMLTableCellElement>) => (
	<td className={cn("p-3", className)} {...props} />
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
		<caption className={cn("mt-2 text-sm text-basalt-muted-foreground", className)} {...props} />
	);
}

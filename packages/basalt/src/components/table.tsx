import * as React from "react";
import { cn } from "../utils/cn";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<table
			ref={ref}
			className={cn(
				"w-full border-separate border-spacing-0 caption-bottom text-left text-sm text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	),
);
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

export const TableRow = ({
	className,
	variant = "default",
	...props
}: React.HTMLAttributes<HTMLTableRowElement> & { variant?: TableRowVariant }) => (
	<tr
		className={cn(
			variant === "selected" ? "[&_td]:bg-basalt-accent" : "even:[&_td]:bg-basalt-secondary",
			className,
		)}
		{...props}
	/>
);

export const TableHead = ({
	className,
	...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
	<th
		className={cn(
			"border-b border-basalt-border bg-basalt-card p-3 text-left font-semibold first:rounded-tl-basalt-md last:rounded-tr-basalt-md",
			className,
		)}
		{...props}
	/>
);

export const TableCell = ({
	className,
	...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
	<td className={cn("p-3", className)} {...props} />
);

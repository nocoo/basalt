import * as React from "react";
import { cn } from "../utils/cn";

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
	),
);
Table.displayName = "Table";

export const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
	<thead {...props} />
);
export const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
	<tbody {...props} />
);
export const TableRow = (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />;
export const TableHead = ({
	className,
	...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
	<th
		className={cn("h-10 px-3 text-left font-medium text-basalt-muted-foreground", className)}
		{...props}
	/>
);
export const TableCell = ({
	className,
	...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
	<td className={cn("px-3 py-2", className)} {...props} />
);

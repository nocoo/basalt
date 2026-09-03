import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type DescriptionListColumns = 1 | 2 | 3;

export type DescriptionListProps = HTMLAttributes<HTMLDListElement> & {
	/**
	 * Number of term/value columns from the small breakpoint up.
	 * @default 2
	 */
	columns?: DescriptionListColumns;
};

const COLUMN_CLASS: Record<DescriptionListColumns, string> = {
	1: "sm:grid-cols-1",
	2: "sm:grid-cols-2",
	3: "sm:grid-cols-3",
};

function DescriptionListRoot({ className, columns = 2, ...props }: DescriptionListProps) {
	return (
		<dl
			className={cn("grid gap-x-8 gap-y-3 text-sm", COLUMN_CLASS[columns], className)}
			{...props}
		/>
	);
}
DescriptionListRoot.displayName = "DescriptionList";

export type DescriptionListItemProps = HTMLAttributes<HTMLDivElement> & {
	/**
	 * Term shown above the value.
	 */
	term: ReactNode;
};

function DescriptionListItem({ term, className, children, ...props }: DescriptionListItemProps) {
	return (
		<div className={cn("min-w-0", className)} {...props}>
			<dt className="text-xs text-basalt-muted-foreground">{term}</dt>
			<dd className="mt-0.5 wrap-break-word text-basalt-foreground">{children}</dd>
		</div>
	);
}
DescriptionListItem.displayName = "DescriptionList.Item";

export const DescriptionList = Object.assign(DescriptionListRoot, {
	Item: DescriptionListItem,
});

import { cn } from "../utils/cn";

export type ItemListItem = { id?: string; label: string; value?: string };

export type ItemListProps = {
	items: ItemListItem[];
	ariaLabel?: string;
	className?: string;
};

export function ItemList({ items, ariaLabel = "Item list", className }: ItemListProps) {
	return (
		<ul className={cn("space-y-1 text-sm", className)} aria-label={ariaLabel}>
			{items.map((item, index) => (
				<li key={item.id ?? `${item.label}-${item.value ?? ""}-${index}`}>
					{item.label}
					{item.value ? <span className="text-basalt-muted-foreground"> {item.value}</span> : null}
				</li>
			))}
		</ul>
	);
}

import { cn } from "../utils/cn";

export function ItemList({
	items = [{ label: "Worker A" }, { label: "Worker B" }, { label: "Worker C" }],
	ariaLabel = "Item list",
	className,
}: {
	items?: { id?: string; label: string; value?: string }[];
	ariaLabel?: string;
	className?: string;
}) {
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

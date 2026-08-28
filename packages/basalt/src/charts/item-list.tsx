export function ItemList({
	items = [{ label: "Worker A" }, { label: "Worker B" }, { label: "Worker C" }],
	ariaLabel = "Item list",
	className,
}: {
	items?: { label: string; value?: string }[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ul className={className ?? "space-y-1 text-sm"} aria-label={ariaLabel}>
			{items.map((item) => (
				<li key={item.label}>
					{item.label}
					{item.value ? <span className="text-basalt-muted-foreground"> {item.value}</span> : null}
				</li>
			))}
		</ul>
	);
}

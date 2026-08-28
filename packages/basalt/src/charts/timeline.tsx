export function Timeline({
	items = [
		{ title: "Created", at: "Mon" },
		{ title: "Shipped", at: "Tue" },
	],
	ariaLabel = "Timeline",
	className,
}: {
	items?: { title: string; at?: string }[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ol className={className ?? "space-y-2 text-sm"} aria-label={ariaLabel}>
			{items.map((item) => (
				<li key={item.title} className="flex gap-2">
					<span className="text-basalt-muted-foreground">{item.at}</span>
					<span>{item.title}</span>
				</li>
			))}
		</ol>
	);
}

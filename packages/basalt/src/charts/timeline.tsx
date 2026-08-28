import { cn } from "../utils/cn";

export function Timeline({
	items = [
		{ title: "Created", at: "Mon" },
		{ title: "Shipped", at: "Tue" },
	],
	ariaLabel = "Timeline",
	className,
}: {
	items?: { id?: string; title: string; at?: string }[];
	ariaLabel?: string;
	className?: string;
}) {
	return (
		<ol className={cn("space-y-2 text-sm", className)} aria-label={ariaLabel}>
			{items.map((item, index) => (
				<li key={item.id ?? `${item.at ?? ""}-${item.title}-${index}`} className="flex gap-2">
					<span className="text-basalt-muted-foreground">{item.at}</span>
					<span>{item.title}</span>
				</li>
			))}
		</ol>
	);
}

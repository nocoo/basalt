import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { PageIntro } from "@/components/PageIntro";
import { CATALOG, CATALOG_CATEGORIES } from "./catalog";
import { UI_DEMOS } from "./demos";

export default function UiIndexPage() {
	return (
		<div data-status="index" className="space-y-8">
			<PageIntro
				title="Home"
				description="Every public Basalt export. Kumo's component list is covered in full; extra Basalt controls stay listed."
				eyebrow="Library"
				icon={BookOpen}
			/>
			{CATALOG_CATEGORIES.map((category) => {
				const items = CATALOG.filter((entry) => entry.category === category.id);
				if (items.length === 0) {
					return null;
				}
				return (
					<section key={category.id} className="space-y-3">
						<h3 className="text-sm font-medium text-muted-foreground">{category.label}</h3>
						<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{items.map((entry) => {
								const Demo = UI_DEMOS[entry.slug];
								return (
									<li key={entry.slug} className="relative rounded-card bg-secondary p-4">
										<Link
											to={`/ui/${entry.slug}`}
											aria-label={entry.name}
											className="absolute inset-0 z-10 rounded-card"
										/>
										<div className="pointer-events-none min-h-16 mb-3 text-muted-foreground">
											{Demo ? <Demo /> : <span>未实现</span>}
										</div>
										<div className="flex items-center justify-between gap-2 text-sm">
											<span>{entry.name}</span>
											<span className="text-xs text-muted-foreground">{entry.kind}</span>
										</div>
									</li>
								);
							})}
						</ul>
					</section>
				);
			})}
		</div>
	);
}

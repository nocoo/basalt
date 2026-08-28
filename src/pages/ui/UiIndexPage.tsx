import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { PageIntro } from "@/components/PageIntro";
import { CATALOG, CATALOG_CATEGORIES } from "./catalog";

export default function UiIndexPage() {
	return (
		<div data-status="index" className="space-y-4">
			<PageIntro
				title="Library"
				description="Catalog of every public Basalt export. Unbuilt pages are placeholders."
				eyebrow="Controls"
				icon={BookOpen}
			/>
			{CATALOG_CATEGORIES.map((category) => {
				const items = CATALOG.filter((entry) => entry.category === category.id);
				if (items.length === 0) {
					return null;
				}
				return (
					<section key={category.id} className="rounded-card bg-secondary p-5 md:p-6">
						<h3 className="text-sm font-medium text-muted-foreground mb-3">{category.label}</h3>
						<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{items.map((entry) => (
								<li key={entry.slug}>
									<Link
										to={`/ui/${entry.slug}`}
										aria-label={entry.name}
										className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
									>
										<span>{entry.name}</span>
										<span className="text-xs text-muted-foreground">{entry.kind}</span>
									</Link>
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</div>
	);
}

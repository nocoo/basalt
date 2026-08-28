import { BookOpen } from "lucide-react";
import { Link, useParams } from "react-router";
import { PageIntro } from "@/components/PageIntro";
import { CATALOG_BY_SLUG, catalogImportPath } from "./catalog";
import { UI_DEMOS } from "./demos";

export default function UiPlaceholderPage() {
	const { slug } = useParams<{ slug: string }>();
	const entry = slug ? CATALOG_BY_SLUG.get(slug) : undefined;

	if (!entry) {
		return (
			<div data-status="missing" className="space-y-4">
				<PageIntro
					title={slug ?? "Unknown"}
					description="This slug is not a 6.2 public export."
					eyebrow="Library"
					icon={BookOpen}
				/>
			</div>
		);
	}

	const Demo = UI_DEMOS[entry.slug];
	if (Demo) {
		return (
			<div data-status="ready" data-slug={entry.slug} className="space-y-4">
				<PageIntro
					title={entry.name}
					description={`import { ${entry.name} } from "${catalogImportPath(entry)}"`}
					eyebrow="Library"
					icon={BookOpen}
				/>
				<div className="rounded-card bg-secondary p-5 md:p-6 space-y-4">
					<Demo />
					<p className="text-xs text-muted-foreground">
						Source: Basalt family + this repo tokens. Import path above. Props follow the component
						TypeScript export.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div data-status="placeholder" data-slug={entry.slug} className="space-y-4">
			<PageIntro
				title={entry.name}
				description="未实现. This catalog page is a placeholder until the control ships."
				eyebrow="Library"
				icon={BookOpen}
			/>
			<div className="rounded-card bg-secondary p-5 text-sm text-muted-foreground space-y-2">
				<p>
					<Link className="text-foreground underline underline-offset-4" to="/ui">
						Library index
					</Link>
				</p>
				<p className="flex flex-wrap gap-3">
					<a
						className="text-foreground underline underline-offset-4"
						href="https://github.com/nocoo/basalt/blob/main/docs/01-plan-2-0.md"
					>
						docs/01-plan-2-0.md
					</a>
					<a
						className="text-foreground underline underline-offset-4"
						href="https://github.com/nocoo/basalt/blob/main/docs/02-implementation.md"
					>
						docs/02-implementation.md
					</a>
				</p>
			</div>
		</div>
	);
}

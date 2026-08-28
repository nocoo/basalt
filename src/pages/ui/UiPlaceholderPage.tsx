import { BookOpen } from "lucide-react";
import { Link, useParams } from "react-router";
import { PageIntro } from "@/components/PageIntro";
import { CATALOG_BY_SLUG } from "./catalog";

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
				<p>
					<code className="text-foreground">docs/01-plan-2-0.md</code>
					{" · "}
					<code className="text-foreground">docs/02-implementation.md</code>
				</p>
			</div>
		</div>
	);
}

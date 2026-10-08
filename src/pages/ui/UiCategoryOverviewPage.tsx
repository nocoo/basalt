import { Badge } from "@nocoo/basalt/components/badge";
import { Grid } from "@nocoo/basalt/components/grid";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { useState } from "react";
import { useParams } from "react-router";
import { ShowcasePage } from "@/components/ShowcasePage";
import { SITE } from "@/lib/site";
import { catalogNavName, libraryNavEntries } from "./catalog";
import { catalogCategory } from "./catalog-categories";
import { CATEGORY_GUIDES } from "./catalog-category-guides";
import { catalogPageStatus } from "./catalog-page-status";

function SpacingPreview({ category }: { category: "card" | "layout" }) {
	const [size, setSize] = useState<"sm" | "md" | "lg" | "xl">("md");
	return (
		<div className="space-y-basalt-layout-sm">
			<Select value={size} onValueChange={(value) => setSize(value as typeof size)}>
				<SelectTrigger aria-label="Spacing tier" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="sm">Small - 12px / .75rem</SelectItem>
					<SelectItem value="md">Medium - 16px / 1rem</SelectItem>
					<SelectItem value="lg">Large - 24px / 1.5rem</SelectItem>
					<SelectItem value="xl">Extra large - 32px / 2rem</SelectItem>
				</SelectContent>
			</Select>
			{category === "card" ? (
				<LayerCard padding={size} data-spacing-preview="card">
					<p className="text-basalt-base">Padding surrounds content, not its actions.</p>
				</LayerCard>
			) : (
				<Grid gap={size} data-spacing-preview="layout">
					<LayerCard>First region</LayerCard>
					<LayerCard>Second region</LayerCard>
				</Grid>
			)}
		</div>
	);
}

export default function UiCategoryOverviewPage() {
	const { category: categoryId } = useParams<{ category: string }>();
	const category = catalogCategory(categoryId);
	if (!category) {
		return (
			<ShowcasePage
				variant="document"
				data-status="missing"
				title="Category not found"
				description="Choose a category from the library."
			>
				<Link href="/ui">Library index</Link>
			</ShowcasePage>
		);
	}
	const guide = CATEGORY_GUIDES[category.id];
	const entries = libraryNavEntries(category.id);
	return (
		<ShowcasePage
			variant="document"
			data-category-overview={category.id}
			title={`${category.label} overview`}
			description={category.description}
		>
			<SectionRule variant="heading" title="Design thinking">
				<p className="max-w-[65ch] text-basalt-lg leading-basalt-relaxed text-basalt-muted-foreground">
					{guide.rationale}
				</p>
			</SectionRule>
			<div className="grid gap-basalt-layout lg:grid-cols-2">
				<LayerCard>
					<LayerCard.Header>
						<h2 className="text-basalt-base font-medium">Size and spacing</h2>
					</LayerCard.Header>
					<LayerCard.Body className="space-y-basalt-card-sm">
						<p className="text-basalt-base font-medium">{category.size}</p>
						<p className="text-basalt-base text-basalt-muted-foreground">{guide.geometry}</p>
						{category.id === "card" || category.id === "layout" ? (
							<SpacingPreview category={category.id} />
						) : null}
					</LayerCard.Body>
				</LayerCard>
				<LayerCard>
					<LayerCard.Header>
						<h2 className="text-basalt-base font-medium">Interaction and motion</h2>
					</LayerCard.Header>
					<LayerCard.Body>
						<p className="text-basalt-base text-basalt-muted-foreground">{guide.interaction}</p>
					</LayerCard.Body>
				</LayerCard>
			</div>
			<SectionRule variant="heading" title="Best practices">
				<ul className="grid gap-basalt-layout md:grid-cols-2">
					{guide.practices.map((practice, index) => (
						<li key={practice} className="flex items-start gap-basalt-space-lg text-basalt-base">
							<Badge variant="outline" className="shrink-0 tabular-nums" aria-hidden="true">
								{index + 1}
							</Badge>
							<p>{practice}</p>
						</li>
					))}
				</ul>
			</SectionRule>
			<SectionRule
				variant="heading"
				title="In this group"
				actions={<Badge variant="secondary">{entries.length} items</Badge>}
			>
				<ul className="grid gap-basalt-layout sm:grid-cols-2 xl:grid-cols-3">
					{entries.map((entry) => (
						<li key={entry.slug} className="flex items-center gap-basalt-space-lg text-basalt-base">
							{catalogPageStatus(entry.slug) === "ready" ? (
								<Link href={`/ui/${entry.slug}`}>{catalogNavName(entry)}</Link>
							) : (
								<>
									<span>{catalogNavName(entry)}</span>
									<Badge variant="outline">Planned</Badge>
								</>
							)}
						</li>
					))}
				</ul>
			</SectionRule>
			<LayerCard>
				<LayerCard.Header>
					<h2 className="text-basalt-base font-medium">One shared contract</h2>
				</LayerCard.Header>
				<LayerCard.Body className="space-y-basalt-card-sm text-basalt-base">
					<p className="text-basalt-muted-foreground">
						Control spacing uses .125rem, .25rem, .375rem and .5rem. Cards and layouts use .75rem,
						1rem, 1.5rem and 2rem; cards and grids default to 1rem, page sections to 1.5rem. Shared
						tokens own typography, radii, color and motion. Reference sizes assume a 16px root,
						never a forced root font size or a fixed-height limit. Verify wrapping, text zoom, both
						themes, keyboard use and reduced motion.
					</p>
					<div className="flex flex-wrap gap-basalt-space-lg">
						<Link
							href={`${SITE.github}/blob/main/DESIGN.md`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Design contract
						</Link>
						<Link
							href={`${SITE.github}/blob/main/INTEGRATION.md`}
							target="_blank"
							rel="noopener noreferrer"
						>
							Integration guide
						</Link>
					</div>
				</LayerCard.Body>
			</LayerCard>
		</ShowcasePage>
	);
}

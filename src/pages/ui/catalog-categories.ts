export const CATALOG_CATEGORIES = [
	{
		id: "inline",
		label: "Inline",
		description: "Small pieces of context that belong beside text, not above it.",
		size: "1.375rem single line (22px reference)",
	},
	{
		id: "action",
		label: "Actions",
		description: "Controls for entering values, choosing options and committing intent.",
		size: "2.125rem default (34px reference)",
	},
	{
		id: "banner",
		label: "Banners",
		description: "Concise feedback that explains what changed and what to do next.",
		size: "2.375rem single line (38px reference)",
	},
	{
		id: "card",
		label: "Cards",
		description: "Content surfaces that group related information through matte depth.",
		size: "Content-driven; no mandatory height",
	},
	{
		id: "layout",
		label: "Layouts",
		description: "Compositions that organize content, navigation and application structure.",
		size: "Intrinsic layout; children retain their own sizing rules",
	},
	{
		id: "overlay",
		label: "Overlays",
		description: "Temporary surfaces that reveal detail without losing the current context.",
		size: "Content-driven surface; action-sized triggers",
	},
	{
		id: "primitive",
		label: "Primitives",
		description: "Text, identity marks and graphic controls with their own natural geometry.",
		size: "Typography or graphic geometry, not a universal control height",
	},
	{
		id: "chart",
		label: "Charts",
		description: "Data displays that prioritize comparison, meaning and accessible alternatives.",
		size: "Data-driven geometry; action-sized toolbars",
	},
	{
		id: "block",
		label: "Blocks",
		description: "Reusable page-level patterns composed from the same component rules.",
		size: "Natural composition; no independent density scale",
	},
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number]["id"];

export function catalogCategoryPath(category: CatalogCategory): string {
	return `/ui/overview/${category}`;
}

export function catalogCategory(category: string | undefined) {
	return CATALOG_CATEGORIES.find((entry) => entry.id === category);
}

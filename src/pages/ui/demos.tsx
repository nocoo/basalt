import { EXTRA_EXAMPLES } from "./catalog-ready";
import type { CatalogScenario } from "./catalog-scenario";
import { KUMO_EXAMPLES } from "./kumo-examples";

export const UI_EXAMPLES: Record<string, CatalogScenario[]> = {
	...EXTRA_EXAMPLES,
	...KUMO_EXAMPLES,
};

export function catalogHeroScenario(slug: string): CatalogScenario | undefined {
	return UI_EXAMPLES[slug]?.[0];
}

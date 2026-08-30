import type { ComponentType } from "react";

export interface CatalogScenario {
	id: string;
	title: string;
	code: string;
	render: ComponentType;
}

export function catalogScenarioId(slug: string, key: string): string {
	return `${slug}-${key}`;
}

export function catalogScenarioMatchesSlug(id: string, slug: string): boolean {
	const prefix = `${slug}-`;
	return id.startsWith(prefix) && id.length > prefix.length;
}

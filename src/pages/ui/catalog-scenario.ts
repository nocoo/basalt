import type { ComponentType } from "react";

export interface CatalogScenario {
	id: string;
	title: string;
	code: string;
	render: ComponentType;
}

export interface CatalogScenarioMeta {
	key: string;
	title: string;
}

export interface LoadModuleScenariosInput {
	slug: string;
	metas: readonly CatalogScenarioMeta[];
	renderModules: Record<string, unknown>;
	sourceModules: Record<string, unknown>;
}

const LEGAL_KEY = /^[a-z][a-z0-9-]*$/;

export function catalogScenarioId(slug: string, key: string): string {
	return `${slug}-${key}`;
}

export function catalogScenarioMatchesSlug(id: string, slug: string): boolean {
	const prefix = `${slug}-`;
	return id.startsWith(prefix) && id.length > prefix.length;
}

function fail(slug: string, message: string): never {
	throw new Error(`${slug} scenario loader: ${message}`);
}

export function normalizeModulePath(modulePath: string): string {
	const unified = modulePath.replace(/\\/g, "/");
	return unified.endsWith("?raw") ? unified.slice(0, -"?raw".length) : unified;
}

export function moduleFileKey(modulePath: string): string {
	const normalized = normalizeModulePath(modulePath);
	const file = normalized.slice(normalized.lastIndexOf("/") + 1);
	if (!file.endsWith(".tsx")) {
		fail("module", `illegal path ${modulePath}`);
	}
	return file.slice(0, -".tsx".length);
}

function indexByFileKey<T>(
	slug: string,
	kind: string,
	modules: Record<string, T>,
): Map<string, { value: T; path: string }> {
	const indexed = new Map<string, { value: T; path: string }>();
	for (const [modulePath, value] of Object.entries(modules)) {
		const key = moduleFileKey(modulePath);
		if (!LEGAL_KEY.test(key)) {
			fail(slug, `illegal ${kind} key "${key}" at ${modulePath}`);
		}
		if (indexed.has(key)) {
			fail(slug, `duplicate ${kind} key "${key}" at ${modulePath}`);
		}
		indexed.set(key, { value, path: modulePath });
	}
	return indexed;
}

function scenarioCode(raw: string): string {
	return raw.replace(/^\uFEFF/, "").trim();
}

export function loadModuleScenarios(input: LoadModuleScenariosInput): CatalogScenario[] {
	const { slug, metas } = input;
	const renders = indexByFileKey(slug, "render", input.renderModules);
	const sources = indexByFileKey(slug, "raw", input.sourceModules);

	const seenMeta = new Set<string>();
	for (const meta of metas) {
		if (!LEGAL_KEY.test(meta.key)) {
			fail(slug, `illegal metadata key "${meta.key}"`);
		}
		if (seenMeta.has(meta.key)) {
			fail(slug, `duplicate metadata key "${meta.key}"`);
		}
		seenMeta.add(meta.key);
	}

	for (const meta of metas) {
		const renderEntry = renders.get(meta.key);
		const sourceEntry = sources.get(meta.key);
		if (!renderEntry) {
			const rawPath = sourceEntry?.path;
			fail(slug, `missing render for key "${meta.key}"${rawPath ? ` (raw at ${rawPath})` : ""}`);
		}
		if (!sourceEntry) {
			fail(slug, `missing raw source for key "${meta.key}" at ${renderEntry.path}`);
		}
		if (normalizeModulePath(renderEntry.path) !== normalizeModulePath(sourceEntry.path)) {
			fail(
				slug,
				`render/raw path mismatch for key "${meta.key}": render ${renderEntry.path} vs raw ${sourceEntry.path}`,
			);
		}
	}

	const extraRender = [...renders.keys()].filter((key) => !sources.has(key));
	const extraRaw = [...sources.keys()].filter((key) => !renders.has(key));
	if (extraRender.length > 0 || extraRaw.length > 0) {
		const renderDetail = extraRender.map((key) => `${key} (${renders.get(key)?.path})`).join(", ");
		const rawDetail = extraRaw.map((key) => `${key} (${sources.get(key)?.path})`).join(", ");
		fail(
			slug,
			`render/raw file sets differ; extra render: ${renderDetail || "none"}; extra raw: ${rawDetail || "none"}`,
		);
	}

	for (const [key, entry] of renders) {
		if (!seenMeta.has(key)) {
			fail(slug, `orphan module "${key}" at ${entry.path}`);
		}
	}

	const scenarios: CatalogScenario[] = [];
	const seenIds = new Set<string>();
	for (const meta of metas) {
		const renderEntry = renders.get(meta.key);
		const sourceEntry = sources.get(meta.key);
		if (!renderEntry || !sourceEntry) {
			fail(slug, `missing module for key "${meta.key}"`);
		}
		if (typeof sourceEntry.value !== "string") {
			fail(slug, `raw source for key "${meta.key}" at ${sourceEntry.path} is not a string`);
		}
		const renderModule =
			renderEntry.value && typeof renderEntry.value === "object"
				? (renderEntry.value as { default?: unknown })
				: undefined;
		const component = renderModule?.default;
		if (typeof component !== "function") {
			fail(slug, `invalid default export for key "${meta.key}" at ${renderEntry.path}`);
		}
		const id = catalogScenarioId(slug, meta.key);
		if (seenIds.has(id)) {
			fail(slug, `duplicate generated id "${id}" for key "${meta.key}"`);
		}
		seenIds.add(id);
		scenarios.push({
			id,
			title: meta.title,
			code: scenarioCode(sourceEntry.value),
			render: component as ComponentType,
		});
	}
	return scenarios;
}

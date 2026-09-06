import { CATALOG_BY_SLUG, type CatalogEntry, catalogImportPath } from "./catalog";
import { CATALOG_SOURCE_FILES } from "./generated/catalog-source-files";

export interface GitHubSource {
	owner: string;
	repo: string;
	ref: string;
	file: string;
	hash?: string;
}

export interface CatalogApiProp {
	name: string;
	type: string;
	required?: boolean;
	default?: string;
	description?: string;
}

export interface CatalogApiCallableParameter {
	name: string;
	type: string;
	required: boolean;
	description?: string;
}

export interface CatalogApiCallableReturn {
	type: string;
	description?: string;
}

export interface CatalogApiCallableOptions {
	name: string;
	props: CatalogApiProp[];
}

export interface CatalogApiSurface {
	name: string;
	props: CatalogApiProp[];
	callSignature?: string;
	description?: string;
	parameters?: CatalogApiCallableParameter[];
	returns?: CatalogApiCallableReturn;
	options?: CatalogApiCallableOptions;
}

export interface CatalogDocs {
	description: string;
	usage: string;
	variants: string[];
	api: CatalogApiSurface[];
	implementationSource: GitHubSource;
	provenance?: GitHubSource;
}

export type CatalogDocsDraft = Omit<CatalogDocs, "implementationSource"> & {
	implementationSource?: GitHubSource;
};

export const BASALT_IMPLEMENTATION_OWNER = "nocoo";
export const BASALT_IMPLEMENTATION_REPO = "basalt";
export const BASALT_IMPLEMENTATION_REF = "main";

const PACKAGE_IMPORT_PREFIX = "@nocoo/basalt/";
const IMPLEMENTATION_ROOT = "packages/basalt/src";

export function githubSourceHref(source: GitHubSource): string {
	return `https://github.com/${source.owner}/${source.repo}/blob/${source.ref}/${source.file}`;
}

export function githubSourceLabel(source: GitHubSource): string {
	return `${source.owner}/${source.repo}@${source.ref}`;
}

export function implementationFileFor(entry: CatalogEntry): string {
	const mapped = CATALOG_SOURCE_FILES[entry.slug];
	if (mapped) {
		return mapped.file;
	}
	const importPath = catalogImportPath(entry);
	if (!importPath.startsWith(PACKAGE_IMPORT_PREFIX)) {
		throw new Error(`Cannot derive implementation file from ${importPath}`);
	}
	const rel = importPath.slice(PACKAGE_IMPORT_PREFIX.length);
	return `${IMPLEMENTATION_ROOT}/${rel}.tsx`;
}

export function implementationSourceFor(entry: CatalogEntry, version?: string): GitHubSource {
	const mapped = CATALOG_SOURCE_FILES[entry.slug];
	return {
		owner: BASALT_IMPLEMENTATION_OWNER,
		repo: BASALT_IMPLEMENTATION_REPO,
		ref: version ?? BASALT_IMPLEMENTATION_REF,
		file: mapped ? mapped.file : implementationFileFor(entry),
		hash: mapped?.hash,
	};
}

export function provenanceFromLegacy(source: {
	repo: string;
	sha: string;
	file: string;
}): GitHubSource {
	return {
		owner: source.repo === "kumo" ? "cloudflare" : "nocoo",
		repo: source.repo,
		ref: source.sha,
		file: source.file,
	};
}

export function catalogDocsWithImplementation(
	docsBySlug: Record<string, CatalogDocsDraft>,
): Record<string, CatalogDocs> {
	return Object.fromEntries(
		Object.entries(docsBySlug).map(([slug, docs]) => {
			const entry = CATALOG_BY_SLUG.get(slug);
			if (!entry) {
				throw new Error(`Unknown catalog slug: ${slug}`);
			}
			const { implementationSource, ...rest } = docs;
			return [
				slug,
				{
					...rest,
					implementationSource: implementationSource ?? implementationSourceFor(entry),
				},
			];
		}),
	);
}

export function catalogSourceViewerHref(slug: string, hash?: string): string {
	const param = hash ? `?hash=${hash}` : "";
	return `/ui/${slug}/source${param}`;
}

export function catalogSourceCopyText(docs: CatalogDocs, slug?: string): string {
	const hashInfo = docs.implementationSource.hash
		? ` (sha256: ${docs.implementationSource.hash})`
		: "";
	const viewerHref = slug ? catalogSourceViewerHref(slug, docs.implementationSource.hash) : "";
	const sourceFile = docs.implementationSource.file;

	let packageReadLocation = "";
	const meta = slug ? CATALOG_SOURCE_FILES[slug] : undefined;
	if (meta?.packageReadLocation) {
		packageReadLocation = `Published package source location: ${meta.packageReadLocation}`;
	} else {
		const rel = sourceFile.replace(/^packages\/basalt\/src\//, "").replace(/\.(tsx|ts)$/, "");
		packageReadLocation = `Published package source location: node_modules/@nocoo/basalt/dist/${rel}.js.map (sourcesContent[0])`;
	}

	const lines = [
		"## Implementation",
		`${githubSourceLabel(docs.implementationSource)} ${docs.implementationSource.file}${hashInfo}`,
		viewerHref
			? `Source Viewer: ${viewerHref}\n${packageReadLocation}`
			: githubSourceHref(docs.implementationSource),
	];
	if (docs.provenance) {
		lines.push(
			"## Provenance",
			`${githubSourceLabel(docs.provenance)} ${docs.provenance.file}`,
			githubSourceHref(docs.provenance),
		);
	}
	return lines.join("\n\n");
}

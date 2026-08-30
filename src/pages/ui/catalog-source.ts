import { CATALOG_BY_SLUG, type CatalogEntry, catalogImportPath } from "./catalog";

export interface GitHubSource {
	owner: string;
	repo: string;
	ref: string;
	file: string;
}

export interface CatalogDocs {
	description: string;
	usage: string;
	variants: string[];
	props: { name: string; type: string; default?: string; description?: string }[];
	implementationSource: GitHubSource;
	provenance?: GitHubSource;
}

export type CatalogDocsDraft = Omit<CatalogDocs, "implementationSource">;

export const BASALT_IMPLEMENTATION_OWNER = "nocoo";
export const BASALT_IMPLEMENTATION_REPO = "basalt";
export const BASALT_IMPLEMENTATION_REF = "main";

const PACKAGE_IMPORT_PREFIX = "@nocoo/basalt/";
const IMPLEMENTATION_ROOT = "packages/basalt/src";

const IMPLEMENTATION_FILE_BY_SLUG: Record<string, string> = {
	"page-header": `${IMPLEMENTATION_ROOT}/components/app-header.tsx`,
};

export function githubSourceHref(source: GitHubSource): string {
	return `https://github.com/${source.owner}/${source.repo}/blob/${source.ref}/${source.file}`;
}

export function githubSourceLabel(source: GitHubSource): string {
	return `${source.owner}/${source.repo}@${source.ref}`;
}

export function implementationFileFor(entry: CatalogEntry): string {
	const exception = IMPLEMENTATION_FILE_BY_SLUG[entry.slug];
	if (exception) {
		return exception;
	}
	const importPath = catalogImportPath(entry);
	if (!importPath.startsWith(PACKAGE_IMPORT_PREFIX)) {
		throw new Error(`Cannot derive implementation file from ${importPath}`);
	}
	return `${IMPLEMENTATION_ROOT}/${importPath.slice(PACKAGE_IMPORT_PREFIX.length)}.tsx`;
}

export function implementationSourceFor(entry: CatalogEntry): GitHubSource {
	return {
		owner: BASALT_IMPLEMENTATION_OWNER,
		repo: BASALT_IMPLEMENTATION_REPO,
		ref: BASALT_IMPLEMENTATION_REF,
		file: implementationFileFor(entry),
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
			return [slug, { ...docs, implementationSource: implementationSourceFor(entry) }];
		}),
	);
}

export function catalogSourceCopyText(docs: CatalogDocs): string {
	const lines = [
		"## Implementation",
		`${githubSourceLabel(docs.implementationSource)} ${docs.implementationSource.file}`,
		githubSourceHref(docs.implementationSource),
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

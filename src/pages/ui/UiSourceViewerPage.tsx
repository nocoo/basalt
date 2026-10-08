import { Banner } from "@nocoo/basalt/components/banner";
import { LinkButton } from "@nocoo/basalt/components/button";
import { CodeBlock } from "@nocoo/basalt/components/code";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { ShowcasePage } from "@/components/ShowcasePage";
import { CATALOG_BY_SLUG } from "./catalog";
import { CATALOG_SOURCE_FILES } from "./generated/catalog-source-files";

const rawModules = import.meta.glob<string>("../../../packages/basalt/src/**/*.{ts,tsx}", {
	query: "?raw",
	import: "default",
});

export async function computeSha256Hex16(text: string): Promise<string> {
	const buf = new TextEncoder().encode(text);
	const hash = await crypto.subtle.digest("SHA-256", buf);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 16);
}

export function getSourceViewerPath(slug: string): string {
	const info = CATALOG_SOURCE_FILES[slug];
	const hash = info?.hash ? `?hash=${info.hash}` : "";
	return `/ui/${slug}/source${hash}`;
}

export function loadSourceContent(sourceFile: string): Promise<string> {
	// sourceFile is e.g. "packages/basalt/src/components/button.tsx"
	const relativeKey = `../../../${sourceFile}`;
	const loader = rawModules[relativeKey];
	if (!loader) {
		return Promise.reject(new Error(`Source file '${sourceFile}' not found in bundle.`));
	}
	return loader();
}

export function UiSourceViewerPage() {
	const { slug } = useParams<{ slug: string }>();
	const [searchParams] = useSearchParams();
	const requestedHash = searchParams.get("hash");
	const entry = slug ? CATALOG_BY_SLUG.get(slug) : undefined;
	const sourceInfo = slug ? CATALOG_SOURCE_FILES[slug] : undefined;

	const [content, setContent] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setContent(null);

		if (!sourceInfo) {
			setError(slug ? `No source mapping found for "${slug}".` : "No component specified.");
			return;
		}

		if (requestedHash && requestedHash !== sourceInfo.hash) {
			setError(
				`Source fingerprint mismatch: requested hash "${requestedHash}" does not match active component source "${sourceInfo.hash}". Cannot load source for outdated or invalid link.`,
			);
			return;
		}

		setError(null);

		loadSourceContent(sourceInfo.file)
			.then(async (text) => {
				if (cancelled) return;
				const actualHash = await computeSha256Hex16(text);
				if (cancelled) return;
				if (actualHash !== sourceInfo.hash) {
					setError(
						`Source integrity error: bundle source sha256 (${actualHash}) does not match expected (${sourceInfo.hash}).`,
					);
					setContent(null);
					return;
				}
				if (requestedHash && requestedHash !== actualHash) {
					setError(
						`Source fingerprint mismatch: requested hash "${requestedHash}" does not match active component source "${actualHash}". Cannot load source for outdated or invalid link.`,
					);
					setContent(null);
					return;
				}
				setError(null);
				setContent(text);
			})
			.catch((err) => {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : String(err));
				setContent(null);
			});

		return () => {
			cancelled = true;
		};
	}, [slug, sourceInfo, requestedHash]);

	if (!entry || !sourceInfo) {
		return (
			<ShowcasePage
				variant="document"
				title="Source Not Found"
				description={error ?? `Unknown catalog slug "${slug}".`}
			>
				<LinkButton href="/ui" variant="outline">
					Back to Catalog
				</LinkButton>
			</ShowcasePage>
		);
	}

	return (
		<ShowcasePage
			variant="document"
			title={sourceInfo.file}
			description={`sha256: ${sourceInfo.hash}`}
			actions={
				<LinkButton href={`/ui/${slug}`} variant="outline">
					Back to Component
				</LinkButton>
			}
		>
			{error ? (
				<Banner variant="error" title="Source unavailable" description={error} />
			) : content === null ? (
				<p role="status" className="text-basalt-base text-basalt-muted-foreground">
					Loading source...
				</p>
			) : (
				<CodeBlock title={sourceInfo.file} lineNumbers>
					{content}
				</CodeBlock>
			)}
		</ShowcasePage>
	);
}
export default UiSourceViewerPage;

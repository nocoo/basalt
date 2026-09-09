import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
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
			<div className="p-8">
				<h1 className="text-2xl font-bold">Source Not Found</h1>
				<p className="mt-2 text-muted-foreground">{error ?? `Unknown catalog slug "${slug}".`}</p>
				<Link to="/ui" className="mt-4 inline-block text-primary underline">
					Back to Catalog
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border px-6 py-6 md:px-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="min-w-0 max-w-full">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Link to={`/ui/${slug}`} className="hover:text-foreground">
								{entry.name}
							</Link>
							<span>/</span>
							<span>Source</span>
						</div>
						<h1 className="mt-1 font-mono text-xl font-semibold [overflow-wrap:anywhere]">
							{sourceInfo.file}
						</h1>
						<p className="text-xs text-muted-foreground font-mono mt-0.5">
							sha256: {sourceInfo.hash}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Link
							to={`/ui/${slug}`}
							className="rounded-basalt-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
						>
							Back to Component
						</Link>
					</div>
				</div>
			</header>

			<main className="p-6 md:p-8">
				{error ? (
					<div className="rounded-basalt-md border border-destructive/20 bg-destructive/10 p-4 text-destructive">
						{error}
					</div>
				) : content === null ? (
					<div className="p-8 text-center text-muted-foreground">Loading source...</div>
				) : (
					<pre className="overflow-x-auto rounded-basalt-md border border-border bg-secondary p-4 font-mono text-xs leading-relaxed text-foreground">
						<code>{content}</code>
					</pre>
				)}
			</main>
		</div>
	);
}
export default UiSourceViewerPage;

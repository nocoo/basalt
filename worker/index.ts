import { canonicalRedirect, isPreviewHost, withSecurityHeaders } from "../src/lib/edge";
import { isKnownAppPath, NOT_FOUND_PATH } from "../src/lib/routes";
import { APP_VERSION } from "../src/lib/version";

export interface AssetEnv {
	ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export async function handleEdgeRequest(request: Request, env: AssetEnv): Promise<Response> {
	const url = new URL(request.url);
	const location = canonicalRedirect(url);
	if (location) {
		return new Response(null, {
			status: 301,
			headers: withSecurityHeaders(new Headers({ Location: location }), false),
		});
	}
	const preview = isPreviewHost(url.hostname);
	if (url.pathname === "/api/live") {
		const headers = withSecurityHeaders(
			new Headers({
				"Content-Type": "application/json; charset=utf-8",
				"Cache-Control": "no-store",
				"X-Robots-Tag": "noindex",
			}),
			preview,
		);
		if (request.method !== "GET" && request.method !== "HEAD") {
			headers.set("Allow", "GET, HEAD");
			return new Response(null, { status: 405, headers });
		}
		return new Response(
			request.method === "HEAD" ? null : JSON.stringify({ status: "ok", version: APP_VERSION }),
			{ headers },
		);
	}
	const asset = await env.ASSETS.fetch(request);
	if (asset.status !== 404 || (request.method !== "GET" && request.method !== "HEAD")) {
		return stamp(asset, preview);
	}
	// No static file: client routes get the app shell, everything else a real 404 document.
	if (isKnownAppPath(url.pathname)) {
		return stamp(await env.ASSETS.fetch(documentRequest(request, url, "/", true)), preview);
	}
	const page = await env.ASSETS.fetch(documentRequest(request, url, NOT_FOUND_PATH, false));
	const headers = withSecurityHeaders(page.headers, preview);
	headers.set("X-Robots-Tag", "noindex");
	return new Response(page.ok ? page.body : null, { status: 404, headers });
}

function stamp(asset: Response, preview: boolean): Response {
	return new Response(asset.body, {
		status: asset.status,
		statusText: asset.statusText,
		headers: withSecurityHeaders(asset.headers, preview),
	});
}

/** Re-targets an asset lookup at a document; a 404 body must never come back as a 304. */
function documentRequest(request: Request, url: URL, path: string, conditional: boolean): Request {
	const headers = new Headers(request.headers);
	if (!conditional) {
		headers.delete("If-None-Match");
		headers.delete("If-Modified-Since");
	}
	return new Request(new URL(path, url), { method: request.method, headers });
}

export default {
	fetch(request: Request, env: AssetEnv): Promise<Response> {
		return handleEdgeRequest(request, env);
	},
};

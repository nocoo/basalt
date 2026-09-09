import { canonicalRedirect, isPreviewHost, withSecurityHeaders } from "../src/lib/edge";
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
	return new Response(asset.body, {
		status: asset.status,
		statusText: asset.statusText,
		headers: withSecurityHeaders(asset.headers, preview),
	});
}

export default {
	fetch(request: Request, env: AssetEnv): Promise<Response> {
		return handleEdgeRequest(request, env);
	},
};

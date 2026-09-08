import { canonicalRedirect, isPreviewHost, withSecurityHeaders } from "../src/lib/edge";

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
	const asset = await env.ASSETS.fetch(request);
	return new Response(asset.body, {
		status: asset.status,
		statusText: asset.statusText,
		headers: withSecurityHeaders(asset.headers, isPreviewHost(url.hostname)),
	});
}

export default {
	fetch(request: Request, env: AssetEnv): Promise<Response> {
		return handleEdgeRequest(request, env);
	},
};

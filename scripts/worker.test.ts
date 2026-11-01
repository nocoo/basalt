import { describe, expect, it } from "vitest";
import { APP_VERSION } from "../src/lib/version";
import { handleEdgeRequest } from "../worker/index";

function request(url: string): Request {
	return new Request(url, { redirect: "manual" });
}

describe("edge worker", () => {
	it("serves the root package version before SPA assets without caching it", async () => {
		const env = {
			ASSETS: {
				fetch: async () => {
					throw new Error("Liveness requests must not reach SPA assets");
				},
			},
		};
		const response = await handleEdgeRequest(request("https://basaltui.com/api/live"), env);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "ok", version: APP_VERSION });
		expect(response.headers.get("Content-Type")).toContain("application/json");
		expect(response.headers.get("Cache-Control")).toBe("no-store");
		expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
		expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
		const head = await handleEdgeRequest(
			new Request("https://basaltui.com/api/live", { method: "HEAD" }),
			env,
		);
		expect(head.status).toBe(200);
		expect(await head.text()).toBe("");
		const post = await handleEdgeRequest(
			new Request("https://basaltui.com/api/live", { method: "POST" }),
			env,
		);
		expect(post.status).toBe(405);
		expect(post.headers.get("Allow")).toBe("GET, HEAD");
		const www = await handleEdgeRequest(
			request("https://www.basaltui.com/api/live?check=release"),
			env,
		);
		expect(www.status).toBe(301);
		expect(www.headers.get("Location")).toBe("https://basaltui.com/api/live?check=release");
	});

	it("301s HTTP and www to the HTTPS apex", async () => {
		const env = {
			ASSETS: {
				fetch: async () => new Response("nope", { status: 500 }),
			},
		};
		const http = await handleEdgeRequest(request("http://basaltui.com/ui"), env);
		expect(http.status).toBe(301);
		expect(http.headers.get("Location")).toBe("https://basaltui.com/ui");
		const www = await handleEdgeRequest(request("https://www.basaltui.com/"), env);
		expect(www.status).toBe(301);
		expect(www.headers.get("Location")).toBe("https://basaltui.com/");
	});

	it("forwards HTTPS apex assets and stamps security headers", async () => {
		const env = {
			ASSETS: {
				fetch: async () => new Response("ok", { headers: { "Content-Type": "text/plain" } }),
			},
		};
		const response = await handleEdgeRequest(request("https://basaltui.com/llms.txt"), env);
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("ok");
		expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
		expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
	});

	describe("unknown paths", () => {
		const files: Record<string, string> = {
			"/": "<title>shell</title>",
			"/404": '<title>not found</title><meta name="robots" content="noindex" />',
		};
		function assets(seen: Request[] = []) {
			return {
				ASSETS: {
					fetch: async (input: Request) => {
						seen.push(input);
						const body = files[new URL(input.url).pathname];
						return body === undefined
							? new Response(null, { status: 404 })
							: new Response(input.method === "HEAD" ? null : body, {
									headers: { "Content-Type": "text/html", "Cache-Control": "no-store" },
								});
					},
				},
			};
		}

		it("returns HTTP 404 with the not-found document and noindex", async () => {
			const seen: Request[] = [];
			const response = await handleEdgeRequest(
				new Request("https://basaltui.com/no-such-page", {
					headers: { "If-None-Match": '"abc"' },
				}),
				assets(seen),
			);
			expect(response.status).toBe(404);
			expect(await response.text()).toContain("not found");
			expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
			expect(response.headers.get("Cache-Control")).toBe("no-store");
			expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
			expect(new URL(seen[1].url).pathname).toBe("/404");
			expect(seen[1].headers.get("If-None-Match")).toBeNull();
			for (const path of ["/ui/not-a-component", "/ui/button/extra", "/dashboard/extra"]) {
				const miss = await handleEdgeRequest(request(`https://basaltui.com${path}`), assets());
				expect(miss.status, path).toBe(404);
			}
			const head = await handleEdgeRequest(
				new Request("https://basaltui.com/missing", { method: "HEAD" }),
				assets(),
			);
			expect(head.status).toBe(404);
			expect(await head.text()).toBe("");
		});

		it("serves the app shell with 200 for client routes without a prerendered file", async () => {
			for (const path of [
				"/ui/button/source",
				"/examples/reader",
				"/examples/workspace/",
				"/loading",
			]) {
				const seen: Request[] = [];
				const response = await handleEdgeRequest(
					request(`https://basaltui.com${path}?theme=dark`),
					assets(seen),
				);
				expect(response.status, path).toBe(200);
				expect(await response.text()).toContain("shell");
				expect(new URL(seen[1].url).pathname).toBe("/");
				expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
			}
		});

		it("returns an empty 404 when the not-found document is missing", async () => {
			const env = { ASSETS: { fetch: async () => new Response(null, { status: 404 }) } };
			const response = await handleEdgeRequest(request("https://basaltui.com/gone"), env);
			expect(response.status).toBe(404);
			expect(await response.text()).toBe("");
		});

		it("leaves non-GET misses and existing assets untouched", async () => {
			const post = await handleEdgeRequest(
				new Request("https://basaltui.com/ui/button/source", { method: "POST" }),
				assets(),
			);
			expect(post.status).toBe(404);
			const home = await handleEdgeRequest(request("https://basaltui.com/"), assets());
			expect(home.status).toBe(200);
			expect(home.headers.get("X-Robots-Tag")).toBeNull();
		});
	});
});

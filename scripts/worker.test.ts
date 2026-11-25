import { describe, expect, it } from "vitest";
import { isMachineDocPath, isMarkdownPath, withSecurityHeaders } from "../src/lib/edge";
import { isKnownAppPath, normalizeAppPath } from "../src/lib/routes";
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
		expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
		expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
		expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
		expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
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
		expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
		expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
		expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
		expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
		expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
		const ogImage = await handleEdgeRequest(
			request("https://basaltui.com/opengraph-image.png"),
			env,
		);
		expect(ogImage.headers.get("Cross-Origin-Resource-Policy")).toBe("cross-origin");
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
			expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
			expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
			expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
			expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
			expect(new URL(seen[1].url).pathname).toBe("/404");
			expect(seen[1].headers.get("If-None-Match")).toBeNull();
			for (const path of [
				"/ui/not-a-component",
				"/ui/button/extra",
				"/dashboard/extra",
				"/templates",
				"/templates/unknown",
				"/view/unknown",
			]) {
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
				"/templates/agent-workspace",
				"/templates/document-page",
				"/templates/not-found",
				"/view/agent-workspace",
				"/view/visitor-login",
				"/examples/reader",
				"/examples/workspace/",
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

	describe("machine documentation and markdown endpoints", () => {
		const machineFiles: Record<string, { body: string; contentType: string }> = {
			"/": { body: "<title>shell</title>", contentType: "text/html" },
			"/404": {
				body: '<title>not found</title><meta name="robots" content="noindex" />',
				contentType: "text/html",
			},
			"/ui/button.md": { body: "# Button\n", contentType: "application/octet-stream" },
			"/templates/agent-workspace.md": {
				body: "# Agent Workspace\n",
				contentType: "text/plain",
			},
			"/agents.md": { body: "# Basalt Agents\n", contentType: "text/plain" },
			"/setup.md": { body: "# Basalt Setup\n", contentType: "text/plain" },
			"/llms.txt": { body: "# Basalt\n", contentType: "text/plain; charset=utf-8" },
			"/llms-full.txt": { body: "# Basalt Full\n", contentType: "text/plain; charset=utf-8" },
			"/ai.txt": { body: "User-agent: *\n", contentType: "text/plain; charset=utf-8" },
			"/md-catalog.json": {
				body: '{"components":[]}',
				contentType: "application/json; charset=utf-8",
			},
		};

		function machineAssets(seen: Request[] = []) {
			return {
				ASSETS: {
					fetch: async (input: Request) => {
						seen.push(input);
						const entry = machineFiles[new URL(input.url).pathname];
						return entry === undefined
							? new Response(null, { status: 404 })
							: new Response(input.method === "HEAD" ? null : entry.body, {
									headers: { "Content-Type": entry.contentType },
								});
					},
				},
			};
		}

		it("serves static markdown endpoints with text/markdown, CORS *, and security headers", async () => {
			for (const path of [
				"/ui/button.md",
				"/templates/agent-workspace.md",
				"/agents.md",
				"/setup.md",
			]) {
				const response = await handleEdgeRequest(
					request(`https://basaltui.com${path}`),
					machineAssets(),
				);
				expect(response.status, path).toBe(200);
				expect(response.headers.get("Content-Type"), path).toBe("text/markdown; charset=utf-8");
				expect(response.headers.get("Access-Control-Allow-Origin"), path).toBe("*");
				expect(response.headers.get("Strict-Transport-Security"), path).toContain(
					"max-age=31536000",
				);
				expect(response.headers.get("X-Content-Type-Options"), path).toBe("nosniff");
				expect(response.headers.get("X-Frame-Options"), path).toBe("SAMEORIGIN");
				expect(response.headers.get("Referrer-Policy"), path).toBe(
					"strict-origin-when-cross-origin",
				);
				expect(response.headers.get("Content-Security-Policy"), path).toContain(
					"frame-ancestors 'self'",
				);
				expect(response.headers.get("Permissions-Policy"), path).toContain("camera=()");
				expect(response.headers.get("Cross-Origin-Opener-Policy"), path).toBe(
					"same-origin-allow-popups",
				);
				expect(response.headers.get("Cross-Origin-Resource-Policy"), path).toBe("same-origin");
				expect(response.headers.get("X-Robots-Tag"), path).toBeNull();
			}

			const head = await handleEdgeRequest(
				new Request("https://basaltui.com/ui/button.md", { method: "HEAD" }),
				machineAssets(),
			);
			expect(head.status).toBe(200);
			expect(await head.text()).toBe("");
			expect(head.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
			expect(head.headers.get("Access-Control-Allow-Origin")).toBe("*");

			const preview = await handleEdgeRequest(
				request("https://basalt.dev.hexly.ai/agents.md"),
				machineAssets(),
			);
			expect(preview.status).toBe(200);
			expect(preview.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
			expect(preview.headers.get("Access-Control-Allow-Origin")).toBe("*");
			expect(preview.headers.get("X-Robots-Tag")).toBe("noindex");
			expect(preview.headers.get("Strict-Transport-Security")).toBeNull();
		});

		it("serves machine discovery endpoints with CORS * while keeping CORP same-origin", async () => {
			for (const [path, expectedType] of [
				["/llms.txt", "text/plain; charset=utf-8"],
				["/llms-full.txt", "text/plain; charset=utf-8"],
				["/ai.txt", "text/plain; charset=utf-8"],
				["/md-catalog.json", "application/json; charset=utf-8"],
			] as const) {
				const response = await handleEdgeRequest(
					request(`https://basaltui.com${path}`),
					machineAssets(),
				);
				expect(response.status, path).toBe(200);
				expect(response.headers.get("Access-Control-Allow-Origin"), path).toBe("*");
				expect(response.headers.get("Cross-Origin-Resource-Policy"), path).toBe("same-origin");
				expect(response.headers.get("Content-Type"), path).toBe(expectedType);
				expect(response.headers.get("X-Content-Type-Options"), path).toBe("nosniff");
			}
		});

		it("returns 404 with X-Robots-Tag: noindex for nonexistent .md routes", async () => {
			for (const path of [
				"/ui/unknown.md",
				"/templates/unknown.md",
				"/ui/button/source.md",
				"/ui/button.md/",
				"/agents.md/",
			]) {
				const seen: Request[] = [];
				const response = await handleEdgeRequest(
					request(`https://basaltui.com${path}`),
					machineAssets(seen),
				);
				expect(response.status, path).toBe(404);
				expect(response.headers.get("X-Robots-Tag"), path).toBe("noindex");
				expect(response.headers.get("Content-Type"), path).toBe("text/html");
				expect(response.headers.get("Access-Control-Allow-Origin"), path).toBeNull();
				expect(await response.text()).toContain("not found");
				expect(new URL(seen[1].url).pathname).toBe("/404");
				expect(isKnownAppPath(path), path).toBe(false);
			}
			expect(normalizeAppPath("/ui/button.md/")).toBe("/ui/button.md");
			expect(isKnownAppPath("/ui/button/")).toBe(true);
		});

		it("classifies markdown and machine doc paths and scopes header overrides", () => {
			for (const path of [
				"/agents.md",
				"/setup.md",
				"/ui/button.md",
				"/templates/agent-workspace.md",
			]) {
				expect(isMarkdownPath(path), path).toBe(true);
				expect(isMachineDocPath(path), path).toBe(true);
				const headers = withSecurityHeaders(
					new Headers({ "Content-Type": "text/plain" }),
					false,
					path,
				);
				expect(headers.get("Content-Type"), path).toBe("text/markdown; charset=utf-8");
				expect(headers.get("Access-Control-Allow-Origin"), path).toBe("*");
				expect(headers.get("Cross-Origin-Resource-Policy"), path).toBe("same-origin");
			}

			for (const path of ["/llms.txt", "/llms-full.txt", "/ai.txt", "/md-catalog.json"]) {
				expect(isMarkdownPath(path), path).toBe(false);
				expect(isMachineDocPath(path), path).toBe(true);
				const headers = withSecurityHeaders(
					new Headers({ "Content-Type": "text/plain" }),
					false,
					path,
				);
				expect(headers.get("Content-Type"), path).toBe("text/plain");
				expect(headers.get("Access-Control-Allow-Origin"), path).toBe("*");
				expect(headers.get("Cross-Origin-Resource-Policy"), path).toBe("same-origin");
			}

			for (const path of ["", "/", "/ui/button", "/ui/button.md/", "/robots.txt", "/sitemap.xml"]) {
				expect(isMarkdownPath(path), path).toBe(false);
				expect(isMachineDocPath(path), path).toBe(false);
				const headers = withSecurityHeaders(
					new Headers({ "Content-Type": "text/html" }),
					false,
					path,
				);
				expect(headers.get("Access-Control-Allow-Origin"), path).toBeNull();
				expect(headers.get("Content-Type"), path).toBe("text/html");
			}

			const omittedPathname = withSecurityHeaders(
				new Headers({ "Content-Type": "text/html" }),
				false,
			);
			expect(omittedPathname.get("Access-Control-Allow-Origin")).toBeNull();
			expect(omittedPathname.get("Content-Type")).toBe("text/html");
		});
	});
});

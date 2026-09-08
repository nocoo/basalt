import { describe, expect, it } from "vitest";
import { handleEdgeRequest } from "../worker/index";

function request(url: string): Request {
	return new Request(url, { redirect: "manual" });
}

describe("edge worker", () => {
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
});

import { describe, expect, it } from "vitest";
import { canonicalRedirect, isPreviewHost, SECURITY_HEADERS, withSecurityHeaders } from "./edge";

describe("edge canonicalization", () => {
	it("upgrades apex HTTP to HTTPS", () => {
		expect(canonicalRedirect(new URL("http://basaltui.com/ui"))).toBe("https://basaltui.com/ui");
	});

	it("sends www to the HTTPS apex and keeps the path", () => {
		expect(canonicalRedirect(new URL("https://www.basaltui.com/ui/button"))).toBe(
			"https://basaltui.com/ui/button",
		);
		expect(canonicalRedirect(new URL("http://www.basaltui.com/"))).toBe("https://basaltui.com/");
	});

	it("leaves production HTTPS apex and preview hosts alone", () => {
		expect(canonicalRedirect(new URL("https://basaltui.com/"))).toBeNull();
		expect(canonicalRedirect(new URL("http://localhost:7003/"))).toBeNull();
		expect(canonicalRedirect(new URL("https://basalt.dev.hexly.ai/"))).toBeNull();
		expect(isPreviewHost("basalt.dev.hexly.ai")).toBe(true);
		expect(isPreviewHost("basaltui.com")).toBe(false);
	});

	it("adds security headers and skips HSTS on preview", () => {
		const production = withSecurityHeaders(new Headers(), false);
		expect(production.get("Strict-Transport-Security")).toBe(
			SECURITY_HEADERS["Strict-Transport-Security"],
		);
		expect(production.get("X-Content-Type-Options")).toBe("nosniff");
		expect(production.get("X-Robots-Tag")).toBeNull();
		const preview = withSecurityHeaders(new Headers(), true);
		expect(preview.get("Strict-Transport-Security")).toBeNull();
		expect(preview.get("X-Robots-Tag")).toBe("noindex");
	});
});

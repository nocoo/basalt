import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
	CONTENT_SECURITY_POLICY,
	canonicalRedirect,
	isCrossOriginAssetPath,
	isPreviewHost,
	SECURITY_HEADERS,
	withSecurityHeaders,
} from "./edge";

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
		expect(production.get("Content-Security-Policy")).toBe(CONTENT_SECURITY_POLICY);
		expect(production.get("Permissions-Policy")).toBe(SECURITY_HEADERS["Permissions-Policy"]);
		expect(production.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
		expect(production.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
		expect(production.get("X-Robots-Tag")).toBeNull();
		const preview = withSecurityHeaders(new Headers(), true);
		expect(preview.get("Strict-Transport-Security")).toBeNull();
		expect(preview.get("X-Robots-Tag")).toBe("noindex");
	});

	it("keeps CSP script hashes synced with index.html inline scripts and scopes CORP by path", () => {
		const html = readFileSync("index.html", "utf8");
		const hashes: string[] = [];
		for (const match of html.matchAll(/<script(?:\s+([^>]*))?>([\s\S]*?)<\/script>/g)) {
			const attrs = match[1] ?? "";
			if (attrs.includes("src=") || attrs.includes("application/ld+json")) continue;
			hashes.push(`sha256-${createHash("sha256").update(match[2], "utf8").digest("base64")}`);
		}
		expect(hashes).toHaveLength(2);
		for (const hash of hashes) {
			expect(CONTENT_SECURITY_POLICY).toContain(`'${hash}'`);
		}
		expect(CONTENT_SECURITY_POLICY).not.toContain("'strict-dynamic'");
		const scriptDirective = CONTENT_SECURITY_POLICY.split(";")
			.map((entry) => entry.trim())
			.find((entry) => entry.startsWith("script-src "));
		expect(scriptDirective).not.toContain("'unsafe-inline'");

		for (const path of [
			"/opengraph-image.png",
			"/favicon.ico",
			"/favicon.png",
			"/apple-touch-icon.png",
			"/logo-128.png",
			"/logo-64.webp",
			"/landing/scene-hero-1600.avif",
			"/fonts/inter-latin.woff2",
		]) {
			expect(isCrossOriginAssetPath(path), path).toBe(true);
			expect(
				withSecurityHeaders(new Headers(), false, path).get("Cross-Origin-Resource-Policy"),
			).toBe("cross-origin");
		}
		for (const path of ["/", "/ui", "/api/live", "/assets/index.js"]) {
			expect(isCrossOriginAssetPath(path), path).toBe(false);
			expect(
				withSecurityHeaders(new Headers(), false, path).get("Cross-Origin-Resource-Policy"),
			).toBe("same-origin");
		}
	});
});

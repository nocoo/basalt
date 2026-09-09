import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SHOWCASE_PATHS, SITE_ORIGIN } from "../src/lib/site";
import { CATALOG } from "../src/pages/ui/catalog";
import { checkSeoFiles, GENERATE_COMMAND, renderSeoFiles, SEO_FILES, writeSeoFiles } from "./seo";

describe("seo file generation", () => {
	it("emits every discovery document from the catalog", () => {
		const files = renderSeoFiles();
		expect(Object.keys(files)).toEqual([...SEO_FILES]);
		expect(files["public/sitemap.xml"]).toContain(`${SITE_ORIGIN}/ui/${CATALOG[0].slug}`);
		expect(files["public/llms-full.txt"]).toContain(CATALOG[0].name);
		for (const showcasePath of SHOWCASE_PATHS) {
			expect(files["public/sitemap.xml"]).toContain(
				`${SITE_ORIGIN}${showcasePath === "/" ? "/" : showcasePath}`,
			);
		}
		expect(files["public/sitemap.xml"]).not.toContain(`${SITE_ORIGIN}/404`);
	});

	it("writes and verifies a matching tree", () => {
		const root = mkdtempSync(path.join(tmpdir(), "basalt-seo-"));
		mkdirSync(path.join(root, "public"));
		writeFileSync(path.join(root, "index.html"), readFileSync("index.html"));
		writeSeoFiles(root);
		expect(() => checkSeoFiles(root)).not.toThrow();
		expect(GENERATE_COMMAND).toBe("bun run seo:generate");
	});

	it("fails check when a generated file or index snippet drifts", () => {
		const root = mkdtempSync(path.join(tmpdir(), "basalt-seo-stale-"));
		mkdirSync(path.join(root, "public"));
		writeFileSync(path.join(root, "index.html"), readFileSync("index.html"));
		writeSeoFiles(root);
		writeFileSync(path.join(root, "public/robots.txt"), "User-agent: *\nDisallow: /\n");
		expect(() => checkSeoFiles(root)).toThrow(/SEO files are stale/);
		writeSeoFiles(root);
		const fresh = readFileSync(path.join(root, "index.html"), "utf8");
		writeFileSync(
			path.join(root, "index.html"),
			fresh.replace(
				"</head>",
				'<style id="basalt-landing-css">main{max-width:720px}</style></head>',
			),
		);
		expect(() => checkSeoFiles(root)).toThrow(/generated content or metadata/);
		writeSeoFiles(root);
		writeFileSync(path.join(root, "index.html"), "<html></html>\n");
		expect(() => checkSeoFiles(root)).toThrow(/index.html missing/);
	});
});

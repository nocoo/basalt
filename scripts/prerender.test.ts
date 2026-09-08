import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "../src/pages/ui/catalog";
import { fileForPath, prerenderHtml } from "./prerender";

const TEMPLATE = `<!doctype html><html><head><title>basalt.</title><meta name="description" content="d" /><link rel="canonical" href="https://basaltui.com/" /><meta property="og:title" content="t" /><meta property="og:url" content="https://basaltui.com" /><meta property="og:description" content="d" /></head><body><div id="root">shell</div></body></html>`;

describe("prerender", () => {
	it("writes home, catalog index and each component as real HTML files", () => {
		const dist = mkdtempSync(path.join(tmpdir(), "basalt-prerender-"));
		const written = prerenderHtml(dist, TEMPLATE);
		expect(written).toContain(fileForPath(dist, "/"));
		expect(readFileSync(fileForPath(dist, "/"), "utf8")).toContain(
			"<h1>Dense, dark, durable.</h1>",
		);
		expect(readFileSync(fileForPath(dist, "/ui"), "utf8")).toContain(
			`href="/ui/${CATALOG[0].slug}"`,
		);
		expect(readFileSync(fileForPath(dist, `/ui/${CATALOG[0].slug}`), "utf8")).toContain("<h1>");
		expect(written.length).toBeGreaterThan(CATALOG.length);
	});
});

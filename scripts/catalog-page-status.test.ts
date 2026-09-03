import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	checkCatalogPageStatusFile,
	deriveCatalogPageStatuses,
	GENERATE_COMMAND,
	GENERATED_RELATIVE_PATH,
	generateCatalogPageStatusModule,
	renderCatalogPageStatusModule,
	writeCatalogPageStatusFile,
} from "./catalog-page-status";

const temporaryRoots: string[] = [];

afterEach(() => {
	while (temporaryRoots.length > 0) {
		const root = temporaryRoots.pop();
		if (root) rmSync(root, { recursive: true, force: true });
	}
});

describe("catalog page-status generator", () => {
	it("uses the fail-closed docs plus hero rule without an allowlist", () => {
		const statuses = deriveCatalogPageStatuses({
			entries: [{ slug: "ready" }, { slug: "no-hero" }, { slug: "no-docs" }],
			docsBySlug: { ready: {}, "no-hero": {} },
			examplesBySlug: { ready: [{}], "no-hero": [], "no-docs": [{}] },
		});
		expect(statuses).toEqual([
			["ready", "ready"],
			["no-hero", "planned"],
			["no-docs", "planned"],
		]);
		expect(() =>
			deriveCatalogPageStatuses({
				entries: [{ slug: "same" }, { slug: "same" }],
				docsBySlug: {},
				examplesBySlug: {},
			}),
		).toThrow("Duplicate catalog slug: same");
	});

	it("loads the production inputs through Vite and renders deterministic pure data", {
		timeout: 30_000,
	}, async () => {
		const first = await generateCatalogPageStatusModule(process.cwd());
		const second = await generateCatalogPageStatusModule(process.cwd());
		expect(first).toBe(second);
		expect(first).toBe(readFileSync(GENERATED_RELATIVE_PATH, "utf8"));
		expect(first).toBe(
			renderCatalogPageStatusModule(
				Object.entries(
					(await import("../src/pages/ui/generated/catalog-page-status")).CATALOG_PAGE_STATUS,
				),
			),
		);
		expect(first).not.toMatch(/^import /m);
		expect(first).not.toContain("React");
		expect(first).not.toContain("render:");
		expect(first.match(/: "ready",/g)).toHaveLength(93);
		expect(first.match(/: "planned",/g)).toHaveLength(1);
	});

	it("writes explicitly and rejects missing or stale bytes with one repair command", () => {
		const root = mkdtempSync(path.join(tmpdir(), "catalog-page-status-"));
		temporaryRoots.push(root);
		const target = path.join(root, GENERATED_RELATIVE_PATH);
		const expected = renderCatalogPageStatusModule([["button", "ready"]]);

		expect(() => checkCatalogPageStatusFile(target, expected)).toThrow(GENERATE_COMMAND);
		mkdirSync(path.dirname(target), { recursive: true });
		writeFileSync(target, "stale\n");
		expect(() => checkCatalogPageStatusFile(target, expected)).toThrow(GENERATE_COMMAND);
		writeCatalogPageStatusFile(target, expected);
		expect(() => checkCatalogPageStatusFile(target, expected)).not.toThrow();
	});

	it("gates typecheck and build without silently generating", () => {
		const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
			scripts: Record<string, string>;
		};
		expect(pkg.scripts["catalog-page-status:generate"]).toBe(
			"bun scripts/catalog-page-status-cli.ts generate",
		);
		expect(pkg.scripts["catalog-page-status:check"]).toBe(
			"bun scripts/catalog-page-status-cli.ts check",
		);
		for (const script of [pkg.scripts.typecheck, pkg.scripts.build]) {
			expect(script).toContain("bun run catalog-page-status:check");
			expect(script).not.toContain("catalog-page-status:generate");
		}
		expect(pkg.scripts.build).toContain("bun scripts/catalog-page-status-build.ts");
	});
});

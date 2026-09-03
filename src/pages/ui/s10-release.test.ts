import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog";
import { catalogPageStatus } from "./catalog-page-status";

const ROOT = process.cwd();

describe("S10 release evidence", () => {
	it("leaves maps planned", () => {
		expect(CATALOG.map((entry) => entry.slug)).not.toContain("installation");
		expect(catalogPageStatus("maps")).toBe("planned");
	});

	it("locks 6DQ coverage thresholds and the prepublish plus osv gates", () => {
		const vitest = readFileSync(path.join(ROOT, "vitest.config.ts"), "utf8");
		expect(vitest).toContain("statements: 95");
		expect(vitest).toContain("branches: 95");
		expect(vitest).toContain("functions: 95");
		expect(vitest).toContain("lines: 95");
		const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
			version: string;
			scripts: Record<string, string>;
		};
		expect(pkg.scripts.release).toBe("bun scripts/release.ts");
		expect(pkg.scripts["package:prepublish"]).toContain("bun run test:coverage");
		expect(pkg.scripts["package:prepublish"]).toContain("pack:check");
		expect(pkg.scripts["package:prepublish"]).toContain("publint");
		expect(pkg.scripts["package:prepublish"]).toContain("consumer:next");
		expect(readFileSync(path.join(ROOT, ".husky/pre-push"), "utf8")).toContain("osv-scanner");
		expect(readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8")).toContain(`## [${pkg.version}]`);
		const packed = JSON.parse(
			readFileSync(path.join(ROOT, "packages/basalt/package.json"), "utf8"),
		) as { files: string[] };
		expect(packed.files).toEqual(["dist", "README.md", "LICENSE"]);
		expect(packed.files.join("\n")).not.toMatch(/secret|token|\.env/i);
	});
});

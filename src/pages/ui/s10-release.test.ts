import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PREPUBLISH_STAGE_1, PREPUBLISH_STAGE_2 } from "../../../scripts/package-prepublish";
import { CATALOG } from "./catalog";

const ROOT = process.cwd();

describe("S10 release evidence", () => {
	it("removes obsolete planned chart entries", () => {
		expect(CATALOG.map((entry) => entry.slug)).not.toContain("installation");
		expect(CATALOG.map((entry) => entry.slug)).not.toContain("maps");
	});

	it("locks System0 coverage thresholds and the prepublish plus dependency gates", () => {
		const vitest = readFileSync(path.join(ROOT, "vitest.config.ts"), "utf8");
		expect(vitest).toContain("statements: 90");
		expect(vitest).toContain("branches: 85");
		expect(vitest).toContain("functions: 90");
		expect(vitest).toContain("lines: 90");
		const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8")) as {
			version: string;
			scripts: Record<string, string>;
		};
		expect(pkg.scripts.release).toBe("bun scripts/release.ts");
		expect(pkg.scripts["package:prepublish"]).toBe("bun scripts/package-prepublish.ts");
		const prepublishCommands = [...PREPUBLISH_STAGE_1, ...PREPUBLISH_STAGE_2]
			.map((step) => [step.command, ...step.args].join(" "))
			.join("\n");
		expect(prepublishCommands).toContain("bun run test:coverage");
		expect(prepublishCommands).toContain("pack:check");
		expect(prepublishCommands).toContain("publint");
		expect(prepublishCommands).toContain("consumer:next");
		expect(readFileSync(path.join(ROOT, ".husky/pre-push"), "utf8")).toContain(
			"supervisor.ts --hook=pre-push",
		);
		expect(readFileSync(path.join(ROOT, "scripts/quality/hook-pre-push.sh"), "utf8")).toContain(
			"gate.ts --stage=pre-push",
		);
		expect(readFileSync(path.join(ROOT, "scripts/quality/slots.ts"), "utf8")).toContain(
			"osv-scanner scan",
		);
		expect(readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8")).toContain(`## [${pkg.version}]`);
		const packed = JSON.parse(
			readFileSync(path.join(ROOT, "packages/basalt/package.json"), "utf8"),
		) as { files: string[] };
		expect(packed.files).toEqual(["dist", "ai", "README.md", "LICENSE"]);
		expect(packed.files.join("\n")).not.toMatch(/secret|token|\.env/i);
	});
});

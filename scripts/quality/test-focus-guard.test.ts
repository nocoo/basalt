import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findFocusedTests } from "./test-focus-guard";

const roots: string[] = [];

afterEach(() => {
	for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture(source: string): string {
	const root = mkdtempSync(join(tmpdir(), "basalt-focus-guard-"));
	roots.push(root);
	mkdirSync(join(root, "src"), { recursive: true });
	writeFileSync(join(root, "src", "fixture.test.ts"), source);
	return root;
}

describe("findFocusedTests", () => {
	it("accepts ordinary tests and conditional skipIf", () => {
		const root = fixture(
			'import { describe, it } from "vitest";\ndescribe("x", () => { it.skipIf(false)("x", () => {}); });\n',
		);
		expect(findFocusedTests(root)).toEqual([]);
	});

	it("finds focused and skipped test declarations", () => {
		const root = fixture(
			'import { describe, it } from "vitest";\nit' +
				'.only("focused", () => {});\ndescribe' +
				'.skip("skipped", () => {});\n',
		);
		expect(findFocusedTests(root)).toEqual([
			`${join("src", "fixture.test.ts")}:2`,
			`${join("src", "fixture.test.ts")}:3`,
		]);
	});
});

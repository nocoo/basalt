import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { APP_VERSION } from "./version";

describe("APP_VERSION", () => {
	it("matches the root package.json north star", () => {
		const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
		expect(APP_VERSION).toBe(pkg.version);
		expect(APP_VERSION).toBe(
			(JSON.parse(readFileSync("packages/basalt/package.json", "utf8")) as { version: string })
				.version,
		);
	});
});

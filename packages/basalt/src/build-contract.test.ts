import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("package build contract", () => {
	it("banners component chunks as client modules", () => {
		const config = readFileSync("packages/basalt/vite.config.ts", "utf8");
		expect(config).toContain('"use client"');
	});

	it("emits declaration files from the package tsconfig", () => {
		const config = readFileSync("packages/basalt/tsconfig.build.json", "utf8");
		expect(config).toContain('"declaration": true');
		expect(config).toContain('"emitDeclarationOnly": true');
	});
});

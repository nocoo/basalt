import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { materializeApplicationRecipes, parseApplicationRecipes } from "./consumer-recipes";

const markdown = readFileSync("packages/basalt/ai/RECIPES.md", "utf8");
describe("installed application recipes", () => {
	it("writes only exact installed-package fences with independently checked hashes", () => {
		const root = mkdtempSync(join(tmpdir(), "basalt-recipes-"));
		try {
			const packageDir = join(root, "node_modules/@nocoo/basalt/ai");
			mkdirSync(packageDir, { recursive: true });
			// A recognizable change in the installed copy must reach the executable consumer.
			const installed = markdown.replace("Atlas workspace", "Installed package workspace");
			writeFileSync(join(packageDir, "RECIPES.md"), installed);
			const evidence = materializeApplicationRecipes(root, "src/recipe-modules");
			expect(evidence.map(({ id }) => id)).toEqual([
				"recipe-app-frame",
				"recipe-login",
				"recipe-resources",
			]);
			for (const { id, sha256 } of evidence) {
				const original = installed
					.split(`\x60\x60\x60tsx compile:${id}\n`)[1]
					.split("\x60\x60\x60")[0];
				const emitted = readFileSync(join(root, "src/recipe-modules", `${id}.tsx`), "utf8");
				expect(emitted).toBe(original);
				expect(sha256).toBe(createHash("sha256").update(original).digest("hex"));
			}
			expect(readFileSync(join(root, "src/recipe-modules/recipe-app-frame.tsx"), "utf8")).toContain(
				"Installed package workspace",
			);
			expect(materializeApplicationRecipes(root, "app/recipes/recipe-modules")).toEqual(evidence);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
	it("rejects missing, duplicate, unknown, empty and unclosed recipe modules", () => {
		expect(() => parseApplicationRecipes("")).toThrow("Missing application recipe");
		expect(() =>
			parseApplicationRecipes(`${markdown}\n\`\`\`tsx compile:recipe-login\nexport {};\n\`\`\`\n`),
		).toThrow("Duplicate application recipe");
		expect(() =>
			parseApplicationRecipes(markdown.replace("compile:recipe-login", "compile:recipe-other")),
		).toThrow("Unknown recipe fence");
		expect(() =>
			parseApplicationRecipes(
				markdown.replace(/(```tsx compile:recipe-login\n)[\s\S]*?(```)/, "$1\n$2"),
			),
		).toThrow("Empty application recipe");
		expect(() => parseApplicationRecipes(`${markdown}\n\`\`\`tsx compile:recipe-login\n`)).toThrow(
			"Unclosed application recipe fence",
		);
	});
});

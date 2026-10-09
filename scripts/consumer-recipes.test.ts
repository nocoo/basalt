import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as ts from "typescript-api";
import { describe, expect, it } from "vitest";
import { materializeApplicationRecipes, parseApplicationRecipes } from "./consumer-recipes";

const markdown = readFileSync("packages/basalt/ai/RECIPES.md", "utf8");
/** Only the classes a recipe actually renders, so prose and import paths stay out. */
function classNames(code: string) {
	const file = ts.createSourceFile(
		"recipe.tsx",
		code,
		ts.ScriptTarget.Latest,
		false,
		ts.ScriptKind.TSX,
	);
	const found: string[] = [];
	const visit = (node: ts.Node) => {
		if (ts.isJsxAttribute(node) && node.name.text === "className") {
			const initializer = node.initializer;
			if (initializer && ts.isStringLiteral(initializer))
				found.push(...initializer.text.split(/\s+/));
			else if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
				if (ts.isStringLiteral(initializer.expression))
					found.push(...initializer.expression.text.split(/\s+/));
				else if (ts.isTemplateExpression(initializer.expression))
					for (const span of initializer.expression.templateSpans)
						found.push(...span.literal.text.split(/\s+/));
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
	return found.filter(Boolean);
}

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
				"recipe-mobile-layout",
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
	it("keeps every recipe on published owners and generated-standalone classes", () => {
		const standalone = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
		for (const { id, code } of parseApplicationRecipes(markdown)) {
			expect(code, id).not.toMatch(/style=\{\{/);
			expect(code, id).not.toMatch(
				/\b(p|px|py|pt|pb|m|mx|my|mt|mb|gap|gap-x|gap-y|space-x|space-y)-\d/,
			);
			expect(code, id).not.toMatch(/\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/);
			for (const candidate of classNames(code)) {
				const escaped = candidate.replace(/[.:/()[\],%#]/g, (char) => `\\${char}`);
				expect(standalone, `${id}: ${candidate}`).toContain(`.${escaped}`);
			}
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

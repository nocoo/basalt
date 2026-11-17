import { readdirSync, readFileSync } from "node:fs";
import postcss from "postcss";
import * as ts from "typescript-api";
import { describe, expect, it } from "vitest";

const selectors: string[] = [];
postcss
	.parse(readFileSync("packages/basalt/src/styles/standalone.css", "utf8"))
	.walkRules((rule) => {
		selectors.push(rule.selector);
	});

function containsClass(selector: string, name: string) {
	const candidate = `.${name.replace(/[^\w-]/g, "\\$&")}`;
	let position = selector.indexOf(candidate);
	while (position !== -1) {
		const next = selector[position + candidate.length];
		if (!next || /[\s:.[#>~+,]/.test(next)) return true;
		position = selector.indexOf(candidate, position + 1);
	}
	return false;
}

describe("portable standalone templates", () => {
	for (const file of readdirSync("src/templates").filter((name) => name.endsWith(".tsx"))) {
		it(`ships every class used by ${file}`, () => {
			const source = ts.createSourceFile(
				file,
				readFileSync(`src/templates/${file}`, "utf8"),
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TSX,
			);
			const classes = new Set<string>();
			function visit(node: ts.Node) {
				if (ts.isJsxAttribute(node) && node.name.getText(source) === "className") {
					expect(node.initializer && ts.isStringLiteral(node.initializer), file).toBe(true);
					if (node.initializer && ts.isStringLiteral(node.initializer)) {
						for (const name of node.initializer.text.split(/\s+/).filter(Boolean))
							classes.add(name);
					}
				}
				ts.forEachChild(node, visit);
			}
			visit(source);
			for (const name of classes)
				expect(
					selectors.some((selector) => containsClass(selector, name)),
					`${file}: ${name}`,
				).toBe(true);
		});
	}
	it("keeps view imports out of the model layer", () => {
		for (const file of readdirSync("src/models").filter((name) => name.endsWith(".ts"))) {
			expect(readFileSync(`src/models/${file}`, "utf8"), file).not.toMatch(
				/(?:from\s*["']|import\s*\(["'])[^"']*(?:templates\/|\.tsx)/,
			);
		}
	});
});

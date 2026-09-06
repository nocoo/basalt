import * as ts from "typescript-api";

function addTokens(raw: string, tokens: string[]) {
	for (const token of raw.split(/\s+/)) {
		if (token && !token.includes("${") && token.length < 200) {
			tokens.push(token);
		}
	}
}

export function classCandidates(source: string): string[] {
	const tokens: string[] = [];
	const sourceFile = ts.createSourceFile(
		"temp.tsx",
		source,
		ts.ScriptTarget.Latest,
		/* setParentNodes */ false,
		ts.ScriptKind.TSX,
	);

	function visit(node: ts.Node) {
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
			addTokens(node.text, tokens);
		} else if (ts.isTemplateExpression(node)) {
			addTokens(node.head.text, tokens);
			for (const span of node.templateSpans) {
				addTokens(span.literal.text, tokens);
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return tokens;
}

import { readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import postcss from "postcss";
import * as ts from "typescript-api";
import { classCandidates } from "./class-candidates";

export interface DesignIssue {
	file: string;
	rule: string;
	value: string;
}
const SPACE = /^(?:-)?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy])-(.+)$/;
const GEOMETRY = /^(?:min-|max-)?(?:h|w|size)-\[([^\]]+)\]$/;
const ACTION = /^(?:Button|LinkButton|Input|SelectTrigger|Toggle|Badge|TagBadge)(?:\.|$)/;
const SELF_INSET =
	/^(?:DocCode|CodeBlock|CodeHighlighted|Table|DataTable|LayerCard\.(?:Header|Body|Well|Footer))$/;

export function auditDesignSource(
	file: string,
	source: string,
	pageTemplate = false,
): DesignIssue[] {
	const issues: DesignIssue[] = [];
	const add = (rule: string, value: string) => {
		if (!issues.some((issue) => issue.rule === rule && issue.value === value))
			issues.push({ file, rule, value });
	};
	for (const token of classCandidates(source)) {
		const clean = token.split(/["<>]/)[0];
		const utility = (clean.split(/:(?![^[]*\])/).at(-1) ?? token).replace(/^!|!$/g, "");
		const space = SPACE.exec(utility)?.[1];
		if (
			space &&
			!(
				/^\[calc\(/.test(space) &&
				space.includes("var(--basalt-") &&
				!/\d(?:px|rem|em)/.test(space)
			) &&
			!/^(?:0|auto|px|basalt-(?:space-(?:xs|sm|md|lg|default)|(?:control|menu|panel|row|table)-[\w-]+|(?:card|layout)(?:-sm|-lg|-xl)?|field-gap|overlay|content-gap|nav-(?:gap|inset)))$/.test(
				space,
			)
		)
			add("spacing-token", token);
		if (
			/^rounded(?:-[trblse]{1,2})?(?:-|$)/.test(utility) &&
			!/^(?:rounded(?:-[trblse]{1,2})?-(?:none|basalt-[\w-]+)|rounded-\[inherit\])$/.test(utility)
		)
			add("radius-token", token);
		if (/^text-(?:\[[^\]]*(?:px|rem|em|vw)[^\]]*\]|xs|sm|base|lg|\d?xl)$/.test(utility))
			add("type-token", token);
		if (/^(?:bg|text|border|ring)-\[#/.test(utility)) add("color-token", token);
		if (
			/^(?:bg-(?:basalt-)?(?:accent|muted))$/.test(utility) &&
			/(?:aria-(?:pressed|selected|current)|data-\[(?:state=(?:active|checked|on)|(?:hover-)?selected=true)\])/.test(
				token,
			)
		)
			add("selection-token", token);
		if (/^hover:(?:bg|text)-/.test(token) && /\/(?:\d+)$/.test(token)) add("hover-token", token);
		if (/^duration-\d+$/.test(utility) || /^ease-(?:in|out|in-out|linear)$/.test(utility))
			add("motion-token", token);
		if (utility === "transition-all") add("bounded-transition", token);
		if (
			/^\[(?:padding|margin|gap|border-radius|font-size|line-height)(?:-[\w-]+)?:/.test(utility) &&
			!utility.includes("var(--basalt-")
		)
			add("inline-design-override", token);
		if (/^leading-(?:\d|\[\d|none|tight|normal|relaxed|loose|snug)/.test(utility))
			add("type-token", token);
		if (GEOMETRY.test(utility) && /px/.test(utility)) add("relative-geometry", token);
	}
	const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const application = /^(?:src\/pages\/|src\/components\/)/.test(file);
	let hasTemplate = false;
	function visit(node: ts.Node) {
		if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
			const tag = node.tagName.getText(ast);
			const action = ACTION.test(tag);
			const attrs = new Map(
				node.attributes.properties
					.filter(ts.isJsxAttribute)
					.map((attr) => [attr.name.getText(ast), attr.initializer?.getText(ast) ?? ""]),
			);
			const classes = attrs.get("className") ?? "";
			const children = ts.isJsxElement(node.parent) ? node.parent.children : [];
			const childTags = children.flatMap((child) =>
				ts.isJsxElement(child)
					? [child.openingElement.tagName.getText(ast)]
					: ts.isJsxSelfClosingElement(child)
						? [child.tagName.getText(ast)]
						: [],
			);
			if (
				application &&
				!file.startsWith("src/components/landing/") &&
				/^(details|summary)$/.test(tag)
			)
				add("use-library-disclosure", tag);
			if (
				application &&
				tag === "CollapsibleContent" &&
				childTags.some((child) => SELF_INSET.test(child)) &&
				(!attrs.has("unstyled") || attrs.get("unstyled") === "{false}")
			)
				add("disclosure-inset-owner", tag);
			if (
				application &&
				tag === "LayerCard.Body" &&
				childTags.some((child) => /^(DocCode|CodeBlock|CodeHighlighted)$/.test(child))
			)
				add("self-inset-content", tag);
			if (
				application &&
				/^(?:DocCode|CodeBlock|CodeHighlighted)$/.test(tag) &&
				/\b(?:p[xytrblse]?|m[xytrblse]?|rounded|border)-(?:0|none|basalt-)/.test(classes)
			)
				add("code-frame-owner", classes);
			if (
				application &&
				/^(?:Button|LinkButton|Input|InputArea|SelectTrigger)$/.test(tag) &&
				/\bp[xytrbl]?-(?!0\b)/.test(classes)
			)
				add("control-spacing-owner", classes);
			if (tag === "ShowcasePage") {
				hasTemplate = true;
				if (/\b(?:p[xytrbl]?|bg|rounded)-/.test(classes)) add("page-template-inset", classes);
			}
			if (pageTemplate && /^(?:main|h1|PageHeader|ShowcaseHeader)$/.test(tag))
				add("page-template-owner", tag);
			if (pageTemplate && /\b(?:min-h|h)-(?:screen|dvh|svh)\b/.test(classes))
				add("nested-page-viewport", classes);
			if (application && /^LayerCard(?:\.|$)/.test(tag)) {
				if (/\b(?:bg-(?:basalt-)?(?:card|secondary|bright)|shadow|ring)-?/.test(classes))
					add("card-surface-owner", classes);
				if (tag === "LayerCard") {
					if (/\bp[xytrbl]?-(?!0\b)/.test(classes)) add("card-padding-prop", classes);
					if (
						ts.isJsxElement(node.parent) &&
						node.parent.children.some(
							(child) =>
								ts.isJsxElement(child) &&
								/^LayerCard\./.test(child.openingElement.tagName.getText(ast)),
						) &&
						/\b(?:gap|space-[xy])-(?!0\b)/.test(classes)
					)
						add("card-slot-spacing", classes);
				} else if (/\b(?:p[xytrblse]?|m[xytrblse]?)-/.test(classes)) {
					add("card-slot-spacing", classes);
				}
			}
			if (
				application &&
				/^(?:CollapsibleTrigger|AccordionTrigger)$/.test(tag) &&
				/\bp[xytrblse]?-/.test(classes)
			)
				add("disclosure-header-owner", classes);
			if (
				application &&
				/^(?:div|section|nav|aside|fieldset)$/.test(tag) &&
				/\b(?:rounded-basalt-(?:sm|md|lg)|bg-(?:basalt-)?(?:card|secondary|bright))\b/.test(
					classes,
				) &&
				/\bp[xytrblse]?-basalt-space-/.test(classes)
			)
				add("container-spacing-role", classes);
			if (
				application &&
				tag === "div" &&
				/\bbg-(?:basalt-)?(?:card|secondary|bright)\b/.test(classes) &&
				/\brounded-/.test(classes) &&
				/\bp[xytrbl]?-/.test(classes)
			)
				add("use-layer-card", classes);
			if (file.startsWith("src/pages/") && /^(?:select|textarea|button|input)$/.test(tag)) {
				const hiddenInput =
					tag === "input" &&
					(/\b(?:sr-only|hidden)\b/.test(classes) || attrs.get("type") === '"hidden"');
				const paletteSwatch =
					file === "src/pages/PalettePage.tsx" &&
					tag === "button" &&
					attrs.has("data-accent-choice");
				if (!hiddenInput && !paletteSwatch) add("use-library-control", tag);
			}
			for (const attribute of node.attributes.properties) {
				if (!ts.isJsxAttribute(attribute)) continue;
				const name = attribute.name.getText(ast);
				const value = attribute.initializer?.getText(ast) ?? "";
				if (
					name === "className" &&
					(action || /\bbasalt-action\b/.test(value)) &&
					/(?:^|[\s"`:])!?(?:h|max-h|size)-(?:\d|\[|basalt-(?:control|action))/.test(
						value.replace(/\[[^\]]*_[^\]]*\]:[^\s"`]+/g, ""),
					)
				)
					add("intrinsic-action-size", value);
				if (
					name === "style" &&
					/\b(?:padding\w*|margin\w*|(?:column|row)?Gap|gap|borderRadius|fontSize|lineHeight)\s*:\s*(?:[1-9]|0\.\d|["'][^"']*(?:\d(?:px|rem|em)|[1-9][\d.]*["']))/.test(
						value.replace(/var\([^)]*\)/g, "token"),
					)
				)
					add("inline-design-override", value);
				if (name === "style" && action && /\b(?:height|maxHeight)\s*:/.test(value))
					add("intrinsic-action-size", value);
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(ast);
	if (pageTemplate && !hasTemplate) add("page-template-missing", "ShowcasePage");
	return issues;
}

export function dashboardPageFiles(source: string): string[] {
	const ast = ts.createSourceFile(
		"App.tsx",
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	const imports = new Map<string, string>();
	const pages = new Set<string>();
	function visit(node: ts.Node) {
		if (ts.isVariableDeclaration(node) && node.initializer) {
			const path = /import\(["'](\.\/pages\/[^"']+)["']\)/.exec(node.initializer.getText(ast))?.[1];
			if (path) imports.set(node.name.getText(ast), `src/${path.slice(2)}.tsx`);
		}
		if (
			ts.isJsxElement(node) &&
			node.openingElement.tagName.getText(ast) === "Route" &&
			/<DashboardLayout\b/.test(node.openingElement.attributes.getText(ast))
		) {
			for (const match of node.getText(ast).matchAll(/routeElement\((\w+)\)/g)) {
				const file = imports.get(match[1]);
				if (file) pages.add(file);
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(ast);
	return [...pages];
}

export function auditDesignCss(file: string, source: string): DesignIssue[] {
	const issues: DesignIssue[] = [];
	postcss.parse(source, { from: file }).walkDecls((declaration) => {
		const { prop, value } = declaration;
		if (prop.startsWith("--")) return;
		const withoutTokens = value.replace(/var\([^)]*\)/g, "token");
		let rule = "";
		if (
			/^(?:padding|margin|gap|row-gap|column-gap)(?:-|$)/.test(prop) &&
			/(?:\d*\.)?[1-9]\d*(?:px|rem|em)\b/.test(withoutTokens)
		)
			rule = "spacing-token";
		if (/^border(?:-\w+)*-radius$/.test(prop) && /\d/.test(withoutTokens)) rule = "radius-token";
		if (prop === "font-size" && /\d/.test(withoutTokens)) rule = "type-token";
		if (
			/^(?:transition|animation)(?:-|$)/.test(prop) &&
			/\b\d+(?:\.\d+)?ms\b|\ball\b/.test(withoutTokens)
		)
			rule = "motion-token";
		if (rule) issues.push({ file, rule, value: `${prop}: ${value}` });
	});
	return issues;
}

export function auditCategories(modules: string[], design: string): DesignIssue[] {
	const inventory = design.split("Root module inventory:")[1]?.split("Graphic primitives")[0] ?? "";
	return modules
		.filter((name) => !inventory.includes(`\`${name}\``))
		.map((name) => ({ file: "DESIGN.md", rule: "component-category", value: name }));
}

function files(root: string): string[] {
	return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(root, entry.name);
		if (entry.isDirectory()) return ["generated", "test"].includes(entry.name) ? [] : files(path);
		return /\.(?:tsx|ts|css)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name)
			? [path]
			: [];
	});
}

export function runDesignAudit(root = process.cwd()) {
	const pages = new Set(dashboardPageFiles(readFileSync(resolve(root, "src/App.tsx"), "utf8")));
	const targets = [
		"packages/basalt/src/components",
		"packages/basalt/src/utils",
		"packages/basalt/src/charts",
		"src/pages",
		"src/components",
		"src/styles",
	];
	const issues = targets.flatMap((dir) =>
		files(resolve(root, dir)).flatMap((file) =>
			(file.endsWith(".css") ? auditDesignCss : auditDesignSource)(
				relative(root, file),
				readFileSync(file, "utf8"),
				pages.has(relative(root, file)),
			),
		),
	);
	for (const file of ["packages/basalt/src/styles/tokens.css", "src/index.css"]) {
		issues.push(...auditDesignCss(file, readFileSync(resolve(root, file), "utf8")));
	}
	issues.push(
		...auditCategories(
			readdirSync(resolve(root, "packages/basalt/src/components"))
				.filter((name) => name.endsWith(".tsx") && !name.includes(".test."))
				.map((name) => name.slice(0, -4)),
			readFileSync(resolve(root, "DESIGN.md"), "utf8"),
		),
	);
	for (const issue of issues) console.error(`${issue.file}: ${issue.rule}: ${issue.value}`);
	console.log(`Design audit: ${issues.length} violations`);
	return issues;
}
if (import.meta.main) process.exitCode = runDesignAudit().length ? 1 : 0;

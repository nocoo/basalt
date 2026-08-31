import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import * as ts from "typescript-api";

export interface CatalogApiTarget {
	slug: string;
	sourceFile: string;
	propsType: string;
}

export interface CatalogApiProp {
	name: string;
	type: string;
	required: boolean;
	description?: string;
}

export const CATALOG_API_TARGETS: CatalogApiTarget[] = [
	{
		slug: "button",
		sourceFile: "packages/basalt/src/components/button.tsx",
		propsType: "ButtonProps",
	},
];

export const DEFAULT_TSCONFIG = "tsconfig.catalog-api.json";
export const GENERATED_RELATIVE_PATH = "src/pages/ui/generated/catalog-api.ts";
export const GENERATE_COMMAND = "bun run catalog-api:generate";

const TYPE_FORMAT =
	ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

export function failCatalogApi(message: string): never {
	throw new Error(`catalog API generator: ${message}`);
}

function normalizeFsPath(fileName: string): string {
	return path.resolve(fileName).replace(/\\/g, "/");
}

function isInFile(node: ts.Node, sourceFile: ts.SourceFile): boolean {
	return normalizeFsPath(node.getSourceFile().fileName) === normalizeFsPath(sourceFile.fileName);
}

function skipAlias(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
	return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[]): string {
	return ts
		.formatDiagnostics(diagnostics, {
			getCanonicalFileName: (fileName) => fileName,
			getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
			getNewLine: () => "\n",
		})
		.trim();
}

function errorDiagnostics(diagnostics: readonly ts.Diagnostic[]): ts.Diagnostic[] {
	return diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
}

function isTruncatedType(text: string): boolean {
	return /\.\.\. \d+ more/.test(text) || /\| \.\.\./.test(text) || text === "...";
}

function typeNodeOriginatesFromFile(
	typeNode: ts.TypeNode,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
): boolean {
	let local = false;
	function visit(node: ts.Node) {
		if (ts.isIdentifier(node)) {
			const symbol = checker.getSymbolAtLocation(node);
			if (!symbol) {
				return;
			}
			const resolved = skipAlias(symbol, checker);
			if ((resolved.getDeclarations() ?? []).some((decl) => isInFile(decl, sourceFile))) {
				local = true;
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(typeNode);
	return local;
}

function collectCvaVariantKeys(
	decl: ts.VariableDeclaration,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
	add: (name: string, pos: number) => void,
) {
	const initializer = decl.initializer;
	if (!initializer || !ts.isCallExpression(initializer)) {
		return;
	}
	for (const argument of initializer.arguments) {
		const argumentType = checker.getTypeAtLocation(argument);
		const variantsSymbol = argumentType.getProperty("variants");
		if (!variantsSymbol) {
			continue;
		}
		const variantsType = checker.getTypeOfSymbolAtLocation(variantsSymbol, argument);
		for (const property of variantsType.getProperties()) {
			for (const propertyDecl of property.getDeclarations() ?? []) {
				if (isInFile(propertyDecl, sourceFile)) {
					add(property.getName(), propertyDecl.getStart(sourceFile));
				}
			}
		}
	}
}

function collectCvaPositions(
	decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
): Map<string, number> {
	const positions = new Map<string, number>();
	function add(name: string, pos: number) {
		const previous = positions.get(name);
		if (previous === undefined || pos < previous) {
			positions.set(name, pos);
		}
	}
	function visit(node: ts.Node) {
		if (ts.isIdentifier(node)) {
			const symbol = checker.getSymbolAtLocation(node);
			if (!symbol) {
				ts.forEachChild(node, visit);
				return;
			}
			const resolved = skipAlias(symbol, checker);
			for (const resolvedDecl of resolved.getDeclarations() ?? []) {
				if (isInFile(resolvedDecl, sourceFile) && ts.isVariableDeclaration(resolvedDecl)) {
					collectCvaVariantKeys(resolvedDecl, sourceFile, checker, add);
				}
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(decl);
	return positions;
}

function eachHeritageTypeNode(
	decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
	visit: (typeNode: ts.TypeNode) => void,
) {
	if (ts.isInterfaceDeclaration(decl)) {
		for (const clause of decl.heritageClauses ?? []) {
			for (const typeRef of clause.types) {
				visit(typeRef);
			}
		}
		return;
	}
	if (!decl.type) {
		return;
	}
	if (ts.isIntersectionTypeNode(decl.type)) {
		for (const part of decl.type.types) {
			visit(part);
		}
		return;
	}
	visit(decl.type);
}

function collectForeignPropNames(
	decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
): Set<string> {
	const names = new Set<string>();
	eachHeritageTypeNode(decl, (typeNode) => {
		if (typeNodeOriginatesFromFile(typeNode, sourceFile, checker)) {
			return;
		}
		for (const property of checker.getTypeFromTypeNode(typeNode).getProperties()) {
			names.add(property.getName());
		}
	});
	return names;
}

function findPropsDeclaration(
	sourceFile: ts.SourceFile,
	typeName: string,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
	let found: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined;
	for (const statement of sourceFile.statements) {
		if (
			(ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) &&
			statement.name.text === typeName
		) {
			if (found) {
				failCatalogApi(`duplicate type ${typeName} in ${sourceFile.fileName}`);
			}
			found = statement;
		}
	}
	if (!found) {
		failCatalogApi(`missing type ${typeName} in ${sourceFile.fileName}`);
	}
	return found;
}

function printAlias(type: ts.Type): string | undefined {
	const alias = type.aliasSymbol;
	if (!alias) {
		return undefined;
	}
	const name = alias.getName();
	if (name.startsWith("__")) {
		return undefined;
	}
	const declFile =
		(alias.getDeclarations() ?? [])[0]?.getSourceFile().fileName.replace(/\\/g, "/") ?? "";
	if (
		declFile.includes("/node_modules/@types/react/") ||
		declFile.includes("/node_modules/react/")
	) {
		return `React.${name}`;
	}
	return name;
}

function isBooleanParts(parts: readonly ts.Type[]): boolean {
	if (parts.length === 1) {
		return (parts[0].flags & ts.TypeFlags.Boolean) !== 0;
	}
	return (
		parts.length === 2 && parts.every((part) => (part.flags & ts.TypeFlags.BooleanLiteral) !== 0)
	);
}

function printAtomicType(type: ts.Type, checker: ts.TypeChecker, enclosing: ts.Node): string {
	const alias = printAlias(type);
	if (alias) {
		return alias;
	}
	if (type.flags & ts.TypeFlags.Boolean) {
		return "boolean";
	}
	const text = checker.typeToString(type, enclosing, TYPE_FORMAT);
	if (isTruncatedType(text)) {
		failCatalogApi(`truncated type: ${text}`);
	}
	return text;
}

function printUnionParts(
	parts: readonly ts.Type[],
	checker: ts.TypeChecker,
	enclosing: ts.Node,
): string {
	const printed = parts.map((part) => ({
		isNull: (part.flags & ts.TypeFlags.Null) !== 0,
		text: printAtomicType(part, checker, enclosing),
	}));
	printed.sort((left, right) => {
		if (left.isNull !== right.isNull) {
			return left.isNull ? 1 : -1;
		}
		return left.text.localeCompare(right.text);
	});
	return printed.map((part) => part.text).join(" | ");
}

function printPropType(type: ts.Type, checker: ts.TypeChecker, enclosing: ts.Node): string {
	const alias = printAlias(type);
	if (alias) {
		return alias;
	}
	const parts = (type.isUnion() ? type.types : [type]).filter(
		(part) => !(part.flags & ts.TypeFlags.Undefined),
	);
	if (parts.length === 0) {
		failCatalogApi("empty type after removing undefined");
	}
	if (isBooleanParts(parts)) {
		return "boolean";
	}
	const withoutNull = parts.filter((part) => !(part.flags & ts.TypeFlags.Null));
	if (withoutNull.length !== parts.length && isBooleanParts(withoutNull)) {
		return "boolean | null";
	}
	if (parts.length === 1) {
		const only = parts[0];
		if (!only) {
			failCatalogApi("empty type after removing undefined");
		}
		return printAtomicType(only, checker, enclosing);
	}
	return printUnionParts(parts, checker, enclosing);
}

function jsDocFor(symbol: ts.Symbol, checker: ts.TypeChecker): string | undefined {
	const text = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
	return text.length > 0 ? text : undefined;
}

function resolveSourceFile(
	program: ts.Program,
	repoRoot: string,
	relativeFile: string,
): ts.SourceFile {
	const absolute = normalizeFsPath(path.resolve(repoRoot, relativeFile));
	for (const sourceFile of program.getSourceFiles()) {
		if (normalizeFsPath(sourceFile.fileName) === absolute) {
			return sourceFile;
		}
	}
	failCatalogApi(`missing source ${relativeFile}`);
}

export function createCatalogApiProgram(repoRoot: string, tsconfigPath: string): ts.Program {
	const configFile = path.resolve(repoRoot, tsconfigPath);
	if (!existsSync(configFile)) {
		failCatalogApi(`missing tsconfig ${tsconfigPath}`);
	}
	const read = ts.readConfigFile(configFile, ts.sys.readFile);
	if (read.error) {
		failCatalogApi(`invalid tsconfig ${tsconfigPath}: ${formatDiagnostics([read.error])}`);
	}
	const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, path.dirname(configFile));
	const parseErrors = errorDiagnostics(parsed.errors);
	if (parseErrors.length > 0) {
		failCatalogApi(`invalid tsconfig ${tsconfigPath}: ${formatDiagnostics(parseErrors)}`);
	}
	const program = ts.createProgram({
		rootNames: parsed.fileNames,
		options: parsed.options,
	});
	const semanticErrors = errorDiagnostics(ts.getPreEmitDiagnostics(program));
	if (semanticErrors.length > 0) {
		failCatalogApi(`TypeScript diagnostics:\n${formatDiagnostics(semanticErrors)}`);
	}
	return program;
}

function extractTargetProps(
	program: ts.Program,
	repoRoot: string,
	target: CatalogApiTarget,
): CatalogApiProp[] {
	const sourceFile = resolveSourceFile(program, repoRoot, target.sourceFile);
	const checker = program.getTypeChecker();
	const decl = findPropsDeclaration(sourceFile, target.propsType);
	const cvaPositions = collectCvaPositions(decl, sourceFile, checker);
	const foreignNames = collectForeignPropNames(decl, sourceFile, checker);
	const type = checker.getTypeAtLocation(decl);
	const collected: Array<{ prop: CatalogApiProp; position: number }> = [];
	const seenPositions = new Map<number, string>();

	for (const symbol of type.getProperties()) {
		const name = symbol.getName();
		const localDecls = (symbol.getDeclarations() ?? []).filter((item) =>
			isInFile(item, sourceFile),
		);
		let position: number | undefined;
		if (localDecls.length > 0) {
			if (foreignNames.has(name)) {
				failCatalogApi(`cross-file prop impersonation: ${name}`);
			}
			position = localDecls[0].getStart(sourceFile);
		} else if (cvaPositions.has(name)) {
			if (foreignNames.has(name)) {
				failCatalogApi(`cross-file prop impersonation: ${name}`);
			}
			position = cvaPositions.get(name);
		}
		if (position === undefined) {
			continue;
		}
		const existing = seenPositions.get(position);
		if (existing) {
			failCatalogApi(`undeterminable order between ${existing} and ${name}`);
		}
		seenPositions.set(position, name);
		const context = localDecls[0] ?? sourceFile;
		const typeNode =
			localDecls[0] &&
			(ts.isPropertySignature(localDecls[0]) || ts.isPropertyDeclaration(localDecls[0]))
				? localDecls[0].type
				: undefined;
		const propType = typeNode
			? checker.getTypeFromTypeNode(typeNode)
			: checker.getTypeOfSymbolAtLocation(symbol, context);
		const description = jsDocFor(symbol, checker);
		collected.push({
			position,
			prop: {
				name,
				type: printPropType(propType, checker, context),
				required: (symbol.flags & ts.SymbolFlags.Optional) === 0,
				...(description ? { description } : {}),
			},
		});
	}

	if (collected.length === 0) {
		failCatalogApi(`empty result for ${target.slug}`);
	}
	collected.sort((left, right) => left.position - right.position);
	return collected.map((item) => item.prop);
}

export function generateCatalogApi(input: {
	repoRoot: string;
	tsconfigPath: string;
	targets: CatalogApiTarget[];
}): Record<string, CatalogApiProp[]> {
	const slugs = new Set<string>();
	for (const target of input.targets) {
		if (slugs.has(target.slug)) {
			failCatalogApi(`duplicate slug ${target.slug}`);
		}
		slugs.add(target.slug);
	}
	const program = createCatalogApiProgram(input.repoRoot, input.tsconfigPath);
	const result: Record<string, CatalogApiProp[]> = {};
	for (const target of input.targets) {
		result[target.slug] = extractTargetProps(program, input.repoRoot, target);
	}
	return result;
}

function emitString(value: string): string {
	if (value.includes('"') && !value.includes("'")) {
		return `'${value}'`;
	}
	return JSON.stringify(value);
}

function emitKey(key: string): string {
	return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function renderProp(prop: CatalogApiProp): string {
	const lines = [
		"\t\t{",
		`\t\t\tname: ${emitString(prop.name)},`,
		`\t\t\ttype: ${emitString(prop.type)},`,
		`\t\t\trequired: ${prop.required ? "true" : "false"},`,
	];
	if (prop.description !== undefined) {
		lines.push(`\t\t\tdescription: ${emitString(prop.description)},`);
	}
	lines.push("\t\t}");
	return lines.join("\n");
}

export function renderCatalogApiModule(data: Record<string, CatalogApiProp[]>): string {
	const slugs = Object.keys(data).sort();
	const entries = slugs.map((slug) => {
		const props = data[slug];
		if (!props) {
			failCatalogApi(`missing generated props for ${slug}`);
		}
		const rendered = props.map((prop) => renderProp(prop)).join(",\n");
		return `\t${emitKey(slug)}: [\n${rendered},\n\t]`;
	});
	return [
		"// Generated by scripts/catalog-api.ts. Do not edit.",
		"",
		"export const CATALOG_API = {",
		`${entries.join(",\n")},`,
		"};",
		"",
	].join("\n");
}

export function checkCatalogApiFile(filePath: string, expected: string): void {
	if (!existsSync(filePath)) {
		failCatalogApi(`missing catalog API at ${filePath}; run ${GENERATE_COMMAND}`);
	}
	const actual = readFileSync(filePath);
	if (!actual.equals(Buffer.from(expected, "utf8"))) {
		failCatalogApi(`stale catalog API at ${filePath}; run ${GENERATE_COMMAND}`);
	}
}

export function writeCatalogApiFile(filePath: string, content: string): void {
	mkdirSync(path.dirname(filePath), { recursive: true });
	writeFileSync(filePath, content);
}

export function generateCatalogApiModule(repoRoot: string): string {
	return renderCatalogApiModule(
		generateCatalogApi({
			repoRoot,
			tsconfigPath: DEFAULT_TSCONFIG,
			targets: CATALOG_API_TARGETS,
		}),
	);
}

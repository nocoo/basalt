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

function typeReferenceName(typeNode: ts.TypeNode): ts.EntityName | ts.Expression | undefined {
	if (ts.isTypeReferenceNode(typeNode)) {
		return typeNode.typeName;
	}
	if (ts.isExpressionWithTypeArguments(typeNode)) {
		return typeNode.expression;
	}
	return undefined;
}

function containsLocalTypeQuery(
	typeNode: ts.TypeNode,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
): boolean {
	let found = false;
	function visit(node: ts.Node) {
		if (ts.isTypeQueryNode(node)) {
			const symbol = checker.getSymbolAtLocation(node.exprName);
			const resolved = symbol ? skipAlias(symbol, checker) : undefined;
			if ((resolved?.getDeclarations() ?? []).some((decl) => isInFile(decl, sourceFile))) {
				found = true;
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(typeNode);
	return found;
}

function localTypeDeclaration(
	typeNode: ts.TypeNode,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
): ts.TypeAliasDeclaration | ts.InterfaceDeclaration | undefined {
	const name = typeReferenceName(typeNode);
	if (!name) {
		return undefined;
	}
	const symbol = checker.getSymbolAtLocation(name);
	if (!symbol) {
		return undefined;
	}
	const immediate = (symbol.getDeclarations() ?? []).find(
		(decl) =>
			isInFile(decl, sourceFile) &&
			(ts.isTypeAliasDeclaration(decl) || ts.isInterfaceDeclaration(decl)),
	);
	if (immediate && (ts.isTypeAliasDeclaration(immediate) || ts.isInterfaceDeclaration(immediate))) {
		return immediate;
	}
	return undefined;
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

function typeArgumentNodes(typeNode: ts.TypeNode): readonly ts.TypeNode[] {
	if (ts.isTypeReferenceNode(typeNode) || ts.isExpressionWithTypeArguments(typeNode)) {
		return typeNode.typeArguments ?? [];
	}
	return [];
}

function collectForeignPropNamesFromTypeNode(
	typeNode: ts.TypeNode,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
	names: Set<string>,
	visited: Set<ts.Node>,
	visitedDecls: Set<ts.Declaration>,
) {
	if (visited.has(typeNode)) {
		return;
	}
	visited.add(typeNode);
	const recurse = (node: ts.TypeNode) => {
		collectForeignPropNamesFromTypeNode(node, sourceFile, checker, names, visited, visitedDecls);
	};
	if (ts.isParenthesizedTypeNode(typeNode)) {
		recurse(typeNode.type);
		return;
	}
	if (ts.isUnionTypeNode(typeNode) || ts.isIntersectionTypeNode(typeNode)) {
		for (const part of typeNode.types) {
			recurse(part);
		}
		return;
	}
	if (ts.isTypeLiteralNode(typeNode)) {
		return;
	}
	if (ts.isIndexedAccessTypeNode(typeNode)) {
		recurse(typeNode.objectType);
		recurse(typeNode.indexType);
		return;
	}
	if (ts.isTupleTypeNode(typeNode)) {
		for (const element of typeNode.elements) {
			recurse(ts.isNamedTupleMember(element) ? element.type : element);
		}
		return;
	}
	if (ts.isArrayTypeNode(typeNode)) {
		recurse(typeNode.elementType);
		return;
	}
	if (ts.isOptionalTypeNode(typeNode) || ts.isRestTypeNode(typeNode)) {
		recurse(typeNode.type);
		return;
	}
	if (ts.isTypeOperatorNode(typeNode)) {
		recurse(typeNode.type);
		return;
	}
	if (ts.isTypeQueryNode(typeNode)) {
		const symbol = checker.getSymbolAtLocation(typeNode.exprName);
		const resolved = symbol ? skipAlias(symbol, checker) : undefined;
		if ((resolved?.getDeclarations() ?? []).some((decl) => isInFile(decl, sourceFile))) {
			return;
		}
		return;
	}
	for (const argument of typeArgumentNodes(typeNode)) {
		recurse(argument);
	}
	const local = localTypeDeclaration(typeNode, sourceFile, checker);
	if (local && ts.isTypeAliasDeclaration(local) && local.type) {
		if (!visitedDecls.has(local)) {
			visitedDecls.add(local);
			recurse(local.type);
		}
		return;
	}
	if (local && ts.isInterfaceDeclaration(local)) {
		if (!visitedDecls.has(local)) {
			visitedDecls.add(local);
			eachHeritageTypeNode(local, recurse);
		}
		return;
	}
	if (containsLocalTypeQuery(typeNode, sourceFile, checker)) {
		return;
	}
	for (const property of checker.getTypeFromTypeNode(typeNode).getProperties()) {
		names.add(property.getName());
	}
}

function collectForeignPropNames(
	decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
	sourceFile: ts.SourceFile,
	checker: ts.TypeChecker,
): Set<string> {
	const names = new Set<string>();
	const visited = new Set<ts.Node>();
	const visitedDecls = new Set<ts.Declaration>();
	eachHeritageTypeNode(decl, (typeNode) => {
		collectForeignPropNamesFromTypeNode(
			typeNode,
			sourceFile,
			checker,
			names,
			visited,
			visitedDecls,
		);
	});
	return names;
}

function findLocalTypeDeclaration(
	sourceFile: ts.SourceFile,
	typeName: string,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
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
	return found;
}

function asTypeDeclaration(
	decl: ts.Declaration | undefined,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
	if (!decl) {
		return undefined;
	}
	if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) {
		return decl;
	}
	return undefined;
}

function findExportedPropsDeclaration(
	sourceFile: ts.SourceFile,
	typeName: string,
	checker: ts.TypeChecker,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
	const local = findLocalTypeDeclaration(sourceFile, typeName);
	const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
	const exported = moduleSymbol
		? checker.getExportsOfModule(moduleSymbol).filter((symbol) => symbol.getName() === typeName)
		: [];
	if (exported.length === 0) {
		if (local) {
			failCatalogApi(`not exported type ${typeName} in ${sourceFile.fileName}`);
		}
		failCatalogApi(`missing type ${typeName} in ${sourceFile.fileName}`);
	}
	if (exported.length > 1) {
		failCatalogApi(`duplicate exported type ${typeName} in ${sourceFile.fileName}`);
	}
	const exportedSymbol = exported[0];
	if (!exportedSymbol) {
		failCatalogApi(`missing type ${typeName} in ${sourceFile.fileName}`);
	}
	const resolved = skipAlias(exportedSymbol, checker);
	const fromExport = (resolved.getDeclarations() ?? [])
		.map((decl) => asTypeDeclaration(decl))
		.find((decl) => decl && isInFile(decl, sourceFile));
	if (fromExport) {
		return fromExport;
	}
	if (local) {
		return local;
	}
	failCatalogApi(`type ${typeName} is not declared in ${sourceFile.fileName}`);
}

function isReactAlias(alias: ts.Symbol, checker: ts.TypeChecker): boolean {
	const resolved = skipAlias(alias, checker);
	for (const symbol of [alias, resolved]) {
		for (const decl of symbol.getDeclarations() ?? []) {
			const declFile = decl.getSourceFile().fileName.replace(/\\/g, "/");
			if (
				declFile.includes("/node_modules/@types/react") ||
				declFile.includes("/node_modules/react/")
			) {
				return true;
			}
		}
	}
	return false;
}

function namespaceQualifiers(decl: ts.Declaration): string[] {
	const parts: string[] = [];
	let node: ts.Node | undefined = decl.parent;
	while (node) {
		if (ts.isModuleDeclaration(node) && ts.isIdentifier(node.name)) {
			parts.unshift(node.name.text);
		}
		node = node.parent;
	}
	return parts;
}

function sourceFileOfSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): ts.SourceFile | undefined {
	const resolved = skipAlias(symbol, checker);
	for (const decl of resolved.getDeclarations() ?? []) {
		if (ts.isSourceFile(decl)) {
			return decl;
		}
	}
	return resolved.getDeclarations()?.[0]?.getSourceFile();
}

function importNamespaceForSourceFile(
	fromFile: ts.SourceFile,
	targetFile: ts.SourceFile,
	checker: ts.TypeChecker,
): string | undefined {
	const names: string[] = [];
	const targetPath = normalizeFsPath(targetFile.fileName);
	for (const statement of fromFile.statements) {
		if (!ts.isImportDeclaration(statement) || !statement.importClause) {
			continue;
		}
		const bindings = statement.importClause.namedBindings;
		if (!bindings || !ts.isNamespaceImport(bindings) || !statement.moduleSpecifier) {
			continue;
		}
		const moduleSymbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
		if (!moduleSymbol) {
			continue;
		}
		const moduleFile = sourceFileOfSymbol(moduleSymbol, checker);
		if (!moduleFile || normalizeFsPath(moduleFile.fileName) !== targetPath) {
			continue;
		}
		names.push(bindings.name.text);
	}
	if (names.length !== 1) {
		return undefined;
	}
	return names[0];
}

function namedTypeSymbol(type: ts.Type): ts.Symbol | undefined {
	if (type.aliasSymbol) {
		return type.aliasSymbol;
	}
	const symbol = type.getSymbol();
	if (
		symbol &&
		symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.Class | ts.SymbolFlags.TypeAlias)
	) {
		return symbol;
	}
	return undefined;
}

function namedTypeArguments(
	type: ts.Type,
	checker: ts.TypeChecker,
): readonly ts.Type[] | undefined {
	if (type.aliasTypeArguments && type.aliasTypeArguments.length > 0) {
		return type.aliasTypeArguments;
	}
	if (type.flags & ts.TypeFlags.Object) {
		const objectType = type as ts.ObjectType;
		if (objectType.objectFlags & ts.ObjectFlags.Reference) {
			const args = checker.getTypeArguments(type as ts.TypeReference);
			if (args.length > 0) {
				return args;
			}
		}
	}
	return undefined;
}

function unwrapTypeNode(typeNode: ts.TypeNode): ts.TypeNode {
	let node = typeNode;
	while (ts.isParenthesizedTypeNode(node)) {
		node = node.type;
	}
	return node;
}

function explicitTypeArgumentNodes(
	typeNode: ts.TypeNode | undefined,
): readonly ts.TypeNode[] | undefined {
	if (!typeNode) {
		return undefined;
	}
	const unwrapped = unwrapTypeNode(typeNode);
	if (ts.isTypeReferenceNode(unwrapped) || ts.isExpressionWithTypeArguments(unwrapped)) {
		return unwrapped.typeArguments ?? [];
	}
	return undefined;
}

function printAlias(
	type: ts.Type,
	checker: ts.TypeChecker,
	enclosing: ts.Node,
	typeNode?: ts.TypeNode,
): string | undefined {
	const alias = namedTypeSymbol(type);
	if (!alias) {
		return undefined;
	}
	const name = alias.getName();
	if (name.startsWith("__")) {
		return undefined;
	}
	const resolved = skipAlias(alias, checker);
	const decls = [...(alias.getDeclarations() ?? []), ...(resolved.getDeclarations() ?? [])];
	let qualified = name;
	for (const decl of decls) {
		const parts = namespaceQualifiers(decl);
		if (parts.length > 0) {
			qualified = [...parts, name].join(".");
			break;
		}
	}
	if (!qualified.includes(".")) {
		const enclosingFile = enclosing.getSourceFile();
		const aliasFile = decls[0]?.getSourceFile();
		if (
			aliasFile &&
			normalizeFsPath(aliasFile.fileName) !== normalizeFsPath(enclosingFile.fileName)
		) {
			const imported = importNamespaceForSourceFile(enclosingFile, aliasFile, checker);
			if (imported) {
				qualified = `${imported}.${name}`;
			}
		}
	}
	if (isReactAlias(alias, checker) && !qualified.startsWith("React.")) {
		qualified = `React.${qualified}`;
	}
	const inferred = namedTypeArguments(type, checker) ?? [];
	const explicit = explicitTypeArgumentNodes(typeNode);
	if (explicit) {
		if (explicit.length === 0) {
			return qualified;
		}
		const args = explicit.map((node, index) => {
			const argument = inferred[index] ?? checker.getTypeFromTypeNode(node);
			return printType(argument, checker, enclosing, false, node);
		});
		return `${qualified}<${args.join(", ")}>`;
	}
	if (inferred.length === 0) {
		return qualified;
	}
	const args = inferred.map((argument) => printType(argument, checker, enclosing, false));
	return `${qualified}<${args.join(", ")}>`;
}

function isBooleanParts(parts: readonly ts.Type[]): boolean {
	if (parts.length === 1) {
		return (parts[0].flags & ts.TypeFlags.Boolean) !== 0;
	}
	return (
		parts.length === 2 && parts.every((part) => (part.flags & ts.TypeFlags.BooleanLiteral) !== 0)
	);
}

function printAtomicType(
	type: ts.Type,
	checker: ts.TypeChecker,
	enclosing: ts.Node,
	typeNode?: ts.TypeNode,
): string {
	const alias = printAlias(type, checker, enclosing, typeNode);
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

function unionRank(part: ts.Type): number {
	if (part.flags & ts.TypeFlags.Undefined) {
		return 2;
	}
	if (part.flags & ts.TypeFlags.Null) {
		return 1;
	}
	return 0;
}

function printUnionParts(
	parts: readonly ts.Type[],
	checker: ts.TypeChecker,
	enclosing: ts.Node,
): string {
	const printed = parts.map((part) => ({
		rank: unionRank(part),
		text: printAtomicType(part, checker, enclosing),
	}));
	printed.sort((left, right) => {
		if (left.rank !== right.rank) {
			return left.rank - right.rank;
		}
		return left.text.localeCompare(right.text);
	});
	return printed.map((part) => part.text).join(" | ");
}

function printType(
	type: ts.Type,
	checker: ts.TypeChecker,
	enclosing: ts.Node,
	stripTopLevelUndefined: boolean,
	typeNode?: ts.TypeNode,
): string {
	const alias = printAlias(type, checker, enclosing, typeNode);
	if (alias) {
		return alias;
	}
	const parts = type.isUnion() ? type.types : [type];
	const visible = stripTopLevelUndefined
		? parts.filter((part) => !(part.flags & ts.TypeFlags.Undefined))
		: parts;
	if (visible.length === 0) {
		failCatalogApi("empty type after removing undefined");
	}
	if (isBooleanParts(visible)) {
		return "boolean";
	}
	const withoutUndefined = visible.filter((part) => !(part.flags & ts.TypeFlags.Undefined));
	const withoutNull = withoutUndefined.filter((part) => !(part.flags & ts.TypeFlags.Null));
	const hasUndefined = withoutUndefined.length !== visible.length;
	const hasNull = withoutNull.length !== withoutUndefined.length;
	if (isBooleanParts(withoutNull)) {
		if (hasNull && hasUndefined) {
			return "boolean | null | undefined";
		}
		if (hasNull) {
			return "boolean | null";
		}
		if (hasUndefined) {
			return "boolean | undefined";
		}
		return "boolean";
	}
	if (visible.length === 1) {
		const only = visible[0];
		if (!only) {
			failCatalogApi("empty type after removing undefined");
		}
		return printAtomicType(only, checker, enclosing, typeNode);
	}
	return printUnionParts(visible, checker, enclosing);
}

function printPropType(
	type: ts.Type,
	checker: ts.TypeChecker,
	enclosing: ts.Node,
	typeNode?: ts.TypeNode,
): string {
	return printType(type, checker, enclosing, true, typeNode);
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
	const decl = findExportedPropsDeclaration(sourceFile, target.propsType, checker);
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
			const hasForeignDeclaration = (symbol.getDeclarations() ?? []).some(
				(item) => !isInFile(item, sourceFile),
			);
			if (hasForeignDeclaration || foreignNames.has(name)) {
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
				type: printPropType(propType, checker, context, typeNode),
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

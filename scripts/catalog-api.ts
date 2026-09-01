import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import * as ts from "typescript-api";

export interface CatalogApiTarget {
	slug: string;
	sourceFile: string;
	propsType: string;
	surface: string;
	allowEmpty?: true;
}

export interface CatalogApiProp {
	name: string;
	type: string;
	required: boolean;
	default?: string;
	description?: string;
}

export interface CatalogApiSurface {
	name: string;
	props: CatalogApiProp[];
}

export const CATALOG_API_TARGETS: CatalogApiTarget[] = [
	{
		slug: "button",
		sourceFile: "packages/basalt/src/components/button.tsx",
		propsType: "ButtonProps",
		surface: "Button",
	},
	{
		slug: "link-button",
		sourceFile: "packages/basalt/src/components/button.tsx",
		propsType: "LinkButtonProps",
		surface: "LinkButton",
	},
	{
		slug: "text",
		sourceFile: "packages/basalt/src/components/text.tsx",
		propsType: "TextProps",
		surface: "Text",
	},
	{
		slug: "label",
		sourceFile: "packages/basalt/src/components/label.tsx",
		propsType: "LabelProps",
		surface: "Label",
	},
	{
		slug: "separator",
		sourceFile: "packages/basalt/src/components/separator.tsx",
		propsType: "SeparatorProps",
		surface: "Separator",
	},
	{
		slug: "scroll-area",
		sourceFile: "packages/basalt/src/components/scroll-area.tsx",
		propsType: "ScrollAreaProps",
		surface: "ScrollArea",
	},
	{
		slug: "link",
		sourceFile: "packages/basalt/src/components/link.tsx",
		propsType: "LinkProps",
		surface: "Link",
	},
	{
		slug: "tooltip",
		sourceFile: "packages/basalt/src/components/tooltip.tsx",
		propsType: "TooltipProps",
		surface: "Tooltip",
	},
	{
		slug: "theme-toggle",
		sourceFile: "packages/basalt/src/components/theme-toggle.tsx",
		propsType: "ThemeToggleProps",
		surface: "ThemeToggle",
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardProps",
		surface: "LayerCard",
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardSectionProps",
		surface: "LayerCard.Primary",
		allowEmpty: true,
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardSectionProps",
		surface: "LayerCard.Secondary",
		allowEmpty: true,
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardSectionProps",
		surface: "LayerCard.Header",
		allowEmpty: true,
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardSectionProps",
		surface: "LayerCard.Body",
		allowEmpty: true,
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardSectionProps",
		surface: "LayerCard.Footer",
		allowEmpty: true,
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardLoadingProps",
		surface: "LayerCard.Loading",
	},
	{
		slug: "layer-card",
		sourceFile: "packages/basalt/src/components/layer-card.tsx",
		propsType: "LayerCardEmptyProps",
		surface: "LayerCard.Empty",
	},
	{
		slug: "basalt-mark",
		sourceFile: "packages/basalt/src/components/basalt-mark.tsx",
		propsType: "BasaltMarkProps",
		surface: "BasaltMark",
	},
	{
		slug: "field",
		sourceFile: "packages/basalt/src/components/field.tsx",
		propsType: "FieldProps",
		surface: "Field",
	},
	{
		slug: "input",
		sourceFile: "packages/basalt/src/components/input.tsx",
		propsType: "InputProps",
		surface: "Input",
	},
	{
		slug: "input-area",
		sourceFile: "packages/basalt/src/components/input-area.tsx",
		propsType: "InputAreaProps",
		surface: "InputArea",
	},
	{
		slug: "input-group",
		sourceFile: "packages/basalt/src/components/input-group.tsx",
		propsType: "InputGroupProps",
		surface: "InputGroup",
	},
	{
		slug: "input-group",
		sourceFile: "packages/basalt/src/components/input-group.tsx",
		propsType: "InputGroupInputProps",
		surface: "InputGroup.Input",
	},
	{
		slug: "input-group",
		sourceFile: "packages/basalt/src/components/input-group.tsx",
		propsType: "InputGroupAddonProps",
		surface: "InputGroup.Addon",
	},
	{
		slug: "input-group",
		sourceFile: "packages/basalt/src/components/input-group.tsx",
		propsType: "InputGroupButtonProps",
		surface: "InputGroup.Button",
	},
	{
		slug: "input-group",
		sourceFile: "packages/basalt/src/components/input-group.tsx",
		propsType: "InputGroupSuffixProps",
		surface: "InputGroup.Suffix",
		allowEmpty: true,
	},
	{
		slug: "sensitive-input",
		sourceFile: "packages/basalt/src/components/sensitive-input.tsx",
		propsType: "SensitiveInputProps",
		surface: "SensitiveInput",
	},
	{
		slug: "checkbox",
		sourceFile: "packages/basalt/src/components/checkbox.tsx",
		propsType: "CheckboxProps",
		surface: "Checkbox",
	},
	{
		slug: "radio",
		sourceFile: "packages/basalt/src/components/radio.tsx",
		propsType: "RadioProps",
		surface: "Radio",
	},
	{
		slug: "switch",
		sourceFile: "packages/basalt/src/components/switch.tsx",
		propsType: "SwitchProps",
		surface: "Switch",
	},
	{
		slug: "select",
		sourceFile: "packages/basalt/src/components/select.tsx",
		propsType: "SelectProps",
		surface: "Select",
	},
	{
		slug: "select",
		sourceFile: "packages/basalt/src/components/select.tsx",
		propsType: "SelectTriggerProps",
		surface: "SelectTrigger",
		allowEmpty: true,
	},
	{
		slug: "select",
		sourceFile: "packages/basalt/src/components/select.tsx",
		propsType: "SelectValueProps",
		surface: "SelectValue",
	},
	{
		slug: "select",
		sourceFile: "packages/basalt/src/components/select.tsx",
		propsType: "SelectContentProps",
		surface: "SelectContent",
	},
	{
		slug: "select",
		sourceFile: "packages/basalt/src/components/select.tsx",
		propsType: "SelectGroupProps",
		surface: "SelectGroup",
		allowEmpty: true,
	},
	{
		slug: "select",
		sourceFile: "packages/basalt/src/components/select.tsx",
		propsType: "SelectItemProps",
		surface: "SelectItem",
	},
	{
		slug: "segment-control",
		sourceFile: "packages/basalt/src/components/segment-control.tsx",
		propsType: "SegmentControlProps",
		surface: "SegmentControl",
	},
	{
		slug: "page-header",
		sourceFile: "packages/basalt/src/components/page-header.tsx",
		propsType: "PageHeaderProps",
		surface: "PageHeader",
	},
	{
		slug: "stat-strip",
		sourceFile: "packages/basalt/src/components/stat-strip.tsx",
		propsType: "StatStripProps",
		surface: "StatStrip",
	},
	{
		slug: "confirm-dialog",
		sourceFile: "packages/basalt/src/components/confirm-dialog.tsx",
		propsType: "ConfirmDialogProps",
		surface: "ConfirmDialog",
	},
	{
		slug: "confirm-dialog",
		sourceFile: "packages/basalt/src/components/confirm-dialog.tsx",
		propsType: "UseConfirmOptions",
		surface: "useConfirm",
	},
];

export const DEFAULT_TSCONFIG = "tsconfig.catalog-api.json";
export const GENERATED_RELATIVE_PATH = "src/pages/ui/generated/catalog-api.ts";
export const GENERATED_SHARD_DIR = "src/pages/ui/generated/catalog-api";
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

function enclosingOriginDeclarations(type: ts.Type, program: ts.Program): ts.Declaration[] {
	if (!type.aliasSymbol) {
		return [];
	}
	return (type.aliasSymbol.getDeclarations() ?? []).filter((decl) => {
		if (!ts.isTypeAliasDeclaration(decl)) {
			return false;
		}
		return !program.isSourceFileDefaultLibrary(decl.getSourceFile());
	});
}

interface HeritagePropOrigins {
	foreign: Set<string>;
	localSynthetic: Map<string, number>;
}

function collectHeritageOriginsFromType(
	type: ts.Type,
	sourceFile: ts.SourceFile,
	program: ts.Program,
	origins: HeritagePropOrigins,
	visited: Set<ts.Type>,
	inheritedOrigin: readonly ts.Declaration[] = [],
) {
	if (visited.has(type)) {
		return;
	}
	visited.add(type);
	const ownOrigin = enclosingOriginDeclarations(type, program);
	const originDecls = ownOrigin.length > 0 ? ownOrigin : inheritedOrigin;
	if (type.isUnion() || type.isIntersection()) {
		for (const part of type.types) {
			collectHeritageOriginsFromType(part, sourceFile, program, origins, visited, originDecls);
		}
		return;
	}
	for (const property of type.getProperties()) {
		const name = property.getName();
		const decls = property.getDeclarations() ?? [];
		if (decls.length > 0) {
			if (decls.some((item) => !isInFile(item, sourceFile))) {
				origins.foreign.add(name);
			}
			continue;
		}
		if (originDecls.length === 0) {
			continue;
		}
		if (originDecls.some((item) => !isInFile(item, sourceFile))) {
			origins.foreign.add(name);
			continue;
		}
		const localOrigins = originDecls.filter((item) => isInFile(item, sourceFile));
		if (localOrigins.length === 0) {
			continue;
		}
		const position = Math.min(...localOrigins.map((item) => item.getStart(sourceFile)));
		const previous = origins.localSynthetic.get(name);
		if (previous === undefined || position < previous) {
			origins.localSynthetic.set(name, position);
		}
	}
}

function collectHeritageOrigins(
	decl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
	sourceFile: ts.SourceFile,
	program: ts.Program,
	checker: ts.TypeChecker,
): HeritagePropOrigins {
	const origins: HeritagePropOrigins = {
		foreign: new Set<string>(),
		localSynthetic: new Map<string, number>(),
	};
	const visited = new Set<ts.Type>();
	eachHeritageTypeNode(decl, (typeNode) => {
		collectHeritageOriginsFromType(
			checker.getTypeFromTypeNode(typeNode),
			sourceFile,
			program,
			origins,
			visited,
		);
	});
	return origins;
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

function isReactPackageFile(fileName: string): boolean {
	const file = fileName.replace(/\\/g, "/");
	return file.includes("/node_modules/@types/react/") || file.includes("/node_modules/react/");
}

function isReactAlias(alias: ts.Symbol, checker: ts.TypeChecker): boolean {
	const resolved = skipAlias(alias, checker);
	for (const symbol of [alias, resolved]) {
		for (const decl of symbol.getDeclarations() ?? []) {
			if (isReactPackageFile(decl.getSourceFile().fileName)) {
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

function entityNameText(name: ts.EntityName): string {
	if (ts.isIdentifier(name)) {
		return name.text;
	}
	return `${entityNameText(name.left)}.${name.right.text}`;
}

function writtenReferenceName(typeNode: ts.TypeNode | undefined): string | undefined {
	if (!typeNode) {
		return undefined;
	}
	const node = unwrapTypeNode(typeNode);
	if (ts.isTypeReferenceNode(node)) {
		return entityNameText(node.typeName);
	}
	if (ts.isExpressionWithTypeArguments(node)) {
		if (ts.isIdentifier(node.expression)) {
			return node.expression.text;
		}
		if (ts.isPropertyAccessExpression(node.expression)) {
			return node.expression.getText();
		}
	}
	return undefined;
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
	let qualified: string;
	if (isReactAlias(alias, checker)) {
		const resolvedName = resolved.getName();
		if (resolvedName.startsWith("__")) {
			return undefined;
		}
		const resolvedDecl = (resolved.getDeclarations() ?? [])[0];
		const ns = resolvedDecl ? namespaceQualifiers(resolvedDecl) : [];
		const nested = ns[0] === "React" ? ns.slice(1) : ns;
		qualified = ["React", ...nested, resolvedName].join(".");
	} else {
		const written = writtenReferenceName(typeNode);
		qualified = written ?? name;
		if (!written) {
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
		}
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
	const element = arrayElementType(type, checker);
	if (element) {
		return `${printType(element, checker, enclosing, false)}[]`;
	}
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

function arrayElementType(type: ts.Type, checker: ts.TypeChecker): ts.Type | undefined {
	if (!checker.isArrayType(type)) {
		return undefined;
	}
	return namedTypeArguments(type, checker)?.[0];
}

function containsTopLevelUndefined(type: ts.Type): boolean {
	if (type.flags & ts.TypeFlags.Undefined) {
		return true;
	}
	if (type.isUnion()) {
		return type.types.some((part) => (part.flags & ts.TypeFlags.Undefined) !== 0);
	}
	return false;
}

function writtenAliasHidesTopLevelUndefined(referenced: ts.Type, checker: ts.TypeChecker): boolean {
	if (!containsTopLevelUndefined(referenced)) {
		return false;
	}
	const alias = namedTypeSymbol(referenced);
	return !alias || !isReactAlias(alias, checker);
}

function printType(
	type: ts.Type,
	checker: ts.TypeChecker,
	enclosing: ts.Node,
	stripTopLevelUndefined: boolean,
	typeNode?: ts.TypeNode,
): string {
	if (type.flags & ts.TypeFlags.TypeParameter) {
		failCatalogApi(`unresolved type parameter ${type.getSymbol()?.getName() ?? "unknown"}`);
	}
	const node = typeNode ? unwrapTypeNode(typeNode) : undefined;
	if (node && ts.isUnionTypeNode(node)) {
		const printed = node.types.map((partNode) => {
			const partType = checker.getTypeFromTypeNode(partNode);
			return {
				rank: unionRank(partType),
				text: printType(partType, checker, enclosing, false, partNode),
				type: partType,
			};
		});
		const visible = stripTopLevelUndefined
			? printed.filter((part) => !(part.type.flags & ts.TypeFlags.Undefined))
			: printed;
		if (visible.length === 0) {
			failCatalogApi("empty type after removing undefined");
		}
		const visibleTypes = visible.map((part) => part.type);
		if (isBooleanParts(visibleTypes)) {
			return "boolean";
		}
		const withoutUndefined = visible.filter((part) => !(part.type.flags & ts.TypeFlags.Undefined));
		const withoutNull = withoutUndefined.filter((part) => !(part.type.flags & ts.TypeFlags.Null));
		const hasUndefined = withoutUndefined.length !== visible.length;
		const hasNull = withoutNull.length !== withoutUndefined.length;
		if (isBooleanParts(withoutNull.map((part) => part.type))) {
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
		visible.sort((left, right) => {
			if (left.rank !== right.rank) {
				return left.rank - right.rank;
			}
			return left.text.localeCompare(right.text);
		});
		return visible.map((part) => part.text).join(" | ");
	}
	let referencedType: ts.Type | undefined;
	if (node && (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node))) {
		referencedType = checker.getTypeFromTypeNode(node);
		if (!containsTopLevelUndefined(referencedType)) {
			const alias = printAlias(referencedType, checker, enclosing, node);
			if (alias) {
				return alias;
			}
		}
	}
	if (node && ts.isArrayTypeNode(node)) {
		return `${printType(checker.getTypeFromTypeNode(node.elementType), checker, enclosing, false, node.elementType)}[]`;
	}
	const element = arrayElementType(type, checker);
	if (element) {
		return `${printType(element, checker, enclosing, false)}[]`;
	}
	const alias = printAlias(type, checker, enclosing, typeNode);
	if (
		alias &&
		!(
			stripTopLevelUndefined &&
			referencedType !== undefined &&
			writtenAliasHidesTopLevelUndefined(referencedType, checker)
		)
	) {
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

function jsDocDefaultFor(symbol: ts.Symbol, checker: ts.TypeChecker): string | undefined {
	const tags = symbol.getJsDocTags(checker).filter((tag) => tag.name === "default");
	if (tags.length === 0) {
		return undefined;
	}
	if (tags.length > 1) {
		failCatalogApi(`duplicate @default for ${symbol.getName()}`);
	}
	const text = ts.displayPartsToString(tags[0]?.text ?? []).trim();
	if (text.length === 0) {
		failCatalogApi(`empty @default for ${symbol.getName()}`);
	}
	return text;
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

function isOwnPropertyDeclaration(
	propsDecl: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
	member: ts.Declaration,
): boolean {
	if (ts.isInterfaceDeclaration(propsDecl)) {
		return propsDecl.members.some((item) => item === member);
	}
	if (!propsDecl.type) {
		return false;
	}
	let found = false;
	function visit(node: ts.Node) {
		if (node === member) {
			found = true;
			return;
		}
		ts.forEachChild(node, visit);
	}
	visit(propsDecl.type);
	return found;
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
	const origins = collectHeritageOrigins(decl, sourceFile, program, checker);
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
			if (origins.foreign.has(name)) {
				failCatalogApi(`cross-file prop impersonation: ${name}`);
			}
			position = localDecls[0].getStart(sourceFile);
		} else if (cvaPositions.has(name)) {
			if (origins.foreign.has(name)) {
				failCatalogApi(`cross-file prop impersonation: ${name}`);
			}
			position = cvaPositions.get(name);
		} else if (origins.localSynthetic.has(name)) {
			if (origins.foreign.has(name)) {
				failCatalogApi(`cross-file prop impersonation: ${name}`);
			}
			position = origins.localSynthetic.get(name);
		} else if (origins.foreign.has(name)) {
			continue;
		} else {
			failCatalogApi(`unresolved provenance for ${name}`);
		}
		if (position === undefined) {
			failCatalogApi(`unresolved provenance for ${name}`);
		}
		const existing = seenPositions.get(position);
		if (existing) {
			failCatalogApi(`undeterminable order between ${existing} and ${name}`);
		}
		seenPositions.set(position, name);
		const ownDecl = localDecls.find((item) => isOwnPropertyDeclaration(decl, item));
		const typeNode =
			ownDecl && (ts.isPropertySignature(ownDecl) || ts.isPropertyDeclaration(ownDecl))
				? ownDecl.type
				: undefined;
		const propType = checker.getTypeOfSymbolAtLocation(symbol, decl);
		const description = jsDocFor(symbol, checker);
		const defaultValue = jsDocDefaultFor(symbol, checker);
		collected.push({
			position,
			prop: {
				name,
				type: printPropType(propType, checker, ownDecl ?? decl, typeNode),
				required: (symbol.flags & ts.SymbolFlags.Optional) === 0,
				...(defaultValue ? { default: defaultValue } : {}),
				...(description ? { description } : {}),
			},
		});
	}

	collected.sort((left, right) => left.position - right.position);
	return collected.map((item) => item.prop);
}

export function generateCatalogApi(input: {
	repoRoot: string;
	tsconfigPath: string;
	targets: CatalogApiTarget[];
}): Record<string, CatalogApiSurface[]> {
	const surfacesBySlug = new Map<string, Set<string>>();
	for (const target of input.targets) {
		if (!target.surface) {
			failCatalogApi(`missing surface for ${target.slug}`);
		}
		const names = surfacesBySlug.get(target.slug) ?? new Set<string>();
		if (names.has(target.surface)) {
			failCatalogApi(`duplicate surface ${target.surface} for ${target.slug}`);
		}
		names.add(target.surface);
		surfacesBySlug.set(target.slug, names);
	}
	const program = createCatalogApiProgram(input.repoRoot, input.tsconfigPath);
	const result: Record<string, CatalogApiSurface[]> = {};
	for (const target of input.targets) {
		const props = extractTargetProps(program, input.repoRoot, target);
		if (props.length === 0) {
			if (target.allowEmpty !== true) {
				failCatalogApi(`empty result for ${target.slug}`);
			}
		} else if (target.allowEmpty === true) {
			failCatalogApi(`allowEmpty expired for ${target.slug} surface ${target.surface}`);
		}
		const surfaces = result[target.slug] ?? [];
		surfaces.push({ name: target.surface, props });
		result[target.slug] = surfaces;
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
		"\t\t\t{",
		`\t\t\t\tname: ${emitString(prop.name)},`,
		`\t\t\t\ttype: ${emitString(prop.type)},`,
		`\t\t\t\trequired: ${prop.required ? "true" : "false"},`,
	];
	if (prop.default !== undefined) {
		lines.push(`\t\t\t\tdefault: ${emitString(prop.default)},`);
	}
	if (prop.description !== undefined) {
		lines.push(`\t\t\t\tdescription: ${emitString(prop.description)},`);
	}
	lines.push("\t\t\t}");
	return lines.join("\n");
}

function renderSurface(surface: CatalogApiSurface): string {
	const propsBlock =
		surface.props.length === 0
			? "\t\tprops: [],"
			: `\t\tprops: [\n${surface.props.map((prop) => renderProp(prop)).join(",\n")},\n\t\t],`;
	return `\t{\n\t\tname: ${emitString(surface.name)},\n${propsBlock}\n\t}`;
}

export function catalogApiShardRelativePath(slug: string): string {
	return `${GENERATED_SHARD_DIR}/${slug}.ts`;
}

export function catalogApiSlugIdent(slug: string): string {
	const camel = slug.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
	return `${camel}Api`;
}

export function renderCatalogApiShard(surfaces: CatalogApiSurface[]): string {
	const rendered = surfaces.map((surface) => renderSurface(surface)).join(",\n");
	return [
		"// Generated by scripts/catalog-api.ts. Do not edit.",
		"",
		"export const API = [",
		`${rendered},`,
		"];",
		"",
	].join("\n");
}

export function renderCatalogApiModule(data: Record<string, CatalogApiSurface[]>): string {
	const slugs = Object.keys(data).sort();
	for (const slug of slugs) {
		if (!data[slug]) {
			failCatalogApi(`missing generated surfaces for ${slug}`);
		}
	}
	const imports = slugs.map((slug) => {
		return `import { API as ${catalogApiSlugIdent(slug)} } from "./catalog-api/${slug}";`;
	});
	const entries = slugs.map((slug) => `\t${emitKey(slug)}: ${catalogApiSlugIdent(slug)},`);
	return [
		"// Generated by scripts/catalog-api.ts. Do not edit.",
		"",
		...imports,
		"",
		"export const CATALOG_API = {",
		...entries,
		"};",
		"",
	].join("\n");
}

export function generateCatalogApiFiles(
	repoRoot: string,
	data = generateCatalogApi({
		repoRoot,
		tsconfigPath: DEFAULT_TSCONFIG,
		targets: CATALOG_API_TARGETS,
	}),
): Record<string, string> {
	const slugs = Object.keys(data).sort();
	const files: Record<string, string> = {
		[GENERATED_RELATIVE_PATH]: renderCatalogApiModule(data),
	};
	for (const slug of slugs) {
		const surfaces = data[slug];
		if (!surfaces) {
			failCatalogApi(`missing generated surfaces for ${slug}`);
		}
		files[catalogApiShardRelativePath(slug)] = renderCatalogApiShard(surfaces);
	}
	return files;
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

export function checkCatalogApiFiles(repoRoot: string, files: Record<string, string>): void {
	for (const [relative, expected] of Object.entries(files)) {
		checkCatalogApiFile(path.join(repoRoot, relative), expected);
	}
	const shardDir = path.join(repoRoot, GENERATED_SHARD_DIR);
	if (!existsSync(shardDir)) {
		failCatalogApi(`missing catalog API shards at ${shardDir}; run ${GENERATE_COMMAND}`);
	}
	const expectedShards = new Set(
		Object.keys(files)
			.filter((relative) => relative.startsWith(`${GENERATED_SHARD_DIR}/`))
			.map((relative) => path.basename(relative)),
	);
	const extra = readdirSync(shardDir).filter((name) => !expectedShards.has(name));
	if (extra.length > 0) {
		failCatalogApi(`extra catalog API shards ${extra.sort().join(", ")}; run ${GENERATE_COMMAND}`);
	}
}

export function writeCatalogApiFile(filePath: string, content: string): void {
	mkdirSync(path.dirname(filePath), { recursive: true });
	writeFileSync(filePath, content);
}

export function writeCatalogApiFiles(repoRoot: string, files: Record<string, string>): void {
	const expectedShards = new Set(
		Object.keys(files)
			.filter((relative) => relative.startsWith(`${GENERATED_SHARD_DIR}/`))
			.map((relative) => path.basename(relative)),
	);
	for (const [relative, content] of Object.entries(files)) {
		writeCatalogApiFile(path.join(repoRoot, relative), content);
	}
	const shardDir = path.join(repoRoot, GENERATED_SHARD_DIR);
	if (existsSync(shardDir)) {
		for (const name of readdirSync(shardDir)) {
			if (!expectedShards.has(name)) {
				unlinkSync(path.join(shardDir, name));
			}
		}
	}
}

export function generateCatalogApiModule(repoRoot: string): string {
	return generateCatalogApiFiles(repoRoot)[GENERATED_RELATIVE_PATH] ?? "";
}

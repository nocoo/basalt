/**
 * Documentation metadata for surfaces that intentionally expose only className
 * and delegate all underlying element behaviors directly to standard DOM/SVG elements.
 */
export interface NativeOnlySurfaceDocumentation {
	justification: string;
	inheritedElement: string;
	forwardsRef: boolean;
	forwardsRestProps: boolean;
}

/**
 * Explicit registry of documented native-only surfaces that legitimately only expose
 * standard styling overrides (className) and inherit standard React/DOM element attributes.
 * Prevents arbitrary surfaces from regressing to className-only tables without explicit justification.
 */
export const DOCUMENTED_NATIVE_ONLY_SURFACES: Record<string, NativeOnlySurfaceDocumentation> = {
	BasaltMark: {
		justification: "Brand vector glyph icon with fixed geometry; exposes only custom styling hook.",
		inheritedElement: "SVGElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	Code: {
		justification:
			"Lightweight inline code element wrapper applying theme typography; inherits HTMLElement attributes.",
		inheritedElement: "HTMLElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	CodeBlock: {
		justification:
			"Preformatted code block container with scroll styling; inherits HTMLPreElement attributes.",
		inheritedElement: "HTMLPreElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	Table: {
		justification:
			"Semantic tabular root container with standard data attributes; inherits HTMLTableElement attributes.",
		inheritedElement: "HTMLTableElement",
		forwardsRef: true,
		forwardsRestProps: true,
	},
	TableCaption: {
		justification:
			"Semantic table caption wrapper for accessible table descriptions; inherits HTMLTableCaptionElement attributes.",
		inheritedElement: "HTMLTableCaptionElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	TableHead: {
		justification:
			"Semantic header cell wrapper with consistent alignment tokens; inherits HTMLTableCellElement attributes.",
		inheritedElement: "HTMLTableCellElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	TableCell: {
		justification:
			"Semantic body data cell wrapper with layout tokens; inherits HTMLTableCellElement attributes.",
		inheritedElement: "HTMLTableCellElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	"LayerCard.Secondary": {
		justification:
			"Semantic subheader section for card containers; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	"LayerCard.Header": {
		justification:
			"Header section for card containers; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	"LayerCard.Body": {
		justification:
			"Main body section for card containers; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	"LayerCard.Footer": {
		justification:
			"Footer action bar for card containers; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	"InputGroup.Suffix": {
		justification:
			"Inline suffix wrapper with truncated span text; forwards HTMLDivElement container attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	"Checkbox.Legend": {
		justification:
			"Accessible fieldset legend for grouped checkboxes; forwards HTMLLegendElement attributes and ref without component-specific props.",
		inheritedElement: "HTMLLegendElement",
		forwardsRef: true,
		forwardsRestProps: true,
	},
	"Radio.Legend": {
		justification:
			"Accessible fieldset legend for grouped radio controls; forwards HTMLLegendElement attributes and ref without component-specific props.",
		inheritedElement: "HTMLLegendElement",
		forwardsRef: true,
		forwardsRestProps: true,
	},
	"Switch.Legend": {
		justification:
			"Accessible fieldset legend for grouped switch toggles; forwards HTMLLegendElement attributes and ref without component-specific props.",
		inheritedElement: "HTMLLegendElement",
		forwardsRef: true,
		forwardsRestProps: true,
	},
	DialogHeader: {
		justification:
			"Semantic dialog header container for title and close actions; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	DialogFooter: {
		justification:
			"Semantic dialog footer container for responsive dialog action buttons; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	SheetHeader: {
		justification:
			"Semantic sheet header container for drawer titles and actions; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	SheetFooter: {
		justification:
			"Semantic sheet footer container for drawer actions; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	AlertDialogHeader: {
		justification:
			"Semantic alert dialog header container for alert titles; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	AlertDialogFooter: {
		justification:
			"Semantic alert dialog footer container for cancel and confirmation actions; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	PopoverTitle: {
		justification:
			"Semantic heading level 2 element wrapper for popover titles; forwards HTMLHeadingElement ref and inherits native h2 attributes.",
		inheritedElement: "HTMLHeadingElement",
		forwardsRef: true,
		forwardsRestProps: true,
	},
	PopoverDescription: {
		justification:
			"Semantic paragraph element wrapper for popover descriptions; forwards HTMLParagraphElement ref and inherits native p attributes.",
		inheritedElement: "HTMLParagraphElement",
		forwardsRef: true,
		forwardsRestProps: true,
	},
	CommandShortcut: {
		justification:
			"Semantic inline shortcut key indicator span; inherits HTMLSpanElement attributes without exposing a forwarded ref.",
		inheritedElement: "HTMLSpanElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	SidebarHeader: {
		justification:
			"Sidebar top branding container header; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	SidebarNav: {
		justification:
			"Sidebar navigation container element; inherits HTMLElement nav attributes without component-specific props.",
		inheritedElement: "HTMLElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	SidebarPartition: {
		justification:
			"Sidebar section label paragraph partition; inherits HTMLParagraphElement attributes without component-specific props.",
		inheritedElement: "HTMLParagraphElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	SidebarFooter: {
		justification:
			"Sidebar bottom pinned container footer; inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	ContentIsland: {
		justification:
			"Primary content card island container; owns data-basalt-surface-root and inherits HTMLDivElement attributes without component-specific props.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	TableHeader: {
		justification:
			"Table header section wrapper; inherits HTMLTableSectionElement thead attributes without exposing a forwarded ref.",
		inheritedElement: "HTMLTableSectionElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	TableBody: {
		justification:
			"Table body section wrapper; inherits HTMLTableSectionElement tbody attributes without exposing a forwarded ref.",
		inheritedElement: "HTMLTableSectionElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	TableFooter: {
		justification:
			"Table footer section wrapper; inherits HTMLTableSectionElement tfoot attributes without exposing a forwarded ref.",
		inheritedElement: "HTMLTableSectionElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
	GridItem: {
		justification:
			"Grid item layout cell container; inherits HTMLDivElement attributes without exposing a forwarded ref.",
		inheritedElement: "HTMLDivElement",
		forwardsRef: false,
		forwardsRestProps: true,
	},
};

export function formatNativeSurfaceStrategy(doc: NativeOnlySurfaceDocumentation): string {
	const refText = doc.forwardsRef ? "forwards ref to root" : "does not expose ref";
	const restText = doc.forwardsRestProps
		? `inherits and forwards all standard ${doc.inheritedElement} attributes (including children)`
		: `does not forward rest props`;
	return `Native element wrapper: ${restText}; ${refText}.`;
}

export function isDocumentedNativeSurface(
	surfaceName: string,
	propsLength: number,
	firstPropName?: string,
): boolean {
	const isClassNameOnly = propsLength === 1 && firstPropName === "className";
	const isEmptyProps = propsLength === 0;
	return (isClassNameOnly || isEmptyProps) && Boolean(DOCUMENTED_NATIVE_ONLY_SURFACES[surfaceName]);
}

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
};

export function formatNativeSurfaceStrategy(doc: NativeOnlySurfaceDocumentation): string {
	const refText = doc.forwardsRef ? "forwards ref to root" : "does not expose ref";
	const restText = doc.forwardsRestProps
		? `inherits and forwards all standard ${doc.inheritedElement} attributes (including children)`
		: `does not forward rest props`;
	return `Native element wrapper: ${restText}; ${refText}.`;
}

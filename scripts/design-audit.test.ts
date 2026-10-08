import { describe, expect, it } from "vitest";
import {
	auditCategories,
	auditDesignCss,
	auditDesignSource,
	dashboardPageFiles,
} from "./design-audit";

describe("design audit rules (without scanning the repository)", () => {
	it("keeps selected state separate from decorative and disabled fills", () => {
		const issues = auditDesignSource(
			"choice.tsx",
			'<button className="aria-pressed:bg-basalt-accent data-[state=active]:bg-muted aria-selected:bg-basalt-muted"/>',
		);
		expect(issues).toHaveLength(3);
		expect(issues.every((issue) => issue.rule === "selection-token")).toBe(true);
		expect(
			auditDesignSource(
				"choice.tsx",
				'<button className="bg-basalt-muted aria-pressed:bg-basalt-selected data-[state=checked]:bg-basalt-primary"/>',
			),
		).toEqual([]);
	});
	it("rejects raw spacing, radius, type, hover and fixed action overrides", () => {
		const issues = auditDesignSource(
			"example.tsx",
			'<Button className="p-4 rounded-xl text-[13px] hover:bg-primary/80 h-[32px] duration-200" style={{padding: 12}}>Save</Button>',
		);
		expect(new Set(issues.map((issue) => issue.rule))).toEqual(
			new Set([
				"spacing-token",
				"radius-token",
				"type-token",
				"hover-token",
				"relative-geometry",
				"motion-token",
				"intrinsic-action-size",
				"inline-design-override",
			]),
		);
	});
	it("allows semantic roles, four steps, natural geometry and data coordinates", () => {
		expect(
			auditDesignSource(
				"example.tsx",
				'<div className="p-basalt-space-lg gap-basalt-space-xs rounded-basalt-md text-basalt-base w-[20rem]"><Button size="sm">Save</Button><svg><rect x={12} height={42}/></svg></div>',
			),
		).toEqual([]);
	});
	it("checks CSS declarations and explicit component categories", () => {
		expect(
			auditDesignCss(
				"example.css",
				".sample { padding: 12px; font-size: 1rem; border-radius: 6px; transition: all 200ms; }",
			),
		).toHaveLength(4);
		expect(
			auditDesignCss(
				"example.css",
				".sample { padding: var(--basalt-space-lg); font-size: var(--basalt-text-base); border-radius: var(--basalt-radius-md); }",
			),
		).toEqual([]);
		expect(
			auditCategories(
				["button", "new-control"],
				"Root module inventory: `button` Graphic primitives",
			),
		).toEqual([{ file: "DESIGN.md", rule: "component-category", value: "new-control" }]);
	});
	it("allows all card and layout tiers without widening the control scale", () => {
		expect(
			auditDesignSource(
				"layout.tsx",
				'<div className="p-basalt-card-xl gap-basalt-layout-xl space-y-basalt-layout-lg mx-basalt-card-sm"/>',
			),
		).toEqual([]);
		expect(
			auditDesignSource("layout.tsx", '<div className="gap-basalt-space-xl"/>').map(
				(issue) => issue.rule,
			),
		).toEqual(["spacing-token"]);
	});
	it("rejects important, responsive and arbitrary property repairs", () => {
		const issues = auditDesignSource(
			"repair.tsx",
			'<Button className="md:h-8! !p-3 [padding:12px] leading-[20px]" />',
		);
		expect(new Set(issues.map((issue) => issue.rule))).toEqual(
			new Set(["intrinsic-action-size", "spacing-token", "inline-design-override", "type-token"]),
		);
		expect(
			auditDesignSource(
				"repair.tsx",
				'<Input className="pr-[calc(var(--basalt-space-lg)+12px)]"/>',
			).map((issue) => issue.rule),
		).toContain("spacing-token");
	});
	it("derives template requirements from dashboard routes, not independent pages", () => {
		expect(
			dashboardPageFiles(`
const Overview = lazy(() => import("./pages/ui/Overview"));
const Landing = lazy(() => import("./pages/Landing"));
const Page = () => <Routes>
  <Route path="/" element={routeElement(Landing)} />
  <Route element={<Suspense><DashboardLayout /></Suspense>}>
    <Route path="/ui" element={routeElement(Overview)} />
  </Route>
</Routes>;`),
		).toEqual(["src/pages/ui/Overview.tsx"]);
	});
	it("rejects duplicate page owners even with token-based styling", () => {
		const source = '<main className="min-h-screen"><PageHeader title="Overview" /></main>';
		expect(auditDesignSource("src/pages/Overview.tsx", source, true).map((i) => i.rule)).toEqual([
			"page-template-owner",
			"nested-page-viewport",
			"page-template-owner",
			"page-template-missing",
		]);
		expect(
			auditDesignSource(
				"src/pages/Overview.tsx",
				'<ShowcasePage title="Overview" className="p-basalt-space-lg" />',
				true,
			).map((i) => i.rule),
		).toContain("page-template-inset");
	});
	it("rejects recreated cards and duplicated slot spacing", () => {
		const source = `<ShowcasePage title="Overview">
<div className="rounded-basalt-lg bg-basalt-card p-basalt-space-lg">Card</div>
<LayerCard className="space-y-basalt-space-lg bg-basalt-secondary p-basalt-space-lg">
  <LayerCard.Header>Title</LayerCard.Header>
  <LayerCard.Body className="mt-basalt-space-lg">Body</LayerCard.Body>
</LayerCard>
<select/><textarea/><button/><input/>
<Input className="px-basalt-space-lg"/>
</ShowcasePage>`;
		expect(
			new Set(auditDesignSource("src/pages/Overview.tsx", source, true).map((i) => i.rule)),
		).toEqual(
			new Set([
				"use-layer-card",
				"card-surface-owner",
				"card-padding-prop",
				"card-slot-spacing",
				"use-library-control",
				"control-spacing-owner",
				"container-spacing-role",
			]),
		);
	});
	it("rejects disclosure repairs and compact padding used as a surface inset", () => {
		const source = `<>
<details><summary>Example code</summary></details>
<div className="bg-basalt-secondary py-basalt-space-lg"><nav>Sections</nav></div>
<CollapsibleTrigger className="px-basalt-card">Details</CollapsibleTrigger>
<CollapsibleContent><LayerCard.Body>Content</LayerCard.Body></CollapsibleContent>
<LayerCard.Body className="p-0"><CodeBlock>source</CodeBlock></LayerCard.Body>
<CodeHighlighted className="rounded-none border-0" code="source"/>
</>`;
		expect(
			new Set(auditDesignSource("src/pages/Doc.tsx", source).map((issue) => issue.rule)),
		).toEqual(
			new Set([
				"use-library-disclosure",
				"container-spacing-role",
				"disclosure-header-owner",
				"disclosure-inset-owner",
				"self-inset-content",
				"card-slot-spacing",
				"code-frame-owner",
			]),
		);
		expect(
			auditDesignSource(
				"src/pages/Doc.tsx",
				`<LayerCard>
<LayerCard.Header asChild><CollapsibleTrigger>Code</CollapsibleTrigger></LayerCard.Header>
<CollapsibleContent unstyled><CodeHighlighted attached code="source"/></CollapsibleContent>
</LayerCard>`,
			),
		).toEqual([]);
	});
	it("allows slot composition, hidden inputs, chart geometry and non-JSX code samples", () => {
		expect(
			auditDesignSource(
				"src/pages/Overview.tsx",
				`
const sample = "<button>Example source text</button>";
const Page = () => <ShowcasePage title="Overview">
<LayerCard><LayerCard.Header>Title</LayerCard.Header>
<LayerCard.Body className="space-y-basalt-space-lg"><Input/><Button>Save</Button></LayerCard.Body>
</LayerCard><input type="file" className="sr-only"/><input type="hidden"/>
<svg><rect height={40}/></svg></ShowcasePage>;`,
				true,
			),
		).toEqual([]);
		expect(
			auditDesignSource("src/pages/PalettePage.tsx", '<button data-accent-choice="rose"/>'),
		).toEqual([]);
		expect(
			auditDesignSource("src/pages/NewPage.tsx", '<button data-accent-choice="rose"/>').map(
				(i) => i.rule,
			),
		).toEqual(["use-library-control"]);
	});
});

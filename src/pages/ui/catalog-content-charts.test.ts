import { describe, expect, it } from "vitest";
import charts from "./catalog-content/families/charts";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const CHART_DESCRIPTIONS = {
	line: "Line series.",
	bar: "Bar series.",
	area: "Area series.",
	donut: "Donut series.",
	sparkline: "Compact line.",
	gauge: "Radial-style meter.",
	"stat-card": "KPI card.",
	palette: "Chart colors.",
	"slot-bar": "Slot bar.",
	"grouped-bar": "Grouped bars.",
	"stacked-bar": "Stacked bars.",
	"heatmap-calendar": "Calendar heatmap.",
	radar: "Radar series.",
	funnel: "Funnel series.",
	bullet: "Bullet chart.",
	timeline: "Timeline.",
	sankey: "Sankey-style flow.",
	"item-list": "Simple list.",
	"date-navigation": "Date control.",
	charts: "Chart overview.",
	"chart-colors": "Chart color tokens.",
	timeseries: "Time series.",
	"custom-chart": "Custom chart.",
} as const;

describe("charts catalog content family", () => {
	it("owns exactly twenty-three slugs and all eighty-six ready owners", () => {
		expect(Object.keys(charts)).toEqual(Object.keys(CHART_DESCRIPTIONS));
		expect(Object.keys(charts)).toHaveLength(23);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "charts")
				.map(([slug]) => slug)
				.sort(),
		).toEqual(Object.keys(CHART_DESCRIPTIONS).sort());
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(102);
	});

	it("keeps one audited Default scenario for every chart", () => {
		for (const slug of Object.keys(CHART_DESCRIPTIONS)) {
			const examples = charts[slug]?.examples ?? [];
			expect(
				examples.map(({ id, title }) => ({ id, title })),
				slug,
			).toEqual([{ id: `${slug}-default`, title: "Default" }]);
			expect(examples[0]?.code.length, slug).toBeGreaterThan(0);
			expect(typeof examples[0]?.render, slug).toBe("function");
		}
	});

	it("preserves every EXTRA docs field and chart implementation source", () => {
		for (const [slug, description] of Object.entries(CHART_DESCRIPTIONS)) {
			const docs = charts[slug]?.docs;
			expect(docs?.description, slug).toBe(description);
			expect(docs?.usage.length, slug).toBeGreaterThan(0);
			expect(docs?.variants, slug).toEqual([]);
			expect(docs?.api[0]?.props, slug).toBeDefined();
			expect(docs?.provenance, slug).toEqual({
				owner: "nocoo",
				repo: "pew",
				ref: "97a890fabe6e",
				file: "packages/web/src/components",
			});
			expect(docs?.implementationSource, slug).toEqual({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: `packages/basalt/src/charts/${slug}.tsx`,
			});
		}
		expect(charts.radar?.docs.api[0]?.props.map((prop) => prop.name)).toEqual([
			"data",
			"series",
			"ariaLabel",
			"className",
		]);
		expect(charts.timeline?.docs.usage).toContain("events=");
		expect(charts["heatmap-calendar"]?.docs.usage).toContain("year={2026}");
		expect(charts.sankey?.docs.usage).toContain("nodes:");
	});
});

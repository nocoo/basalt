import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const tokens = readFileSync(path.join("packages/basalt/src/styles/tokens.css"), "utf8");
const tailwind = readFileSync(path.join("packages/basalt/src/styles/tailwind.css"), "utf8");

describe("nested surface CSS", () => {
	it("defaults control and zebra fills on the document", () => {
		expect(tokens).toContain("--basalt-control-fill: hsl(var(--basalt-secondary));");
		expect(tokens).toContain("--basalt-zebra-fill: hsl(var(--basalt-bright));");
	});

	it("paints nested surfaces with descendant selectors and no @scope", () => {
		expect(tokens).toContain("[data-basalt-surface-root]");
		expect(tokens).toContain("[data-basalt-surface-root] [data-basalt-surface]");
		expect(tokens).toContain(
			"[data-basalt-surface]:not([data-basalt-surface-root] *):not([data-basalt-surface] *)",
		);
		expect(tokens).not.toContain("@scope");
	});

	it("stripes tables from the inherited zebra fill", () => {
		expect(tokens).toContain("[data-basalt-table] tbody tr:nth-child(even)");
		expect(tokens).toContain(":not(:hover)");
		expect(tokens).toContain('tr[aria-selected="true"] td');
	});

	it("exposes the control fill to Tailwind", () => {
		expect(tailwind).toContain("--color-basalt-control: var(--basalt-control-fill);");
	});
});

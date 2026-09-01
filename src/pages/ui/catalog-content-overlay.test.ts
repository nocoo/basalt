import { describe, expect, it } from "vitest";
import overlay from "./catalog-content/families/overlay";
import { CONFIRM_DIALOG_EXAMPLES } from "./examples/confirm-dialog";
import { TOOLTIP_EXAMPLES } from "./examples/tooltip";
import { API as confirmDialogApi } from "./generated/catalog-api/confirm-dialog";
import { API as tooltipApi } from "./generated/catalog-api/tooltip";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const OVERLAY_SLUGS = [
	"tooltip",
	"accordion",
	"dialog",
	"alert-dialog",
	"popover",
	"dropdown-menu",
	"context-menu",
	"hover-card",
	"sheet",
	"collapsible",
	"confirm-dialog",
] as const;

describe("overlay catalog content family", () => {
	it("owns exactly eleven slugs and eighty-eight generated owners", () => {
		expect(Object.keys(overlay)).toEqual([...OVERLAY_SLUGS]);
		expect(Object.keys(overlay)).toHaveLength(11);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "overlay")
				.map(([slug]) => slug)
				.sort(),
		).toEqual([...OVERLAY_SLUGS].sort());
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "foundation"),
		).toHaveLength(12);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "forms"),
		).toHaveLength(16);
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(88);
	});

	it("keeps tooltip examples and generated API shard by reference", () => {
		expect(overlay.tooltip?.examples).toBe(TOOLTIP_EXAMPLES);
		expect(overlay.tooltip?.docs.api).toBe(tooltipApi);
		expect(overlay["confirm-dialog"]?.examples).toBe(CONFIRM_DIALOG_EXAMPLES);
		expect(overlay["confirm-dialog"]?.docs.api).toBe(confirmDialogApi);
		expect(overlay.tooltip?.examples.map((example) => example.id)).toEqual(
			TOOLTIP_EXAMPLES.map((example) => example.id),
		);
		expect(overlay.tooltip?.examples.map((example) => example.render)).toEqual(
			TOOLTIP_EXAMPLES.map((example) => example.render),
		);
	});

	it("preserves docs truth and extra scenario identity for every overlay slug", () => {
		expect(overlay.tooltip?.docs.description).toBe("Short contextual help on hover or focus.");
		expect(overlay.tooltip?.docs.provenance).toEqual({
			owner: "nocoo",
			repo: "pew",
			ref: "97a890fabe6e",
			file: "packages/web/src/components/ui/tooltip.tsx",
		});
		expect(overlay.dialog?.docs.description).toBe(
			"A window overlaid on the primary window, rendering the content underneath inert.",
		);
		expect(overlay.dialog?.docs.provenance).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/components/dialog/dialog.tsx",
		});
		expect(overlay.dialog?.examples.map((example) => example.id)).toEqual([
			"dialog-basic-dialog",
			"dialog-sizes",
			"dialog-alert-dialog",
			"dialog-confirmation-dialog",
			"dialog-with-actions",
			"dialog-custom-max-width",
			"dialog-with-select",
			"dialog-with-combobox",
			"dialog-with-dropdown",
		]);
		expect(overlay.dialog?.examples[6]?.code).toContain("SelectItem");
		expect(overlay.dialog?.examples[7]?.code).toContain("Combobox");
		expect(overlay.dialog?.examples[8]?.code).toContain("DropdownMenu");
		expect(overlay.popover?.examples.map((example) => example.id)).toEqual([
			"popover-basic-popover",
			"popover-sides",
		]);
		expect(overlay["dropdown-menu"]?.examples).toHaveLength(1);
		expect(overlay["dropdown-menu"]?.examples[0]).toMatchObject({
			id: "dropdown-menu-basic-dropdown",
			title: "Basic Dropdown",
		});
		expect(overlay.collapsible?.examples.map((example) => example.id)).toEqual([
			"collapsible-with-default-styling",
			"collapsible-custom-trigger",
		]);
		expect(overlay.accordion?.examples).toHaveLength(1);
		expect(overlay.accordion?.examples[0]).toMatchObject({
			id: "accordion-default",
			title: "Default",
		});
		expect(overlay["alert-dialog"]?.examples[0]?.id).toBe("alert-dialog-default");
		expect(overlay["context-menu"]?.examples[0]?.id).toBe("context-menu-default");
		expect(overlay["hover-card"]?.examples[0]?.id).toBe("hover-card-default");
		expect(overlay.sheet?.examples[0]?.id).toBe("sheet-default");
		expect(overlay["confirm-dialog"]?.examples.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "confirm-dialog-controlled-async-loading", title: "Controlled async loading" },
			{ id: "confirm-dialog-promise-result", title: "Promise result" },
		]);
		expect(overlay["confirm-dialog"]?.docs.provenance).toEqual({
			owner: "nocoo",
			repo: "meowth",
			ref: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/confirm-dialog.tsx",
		});
		for (const slug of OVERLAY_SLUGS) {
			const content = overlay[slug];
			expect(content?.docs.description.length, slug).toBeGreaterThan(0);
			expect(content?.examples[0], slug).toBeDefined();
			expect(content?.docs.implementationSource.file, slug).toContain("packages/basalt/src");
			for (const example of content?.examples ?? []) {
				expect(example.id.startsWith(`${slug}-`), example.id).toBe(true);
			}
		}
	});
});

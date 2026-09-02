import { describe, expect, it } from "vitest";
import feedback from "./catalog-content/families/feedback";
import { API as codeBlockApi } from "./generated/catalog-api/code-block";
import { CATALOG_CONTENT_FAMILY } from "./generated/catalog-content-family";

const FEEDBACK_SCENARIOS = {
	badge: [
		"badge-primary-badges",
		"badge-other-color-variants",
		"badge-color-tokens",
		"badge-dot-badges",
		"badge-in-a-sentence",
		"badge-with-an-icon",
		"badge-linked-badge",
	],
	banner: [
		"banner-variants",
		"banner-with-icon",
		"banner-with-action",
		"banner-with-multiple-actions",
		"banner-compact-size",
		"banner-custom-content",
	],
	empty: ["empty-basic", "empty-with-icon"],
	loader: ["loader-default-size", "loader-custom-size"],
	"skeleton-line": ["skeleton-line-default", "skeleton-line-width", "skeleton-line-height"],
	meter: [
		"meter-basic-meter",
		"meter-custom-value-display",
		"meter-hidden-value",
		"meter-full-meter",
		"meter-low-value",
	],
	toast: [
		"toast-title-only",
		"toast-title-and-description",
		"toast-success-variant",
		"toast-error-variant",
		"toast-warning-variant",
		"toast-info-variant",
		"toast-close-button",
		"toast-hidden-close",
		"toast-custom-icon",
		"toast-hidden-icon",
	],
	"clipboard-text": [
		"clipboard-text-short-text",
		"clipboard-text-api-key",
		"clipboard-text-copy-alternate-text",
		"clipboard-text-long-text",
	],
	code: ["code-typescript", "code-react", "code-inline"],
	"code-block": ["code-block-basic"],
	avatar: ["avatar-fallback"],
} as const;

const FEEDBACK_DESCRIPTIONS = {
	badge: "Compact status labels.",
	banner: "Displays contextual inline messages for informational, alert, or error states.",
	empty: "Empty-state copy.",
	loader: "Indicates a pending state.",
	"skeleton-line": "Placeholder lines while content loads.",
	meter: "Numeric meter.",
	toast: "Transient notification.",
	"clipboard-text": "Copyable text.",
	code: "Syntax-highlighted code.",
	"code-block": "A fenced code block.",
	avatar: "User avatar.",
} as const;

describe("feedback catalog content family", () => {
	it("owns exactly eleven migrated slugs and eighty-six generated owners", () => {
		expect(Object.keys(feedback)).toEqual(Object.keys(FEEDBACK_SCENARIOS));
		expect(Object.keys(feedback)).toHaveLength(11);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY)
				.filter(([, family]) => family === "feedback")
				.map(([slug]) => slug)
				.sort(),
		).toEqual(Object.keys(FEEDBACK_SCENARIOS).sort());
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "foundation"),
		).toHaveLength(12);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "forms"),
		).toHaveLength(16);
		expect(
			Object.entries(CATALOG_CONTENT_FAMILY).filter(([, family]) => family === "overlay"),
		).toHaveLength(11);
		expect(Object.keys(CATALOG_CONTENT_FAMILY)).toHaveLength(100);
	});

	it("keeps the forty-four final winner scenarios in their audited order", () => {
		let count = 0;
		for (const [slug, ids] of Object.entries(FEEDBACK_SCENARIOS)) {
			const examples = feedback[slug]?.examples ?? [];
			expect(
				examples.map((example) => example.id),
				slug,
			).toEqual(ids);
			expect(
				examples.every((example) => example.title.length > 0 && example.code.length > 0),
				slug,
			).toBe(true);
			expect(
				examples.every((example) => typeof example.render === "function"),
				slug,
			).toBe(true);
			count += examples.length;
		}
		expect(count).toBe(44);
	});

	it("keeps the BASE banner winner without reviving the EXTRA default", () => {
		expect(feedback.banner?.examples.map((example) => example.id)).toEqual([
			"banner-variants",
			"banner-with-icon",
			"banner-with-action",
			"banner-with-multiple-actions",
			"banner-compact-size",
			"banner-custom-content",
		]);
		expect(feedback.banner?.examples.some((example) => example.id === "banner-default")).toBe(
			false,
		);
		expect(feedback.banner?.examples[0]?.code).toContain('variant="secondary"');
		expect(feedback.banner?.examples[2]?.code).toContain("<Banner.Action>Update</Banner.Action>");
		expect(feedback.banner?.examples[5]?.code).toContain("<strong>custom content</strong>");
	});

	it("preserves every EXTRA docs field and derives the Basalt implementation source", () => {
		for (const [slug, description] of Object.entries(FEEDBACK_DESCRIPTIONS)) {
			const docs = feedback[slug]?.docs;
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
			const implementationSlug = slug === "code-block" ? "code" : slug;
			expect(docs?.implementationSource, slug).toEqual({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: `packages/basalt/src/components/${implementationSlug}.tsx`,
			});
		}
		expect(feedback.banner?.docs.api[0]?.props.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"icon",
			"title",
			"description",
			"action",
			"className",
		]);
		expect(feedback.toast?.docs.api[0]?.props.map((prop) => prop.name)).toEqual([
			"message",
			"variant",
			"icon",
			"close",
			"description",
		]);
		expect(feedback.code?.docs.usage).toContain("CodeHighlighted");
		expect(feedback["code-block"]?.docs.api).toBe(codeBlockApi);
	});
});

import { describe, expect, it } from "vitest";
import { CATALOG_BY_SLUG } from "./catalog";
import {
	catalogDocsWithImplementation,
	githubSourceHref,
	githubSourceLabel,
	implementationFileFor,
	implementationSourceFor,
	provenanceFromLegacy,
} from "./catalog-source";
import { CATALOG_DOCS } from "./docs";
import { CATALOG_API } from "./generated/catalog-api";

function entry(slug: string) {
	const found = CATALOG_BY_SLUG.get(slug);
	if (!found) {
		throw new Error(`missing catalog entry ${slug}`);
	}
	return found;
}

describe("catalog source contract", () => {
	it("builds github urls from explicit owner, repo, ref, and file", () => {
		expect(
			githubSourceHref({
				owner: "cloudflare",
				repo: "kumo",
				ref: "1159868dfe32",
				file: "packages/kumo/src/components/dialog/dialog.tsx",
			}),
		).toBe(
			"https://github.com/cloudflare/kumo/blob/1159868dfe32/packages/kumo/src/components/dialog/dialog.tsx",
		);
		expect(
			githubSourceHref({
				owner: "nocoo",
				repo: "pew",
				ref: "97a890fabe6e",
				file: "packages/web/src/components/ui/button.tsx",
			}),
		).toBe(
			"https://github.com/nocoo/pew/blob/97a890fabe6e/packages/web/src/components/ui/button.tsx",
		);
	});

	it("does not infer github owner from the repo name", () => {
		const href = githubSourceHref({
			owner: "cloudflare",
			repo: "kumo",
			ref: "main",
			file: "README.md",
		});
		expect(href).not.toContain("github.com/nocoo/kumo");
		expect(href).toBe("https://github.com/cloudflare/kumo/blob/main/README.md");
	});

	it("labels sources with owner, repo, and ref", () => {
		expect(
			githubSourceLabel({
				owner: "nocoo",
				repo: "basalt",
				ref: "main",
				file: "packages/basalt/src/components/button.tsx",
			}),
		).toBe("nocoo/basalt@main");
	});

	it("assigns cloudflare to kumo provenance and nocoo to personal repos", () => {
		expect(
			provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/utils/link-provider.tsx",
			}),
		).toEqual({
			owner: "cloudflare",
			repo: "kumo",
			ref: "1159868dfe32",
			file: "packages/kumo/src/utils/link-provider.tsx",
		});
		expect(
			provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/ui/button.tsx",
			}),
		).toEqual({
			owner: "nocoo",
			repo: "pew",
			ref: "97a890fabe6e",
			file: "packages/web/src/components/ui/button.tsx",
		});
		expect(
			provenanceFromLegacy({
				repo: "basalt",
				sha: "2727ae6a8d3f",
				file: "src/components/ThemeToggle.tsx",
			}).owner,
		).toBe("nocoo");
		expect(
			provenanceFromLegacy({
				repo: "signoff.now",
				sha: "92033c89d807",
				file: "apps/web/src/components/Field.tsx",
			}).owner,
		).toBe("nocoo");
	});

	it("derives implementation files from catalog import paths", () => {
		expect(implementationFileFor(entry("button"))).toBe(
			"packages/basalt/src/components/button.tsx",
		);
		expect(implementationFileFor(entry("theme-provider"))).toBe(
			"packages/basalt/src/providers/theme.tsx",
		);
		expect(implementationFileFor(entry("bar"))).toBe("packages/basalt/src/charts/bar.tsx");
	});

	it("maps shared and renamed implementation files", () => {
		expect(implementationFileFor(entry("page-header"))).toBe(
			"packages/basalt/src/components/app-header.tsx",
		);
		expect(implementationFileFor(entry("link-button"))).toBe(
			"packages/basalt/src/components/button.tsx",
		);
		expect(CATALOG_DOCS["link-button"]?.props).toEqual(CATALOG_API["link-button"]);
		expect(CATALOG_API["link-button"]?.map((prop) => prop.name)).toEqual([
			"variant",
			"size",
			"icon",
		]);
		expect(implementationFileFor(entry("text"))).toBe("packages/basalt/src/components/text.tsx");
		expect(CATALOG_DOCS.text?.props).toEqual(CATALOG_API.text);
		expect(CATALOG_API.text?.map((prop) => prop.name)).toEqual(["size", "tone"]);
		expect(implementationFileFor(entry("label"))).toBe("packages/basalt/src/components/label.tsx");
		expect(CATALOG_DOCS.label?.props).toEqual(CATALOG_API.label);
		expect(CATALOG_API.label?.map((prop) => prop.name)).toEqual(["showOptional", "tooltip"]);
		expect(implementationFileFor(entry("separator"))).toBe(
			"packages/basalt/src/components/separator.tsx",
		);
		expect(CATALOG_DOCS.separator?.props).toEqual(CATALOG_API.separator);
		expect(CATALOG_API.separator?.map((prop) => prop.name)).toEqual(["orientation", "decorative"]);
		expect(implementationFileFor(entry("code-block"))).toBe(
			"packages/basalt/src/components/code.tsx",
		);
	});

	it("preserves generated required semantics on catalog docs", () => {
		const docs = catalogDocsWithImplementation({
			button: {
				description: "Primary actions, including loading and icon slots.",
				usage: 'import { Button } from "@nocoo/basalt/components/button";',
				variants: [],
				props: [
					{
						name: "loading",
						type: "boolean",
						required: false,
						description: "Shows a spinner.",
					},
				],
			},
		});
		expect(docs.button?.props).toEqual([
			{
				name: "loading",
				type: "boolean",
				required: false,
				description: "Shows a spinner.",
			},
		]);
	});

	it("always points implementation source at nocoo/basalt@main", () => {
		expect(implementationSourceFor(entry("dialog"))).toEqual({
			owner: "nocoo",
			repo: "basalt",
			ref: "main",
			file: "packages/basalt/src/components/dialog.tsx",
		});
	});
});

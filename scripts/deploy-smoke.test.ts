import { describe, expect, it } from "vitest";
import { assertHomepageFooterVersion } from "./deploy-smoke";

const VERSION = "3.0.0";
const LABEL = `v${VERSION}`;

function page(parts: { header?: string; footer?: string; head?: string }): string {
	return `<!doctype html><html><head>${parts.head ?? ""}</head><body><header>${parts.header ?? "basalt."}</header><main>home</main><footer>${parts.footer ?? "license"}</footer></body></html>`;
}

describe("assertHomepageFooterVersion", () => {
	it("accepts the visible footer version and rejects a header copy", () => {
		expect(() =>
			assertHomepageFooterVersion(
				page({ footer: `<span id="landing-version">${LABEL}</span>` }),
				VERSION,
			),
		).not.toThrow();
		expect(() =>
			assertHomepageFooterVersion(
				page({
					header: LABEL,
					footer: `<span id="landing-version">${LABEL}</span>`,
				}),
				VERSION,
			),
		).toThrow(/header must not show the version/);
	});

	it("rejects version-only-in-header, version-only-in-meta, and the wrong footer", () => {
		expect(() => assertHomepageFooterVersion(page({ header: LABEL }), VERSION)).toThrow(
			/footer must show/,
		);
		expect(() =>
			assertHomepageFooterVersion(
				page({ head: `<meta name="basalt-version" content="${VERSION}" />` }),
				VERSION,
			),
		).toThrow(/footer must show/);
		expect(() =>
			assertHomepageFooterVersion(
				page({ footer: '<span id="landing-version">v2.9.9</span>' }),
				VERSION,
			),
		).toThrow(/footer must show/);
	});
});

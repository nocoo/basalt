import { describe, expect, it } from "vitest";
import {
	bumpVersion,
	classifyCommits,
	compareSemver,
	formatChangelogSection,
	parseSemver,
	VERSION_TARGETS,
} from "./release";

describe("parseSemver", () => {
	it("parses valid semver", () => {
		expect(parseSemver("1.2.3")).toEqual([1, 2, 3]);
	});

	it("throws on invalid semver", () => {
		expect(() => parseSemver("v1.2.3")).toThrow('Invalid semver: "v1.2.3"');
	});
});

describe("compareSemver", () => {
	it("orders versions", () => {
		expect(compareSemver("2.0.1", "2.0.0")).toBeGreaterThan(0);
		expect(compareSemver("2.0.0", "2.0.0")).toBe(0);
	});
});

describe("bumpVersion", () => {
	it("bumps patch, minor, and major", () => {
		expect(bumpVersion("2.0.0", "patch")).toBe("2.0.1");
		expect(bumpVersion("2.0.1", "minor")).toBe("2.1.0");
		expect(bumpVersion("2.1.0", "major")).toBe("3.0.0");
	});

	it("accepts an explicit greater version", () => {
		expect(bumpVersion("2.0.0", "2.0.1")).toBe("2.0.1");
	});

	it("rejects a version that is not greater", () => {
		expect(() => bumpVersion("2.0.0", "2.0.0")).toThrow("must be greater than current");
	});
});

describe("classifyCommits", () => {
	it("maps conventional types onto Keep a Changelog sections", () => {
		const sections = classifyCommits([
			{ hash: "a", subject: "feat: share theme palette with header picker" },
			{ hash: "b", subject: "fix: stop ci catalog test timeouts" },
			{ hash: "c", subject: "docs: add app chrome guide for agents" },
		]);
		expect(sections.added).toEqual(["Share theme palette with header picker"]);
		expect(sections.fixed).toEqual(["Stop ci catalog test timeouts"]);
		expect(sections.changed).toEqual(["Add app chrome guide for agents"]);
	});
});

describe("formatChangelogSection", () => {
	it("emits Keep a Changelog headings", () => {
		const body = formatChangelogSection("2.0.1", {
			added: ["Release script"],
			changed: [],
			fixed: ["Sidebar version"],
			removed: [],
		});
		expect(body).toContain("## [2.0.1] - ");
		expect(body).toContain("### Added");
		expect(body).toContain("- Release script");
		expect(body).toContain("### Fixed");
	});
});

describe("VERSION_TARGETS", () => {
	it("keeps the package copies next to the root north star", () => {
		expect(VERSION_TARGETS).toEqual(["package.json", "packages/basalt/package.json"]);
	});
});

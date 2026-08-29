import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentIsland, Sidebar } from "./sidebar";

describe("Sidebar", () => {
	it("renders children on the L0 chrome", () => {
		render(<Sidebar>Nav</Sidebar>);
		const nav = screen.getByText("Nav");
		expect(nav.tagName).toBe("ASIDE");
		expect(nav.className).toContain("bg-basalt-background");
		expect(nav.className).not.toContain("border-r");
	});
});

describe("ContentIsland", () => {
	it("floats the panel with a corner shadow", () => {
		render(<ContentIsland>Body</ContentIsland>);
		const island = screen.getByText("Body");
		expect(island.className).toContain("shadow-sm");
		expect(island.className).toContain("ring-1");
		expect(island.className).toContain("ring-basalt-border/40");
		expect(island.className).toContain("rounded-[16px]");
		expect(island.className).toContain("md:rounded-basalt-island");
	});
});

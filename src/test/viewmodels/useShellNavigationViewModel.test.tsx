import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { useShellNavigationViewModel } from "@/viewmodels/useShellNavigationViewModel";

function wrapperFor(initialEntry: string) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
	};
}

describe("useShellNavigationViewModel", () => {
	it("exposes title, breadcrumbs, metadata, and filtered palette results for the active route", () => {
		const { result } = renderHook(() => useShellNavigationViewModel("agent workspace"), {
			wrapper: wrapperFor("/ui/button"),
		});

		expect(result.current.pathname).toBe("/ui/button");
		expect(result.current.title).toBe("Button");
		expect(result.current.metadata.title).toBe("Button · basalt.");
		expect(result.current.breadcrumbs).toEqual([
			{ href: "/dashboard", label: "Dashboard" },
			{ href: "/ui", label: "Component library" },
			{ href: "/ui/overview/action", label: "Actions" },
			{ label: "Button" },
		]);
		expect(result.current.navGroups.map((group) => group.id)).toEqual([
			"overview",
			"scenarios",
			"pages",
		]);
		expect(result.current.commandResults.templates.map((entry) => entry.slug)).toEqual([
			"agent-workspace",
		]);
	});

	it("returns unfiltered navigation collections by default", () => {
		const { result } = renderHook(() => useShellNavigationViewModel(), {
			wrapper: wrapperFor("/dashboard"),
		});

		expect(result.current.title).toBe("Dashboard");
		expect(result.current.commandResults.catalogEntries).toHaveLength(81);
		expect(result.current.libraryGuideItems).toHaveLength(10);
	});
});

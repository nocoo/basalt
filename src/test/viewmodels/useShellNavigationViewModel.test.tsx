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
			{ href: "/ui", label: "Component library" },
			{ href: "/ui/overview/action", label: "Actions" },
			{ label: "Button" },
		]);
		expect(result.current.templateNavGroups.map((group) => group.id)).toEqual([
			"workspaces",
			"dashboards",
			"standalone",
		]);
		expect(
			result.current.commandResults.templateGroups
				.flatMap((group) => group.items)
				.map((item) => item.path),
		).toEqual(["/templates/agent-workspace"]);
	});

	it("returns unfiltered navigation collections by default", () => {
		const { result } = renderHook(() => useShellNavigationViewModel(), {
			wrapper: wrapperFor("/dashboard"),
		});

		expect(result.current.title).toBe("Analytics overview");
		expect(result.current.commandResults.catalogEntries).toHaveLength(81);
		expect(result.current.patternNavItems).toHaveLength(4);
		expect(result.current.foundationNavItems).toHaveLength(5);
		expect(result.current.libraryIndexItem.path).toBe("/ui");
	});
});

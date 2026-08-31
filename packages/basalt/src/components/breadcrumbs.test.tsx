import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./breadcrumbs";

const typeTokens = ["text-sm", "font-normal"] as const;
const emphasisTokens = [
	"font-medium",
	"font-semibold",
	"text-lg",
	"text-xl",
	"md:text-xl",
] as const;

function classTokens(className: string) {
	return className.split(/\s+/);
}

function expectHierarchyType(el: Element) {
	expect(classTokens(el.className)).toEqual(expect.arrayContaining([...typeTokens]));
	for (const token of emphasisTokens) {
		expect(classTokens(el.className)).not.toContain(token);
	}
}

describe("Breadcrumbs", () => {
	it("marks the current crumb", () => {
		render(<Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Settings" }]} />);
		expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
		expect(screen.getByText("Settings")).toHaveAttribute("aria-current", "page");
		expect(screen.queryByText("/")).not.toBeInTheDocument();
	});

	it("keeps linked ancestor, plain ancestor, and current at 14px/400", () => {
		render(
			<Breadcrumbs
				items={[{ href: "/", label: "Home" }, { label: "Section" }, { label: "Settings" }]}
			/>,
		);
		const nav = screen.getByLabelText("Breadcrumb");
		const ancestor = screen.getByRole("link", { name: "Home" });
		const plain = screen.getByText("Section");
		const current = screen.getByText("Settings");
		expectHierarchyType(nav);
		expectHierarchyType(ancestor);
		expectHierarchyType(plain);
		expectHierarchyType(current);
		expect(ancestor).toHaveAttribute("href", "/");
		expect(plain).not.toHaveAttribute("aria-current");
		expect(current).toHaveAttribute("aria-current", "page");
		expect(classTokens(ancestor.className)).toContain("text-basalt-muted-foreground");
		expect(classTokens(plain.className)).toContain("text-basalt-muted-foreground");
		expect(classTokens(current.className)).toContain("text-basalt-foreground");
		expect(classTokens(current.className)).not.toContain("text-basalt-muted-foreground");
	});
});

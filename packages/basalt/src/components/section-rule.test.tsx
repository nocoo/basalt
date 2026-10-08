import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionRule } from "./section-rule";

describe("SectionRule", () => {
	it("offers a reading heading without the compact dashed rule", () => {
		const { container } = render(
			<SectionRule variant="heading" title="Installation" actions={<span>Actions</span>}>
				<p>Content</p>
			</SectionRule>,
		);
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toHaveClass("text-basalt-2xl", "font-basalt-display");
		expect(heading).not.toHaveClass("uppercase");
		expect(heading.closest("section")).toHaveClass("space-y-basalt-layout");
		expect(container.querySelector(".border-dashed")).toBeNull();
		expect(screen.getByText("Actions").parentElement).toHaveClass("ml-auto");
		expect(screen.getByText("Content")).toBeInTheDocument();
	});
	it("renders a title and a dashed rule", () => {
		const { container } = render(<SectionRule title="Catalog" />);
		const heading = screen.getByRole("heading", { level: 2, name: "Catalog" });
		expect(heading.tagName).toBe("H2");
		expect(container.querySelector(".border-dashed")).not.toBeNull();
		expect(screen.queryByRole("button", { name: "More information" })).toBeNull();
	});

	it("shows an info control when hinted", () => {
		render(<SectionRule title="Catalog" hint="Published items only" />);
		expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
	});

	it("puts actions after the dashed rule", () => {
		render(
			<SectionRule title="Catalog" actions={<button type="button">Export</button>}>
				<p>Body</p>
			</SectionRule>,
		);
		const section = screen.getByRole("heading", { name: "Catalog" }).closest("section");
		expect(section).not.toBeNull();
		expect(
			within(section as HTMLElement).getByRole("button", { name: "Export" }),
		).toBeInTheDocument();
		expect(within(section as HTMLElement).getByText("Body")).toBeInTheDocument();
	});
});

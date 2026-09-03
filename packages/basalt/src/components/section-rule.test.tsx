import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionRule } from "./section-rule";

describe("SectionRule", () => {
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

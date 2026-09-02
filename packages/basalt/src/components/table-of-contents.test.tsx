import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableOfContents, TableOfContentsItem } from "./table-of-contents";

describe("TableOfContents", () => {
	it("renders the title", () => {
		render(
			<TableOfContents>
				<TableOfContentsItem active>Intro</TableOfContentsItem>
			</TableOfContents>,
		);
		expect(screen.getByText("On this page")).toBeInTheDocument();
		expect(screen.getByText("Intro")).toHaveAttribute("aria-current", "location");
	});

	it("renders a current section link", () => {
		render(
			<TableOfContents>
				<TableOfContentsItem href="#intro" active>
					Intro
				</TableOfContentsItem>
			</TableOfContents>,
		);
		const link = screen.getByRole("link", { name: "Intro" });
		expect(link).toHaveAttribute("href", "#intro");
		expect(link).toHaveAttribute("aria-current", "location");
	});

	it("renders inactive items", () => {
		render(
			<TableOfContents title="Sections">
				<TableOfContentsItem>Usage</TableOfContentsItem>
			</TableOfContents>,
		);
		expect(screen.getByText("Usage").className).toContain("border-transparent");
	});
});

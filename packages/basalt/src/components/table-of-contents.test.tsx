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
		expect(screen.getByText("Intro")).toBeInTheDocument();
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

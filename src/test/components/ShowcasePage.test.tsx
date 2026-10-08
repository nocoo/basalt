import { Button } from "@nocoo/basalt/components/button";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShowcasePage } from "@/components/ShowcasePage";

describe("ShowcasePage", () => {
	it("owns one header and section rhythm without repeating the island", () => {
		const { container } = render(
			<ShowcasePage
				title="Overview"
				description="Shared layout"
				actions={<Button>New item</Button>}
				filters={<span>Filters</span>}
				className="h-full"
				data-category="action"
			>
				<section>Content</section>
			</ShowcasePage>,
		);
		const root = container.querySelector("[data-showcase-page]");
		expect(root).toHaveAttribute("data-category", "action");
		expect(root).toHaveClass("h-full", "gap-basalt-layout-lg", "min-w-0");
		expect(root?.className).not.toMatch(/\b(?:p-|bg-|min-h-screen)/);
		expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
		expect(screen.getByRole("button", { name: "New item" })).toBeInTheDocument();
		expect(screen.getByText("Filters")).toBeInTheDocument();
		expect(root?.lastElementChild).toHaveTextContent("Content");
		expect(container.querySelector("main, [data-basalt-surface-root]")).toBeNull();
	});
	it("uses a reading scale without another padded header wrapper", () => {
		const { container } = render(<ShowcasePage title="Showcase" variant="document" />);
		const root = container.querySelector("[data-showcase-page]");
		expect(root).toHaveAttribute("data-page-variant", "document");
		expect(root).toHaveClass("gap-basalt-layout-xl");
		expect(root?.firstElementChild?.tagName).toBe("HEADER");
		expect(screen.getByRole("heading", { level: 1 })).toHaveClass("md:text-basalt-5xl");
		expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
	});
});

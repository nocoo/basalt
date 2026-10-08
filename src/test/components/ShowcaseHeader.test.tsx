import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShowcaseHeader } from "@/components/ShowcaseHeader";

describe("ShowcaseHeader", () => {
	it.each(["compact", "library"] as const)(
		"renders the %s opening without a decorative background",
		(variant) => {
			const { container } = render(
				<ShowcaseHeader
					variant={variant}
					title="Overview"
					description="Shared layout"
					actions={<span>Actions</span>}
					filters={<span>Filters</span>}
				/>,
			);
			const root = container.querySelector("[data-showcase-header]");
			expect(root).toHaveAttribute("data-variant", variant);
			expect(root?.children).toHaveLength(1);
			expect(root?.firstElementChild).toHaveClass("showcase-header-content");
			expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
			expect(screen.getByRole("heading", { name: "Overview", level: 1 })).toBeInTheDocument();
			expect(screen.getByText("Shared layout")).toBeInTheDocument();
			expect(screen.getByText("Actions")).toBeInTheDocument();
			expect(screen.getByText("Filters")).toBeInTheDocument();
		},
	);
});

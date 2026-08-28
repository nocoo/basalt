import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Banner } from "./banner";

describe("Banner", () => {
	it("renders title and description", () => {
		render(<Banner title="Update" description="A new version is ready." />);
		expect(screen.getByText("Update")).toBeInTheDocument();
		expect(screen.getByText("A new version is ready.")).toBeInTheDocument();
	});

	it("renders children without a title", () => {
		render(<Banner variant="alert">Just copy</Banner>);
		expect(screen.getByText("Just copy")).toBeInTheDocument();
	});

	it("renders secondary and compact sizes", () => {
		const { rerender } = render(
			<Banner variant="secondary" title="Maintenance scheduled" description="Ten minutes." />,
		);
		expect(screen.getByText("Maintenance scheduled")).toBeInTheDocument();
		rerender(<Banner size="sm" description="A DNS record already exists." />);
		expect(screen.getByText("A DNS record already exists.")).toBeInTheDocument();
	});

	it("renders accent-aware actions", () => {
		render(
			<Banner
				variant="error"
				title="Save failed"
				description="Try again."
				action={
					<>
						<Banner.Action>Retry</Banner.Action>
						<Banner.Action variant="ghost" aria-label="Dismiss" />
					</>
				}
			/>,
		);
		expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
	});
});

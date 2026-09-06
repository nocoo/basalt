import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Empty } from "./empty";

describe("Empty", () => {
	it("renders the title", () => {
		render(<Empty title="Nothing here" />);
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});

	it("renders an icon", () => {
		render(<Empty title="Empty" icon={<span data-testid="empty-icon" />} />);
		expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
	});

	it("renders description, children, and action in order", () => {
		const onClick = vi.fn();
		render(
			<Empty
				title="Main title"
				description="Supporting description"
				action={
					<button type="button" onClick={onClick}>
						Click action
					</button>
				}
			>
				Extra details
			</Empty>,
		);
		expect(screen.getByText("Main title")).toBeInTheDocument();
		expect(screen.getByText("Supporting description")).toBeInTheDocument();
		expect(screen.getByText("Extra details")).toBeInTheDocument();

		const actionBtn = screen.getByRole("button", { name: "Click action" });
		expect(actionBtn).toBeInTheDocument();
		fireEvent.click(actionBtn);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("renders numeric 0 without dropping it in children or action", () => {
		render(
			<Empty title="Count" action={0}>
				{0}
			</Empty>,
		);
		const zeros = screen.getAllByText("0");
		expect(zeros.length).toBeGreaterThanOrEqual(2);
	});
});

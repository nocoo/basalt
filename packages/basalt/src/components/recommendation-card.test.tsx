import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecommendationCard, type RecommendationOption } from "./recommendation-card";

const options: RecommendationOption[] = [
	{ id: "cones", label: "Cone King", description: "Reorder cones", confidence: "high" },
	{
		id: "vanilla",
		label: "Vanilla",
		description: "Switch vanilla",
		confidence: "review",
		actionLabel: "Configure",
	},
	{ id: "all", label: "Full restock", description: "Restock everything", confidence: "none" },
];
describe("RecommendationCard", () => {
	it("opens alternatives, promotes a choice and restores keyboard focus", () => {
		render(<RecommendationCard options={options} onAccept={vi.fn()} />);
		expect(screen.getByText("Reorder cones")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Vanilla/ })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Alternatives" }));
		fireEvent.click(screen.getByRole("button", { name: /Vanilla/ }));
		expect(screen.getByText("Switch vanilla")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Configure" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Alternatives" })).toHaveFocus();
		fireEvent.click(screen.getByRole("button", { name: /Full restock/ }));
		expect(screen.getByText("Restock everything")).toBeInTheDocument();
	});
	it("requires explicit acceptance, locks double submissions, and retries errors", async () => {
		let reject: (e: unknown) => void = () => {};
		const accept = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise((_, no) => {
						reject = no;
					}),
			)
			.mockResolvedValue(undefined);
		render(<RecommendationCard options={options} onAccept={accept} />);
		fireEvent.click(screen.getByRole("button", { name: "Accept" }));
		fireEvent.click(screen.getByRole("button", { name: "Accept" }));
		expect(accept).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("button", { name: "Alternatives" })).toBeDisabled();
		await act(async () => reject(new Error("Try again later")));
		expect(screen.getByRole("alert")).toHaveTextContent("Try again later");
		fireEvent.click(screen.getByRole("button", { name: "Accept" }));
		await screen.findByRole("button", { name: "Accepted" });
		expect(accept).toHaveBeenLastCalledWith(options[0]);
		expect(screen.getByRole("button", { name: "Accepted" })).toBeDisabled();
		fireEvent.click(screen.getByRole("button", { name: "Alternatives" }));
		fireEvent.click(screen.getByRole("button", { name: /Vanilla/ }));
		expect(screen.getByRole("button", { name: "Configure" })).toBeEnabled();
	});
	it("handles empty, unavailable and changed options without stale selection", async () => {
		const { rerender } = render(<RecommendationCard options={[]} onAccept={vi.fn()} />);
		expect(screen.getByRole("status")).toHaveTextContent("No recommendations yet");
		rerender(
			<RecommendationCard options={[{ ...options[0], disabled: true }]} onAccept={vi.fn()} />,
		);
		expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled();
		rerender(<RecommendationCard options={options} disabled onAccept={vi.fn()} />);
		expect(screen.getByRole("button", { name: "Accept" })).toBeDisabled();
		rerender(<RecommendationCard options={options} onAccept={vi.fn()} />);
		fireEvent.click(screen.getByRole("button", { name: "Alternatives" }));
		fireEvent.click(screen.getByRole("button", { name: /Vanilla/ }));
		rerender(<RecommendationCard options={[options[2]]} onAccept={vi.fn()} />);
		await waitFor(() => expect(screen.getByText("Restock everything")).toBeInTheDocument());
	});
});

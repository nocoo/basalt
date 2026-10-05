import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContextCards } from "./context-cards";

const chunks = [
	{
		id: "one",
		title: "Vendor rule",
		body: "Verify certification.",
		characters: 1250,
		source: { name: "Rule.pdf", type: "PDF", href: "https://example.com/rule" },
	},
	{
		id: "two",
		title: "Sales row",
		body: "Demand rises.",
		source: { name: "Sales.csv", type: "CSV", href: "javascript:alert(1)" },
	},
];
describe("ContextCards", () => {
	it("shows source-labelled chunks, accurate metadata and safe links", () => {
		render(<ContextCards chunks={chunks} totalCount={32} />);
		expect(screen.getByRole("region", { name: "All chunks" })).toBeInTheDocument();
		expect(screen.getByText("32")).toBeInTheDocument();
		expect(screen.getByText("1,250 characters")).toBeInTheDocument();
		expect(screen.getByText("Verify certification.")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Rule.pdf/ })).toHaveAttribute(
			"rel",
			"noopener noreferrer",
		);
		expect(screen.queryByRole("link", { name: /Sales.csv/ })).toBeNull();
		expect(screen.getByText("Sales.csv")).toBeInTheDocument();
	});
	it("renders loading, retryable error and empty states", () => {
		const retry = vi.fn();
		const { rerender } = render(<ContextCards chunks={[]} loading />);
		expect(screen.getByRole("status", { name: "Loading context" })).toBeInTheDocument();
		expect(screen.getByRole("region")).toHaveAttribute("aria-busy", "true");
		rerender(<ContextCards chunks={[]} error="Offline" onRetry={retry} />);
		fireEvent.click(screen.getByRole("button", { name: "Try again" }));
		expect(retry).toHaveBeenCalledOnce();
		expect(screen.getByRole("alert")).toHaveTextContent("Offline");
		rerender(<ContextCards chunks={[]} error="Unavailable" />);
		expect(screen.queryByRole("button")).toBeNull();
		rerender(<ContextCards chunks={[]} />);
		expect(screen.getByRole("status")).toHaveTextContent("No context retrieved");
	});
});

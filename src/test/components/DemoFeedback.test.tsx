import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DemoFeedback } from "@/components/examples/DemoFeedback";

describe("DemoFeedback", () => {
	it("renders status messages and triggers retry on error", () => {
		const retry = vi.fn();
		const { container, rerender } = render(<DemoFeedback status="idle" retry={retry} />);
		expect(container).toBeEmptyDOMElement();

		rerender(<DemoFeedback status="pending" retry={retry} />);
		expect(screen.getByRole("status")).toHaveTextContent("Saving…");

		rerender(<DemoFeedback status="success" retry={retry} />);
		expect(screen.getByRole("status")).toHaveTextContent("Saved locally.");

		rerender(<DemoFeedback status="error" retry={retry} />);
		expect(screen.getByRole("alert")).toHaveTextContent(
			"The demo request failed. Your input is preserved.",
		);
		fireEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(retry).toHaveBeenCalledTimes(1);
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChatPage from "@/pages/ChatPage";

describe("ChatPage", () => {
	it("opens the dock from the fab and lists inbox threads", () => {
		render(<ChatPage />);
		expect(screen.getByRole("heading", { name: "Chat framework" })).toBeInTheDocument();
		expect(screen.getByLabelText("Assistant")).toHaveAttribute("aria-hidden", "false");
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(screen.getByLabelText("Assistant")).toHaveAttribute("aria-hidden", "true");
		fireEvent.click(screen.getByRole("button", { name: "Open assistant" }));
		expect(screen.getByLabelText("Assistant")).toHaveAttribute("aria-hidden", "false");
		fireEvent.click(screen.getByRole("button", { name: /Quality/ }));
		expect(screen.getAllByText("Crash-free sessions held at 99.8%.").length).toBeGreaterThan(0);
	});
});

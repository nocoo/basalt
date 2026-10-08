import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ChatPage from "@/pages/ChatPage";

afterEach(() => vi.useRealTimers());
describe("ChatPage", () => {
	it("keeps thread drafts, supports rename and confirmed deletion", () => {
		render(<ChatPage />);
		expect(screen.getByRole("heading", { name: "Care assistant" })).toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Message" }), {
			target: { value: "Draft one" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Rename conversation" }));
		fireEvent.change(screen.getByRole("textbox", { name: "Conversation name" }), {
			target: { value: "First thread" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
		expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("");
		fireEvent.click(screen.getByRole("button", { name: /First thread/ }));
		expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("Draft one");
		fireEvent.click(screen.getByRole("button", { name: "Delete conversation" }));
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
		expect(screen.queryByRole("button", { name: /First thread/ })).toBeNull();
	});
	it("renders thinking, paused approval, result preview and editable messages", async () => {
		vi.useFakeTimers();
		render(<ChatPage />);
		fireEvent.click(screen.getByRole("button", { name: "Update my follow-up plan for next week" }));
		fireEvent.keyDown(screen.getByRole("textbox", { name: "Message" }), { key: "Enter" });
		await act(async () => {});
		act(() => vi.advanceTimersByTime(1500));
		expect(
			screen.getByRole("heading", { name: "Generate a local change preview?" }),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("radio", { name: "Approve preview only" }));
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await act(async () => {});
		act(() => vi.advanceTimersByTime(6000));
		expect(
			screen.getByRole("table", { name: "Local change preview - no files written" }),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Reference sources 1" }));
		expect(screen.getByRole("link", { name: /Care-team preparation guide/ })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Edit message" }));
		fireEvent.change(screen.getByRole("textbox", { name: "Edit message text" }), {
			target: { value: "Edited prompt" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save and resend" }));
		await act(async () => {});
		expect(within(screen.getByRole("log")).getByText("Edited prompt")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Stop generating" }));
		expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
	});
});

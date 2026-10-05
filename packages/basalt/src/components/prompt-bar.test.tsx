import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PromptBar } from "./prompt-bar";

it("composes model and optional reasoning controls", () => {
	const model = vi.fn(),
		reason = vi.fn(),
		search = vi.fn();
	const { rerender } = render(
		<PromptBar
			models={[{ id: "a", label: "Balanced" }]}
			model="a"
			onModelChange={model}
			onSend={vi.fn()}
			reasoning
			onReasoningChange={reason}
			webSearch={false}
			onWebSearchChange={search}
		/>,
	);
	fireEvent.click(screen.getByRole("button", { name: "Reasoning" }));
	expect(reason).toHaveBeenCalledWith(false);
	fireEvent.click(screen.getByRole("button", { name: "Web search" }));
	expect(search).toHaveBeenCalledWith(true);
	rerender(
		<PromptBar
			models={[{ id: "a", label: "Balanced" }]}
			model="a"
			onModelChange={model}
			onSend={vi.fn()}
			streaming
		/>,
	);
	expect(screen.getByRole("combobox", { name: "Model" })).toBeDisabled();
	expect(screen.queryByRole("button", { name: "Reasoning" })).toBeNull();
});

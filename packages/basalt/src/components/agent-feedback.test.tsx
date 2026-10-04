import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApprovalCard, type ApprovalQuestion } from "./approval-card";
import { Thinking } from "./thinking";
import { ToolChips } from "./tool-chips";

const questions: ApprovalQuestion[] = [
	{
		id: "plan",
		label: "Pick a plan",
		type: "single",
		options: [
			{ id: "a", label: "Alpha" },
			{ id: "b", label: "Disabled", disabled: true },
		],
	},
	{
		id: "mix",
		label: "Pick mix-ins",
		type: "multiple",
		allowCustom: true,
		options: [
			{ id: "x", label: "Chocolate" },
			{ id: "y", label: "Sprinkles" },
		],
	},
	{
		id: "market",
		label: "Market",
		type: "single",
		required: false,
		options: [{ id: "z", label: "Shops" }],
	},
];
afterEach(() => vi.useRealTimers());
describe("Thinking", () => {
	it("renders truthful statuses and supports controlled disclosure", () => {
		const onOpenChange = vi.fn();
		const { rerender } = render(
			<Thinking steps={[]} defaultOpen={false} onOpenChange={onOpenChange} />,
		);
		fireEvent.click(screen.getByRole("button"));
		expect(onOpenChange).toHaveBeenCalledWith(true);
		expect(screen.getByText("No steps yet")).toBeInTheDocument();
		for (const variant of ["steps", "reasoning", "search", "coding"] as const) {
			rerender(
				<Thinking
					variant={variant}
					open
					steps={[
						{ id: "a", label: "Read", detail: "File data", status: "running" },
						{ id: "b", label: "Done", status: "complete" },
						{ id: "c", label: "Failed", status: "error" },
						{ id: "d", label: "Later", status: "pending" },
					]}
				/>,
			);
			expect(screen.getByText("Needs attention")).toBeInTheDocument();
			expect(screen.getByText("File data")).toBeInTheDocument();
		}
		rerender(<Thinking steps={[{ id: "a", label: "Read", status: "complete" }]} />);
		expect(screen.getByText("Thinking complete")).toBeInTheDocument();
		rerender(
			<Thinking title="Searching" steps={[{ id: "a", label: "Read", status: "running" }]} />,
		);
		expect(screen.getByText("Searching")).toBeInTheDocument();
	});
});
describe("ApprovalCard", () => {
	it("auto advances single choice, preserves answers and submits optional skip", async () => {
		const submit = vi.fn();
		render(<ApprovalCard questions={questions} onSubmit={submit} />);
		expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
		fireEvent.click(screen.getByRole("radio", { name: "Disabled" }));
		expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
		fireEvent.click(screen.getByRole("radio", { name: "Alpha" }));
		await screen.findByText("Pick mix-ins");
		fireEvent.click(screen.getByRole("checkbox", { name: "Chocolate" }));
		fireEvent.click(screen.getByRole("checkbox", { name: "Sprinkles" }));
		fireEvent.click(screen.getByRole("checkbox", { name: "Sprinkles" }));
		fireEvent.change(screen.getByRole("textbox", { name: "Custom answer" }), {
			target: { value: "  Waffle  " },
		});
		fireEvent.click(screen.getByRole("button", { name: "Previous question" }));
		expect(screen.getByRole("radio", { name: "Alpha" })).toHaveAttribute("aria-checked", "true");
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		fireEvent.click(screen.getByRole("button", { name: "Continue" }));
		fireEvent.click(screen.getByRole("button", { name: "Skip" }));
		await screen.findByText("Answers submitted");
		expect(submit).toHaveBeenCalledWith({
			plan: { selected: ["a"] },
			mix: { selected: ["x"], custom: "Waffle" },
			market: { selected: [], skipped: true },
		});
	});
	it("locks submission and retains answers after failure", async () => {
		let reject: (error: unknown) => void = () => {};
		const submit = vi
			.fn()
			.mockImplementationOnce(
				() =>
					new Promise((_, no) => {
						reject = no;
					}),
			)
			.mockResolvedValue(undefined);
		render(<ApprovalCard questions={[questions[0]]} onSubmit={submit} autoAdvance={false} />);
		fireEvent.click(screen.getByRole("radio", { name: "Alpha" }));
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		expect(submit).toHaveBeenCalledTimes(1);
		await act(async () => reject(new Error("Retry this request")));
		expect(screen.getByRole("alert")).toHaveTextContent("Retry this request");
		expect(screen.getByRole("radio", { name: "Alpha" })).toHaveAttribute("aria-checked", "true");
		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		await screen.findByText("Answers submitted");
		expect(submit).toHaveBeenCalledTimes(2);
	});
	it("handles empty, dismiss and auto-advance cancellation", () => {
		vi.useFakeTimers();
		const dismiss = vi.fn();
		const { rerender, unmount } = render(<ApprovalCard questions={[]} onSubmit={vi.fn()} />);
		expect(screen.getByText("No approval questions")).toBeInTheDocument();
		rerender(<ApprovalCard questions={questions} onSubmit={vi.fn()} onDismiss={dismiss} />);
		fireEvent.click(screen.getByRole("button", { name: "Dismiss approval" }));
		expect(dismiss).toHaveBeenCalled();
		fireEvent.click(screen.getByRole("radio", { name: "Alpha" }));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
describe("ToolChips", () => {
	it("expands tool output and opens diff previews", async () => {
		const { rerender } = render(<ToolChips steps={[]} defaultOpen={false} />);
		fireEvent.click(screen.getByRole("button"));
		expect(screen.getByText("No tool calls yet")).toBeInTheDocument();
		rerender(
			<ToolChips
				steps={[
					{
						id: "read",
						kind: "read",
						label: "Read",
						status: "complete",
						target: "notes.md",
						detail: "Loaded notes",
					},
					{ id: "run", kind: "run", label: "Run", status: "error" },
					{ id: "write", kind: "write", label: "Write", status: "running" },
					{ id: "think", kind: "think", label: "Plan", status: "pending" },
				]}
				diffs={[
					{ file: "notes.md", added: 2, removed: 1, content: "+ hello" },
					{ file: "empty.md", added: 0, removed: 0 },
				]}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: /Read notes.md/ }));
		expect(screen.getByText("Loaded notes")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /Read notes.md/ }));
		fireEvent.click(screen.getByRole("button", { name: /Run error/ }));
		expect(screen.getByText("No output yet")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /notes.md \+2/ }));
		await waitFor(() => expect(screen.getByText("+ hello")).toBeInTheDocument());
		fireEvent.keyDown(document, { key: "Escape" });
		fireEvent.click(screen.getByRole("button", { name: /empty.md/ }));
		expect(screen.getByText("No diff preview available")).toBeInTheDocument();
	});
});

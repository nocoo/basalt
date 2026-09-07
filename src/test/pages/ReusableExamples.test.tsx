import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CoverImageIntake from "@/pages/ui/examples/file-dropzone/media";
import RemoteModelSelection from "@/pages/ui/examples/multi-select/remote-search";
import LocalUploadQueue from "@/pages/ui/examples/upload-queue/local-transport";

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});
describe("reusable example adapters", () => {
	it("releases previews on replacement, removal and unmount", () => {
		const create = vi
			.fn()
			.mockReturnValueOnce("blob:one")
			.mockReturnValueOnce("blob:two")
			.mockReturnValueOnce("blob:three");
		const revoke = vi.fn();
		vi.stubGlobal(
			"URL",
			class extends URL {
				static createObjectURL = create;
				static revokeObjectURL = revoke;
			},
		);
		const { container, unmount } = render(<CoverImageIntake />);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const first = new File(["one"], "one.png", { type: "image/png" });
		const second = new File(["two"], "two.png", { type: "image/png" });
		fireEvent.change(input, { target: { files: [first] } });
		expect(screen.getByRole("img")).toHaveAttribute("src", "blob:one");
		fireEvent.change(input, { target: { files: [second] } });
		expect(revoke).toHaveBeenLastCalledWith("blob:one");
		fireEvent.click(screen.getByRole("button", { name: "Remove cover" }));
		expect(revoke).toHaveBeenLastCalledWith("blob:two");
		fireEvent.change(input, { target: { files: [first] } });
		unmount();
		expect(revoke.mock.calls.map(([url]) => url)).toEqual(["blob:one", "blob:two", "blob:three"]);
	});
	it("cancels local search work when its page is unmounted", () => {
		vi.useFakeTimers();
		const { unmount } = render(<RemoteModelSelection />);
		expect(vi.getTimerCount()).toBeGreaterThan(0);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
	it("keeps cancelled uploads stopped, retries after failure and clears pending transport work", () => {
		vi.useFakeTimers();
		const { unmount } = render(<LocalUploadQueue />);
		fireEvent.click(screen.getByRole("button", { name: "Add sample file" }));
		fireEvent.click(screen.getByRole("checkbox", { name: "Simulate failure" }));
		fireEvent.click(screen.getByRole("button", { name: "Start uploads" }));
		for (let tick = 0; tick < 5; tick++) act(() => vi.advanceTimersByTime(200));
		expect(screen.getByRole("alert")).toHaveTextContent("Connection interrupted");
		fireEvent.click(screen.getByRole("checkbox", { name: "Simulate failure" }));
		fireEvent.click(screen.getByRole("button", { name: "Retry Project-notes-1.pdf" }));
		fireEvent.click(screen.getByRole("button", { name: "Cancel Project-notes-1.pdf" }));
		act(() => vi.advanceTimersByTime(5000));
		expect(screen.getByText("180 KB · Cancelled")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Retry Project-notes-1.pdf" }));
		for (let tick = 0; tick < 10; tick++) act(() => vi.advanceTimersByTime(200));
		expect(screen.getByText("1 completed · 1 total")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Add sample file" }));
		fireEvent.click(screen.getByRole("button", { name: "Start uploads" }));
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type UploadFile, UploadItem, UploadQueue } from "./upload-queue";

const file: UploadFile = { id: "notes", name: "notes.pdf", status: "queued" };
describe("UploadQueue and UploadItem", () => {
	it("presents the empty state and named list without owning transport state", () => {
		const { rerender } = render(<UploadQueue label="Documents" files={[]} />);
		expect(screen.getByRole("status")).toHaveTextContent("No files selected.");
		rerender(<UploadQueue label="Documents" files={[]} emptyLabel="Choose documents" />);
		expect(screen.getByRole("status")).toHaveTextContent("Choose documents");
		rerender(<UploadQueue label="Documents" files={[file]} />);
		expect(screen.getByRole("list", { name: "Documents" })).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(1);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
	it("shows only actions appropriate to each state and emits stable identifiers", () => {
		const cancel = vi.fn(),
			retry = vi.fn(),
			remove = vi.fn();
		const actions = { onCancel: cancel, onRetry: retry, onRemove: remove };
		const { rerender } = render(<UploadItem file={file} {...actions} />);
		fireEvent.click(screen.getByRole("button", { name: "Cancel notes.pdf" }));
		fireEvent.click(screen.getByRole("button", { name: "Remove notes.pdf" }));
		expect(cancel).toHaveBeenCalledWith("notes");
		expect(remove).toHaveBeenCalledWith("notes");
		expect(screen.queryByRole("button", { name: "Retry notes.pdf" })).not.toBeInTheDocument();
		rerender(<UploadItem file={{ ...file, status: "uploading", progress: 45 }} {...actions} />);
		expect(screen.getByRole("progressbar", { name: "notes.pdf" })).toHaveAttribute(
			"aria-valuenow",
			"45",
		);
		expect(screen.queryByRole("button", { name: "Remove notes.pdf" })).not.toBeInTheDocument();
		for (const status of ["error", "cancelled"] as const) {
			rerender(<UploadItem file={{ ...file, status, error: "Connection lost" }} {...actions} />);
			fireEvent.click(screen.getByRole("button", { name: "Retry notes.pdf" }));
			expect(retry).toHaveBeenLastCalledWith("notes");
			expect(screen.queryByRole("button", { name: "Cancel notes.pdf" })).not.toBeInTheDocument();
			if (status === "error")
				expect(screen.getByRole("alert")).toHaveTextContent("Connection lost");
		}
		rerender(
			<UploadItem
				file={{ ...file, status: "success", size: 2048, preview: <span>PDF preview</span> }}
				labels={{ success: "Ready", remove: "Dismiss" }}
				{...actions}
			/>,
		);
		expect(screen.getByText("2 KB · Ready")).toBeInTheDocument();
		expect(screen.getByText("PDF preview")).toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Dismiss notes.pdf" }));
	});
	it("clamps finite progress and announces indeterminate progress without an invalid value", () => {
		const { rerender } = render(
			<UploadItem file={{ ...file, status: "uploading", progress: -10 }} />,
		);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
		rerender(<UploadItem file={{ ...file, status: "uploading", progress: 180 }} />);
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
		for (const progress of [undefined, Number.NaN, Infinity]) {
			rerender(<UploadItem file={{ ...file, status: "uploading", progress }} />);
			expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
			expect(screen.getByRole("progressbar").firstChild).toHaveClass("motion-reduce:animate-none");
		}
		rerender(<UploadItem file={{ ...file, status: "error" }} />);
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
});

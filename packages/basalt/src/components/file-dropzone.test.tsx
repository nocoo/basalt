import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileDropzone } from "./file-dropzone";

const file = (name: string, type = "", size = 1) => new File(["x".repeat(size)], name, { type });
describe("FileDropzone", () => {
	it("validates extensions, wildcard/exact MIME, size and count with one reason per file", () => {
		const accept = vi.fn(),
			reject = vi.fn();
		render(
			<FileDropzone
				label="Documents"
				accept=" .PDF, image/*,text/plain,, "
				maxSize={10}
				maxFiles={4}
				fileCount={1}
				onFilesAccepted={accept}
				onFilesRejected={reject}
			/>,
		);
		const accepted = [
			file("UPPER.PDF"),
			file("photo.png", "image/png"),
			file("notes.txt", "text/plain"),
		];
		const wrong = file("file.exe", "application/octet-stream", 20),
			large = file("large.pdf", "", 20),
			extra = file("extra.pdf");
		fireEvent.drop(screen.getByRole("button"), {
			dataTransfer: { files: [wrong, large, ...accepted, extra] },
		});
		expect(accept).toHaveBeenCalledWith(accepted);
		expect(reject).toHaveBeenCalledWith([
			{ file: wrong, code: "file-invalid-type" },
			{ file: large, code: "file-too-large" },
			{ file: extra, code: "too-many-files" },
		]);
		expect(screen.getByRole("alert")).toHaveTextContent("File count limit reached.");
	});
	it("browses through the native input, resets selection and clears previous rejection feedback", () => {
		const accept = vi.fn();
		const { container } = render(
			<FileDropzone
				label="Cover"
				description="One image"
				multiple={false}
				accept="image/*"
				onFilesAccepted={accept}
				formatRejection={(item) => `Rejected ${item.file.name}`}
				browseLabel="Choose"
			/>,
		);
		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		const click = vi.spyOn(input, "click").mockImplementation(() => {});
		fireEvent.click(screen.getByRole("button", { name: "Choose: Cover" }));
		expect(click).toHaveBeenCalledOnce();
		expect(screen.getByRole("button")).toHaveAccessibleDescription("One image");
		fireEvent.change(input, { target: { files: [file("bad.txt")] } });
		expect(screen.getByRole("alert")).toHaveTextContent("Rejected bad.txt");
		expect(accept).not.toHaveBeenCalled();
		const image = file("good.webp", "image/webp");
		fireEvent.change(input, { target: { files: [image] } });
		expect(accept).toHaveBeenCalledWith([image]);
		expect(input.value).toBe("");
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		fireEvent.change(input, { target: { files: null } });
		expect(accept).toHaveBeenCalledTimes(1);
		click.mockRestore();
	});
	it("enforces single-file and zero-capacity limits without rejecting valid files for prior invalid ones", () => {
		const accept = vi.fn(),
			reject = vi.fn();
		const { rerender } = render(
			<FileDropzone
				label="File"
				multiple={false}
				onFilesAccepted={accept}
				onFilesRejected={reject}
			/>,
		);
		const one = file("one"),
			two = file("two");
		fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [one, two] } });
		expect(accept).toHaveBeenCalledWith([one]);
		expect(reject).toHaveBeenCalledWith([{ file: two, code: "too-many-files" }]);
		rerender(
			<FileDropzone label="File" maxFiles={0} onFilesAccepted={accept} onFilesRejected={reject} />,
		);
		fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [one] } });
		expect(accept).toHaveBeenCalledTimes(1);
	});
	it("maintains nested drag depth, drop effect and clears highlighting on leave and drop", () => {
		const accept = vi.fn();
		render(<FileDropzone label="File" dropLabel="Release now" onFilesAccepted={accept} />);
		const button = screen.getByRole("button"),
			transfer = { files: [file("a")], dropEffect: "none" };
		fireEvent.dragEnter(button);
		fireEvent.dragEnter(button);
		expect(button).toHaveAttribute("data-drag-active", "true");
		fireEvent.dragLeave(button);
		expect(button).toHaveTextContent("Release now");
		fireEvent.dragOver(button, { dataTransfer: transfer });
		expect(transfer.dropEffect).toBe("copy");
		fireEvent.dragLeave(button);
		expect(button).toHaveAttribute("data-drag-active", "false");
		fireEvent.dragEnter(button);
		fireEvent.drop(button, { dataTransfer: transfer });
		expect(button).toHaveAttribute("data-drag-active", "false");
		expect(accept).toHaveBeenCalledWith(transfer.files);
	});
	it("disables both browse and programmatic drops, even during an active drag", () => {
		const accept = vi.fn();
		const { rerender } = render(<FileDropzone label="File" onFilesAccepted={accept} />);
		fireEvent.dragEnter(screen.getByRole("button"));
		rerender(<FileDropzone label="File" disabled onFilesAccepted={accept} />);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		const transfer = { files: [file("a")], dropEffect: "none" };
		fireEvent.dragEnter(button);
		fireEvent.dragOver(button, { dataTransfer: transfer });
		fireEvent.drop(button, { dataTransfer: transfer });
		expect(transfer.dropEffect).toBe("none");
		expect(button).toHaveAttribute("data-drag-active", "false");
		expect(accept).not.toHaveBeenCalled();
	});
});

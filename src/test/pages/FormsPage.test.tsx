import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FormsPage from "@/pages/FormsPage";

describe("FormsPage", () => {
	it("uses library buttons for form actions", () => {
		render(<FormsPage />);

		expect(screen.getByRole("button", { name: "Save profile" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Update security" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Browse files: File Upload" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "View details" })).toBeInTheDocument();
	});
	it("keeps uploads and icon-adorned location fields functional", () => {
		const { container } = render(<FormsPage />);
		const location = screen.getByRole("textbox", { name: "Location" });
		expect(location.closest('[data-slot="input-group"]')).not.toBeNull();
		fireEvent.change(location, { target: { value: "Shanghai" } });
		expect(location).toHaveValue("Shanghai");
		const input = container.querySelector('input[type="file"]');
		if (!input) throw new Error("Missing upload input");
		fireEvent.change(input, {
			target: { files: [new File(["pdf"], "receipt.pdf", { type: "application/pdf" })] },
		});
		expect(screen.getByText(/receipt.pdf/)).toBeInTheDocument();
		const oversized = new File(["pdf"], "oversized.pdf", { type: "application/pdf" });
		Object.defineProperty(oversized, "size", { value: 4 * 1024 * 1024 + 1 });
		fireEvent.change(input, { target: { files: [oversized] } });
		expect(screen.getByRole("alert")).toHaveTextContent("File exceeds the size limit");
		fireEvent.change(input, {
			target: { files: [new File(["text"], "invalid.txt", { type: "text/plain" })] },
		});
		expect(screen.getByRole("alert")).toHaveTextContent("File type is not accepted");
		expect(screen.getByText(/receipt.pdf/)).toBeInTheDocument();
	});
});

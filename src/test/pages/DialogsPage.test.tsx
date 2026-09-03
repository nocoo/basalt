import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DialogsPage from "@/pages/DialogsPage";

describe("DialogsPage", () => {
	it("teaches dialog chrome with package controls", () => {
		render(<DialogsPage />);
		expect(screen.getByRole("heading", { name: "Dialogs" })).toBeInTheDocument();
		expect(screen.getByText(/Default size is base \(384px\)/)).toBeInTheDocument();
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("opens the standard dialog with title, close, cancel, and confirm", () => {
		render(<DialogsPage />);
		fireEvent.click(screen.getByRole("button", { name: "Open standard" }));
		const dialog = screen.getByRole("dialog");
		expect(dialog).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Rename workspace" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
		expect(dialog.querySelector("button:not([class])")).toBeNull();
	});

	it("opens a sized dialog at the documented width", () => {
		render(<DialogsPage />);
		fireEvent.click(screen.getByRole("button", { name: "Base (384px)" }));
		expect(screen.getByRole("dialog")).toHaveClass("sm:w-96");
	});

	it("opens a form dialog with Field and Input", () => {
		render(<DialogsPage />);
		fireEvent.click(screen.getByRole("button", { name: "Open form" }));
		expect(screen.getByRole("heading", { name: "Create workspace" })).toBeInTheDocument();
		expect(screen.getByLabelText("Workspace name")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
	});

	it("opens ConfirmDialog and AlertDialog from package controls", () => {
		render(<DialogsPage />);
		fireEvent.click(screen.getByRole("button", { name: "Open confirm" }));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Apply this layout?" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Open alert" }));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Delete workspace?" })).toBeInTheDocument();
	});
});

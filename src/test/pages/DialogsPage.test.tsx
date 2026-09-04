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
		expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Open alert" }));
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Delete workspace?" })).toBeInTheDocument();
	});

	it("opens money-flow dialogs from small send to wide review", () => {
		render(<DialogsPage />);
		fireEvent.click(screen.getByRole("button", { name: "Open send" }));
		expect(screen.getByRole("dialog").className).toContain("sm:w-72");
		expect(screen.getByRole("heading", { name: "Send $1,200?" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		fireEvent.click(screen.getByRole("button", { name: "Open contribution" }));
		expect(screen.getByRole("heading", { name: "Log contribution" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
		expect(screen.getByLabelText("Amount")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		fireEvent.click(screen.getByRole("button", { name: "Open holding" }));
		expect(screen.getByRole("dialog").className).toContain("sm:w-[32rem]");
		expect(screen.getByRole("heading", { name: "Edit holding" })).toBeInTheDocument();
		expect(screen.getByLabelText(/Note/)).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		fireEvent.click(screen.getByRole("button", { name: "Open review" }));
		expect(screen.getByRole("dialog").className).toContain("sm:w-[48rem]");
		expect(screen.getByRole("heading", { name: "Review transfer" })).toBeInTheDocument();
		expect(screen.getByText("Operating cash")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		fireEvent.click(screen.getByRole("button", { name: "Open unit editor" }));
		const unit = screen.getByRole("dialog");
		expect(unit.className).toContain("sm:w-[min(72rem,calc(100vw-2rem))]");
		expect(screen.getByRole("heading", { name: "Edit capital unit · U-2044" })).toBeInTheDocument();
		expect(screen.getByText("Basics")).toBeInTheDocument();
		expect(screen.getByText("Product and operations")).toBeInTheDocument();
		expect(screen.getByText("History")).toBeInTheDocument();
		expect(screen.getByLabelText("Code")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
	});
});

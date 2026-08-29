import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	DIALOG_SIZES,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
	dialogPanelClass,
} from "./dialog";

describe("Dialog", () => {
	it("opens from a trigger", () => {
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});

	it("shows the dialog title after open", () => {
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
					<DialogDescription>Details</DialogDescription>
				</DialogContent>
			</Dialog>,
		);
		fireEvent.click(screen.getByText("Open"));
		expect(screen.getByRole("dialog", { name: "Title" })).toBeInTheDocument();
		expect(screen.getByText("Details")).toBeInTheDocument();
	});

	it("applies size classes without centering vertically", () => {
		const classes = dialogPanelClass({ size: "sm" }).split(" ");
		expect(classes).toContain("top-8");
		expect(classes).toContain("sm:top-16");
		expect(classes).toContain(DIALOG_SIZES.sm);
		expect(classes).not.toContain("top-1/2");
		expect(classes).not.toContain("-translate-y-1/2");
	});

	it("renders each size on the panel", () => {
		render(
			<Dialog defaultOpen>
				<DialogContent size="xl">
					<DialogTitle>Wide</DialogTitle>
				</DialogContent>
			</Dialog>,
		);
		expect(screen.getByRole("dialog").className).toContain(DIALOG_SIZES.xl);
	});

	it("closes from an explicit close control", () => {
		render(
			<Dialog defaultOpen>
				<DialogContent>
					<DialogTitle>Stay</DialogTitle>
					<DialogClose>Dismiss</DialogClose>
				</DialogContent>
			</Dialog>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("blocks pointer dismissal when asked", () => {
		render(
			<Dialog defaultOpen>
				<DialogContent disablePointerDismissal>
					<DialogTitle>Locked</DialogTitle>
				</DialogContent>
			</Dialog>,
		);
		const dialog = screen.getByRole("dialog");
		fireEvent.pointerDown(dialog);
		const outside = new MouseEvent("pointerdown", { bubbles: true, cancelable: true });
		dialog.dispatchEvent(outside);
		expect(screen.getByRole("dialog", { name: "Locked" })).toBeInTheDocument();
	});
});

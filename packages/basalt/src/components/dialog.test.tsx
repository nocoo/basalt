import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	DIALOG_SIZES,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	dialogOverlayClass,
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

	it("centers the panel and animates open and close", () => {
		const classes = dialogPanelClass({ size: "sm" }).split(" ");
		expect(classes).toContain("top-1/2");
		expect(classes).toContain("-translate-y-1/2");
		expect(classes).toContain(DIALOG_SIZES.sm);
		expect(classes).toContain("data-[state=open]:animate-basalt-dialog-in");
		expect(classes).toContain("data-[state=closed]:animate-basalt-dialog-out");
		expect(classes).toContain("motion-reduce:animate-none");
		expect(classes).toContain("z-50");
		expect(classes).toContain("overflow-y-auto");
		expect(classes).not.toContain("overflow-hidden");
		expect(classes).not.toContain("top-8");
	});

	it("frosts the overlay and fades it with the panel", () => {
		const classes = dialogOverlayClass().split(" ");
		expect(classes).toContain("backdrop-blur-md");
		expect(classes).toContain("bg-black/40");
		expect(classes).toContain("data-[state=open]:animate-basalt-overlay-in");
		expect(classes).toContain("data-[state=closed]:animate-basalt-overlay-out");
		expect(classes).toContain("motion-reduce:animate-none");
		expect(classes).toContain("z-50");
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

	it("renders header and footer slots", () => {
		render(
			<Dialog defaultOpen>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit</DialogTitle>
					</DialogHeader>
					<DialogFooter>Save</DialogFooter>
				</DialogContent>
			</Dialog>,
		);
		expect(screen.getByText("Edit").parentElement?.className).toContain("flex-col");
		expect(screen.getByText("Save").className).toContain("sm:justify-end");
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

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./sheet";

describe("Sheet", () => {
	it("renders a trigger", () => {
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
			</Sheet>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});

	it("anchors content to the requested side", () => {
		render(
			<Sheet defaultOpen>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent side="left">
					<SheetTitle>Panel</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		const panel = screen.getByRole("dialog");
		expect(panel.className).toContain("left-0");
		expect(panel).toHaveAttribute("data-side", "left");
		expect(panel.className).not.toContain("left-1/2");
		expect(panel.className).toContain("motion-reduce:animate-none");
		expect(panel.className).toContain("z-50");
		expect(panel).toHaveStyle({ boxSizing: "border-box" });
	});

	it("renders header and footer slots", () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Panel</SheetTitle>
					</SheetHeader>
					<SheetFooter>Done</SheetFooter>
				</SheetContent>
			</Sheet>,
		);
		expect(screen.getByText("Panel").parentElement?.className).toContain("flex-col");
		expect(screen.getByText("Done").className).toContain("sm:justify-end");
	});

	it("uses responsive card inset and coherent title hierarchy by default", () => {
		render(
			<Sheet defaultOpen>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Panel</SheetTitle>
						<SheetDescription>Panel details</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>,
		);
		const panel = screen.getByRole("dialog");
		expect(panel.className).toContain("p-basalt-card sm:p-basalt-card-lg");
		expect(screen.getByRole("heading", { name: "Panel" }).className).toContain("text-basalt-lg");
		expect(screen.getByText("Panel details").className).toContain("text-basalt-base");
		expect(screen.getByText("Panel details").className).toContain("basalt-line-body");
	});

	it("defaults to the right edge", () => {
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetTitle>Panel</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		fireEvent.click(screen.getByText("Open"));
		expect(screen.getByRole("dialog").className).toContain("right-0");
		expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "right");
	});

	it.each(["top", "bottom"] as const)("exposes the %s animation direction", (side) => {
		render(
			<Sheet defaultOpen>
				<SheetContent side={side}>
					<SheetTitle>Panel</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		expect(screen.getByRole("dialog")).toHaveAttribute("data-side", side);
		expect(document.querySelector(".basalt-sheet-overlay")).toHaveAttribute("data-state", "open");
	});
});

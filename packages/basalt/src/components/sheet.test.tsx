import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
		expect(screen.getByText("Panel").parentElement).toHaveClass(
			"flex-col",
			"space-y-basalt-space-md",
			"pe-basalt-card-xl",
		);
		expect(screen.getByText("Done")).toHaveClass("mt-basalt-layout");
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
		expect(panel).toHaveAttribute("data-basalt-floating");
		expect(panel.className).toContain("p-basalt-card sm:p-basalt-card-lg");
		expect(screen.getByRole("heading", { name: "Panel" }).className).toContain("text-basalt-xl");
		expect(screen.getByText("Panel details").className).toContain("text-basalt-base");
		expect(screen.getByText("Panel details").className).toContain("basalt-line-relaxed");
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
	});

	it("supports hiding or relabeling the built-in close button", () => {
		render(
			<Sheet defaultOpen>
				<SheetContent closeLabel="Hide drawer">
					<SheetTitle>Panel</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Hide drawer" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		cleanup();

		render(
			<Sheet defaultOpen>
				<SheetContent showCloseButton={false}>
					<SheetTitle>Locked</SheetTitle>
				</SheetContent>
			</Sheet>,
		);
		expect(screen.getByRole("dialog", { name: "Locked" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
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

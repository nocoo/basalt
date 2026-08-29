import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";

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
		expect(panel.className).not.toContain("left-1/2");
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
	});
});

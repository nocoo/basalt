import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./dialog";

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
				</DialogContent>
			</Dialog>,
		);
		fireEvent.click(screen.getByText("Open"));
		expect(screen.getByText("Title")).toBeInTheDocument();
	});
});

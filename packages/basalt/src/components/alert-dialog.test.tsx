import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";
import { DIALOG_SIZES } from "./dialog";

describe("AlertDialog", () => {
	it("renders a trigger", () => {
		render(
			<AlertDialog>
				<AlertDialogTrigger>Delete</AlertDialogTrigger>
			</AlertDialog>,
		);
		expect(screen.getByText("Delete")).toBeInTheDocument();
	});

	it("opens a confirmation panel with actions", () => {
		render(
			<AlertDialog>
				<AlertDialogTrigger>Delete</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Account?</AlertDialogTitle>
						<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction>Delete Account</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>,
		);
		fireEvent.click(screen.getByText("Delete"));
		expect(screen.getByRole("alertdialog", { name: "Delete Account?" })).toBeInTheDocument();
		expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Cancel" }).className).toContain(
			"border-basalt-border",
		);
		expect(screen.getByRole("button", { name: "Delete Account" }).className).toContain(
			"bg-basalt-destructive",
		);
	});

	it("applies size classes on the panel", () => {
		render(
			<AlertDialog defaultOpen>
				<AlertDialogContent size="lg">
					<AlertDialogTitle>Wide</AlertDialogTitle>
				</AlertDialogContent>
			</AlertDialog>,
		);
		expect(screen.getByRole("alertdialog").className).toContain(DIALOG_SIZES.lg);
	});

	it("keeps default Cancel and Action styles when composed with asChild", () => {
		render(
			<AlertDialog defaultOpen>
				<AlertDialogContent>
					<AlertDialogCancel asChild>
						<a href="#keep">Keep</a>
					</AlertDialogCancel>
					<AlertDialogAction asChild>
						<a href="#delete">Delete</a>
					</AlertDialogAction>
				</AlertDialogContent>
			</AlertDialog>,
		);
		expect(screen.getByRole("link", { name: "Keep" }).className).toContain("border-basalt-border");
		expect(screen.getByRole("link", { name: "Delete" }).className).toContain(
			"bg-basalt-destructive",
		);
	});
});

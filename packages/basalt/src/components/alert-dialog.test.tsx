import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlertDialog, AlertDialogTrigger } from "./alert-dialog";

describe("AlertDialog", () => {
	it("renders a trigger", () => {
		render(
			<AlertDialog>
				<AlertDialogTrigger>Delete</AlertDialogTrigger>
			</AlertDialog>,
		);
		expect(screen.getByText("Delete")).toBeInTheDocument();
	});
});

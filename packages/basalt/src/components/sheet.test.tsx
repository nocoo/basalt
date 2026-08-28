import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sheet, SheetTrigger } from "./sheet";

describe("Sheet", () => {
	it("renders a trigger", () => {
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
			</Sheet>,
		);
		expect(screen.getByText("Open")).toBeInTheDocument();
	});
});

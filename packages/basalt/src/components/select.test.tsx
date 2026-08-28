import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select, SelectTrigger, SelectValue } from "./select";

describe("Select", () => {
	it("renders a trigger", () => {
		render(
			<Select>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
			</Select>,
		);
		expect(screen.getByRole("combobox", { name: "Version" })).toBeInTheDocument();
	});
});

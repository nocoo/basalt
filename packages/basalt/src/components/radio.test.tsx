import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Radio, RadioGroup } from "./radio";

describe("Radio", () => {
	it("renders options", () => {
		render(
			<RadioGroup defaultValue="a">
				<Radio value="a" aria-label="Alpha" />
				<Radio value="b" aria-label="Beta" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "Beta" })).not.toBeChecked();
	});

	it("can disable an option", () => {
		render(
			<RadioGroup>
				<Radio value="a" aria-label="Alpha" disabled />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "Alpha" })).toBeDisabled();
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";
import { InputGroup } from "./input-group";

describe("InputGroup", () => {
	it("groups controls", () => {
		render(
			<InputGroup>
				<Input aria-label="Query" />
			</InputGroup>,
		);
		expect(screen.getByRole("textbox", { name: "Query" })).toBeInTheDocument();
	});
});

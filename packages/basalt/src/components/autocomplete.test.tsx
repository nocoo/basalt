import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Autocomplete } from "./autocomplete";

describe("Autocomplete", () => {
	it("renders an input", () => {
		render(<Autocomplete items={["Apple"]} placeholder="Search fruits" />);
		expect(screen.getByLabelText("Search fruits")).toBeInTheDocument();
	});
});

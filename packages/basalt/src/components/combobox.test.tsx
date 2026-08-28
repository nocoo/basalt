import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Combobox } from "./combobox";

describe("Combobox", () => {
	it("renders an input", () => {
		render(<Combobox items={["Apple", "Banana"]} placeholder="Search fruits" />);
		expect(screen.getByLabelText("Search fruits")).toBeInTheDocument();
	});
});

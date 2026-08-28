import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Empty } from "./empty";

describe("Empty", () => {
	it("renders the title", () => {
		render(<Empty title="Nothing here" />);
		expect(screen.getByText("Nothing here")).toBeInTheDocument();
	});
});

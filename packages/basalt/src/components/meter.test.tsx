import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./meter";

describe("Meter", () => {
	it("shows the label", () => {
		render(<Meter value={40} label="Usage" />);
		expect(screen.getByText("Usage")).toBeInTheDocument();
	});
});

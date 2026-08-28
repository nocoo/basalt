import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
	it("renders children", () => {
		render(<Toolbar>Tools</Toolbar>);
		expect(screen.getByText("Tools")).toBeInTheDocument();
	});
});

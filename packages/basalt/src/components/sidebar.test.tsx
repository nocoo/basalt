import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
	it("renders children", () => {
		render(<Sidebar>Nav</Sidebar>);
		expect(screen.getByText("Nav")).toBeInTheDocument();
	});
});

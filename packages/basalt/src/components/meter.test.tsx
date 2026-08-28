import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Meter } from "./meter";

describe("Meter", () => {
	it("shows the label", () => {
		render(<Meter value={40} label="Usage" />);
		expect(screen.getByText("Usage")).toBeInTheDocument();
		expect(screen.getByText("40%")).toBeInTheDocument();
	});

	it("accepts a custom value label", () => {
		render(<Meter value={12} customValue="12 GB" />);
		expect(screen.getByText("12 GB")).toBeInTheDocument();
	});

	it("renders without captions", () => {
		const { container } = render(<Meter value={8} />);
		expect(container.querySelector("[data-state]")).toBeTruthy();
	});

	it("can hide the value", () => {
		render(<Meter value={40} label="Usage" hideValue />);
		expect(screen.getByText("Usage")).toBeInTheDocument();
		expect(screen.queryByText("40%")).not.toBeInTheDocument();
	});
});

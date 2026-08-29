import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "./loader";

describe("Loader", () => {
	it("exposes a loading label", () => {
		render(<Loader />);
		expect(screen.getByLabelText("Loading")).toBeInTheDocument();
	});

	it("defaults to 24px", () => {
		render(<Loader />);
		expect(screen.getByLabelText("Loading")).toHaveAttribute("width", "24");
	});

	it("accepts a custom size", () => {
		render(<Loader size={32} />);
		expect(screen.getByLabelText("Loading")).toHaveAttribute("width", "32");
	});

	it("paints a gradient arc and variable spin", () => {
		const { container } = render(<Loader />);
		expect(container.querySelector("linearGradient")).toBeTruthy();
		expect(screen.getByLabelText("Loading").getAttribute("class")).toContain(
			"animate-basalt-loader",
		);
	});
});

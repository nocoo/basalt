import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "./loader";

describe("Loader", () => {
	it("exposes a loading label", () => {
		render(<Loader />);
		expect(screen.getByLabelText("Loading")).toBeInTheDocument();
	});

	it("accepts a custom size", () => {
		render(<Loader size={32} />);
		expect(screen.getByLabelText("Loading")).toHaveAttribute("width", "32");
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BasaltMark } from "./basalt-mark";

describe("BasaltMark", () => {
	it("labels the mark", () => {
		render(<BasaltMark />);
		expect(screen.getByLabelText("Basalt")).toBeInTheDocument();
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loader } from "./loader";

describe("Loader", () => {
	it("exposes a loading label", () => {
		render(<Loader />);
		expect(screen.getByLabelText("Loading")).toBeInTheDocument();
	});
});

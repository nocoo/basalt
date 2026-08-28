import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
	it("renders and associates with a control via htmlFor", () => {
		render(
			<>
				<Label htmlFor="email">Email</Label>
				<input id="email" />
			</>,
		);
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SensitiveInput } from "./sensitive-input";

describe("SensitiveInput", () => {
	it("starts hidden and can reveal", () => {
		render(
			<SensitiveInput
				aria-label="Password"
				revealLabel="Show password"
				hideLabel="Hide password"
			/>,
		);
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
		fireEvent.click(screen.getByRole("button", { name: "Show password" }));
		expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
	});
});

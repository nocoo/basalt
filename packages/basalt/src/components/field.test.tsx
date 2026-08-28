import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./field";
import { Input } from "./input";

describe("Field", () => {
	it("associates a label with its control", () => {
		render(
			<Field label="Email" htmlFor="email">
				<Input id="email" />
			</Field>,
		);
		expect(screen.getByLabelText("Email")).toBeInTheDocument();
	});

	it("shows hint copy", () => {
		render(
			<Field label="Email" htmlFor="email-hint" hint="Never shared">
				<Input id="email-hint" />
			</Field>,
		);
		expect(screen.getByText("Never shared")).toBeInTheDocument();
	});

	it("shows an error", () => {
		render(
			<Field label="Email" htmlFor="email" error="Required">
				<Input id="email" />
			</Field>,
		);
		expect(screen.getByRole("alert")).toHaveTextContent("Required");
	});
});

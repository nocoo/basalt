import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, type FieldProps } from "./field";
import { Input } from "./input";

function acceptFieldProps(_props: FieldProps) {}

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

	it("renders non-element children without htmlFor", () => {
		render(<Field label="Note">plain</Field>);
		expect(screen.getByText("plain")).toBeInTheDocument();
	});

	it("merges caller described-by ids with hint and error", () => {
		render(
			<>
				<p id="extra">Company domain</p>
				<Field label="Email" htmlFor="email-merge" hint="Never shared">
					<Input id="email-merge" aria-describedby="extra" />
				</Field>
			</>,
		);
		expect(screen.getByLabelText("Email")).toHaveAttribute(
			"aria-describedby",
			"email-merge-hint extra",
		);
	});

	it("accepts required and optional Field props and rejects missing or wrong types", () => {
		acceptFieldProps({ label: "Email", children: <Input /> });
		acceptFieldProps({
			label: "Email",
			htmlFor: "email",
			hint: "Never shared",
			error: "Required",
			className: "extra",
			children: "plain",
		});
		// @ts-expect-error label is required
		acceptFieldProps({ children: "plain" });
		// @ts-expect-error children is required
		acceptFieldProps({ label: "Email" });
		// @ts-expect-error label must be a string
		acceptFieldProps({ label: 1, children: "plain" });
		// @ts-expect-error className must be a string
		acceptFieldProps({ label: "Email", className: 1, children: "plain" });
	});

	it("merges className and prefers error over hint while merging caller described-by", () => {
		render(
			<>
				<p id="extra">Company domain</p>
				<Field
					label="Email"
					htmlFor="email-error-merge"
					hint="Never shared"
					error="Required"
					className="extra"
				>
					<Input id="email-error-merge" aria-describedby="extra" aria-invalid="false" />
				</Field>
			</>,
		);
		expect(screen.getByText("Email").parentElement).toHaveClass(
			"flex",
			"flex-col",
			"gap-1.5",
			"extra",
		);
		const input = screen.getByLabelText("Email");
		expect(input).toHaveAttribute("aria-describedby", "email-error-merge-error extra");
		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(screen.getByRole("alert")).toHaveTextContent("Required");
		expect(screen.queryByText("Never shared")).not.toBeInTheDocument();
	});
});

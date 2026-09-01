import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field, type FieldError, type FieldProps } from "./field";
import { Input } from "./input";

function acceptFieldProps(_props: FieldProps) {}
function acceptFieldError(_error: FieldError) {}

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
		expect(document.querySelector("label[for]")).toBeNull();
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
			label: <span>Email</span>,
			htmlFor: "email",
			hint: <span>Never shared</span>,
			error: { message: <strong>Required</strong> },
			required: false,
			labelTooltip: "Used in billing",
			className: "extra",
			id: "root",
			children: "plain",
		});
		acceptFieldProps({ label: "Email", error: "Required", children: "plain" });
		acceptFieldError("Required");
		acceptFieldError({ message: <span>Required</span> });
		// @ts-expect-error label is required
		acceptFieldProps({ children: "plain" });
		// @ts-expect-error children is required
		acceptFieldProps({ label: "Email" });
		// @ts-expect-error className must be a string
		acceptFieldProps({ label: "Email", className: 1, children: "plain" });
		// @ts-expect-error required must be boolean
		acceptFieldProps({ label: "Email", required: "yes", children: "plain" });
		// @ts-expect-error error must be FieldError
		acceptFieldProps({ label: "Email", error: { nope: true }, children: "plain" });
		// @ts-expect-error labelTooltip must be ReactNode
		acceptFieldProps({ label: "Email", labelTooltip: { nope: true }, children: "plain" });
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

	it("uses the child's existing id when htmlFor is omitted", () => {
		render(
			<Field label="Email">
				<Input id="child-email" />
			</Field>,
		);
		const input = screen.getByLabelText("Email");
		expect(input).toHaveAttribute("id", "child-email");
		expect(document.querySelector('label[for="child-email"]')).toHaveTextContent("Email");
	});

	it("generates a control id when htmlFor and child id are omitted", () => {
		render(
			<Field label="Email" hint="Never shared">
				<Input />
			</Field>,
		);
		const input = screen.getByLabelText("Email");
		const id = input.getAttribute("id");
		expect(id).toBeTruthy();
		expect(document.querySelector(`label[for="${id}"]`)).toHaveTextContent("Email");
		expect(input).toHaveAttribute("aria-describedby", `${id}-hint`);
		expect(document.getElementById(`${id}-hint`)).toHaveTextContent("Never shared");
	});

	it("prefers explicit htmlFor over the child's existing id", () => {
		render(
			<Field label="Email" htmlFor="explicit-email">
				<Input id="other-email" />
			</Field>,
		);
		expect(screen.getByLabelText("Email")).toHaveAttribute("id", "explicit-email");
		expect(document.querySelector('label[for="explicit-email"]')).toHaveTextContent("Email");
	});

	it("renders a ReactNode error without treating it as structured", () => {
		render(
			<Field label="Email" error={<span>Must be unique</span>}>
				<Input />
			</Field>,
		);
		expect(screen.getByRole("alert")).toHaveTextContent("Must be unique");
	});

	it("treats direct and structured absent or falsy messages as no error", () => {
		const cases: Array<FieldError | undefined> = [
			undefined,
			"",
			{ message: "" },
			0,
			{ message: 0 },
			null,
			{ message: null },
			{ message: undefined },
		];
		for (const error of cases) {
			const { unmount } = render(
				<Field label="Email" htmlFor="email-falsy" hint="Never shared" error={error}>
					<Input id="email-falsy" />
				</Field>,
			);
			const input = screen.getByLabelText("Email");
			expect(input).not.toHaveAttribute("aria-invalid", "true");
			expect(input).toHaveAttribute("aria-describedby", "email-falsy-hint");
			expect(screen.getByText("Never shared")).toBeInTheDocument();
			expect(screen.queryByRole("alert")).not.toBeInTheDocument();
			unmount();
		}
	});

	it("treats structured error messages like string errors", () => {
		render(
			<Field label="Email" error={{ message: <span>Enter a valid email</span> }}>
				<Input />
			</Field>,
		);
		const input = screen.getByLabelText("Email");
		const id = input.getAttribute("id");
		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(input).toHaveAttribute("aria-describedby", `${id}-error`);
		expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email");
		expect(screen.getByRole("alert")).toHaveAttribute("id", `${id}-error`);
	});

	it("keeps the child's aria-invalid when there is no error", () => {
		render(
			<Field label="Email" htmlFor="email-invalid">
				<Input id="email-invalid" aria-invalid="true" />
			</Field>,
		);
		expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
	});

	it("renders ReactNode label and hint, optional marker, and label tooltip", () => {
		render(
			<Field
				label={<span>Workspace name</span>}
				hint={<span>Shown on invoices</span>}
				required={false}
				labelTooltip="Used in billing"
			>
				<Input />
			</Field>,
		);
		const input = document.querySelector("input");
		expect(input).toBeTruthy();
		const id = input?.getAttribute("id");
		expect(id).toBeTruthy();
		expect(document.querySelector(`label[for="${id}"]`)).toHaveTextContent("Workspace name");
		expect(screen.getByText("Shown on invoices")).toBeInTheDocument();
		expect(screen.getByText("(optional)")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "More information" })).toBeInTheDocument();
	});

	it("does not show the optional marker when required is true or omitted", () => {
		const { rerender } = render(
			<Field label="Email" required>
				<Input />
			</Field>,
		);
		expect(screen.queryByText("(optional)")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Email")).not.toHaveAttribute("required");
		rerender(
			<Field label="Email">
				<Input />
			</Field>,
		);
		expect(screen.queryByText("(optional)")).not.toBeInTheDocument();
	});

	it("forwards root ref, html attributes, events, and className", () => {
		const ref = createRef<HTMLDivElement>();
		const onClick = vi.fn();
		render(
			<Field
				ref={ref}
				label="Email"
				id="field-root"
				data-test="root"
				style={{ marginTop: 8 }}
				onClick={onClick}
				className="extra"
			>
				<Input />
			</Field>,
		);
		expect(ref.current).toHaveAttribute("id", "field-root");
		expect(ref.current).toHaveAttribute("data-test", "root");
		expect(ref.current).toHaveClass("flex", "flex-col", "gap-1.5", "extra");
		expect(ref.current).toHaveStyle({ marginTop: "8px" });
		fireEvent.click(ref.current as HTMLDivElement);
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

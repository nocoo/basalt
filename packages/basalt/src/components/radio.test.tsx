import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Radio, RadioGroup, type RadioProps } from "./radio";

function acceptRadioProps(_props: RadioProps) {}

describe("Radio", () => {
	it("renders options", () => {
		render(
			<RadioGroup defaultValue="a">
				<Radio value="a" aria-label="Alpha" />
				<Radio value="b" aria-label="Beta" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "Beta" })).not.toBeChecked();
	});

	it("can disable an option", () => {
		render(
			<RadioGroup>
				<Radio value="a" aria-label="Alpha" disabled />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "Alpha" })).toBeDisabled();
	});

	it("accepts required string value and inherited attributes, and rejects illegal values", () => {
		acceptRadioProps({ value: "a" });
		acceptRadioProps({
			value: "a",
			disabled: true,
			required: true,
			form: "signup",
			asChild: false,
			className: "extra",
			id: "alpha",
			"aria-label": "Alpha",
			"aria-describedby": "hint",
		});
		// @ts-expect-error value is required
		acceptRadioProps({});
		// @ts-expect-error value must be a string
		acceptRadioProps({ value: 1 });
		// @ts-expect-error value must be a string
		acceptRadioProps({ value: {} });
	});

	it("forwards ref, id, data, and className", () => {
		const ref = createRef<HTMLButtonElement>();
		render(
			<RadioGroup defaultValue="a">
				<Radio
					ref={ref}
					value="a"
					id="alpha"
					className="extra"
					aria-label="Alpha"
					data-example="yes"
				/>
			</RadioGroup>,
		);
		const item = screen.getByRole("radio", { name: "Alpha" });
		expect(item.tagName).toBe("BUTTON");
		expect(ref.current).toBe(item);
		expect(item).toHaveAttribute("id", "alpha");
		expect(item).toHaveAttribute("data-example", "yes");
		expect(item.className).toContain("extra");
		expect(item.className).toContain("rounded-full");
		expect(item).not.toHaveAttribute("form");
	});

	it("selects options exclusively", () => {
		render(
			<RadioGroup defaultValue="a">
				<Radio value="a" aria-label="Alpha" />
				<Radio value="b" aria-label="Beta" />
			</RadioGroup>,
		);
		const alpha = screen.getByRole("radio", { name: "Alpha" });
		const beta = screen.getByRole("radio", { name: "Beta" });
		expect(alpha).toBeChecked();
		expect(beta).not.toBeChecked();
		fireEvent.click(beta);
		expect(beta).toBeChecked();
		expect(alpha).not.toBeChecked();
	});
});

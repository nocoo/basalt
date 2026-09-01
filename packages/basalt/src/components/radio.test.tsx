import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	Radio,
	RadioGroup,
	type RadioGroupProps,
	type RadioLegendProps,
	type RadioProps,
} from "./radio";

function acceptRadioProps(_props: RadioProps) {}
function acceptRadioGroupProps(_props: RadioGroupProps) {}
function acceptRadioLegendProps(_props: RadioLegendProps) {}

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

	it("applies named sizes and keeps the default class", () => {
		render(
			<RadioGroup defaultValue="a">
				<Radio value="a" aria-label="Default size" />
				<Radio value="b" size="sm" aria-label="Small" />
			</RadioGroup>,
		);
		expect(screen.getByRole("radio", { name: "Default size" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-4", "w-4"]),
		);
		expect(screen.getByRole("radio", { name: "Small" }).className.split(/\s+/)).toEqual(
			expect.arrayContaining(["h-3", "w-3"]),
		);
	});

	it("keeps a controlled group value, legend, and error", () => {
		const onValueChange = vi.fn();
		render(
			<Radio.Group value="a" onValueChange={onValueChange} error="Pick one" aria-describedby="hint">
				<Radio.Legend>Plan</Radio.Legend>
				<Radio.Item value="a" aria-label="Alpha" />
				<Radio.Item value="b" aria-label="Beta" />
			</Radio.Group>,
		);
		expect(screen.getByRole("group", { name: "Plan" }).tagName).toBe("FIELDSET");
		const radiogroup = screen.getByRole("radiogroup", { name: "Plan" });
		const alert = screen.getByRole("alert");
		expect(alert).toHaveTextContent("Pick one");
		expect(radiogroup).toHaveAttribute("aria-invalid", "true");
		expect(radiogroup).toHaveAttribute("aria-describedby", `${alert.id} hint`);
		expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
		fireEvent.click(screen.getByRole("radio", { name: "Beta" }));
		expect(onValueChange).toHaveBeenCalledWith("b");
		expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked();
	});

	it("accepts group and legend props and rejects illegal values", () => {
		acceptRadioProps({ value: "a", size: "sm" });
		acceptRadioGroupProps({ value: "a", error: "Required", disabled: true });
		acceptRadioLegendProps({ children: "Plan" });
		// @ts-expect-error size must be sm or default
		acceptRadioProps({ value: "a", size: "lg" });
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

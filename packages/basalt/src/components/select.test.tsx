import * as SelectPrimitive from "@radix-ui/react-select";
import { fireEvent, render, screen } from "@testing-library/react";
import { type ComponentPropsWithoutRef, type ComponentPropsWithRef, createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { CONTROL_SURFACE_CLASS } from "../utils/control-surface";
import {
	Select,
	SelectContent,
	type SelectContentProps,
	SelectGroup,
	type SelectGroupProps,
	SelectItem,
	type SelectItemProps,
	type SelectProps,
	SelectTrigger,
	type SelectTriggerProps,
	SelectValue,
	type SelectValueProps,
} from "./select";

function acceptSelectProps(_props: SelectProps) {}
function acceptSelectComponent(_props: ComponentPropsWithoutRef<typeof Select>) {}
function acceptTriggerProps(_props: SelectTriggerProps) {}
function acceptValueProps(_props: SelectValueProps) {}
function acceptValueComponent(_props: ComponentPropsWithRef<typeof SelectValue>) {}
function acceptContentProps(_props: SelectContentProps) {}
function acceptGroupProps(_props: SelectGroupProps) {}
function acceptGroupComponent(_props: ComponentPropsWithRef<typeof SelectGroup>) {}
function acceptItemProps(_props: SelectItemProps) {}

describe("Select", () => {
	it("renders a trigger", () => {
		render(
			<Select>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
			</Select>,
		);
		const trigger = screen.getByRole("combobox", { name: "Version" });
		expect(trigger).toBeInTheDocument();
		expect(trigger.className.split(/\s+/)).toEqual(
			expect.arrayContaining(CONTROL_SURFACE_CLASS.split(/\s+/)),
		);
		expect(trigger.className.split(/\s+/)).toEqual(expect.arrayContaining(["h-9", "px-3"]));
	});

	it("opens the list below the trigger", () => {
		render(
			<Select defaultOpen>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All deployed versions</SelectItem>
					<SelectItem value="active">Active versions</SelectItem>
				</SelectContent>
			</Select>,
		);
		const list = screen.getByRole("listbox");
		expect(list).toHaveAttribute("data-side", "bottom");
		expect(list.className).toContain("py-1.5");
		const first = screen.getByRole("option", { name: "All deployed versions" });
		expect(first.className).toContain("mx-1.5");
		expect(first.className).toContain("hover:bg-basalt-accent");
		expect(first.className).toContain("focus-visible:bg-basalt-accent");
		expect(first.className).not.toContain("focus:bg-basalt-accent");
	});

	it("keeps a closed trigger from covering the page", () => {
		render(
			<Select>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All deployed versions</SelectItem>
				</SelectContent>
			</Select>,
		);
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("combobox", { name: "Version" }));
		expect(screen.getByRole("listbox")).toHaveAttribute("data-side", "bottom");
	});

	it("keeps Root, Value, and Group as the same primitive references", () => {
		expect(Select).toBe(SelectPrimitive.Root);
		expect(SelectValue).toBe(SelectPrimitive.Value);
		expect(SelectGroup).toBe(SelectPrimitive.Group);
	});

	it("accepts named props types and rejects illegal values", () => {
		acceptSelectProps({ value: "1" });
		acceptSelectComponent({ value: "1" });
		acceptSelectProps({
			defaultValue: "1",
			onValueChange: () => undefined,
			open: false,
			defaultOpen: true,
			disabled: true,
			name: "version",
			required: true,
			form: "signup",
		});
		acceptSelectComponent({
			defaultValue: "1",
			onValueChange: () => undefined,
			open: false,
			defaultOpen: true,
			disabled: true,
			name: "version",
			required: true,
			form: "signup",
		});
		acceptTriggerProps({ className: "extra", id: "trigger", "aria-label": "Version" });
		acceptValueProps({ placeholder: "Select version" });
		acceptValueProps({ placeholder: <span>Choose</span> });
		acceptValueComponent({
			placeholder: "Select version",
			className: "value",
			id: "value",
			ref: createRef<HTMLSpanElement>(),
		});
		acceptContentProps({ position: "popper", sideOffset: 4 });
		acceptContentProps({ position: "item-aligned" });
		acceptGroupProps({ className: "group", id: "group" });
		acceptGroupComponent({
			className: "group",
			id: "group",
			ref: createRef<HTMLDivElement>(),
		});
		acceptItemProps({ value: "1" });
		acceptItemProps({
			value: "1",
			disabled: true,
			textValue: "v1",
			className: "extra",
			"aria-label": "v1",
		});
		// @ts-expect-error value must be a string
		acceptSelectProps({ value: 1 });
		// @ts-expect-error value must be a string
		acceptSelectComponent({ value: 1 });
		// @ts-expect-error value must be a string
		acceptSelectProps({ value: {} });
		// @ts-expect-error value must be a string
		acceptSelectComponent({ value: {} });
		// @ts-expect-error position must be item-aligned or popper
		acceptContentProps({ position: "top" });
		// @ts-expect-error sideOffset must be a number
		acceptContentProps({ sideOffset: "4" });
		// @ts-expect-error value is required
		acceptItemProps({});
		// @ts-expect-error value must be a string
		acceptItemProps({ value: 1 });
		// @ts-expect-error value must be a string
		acceptItemProps({ value: {} });
	});

	it("forwards value and group refs and inherited attributes", () => {
		const valueRef = createRef<HTMLSpanElement>();
		const groupRef = createRef<HTMLDivElement>();
		render(
			<Select defaultOpen>
				<SelectTrigger aria-label="Version">
					<SelectValue ref={valueRef} id="select-value" placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup ref={groupRef} className="group-extra" id="version-group">
						<SelectItem value="1">v1</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>,
		);
		expect(valueRef.current).toBeInstanceOf(HTMLSpanElement);
		expect(valueRef.current).toHaveAttribute("id", "select-value");
		expect(groupRef.current).toBeInstanceOf(HTMLDivElement);
		expect(groupRef.current).toHaveClass("group-extra");
		expect(groupRef.current).toHaveAttribute("id", "version-group");
	});

	it("forwards trigger ref and className", () => {
		const ref = createRef<HTMLButtonElement>();
		render(
			<Select>
				<SelectTrigger ref={ref} className="extra" aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
			</Select>,
		);
		const trigger = screen.getByRole("combobox", { name: "Version" });
		expect(trigger.tagName).toBe("BUTTON");
		expect(ref.current).toBe(trigger);
		expect(trigger.className).toContain("extra");
		expect(trigger.className).toContain("h-9");
	});

	it("selects an uncontrolled value and reports a controlled next value", () => {
		render(
			<Select defaultValue="1">
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="1">v1</SelectItem>
					<SelectItem value="2">v2</SelectItem>
				</SelectContent>
			</Select>,
		);
		const trigger = screen.getByRole("combobox", { name: "Version" });
		expect(trigger).toHaveTextContent("v1");
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("option", { name: "v2" }));
		expect(trigger).toHaveTextContent("v2");
	});

	it("keeps a controlled value and reports the next selection", () => {
		const onValueChange = vi.fn();
		render(
			<Select value="1" onValueChange={onValueChange}>
				<SelectTrigger aria-label="Version">
					<SelectValue placeholder="Select version" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="1">v1</SelectItem>
					<SelectItem value="2">v2</SelectItem>
				</SelectContent>
			</Select>,
		);
		const trigger = screen.getByRole("combobox", { name: "Version" });
		expect(trigger).toHaveTextContent("v1");
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole("option", { name: "v2" }));
		expect(trigger).toHaveTextContent("v1");
		expect(onValueChange).toHaveBeenCalledWith("2");
	});

	it("keeps a disabled item from becoming the value", () => {
		render(
			<Select>
				<SelectTrigger aria-label="Disabled option">
					<SelectValue placeholder="Choose…" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">Alpha</SelectItem>
					<SelectItem value="b" disabled>
						Beta
					</SelectItem>
				</SelectContent>
			</Select>,
		);
		const trigger = screen.getByRole("combobox", { name: "Disabled option" });
		fireEvent.click(trigger);
		const beta = screen.getByRole("option", { name: "Beta" });
		expect(beta).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(beta);
		expect(trigger).toHaveTextContent("Choose…");
	});
});

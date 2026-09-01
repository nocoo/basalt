import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentControl } from "./segment-control";

const OPTIONS = [
	{ value: "ready", label: "Ready" },
	{ value: "planned", label: "Planned" },
] as const;

describe("SegmentControl", () => {
	it("renders a labelled fieldset and radiogroup with a leading All segment", () => {
		render(
			<SegmentControl
				legend="Status"
				value="all"
				onValueChange={() => {}}
				allOption={{ value: "all" }}
				options={OPTIONS}
			/>,
		);

		const group = screen.getByRole("radiogroup", { name: "Status" });
		expect(group.closest("fieldset")).toBe(screen.getByRole("group", { name: "Status" }));
		expect(screen.getAllByRole("radio").map((item) => item.textContent)).toEqual([
			"All",
			"Ready",
			"Planned",
		]);
		expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("data-state", "on");
	});

	it("keeps selection controlled and does not emit an empty value", () => {
		const onValueChange = vi.fn();
		function Example() {
			const [value, setValue] = useState("ready");
			return (
				<SegmentControl
					legend="Status"
					value={value}
					onValueChange={(nextValue) => {
						onValueChange(nextValue);
						setValue(nextValue);
					}}
					options={OPTIONS}
				/>
			);
		}
		render(<Example />);

		fireEvent.click(screen.getByRole("radio", { name: "Planned" }));
		expect(onValueChange).toHaveBeenLastCalledWith("planned");
		expect(screen.getByRole("radio", { name: "Planned" })).toHaveAttribute("data-state", "on");
		fireEvent.click(screen.getByRole("radio", { name: "Planned" }));
		expect(onValueChange).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("radio", { name: "Planned" })).toHaveAttribute("data-state", "on");
	});

	it("supports a custom All label and isolated item disabling", () => {
		const onValueChange = vi.fn();
		render(
			<SegmentControl
				legend="Availability"
				value="all"
				onValueChange={onValueChange}
				allOption={{ value: "all", label: "Everything" }}
				options={[
					{ value: "active", label: "Active" },
					{ value: "archived", label: "Archived", disabled: true },
				]}
			/>,
		);

		expect(screen.getByRole("radio", { name: "Everything" })).toBeEnabled();
		expect(screen.getByRole("radio", { name: "Archived" })).toBeDisabled();
		fireEvent.click(screen.getByRole("radio", { name: "Archived" }));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it("disables the fieldset and every segment", () => {
		render(
			<SegmentControl
				disabled
				legend="Status"
				value="ready"
				onValueChange={() => {}}
				options={OPTIONS}
			/>,
		);

		expect(screen.getByRole("group", { name: "Status" })).toBeDisabled();
		for (const item of screen.getAllByRole("radio")) {
			expect(item).toBeDisabled();
		}
	});

	it("keeps a one-line content-width track inside a native overflow viewport", () => {
		const ref = createRef<HTMLFieldSetElement>();
		const { container } = render(
			<SegmentControl
				ref={ref}
				legend="Long range"
				value="one"
				onValueChange={() => {}}
				options={[{ value: "one", label: "One" }]}
				className="max-w-40"
				data-testid="segments"
			/>,
		);

		const viewport = container.querySelector('[data-slot="segment-control-viewport"]');
		expect(ref.current).toBe(screen.getByTestId("segments"));
		expect(ref.current?.className).toContain("max-w-40");
		expect(viewport?.className).toContain("overflow-x-auto");
		expect(screen.getByRole("radiogroup").className).toContain("w-max");
	});
});

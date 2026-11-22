import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentControl } from "./segment-control";

const OPTIONS = [
	{ value: "ready", label: "Ready" },
	{ value: "planned", label: "Planned" },
] as const;

describe("SegmentControl", () => {
	it("omits the legend element by default when legend is not provided", () => {
		const { container } = render(
			<SegmentControl
				aria-label="Filter status"
				value="ready"
				onValueChange={() => {}}
				options={OPTIONS}
			/>,
		);

		expect(container.querySelector("legend")).toBeNull();
		const group = screen.getByRole("radiogroup", { name: "Filter status" });
		expect(group).not.toHaveAttribute("aria-labelledby");
		expect(screen.getByRole("group", { name: "Filter status" })).toBeInTheDocument();
	});

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
		expect(viewport?.className).toContain("p-basalt-space-sm");
		expect(viewport?.className).toContain("scroll-p-basalt-space-sm");
		const group = screen.getByRole("radiogroup");
		expect(group.className).toContain("w-max");
		expect(group).toHaveClass("gap-basalt-space-xs", "p-basalt-space-xs");
		for (const item of screen.getAllByRole("radio")) {
			expect(item).toHaveClass("basalt-action-sm");
		}
		expect(ref.current).toHaveAttribute("data-slot", "segment-control");
	});

	it("supports uncontrolled state via defaultValue or leading fallback and notifies onValueChange", () => {
		const onValueChange = vi.fn();
		render(
			<SegmentControl
				aria-label="Period"
				defaultValue="planned"
				onValueChange={onValueChange}
				options={OPTIONS}
			/>,
		);
		expect(screen.getByRole("radio", { name: "Planned" })).toHaveAttribute("aria-checked", "true");
		fireEvent.click(screen.getByRole("radio", { name: "Ready" }));
		expect(screen.getByRole("radio", { name: "Ready" })).toHaveAttribute("aria-checked", "true");
		expect(onValueChange).toHaveBeenCalledWith("ready");

		render(<SegmentControl aria-label="Fallback" allOption={{ value: "all" }} options={OPTIONS} />);
		expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
	});
});

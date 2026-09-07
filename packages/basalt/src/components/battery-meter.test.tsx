import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BatteryMeter } from "./battery-meter";

describe("BatteryMeter", () => {
	it.each([0, 14, 42, 94, 100])("exposes a named native reading for %s percent", (value) => {
		render(<BatteryMeter value={value} label="Sensor battery" />);
		expect(screen.getByRole("meter", { name: "Sensor battery, discharging" })).toHaveAttribute(
			"value",
			String(value),
		);
		expect(screen.getByText(`${value}%`)).toBeVisible();
	});
	it("clamps measurements and supports charging, attributes and class names", () => {
		const { rerender } = render(
			<BatteryMeter
				value={120}
				label="Gateway"
				status="charging"
				className="custom"
				data-testid="battery"
			/>,
		);
		expect(screen.getByRole("meter")).toHaveAttribute("value", "100");
		expect(screen.getByText("Charging")).toBeVisible();
		expect(screen.getByTestId("battery")).toHaveClass("custom");
		rerender(<BatteryMeter value={-8} label="Gateway" />);
		expect(screen.getByRole("meter")).toHaveAttribute("value", "0");
	});
	it("distinguishes unavailable devices from an empty battery", () => {
		const { rerender } = render(<BatteryMeter value={0} label="Relay" status="offline" />);
		expect(screen.queryByRole("meter")).not.toBeInTheDocument();
		expect(screen.getByText("Relay: unavailable")).toBeInTheDocument();
		rerender(<BatteryMeter value={Number.NaN} label="Relay" />);
		expect(screen.queryByRole("meter")).not.toBeInTheDocument();
		expect(screen.getByText("Offline")).toBeVisible();
	});
});

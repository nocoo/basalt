import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTableShowcaseViewModel } from "@/viewmodels/useTableShowcaseViewModel";

describe("useTableShowcaseViewModel", () => {
	it("filters the dense pipeline by owner and stage", () => {
		const { result } = renderHook(() => useTableShowcaseViewModel());
		expect(result.current.companies).toHaveLength(12);
		expect(result.current.selected).toEqual(["summit"]);
		act(() => result.current.setOwner("Sarah Nguyen"));
		expect(result.current.companies.map((row) => row.name)).toEqual(["Atlas"]);
		act(() => result.current.setOwner("all"));
		act(() => result.current.setStage("Pilot"));
		expect(result.current.companies.map((row) => row.name)).toEqual(["Orbit"]);
	});

	it("switches table bodies without dropping shared filters", () => {
		const { result } = renderHook(() => useTableShowcaseViewModel());
		act(() => result.current.setStage("Upsell"));
		expect(result.current.tab).toBe("companies");
		act(() => result.current.setTab("deals"));
		expect(result.current.deals.every((row) => row.stage === "Upsell")).toBe(true);
		act(() => result.current.setTab("forecast"));
		expect(result.current.forecast.map((row) => row.stage)).toEqual(["Upsell"]);
	});

	it("filters the fleet independently of the pipeline", () => {
		const { result } = renderHook(() => useTableShowcaseViewModel());
		act(() => result.current.setDeviceStatus("Warning"));
		expect(result.current.devices.map((row) => row.name)).toEqual(["Meridian sensor"]);
		expect(result.current.companies).toHaveLength(12);
	});
});

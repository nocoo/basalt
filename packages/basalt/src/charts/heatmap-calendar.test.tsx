import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeatmapCalendar, heatmapColorScales } from "./heatmap-calendar";

describe("HeatmapCalendar", () => {
	it("renders a compact values grid", () => {
		render(<HeatmapCalendar values={[1, 2, 3]} ariaLabel="Heat" />);
		expect(screen.getByRole("img", { name: "Heat" })).toBeInTheDocument();
	});

	it("renders a year calendar from caller data", () => {
		render(
			<HeatmapCalendar
				data={[
					{ date: "2026-01-01", value: 4 },
					{ date: "2026-01-02", value: 8 },
				]}
				year={2026}
				colorScale={heatmapColorScales.blue}
				metricLabel="Sessions"
				ariaLabel="Year heat"
			/>,
		);
		expect(screen.getByRole("img", { name: "Year heat" })).toBeInTheDocument();
	});
});

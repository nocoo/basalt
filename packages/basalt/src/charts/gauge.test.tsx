import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { cloneElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Gauge } from "./gauge";

vi.mock("recharts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("recharts")>();
	return {
		...actual,
		ResponsiveContainer: ({
			children,
		}: {
			children: React.ReactElement<{ width?: number; height?: number }>;
		}) => {
			return (
				<div data-testid="mock-responsive-container">
					{cloneElement(children, {
						width: 144,
						height: 144,
					})}
				</div>
			);
		},
	};
});

describe("Gauge options", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders value and default ariaLabel='Gauge' when ariaLabel is omitted", () => {
		render(<Gauge value={75} />);
		expect(screen.getByRole("group", { name: "Gauge" })).toBeInTheDocument();
		expect(screen.getByText("75")).toBeInTheDocument();
	});

	it("supports hideValue=true omitting center display", () => {
		render(<Gauge value={50} ariaLabel="Hidden" hideValue />);
		expect(screen.getByRole("group", { name: "Hidden" })).toBeInTheDocument();
		expect(screen.queryByText("50")).toBeNull();
	});

	it("supports custom valueFormatter", () => {
		render(<Gauge value={80} valueFormatter={(v) => `${v} km/h`} ariaLabel="Speedo" />);
		expect(screen.getByText("80 km/h")).toBeInTheDocument();
	});

	it("supports summary string and connects aria-describedby on the svg chart", () => {
		const { container } = render(
			<Gauge
				value={90}
				max={100}
				ariaLabel="Battery"
				summary="Battery level is optimal at 90 percent."
			/>,
		);
		const summaryEl = screen.getByText("Battery level is optimal at 90 percent.");
		expect(summaryEl).toBeInTheDocument();
		const summaryId = summaryEl.getAttribute("id");
		expect(summaryId).toBeTruthy();

		// Svg radial bar chart receives aria-describedby
		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).toHaveAttribute("aria-describedby", summaryId);
	});

	it("omits summary when null, false, or undefined, but preserves numeric 0", () => {
		const { container, rerender } = render(
			<Gauge value={90} max={100} ariaLabel="Battery" summary={false} />,
		);
		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).not.toHaveAttribute("aria-describedby");

		rerender(<Gauge value={90} max={100} ariaLabel="Battery" summary={null} />);
		expect(svg).not.toHaveAttribute("aria-describedby");

		rerender(<Gauge value={90} max={100} ariaLabel="Battery" summary={undefined} />);
		expect(svg).not.toHaveAttribute("aria-describedby");

		// Numeric 0 is preserved
		rerender(<Gauge value={90} max={100} ariaLabel="Battery" summary={0} />);
		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("supports dataAlternative and handles false, null, undefined, and 0 slots with content disappearance checks", () => {
		const { container, rerender } = render(
			<Gauge
				value={45}
				max={100}
				ariaLabel="Storage"
				summary="Storage space usage"
				dataAlternative={<span data-testid="gauge-alt">45 of 100 GB used</span>}
			/>,
		);
		expect(screen.getByText("Storage space usage")).toBeInTheDocument();
		expect(screen.getByTestId("gauge-alt")).toHaveTextContent("45 of 100 GB used");

		// Only dataAlternative without summary
		rerender(
			<Gauge
				value={45}
				max={100}
				ariaLabel="Storage"
				dataAlternative={<span data-testid="gauge-alt-only">Alternate only</span>}
			/>,
		);
		expect(screen.getByTestId("gauge-alt-only")).toHaveTextContent("Alternate only");
		expect(screen.queryByText("Storage space usage")).toBeNull();

		// dataAlternative slot with 0
		rerender(<Gauge value={45} max={100} ariaLabel="Storage" dataAlternative={0} />);
		expect(screen.getByText("0")).toBeInTheDocument();
		expect(screen.queryByTestId("gauge-alt-only")).toBeNull();

		// dataAlternative slot with false: removes previous 0 content and renders bare plot
		rerender(<Gauge value={45} max={100} ariaLabel="Storage" dataAlternative={false} />);
		expect(screen.queryByText("0")).toBeNull();
		expect(screen.queryByTestId("gauge-alt")).toBeNull();
		expect(container.textContent?.trim()).toBe("45");

		// dataAlternative slot with null
		rerender(<Gauge value={45} max={100} ariaLabel="Storage" dataAlternative={null} />);
		expect(container.textContent?.trim()).toBe("45");

		// dataAlternative slot with undefined
		rerender(<Gauge value={45} max={100} ariaLabel="Storage" dataAlternative={undefined} />);
		expect(container.textContent?.trim()).toBe("45");
	});

	it("respects accessibilityLayer=false on ChartFrame", () => {
		const { container } = render(
			<Gauge value={50} ariaLabel="Static" accessibilityLayer={false} />,
		);
		const svg = container.querySelector("svg.recharts-surface");
		expect(svg).toBeInTheDocument();
		expect(svg?.getAttribute("role")).toBeNull();
		expect(svg?.getAttribute("tabindex")).toBeNull();
	});

	it("clamps percent to 0 when max=0 or negative, caps at 100, and verifies completed animation arc path", async () => {
		vi.useFakeTimers({
			toFake: [
				"setTimeout",
				"clearTimeout",
				"requestAnimationFrame",
				"cancelAnimationFrame",
				"performance",
			],
		});

		try {
			// Zero max: percent is 0
			const { container, rerender } = render(<Gauge value={50} max={0} ariaLabel="Zero max" />);
			await act(async () => {
				await vi.advanceTimersByTimeAsync(2000);
			});
			const zeroSector = container.querySelector("path.recharts-radial-bar-sector");
			const zeroPath = zeroSector?.getAttribute("d") ?? "";
			expect(screen.getByText("50")).toBeInTheDocument();

			// Negative value: clamped to 0 -> same arc path d
			rerender(<Gauge value={-50} max={100} ariaLabel="Negative" />);
			await act(async () => {
				await vi.advanceTimersByTimeAsync(2000);
			});
			const negativeSector = container.querySelector("path.recharts-radial-bar-sector");
			const negativePath = negativeSector?.getAttribute("d") ?? "";
			expect(negativePath).toBe(zeroPath);
			expect(screen.getByText("-50")).toBeInTheDocument();

			// Max 100%
			rerender(<Gauge value={100} max={100} ariaLabel="Full max" />);
			await act(async () => {
				await vi.advanceTimersByTimeAsync(2000);
			});
			const fullSector = container.querySelector("path.recharts-radial-bar-sector");
			expect(fullSector).toBeInTheDocument();
			const fullPath = fullSector?.getAttribute("d") ?? "";
			expect(fullPath).toBeTruthy();
			expect(fullPath).not.toBe(zeroPath);
			expect(screen.getByText("100")).toBeInTheDocument();

			// Over max 150%: clamped to 100% -> arc path d matches fullPath
			rerender(<Gauge value={150} max={100} ariaLabel="Over max" />);
			await act(async () => {
				await vi.advanceTimersByTimeAsync(2000);
			});
			const overSector = container.querySelector("path.recharts-radial-bar-sector");
			expect(overSector).toBeInTheDocument();
			const overPath = overSector?.getAttribute("d") ?? "";
			expect(overPath).toBe(fullPath);
			expect(screen.getByText("150")).toBeInTheDocument();
		} finally {
			vi.useRealTimers();
		}
	});

	it("renders background sector and accepts custom series lead color override on completed animation sector", async () => {
		vi.useFakeTimers({
			toFake: [
				"setTimeout",
				"clearTimeout",
				"requestAnimationFrame",
				"cancelAnimationFrame",
				"performance",
			],
		});

		try {
			const { container } = render(
				<Gauge value={60} max={100} series={[{ key: "val", color: "rgb(255, 0, 128)" }]} />,
			);
			const bgSector = container.querySelector(".recharts-radial-bar-background-sector");
			expect(bgSector).toBeInTheDocument();
			expect(bgSector?.getAttribute("d")).toBeTruthy();

			await act(async () => {
				await vi.advanceTimersByTimeAsync(2000);
			});

			const sector = container.querySelector("path.recharts-radial-bar-sector");
			expect(sector).toBeInTheDocument();
			expect(sector).toHaveAttribute("fill", "rgb(255, 0, 128)");
		} finally {
			vi.useRealTimers();
		}
	});
});

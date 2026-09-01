import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { StatStrip } from "./stat-strip";

const ITEMS = [
	{ label: "Projects", value: "24" },
	{ label: "Deploys", value: "128" },
	{ label: "Incidents", value: "3" },
	{ label: "Uptime", value: "99.9%" },
] as const;

describe("StatStrip", () => {
	it("renders a definition list with paired terms and values in order", () => {
		const { container } = render(<StatStrip items={ITEMS} />);

		const list = container.querySelector("dl");
		expect(list).toBeTruthy();
		if (!list) {
			throw new Error("missing definition list");
		}
		expect(list.tagName).toBe("DL");
		expect(list.querySelectorAll("dt").length).toBe(4);
		expect(list.querySelectorAll("dd").length).toBe(4);
		expect([...list.querySelectorAll("dt")].map((item) => item.textContent)).toEqual([
			"Projects",
			"Deploys",
			"Incidents",
			"Uptime",
		]);
		expect([...list.querySelectorAll("dd")].map((item) => item.textContent)).toEqual([
			"24",
			"128",
			"3",
			"99.9%",
		]);
		for (const term of list.querySelectorAll("dt")) {
			expect(term.nextElementSibling?.tagName).toBe("DD");
			expect(term.parentElement?.tagName).toBe("DIV");
		}
	});

	it("accepts ReactNode labels and values, a ref, and standard dl props", () => {
		const ref = createRef<HTMLDListElement>();
		render(
			<StatStrip
				ref={ref}
				id="overview-stats"
				data-testid="stats"
				aria-label="Workspace totals"
				className="mt-4"
				items={[
					{ label: <span>Active</span>, value: <strong>12</strong> },
					{ label: "Queued", value: "4" },
				]}
			/>,
		);

		const list = screen.getByTestId("stats");
		expect(ref.current).toBe(list);
		expect(list).toHaveAttribute("id", "overview-stats");
		expect(list).toHaveAccessibleName("Workspace totals");
		expect(list.className).toContain("mt-4");
		expect(list.className).toContain("grid-cols-2");
		expect(list.className).toContain("md:grid-cols-4");
		expect(within(list).getByText("Active").tagName).toBe("SPAN");
		expect(within(list).getByText("12").tagName).toBe("STRONG");
	});

	it("keeps labels, hides values, and marks the list busy while loading", () => {
		const { container } = render(<StatStrip loading items={ITEMS} />);

		const list = container.querySelector("dl");
		expect(list).toBeTruthy();
		if (!list) {
			throw new Error("missing definition list");
		}
		expect(list).toHaveAttribute("aria-busy", "true");
		expect([...list.querySelectorAll("dt")].map((item) => item.textContent)).toEqual([
			"Projects",
			"Deploys",
			"Incidents",
			"Uptime",
		]);
		expect(screen.queryByText("24")).toBeNull();
		expect(screen.queryByText("128")).toBeNull();
		expect(list.querySelectorAll("dd [aria-hidden='true']")).toHaveLength(4);
	});

	it("keeps the list busy while loading even if the caller sets aria-busy false", () => {
		const { container, rerender } = render(<StatStrip loading aria-busy={false} items={ITEMS} />);
		expect(container.querySelector("dl")).toHaveAttribute("aria-busy", "true");

		rerender(<StatStrip aria-busy={false} items={ITEMS} />);
		expect(container.querySelector("dl")).toHaveAttribute("aria-busy", "false");
	});
});

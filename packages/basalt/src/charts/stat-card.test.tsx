import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
	it("renders label and value", () => {
		render(<StatCard />);
		expect(screen.getByText("Requests")).toBeInTheDocument();
	});

	it("renders title, subtitle, and trend", () => {
		render(
			<StatCard
				title="Assets"
				value="$4.82M"
				subtitle="Managed"
				trend={{ value: 4.8, label: "QoQ" }}
			/>,
		);
		expect(screen.getByText("Assets")).toBeInTheDocument();
		expect(screen.getByText("$4.82M")).toBeInTheDocument();
		expect(screen.getByText("Managed")).toBeInTheDocument();
		expect(screen.getByText("+4.8%")).toBeInTheDocument();
		expect(screen.getByText("QoQ")).toBeInTheDocument();
	});
});

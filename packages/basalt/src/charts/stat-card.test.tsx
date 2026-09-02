import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { describe, expect, it } from "vitest";
import { StatCard, StatGrid } from "./stat-card";

describe("StatCard", () => {
	it("renders caller label and value", () => {
		render(<StatCard label="Requests" value="12.4k" />);
		expect(screen.getByText("Requests")).toBeInTheDocument();
		expect(screen.getByText("12.4k")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Requests 12.4k" })).toBeInTheDocument();
	});

	it("lets title override label", () => {
		render(<StatCard label="Requests" title="CPU" value="8%" />);
		expect(screen.getByText("CPU")).toBeInTheDocument();
		expect(screen.queryByText("Requests")).toBeNull();
		expect(screen.getByRole("img", { name: "CPU 8%" })).toBeInTheDocument();
	});

	it("renders string values and locale-formats number values", () => {
		const { rerender } = render(<StatCard label="Requests" value="8%" />);
		expect(screen.getByText("8%")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Requests 8%" })).toBeInTheDocument();
		const numeric = 12400;
		rerender(<StatCard label="Requests" value={numeric} />);
		const formatted = numeric.toLocaleString();
		expect(screen.getByText(formatted)).toBeInTheDocument();
		expect(screen.getByRole("img", { name: `Requests ${formatted}` })).toBeInTheDocument();
	});

	it("builds the automatic aria-label from heading, value, subtitle, and trend", () => {
		const { rerender } = render(
			<StatCard
				label="Requests"
				value="12.4k"
				subtitle="this week"
				trend={{ value: 12, label: "wow" }}
			/>,
		);
		expect(
			screen.getByRole("img", { name: "Requests 12.4k this week +12% wow" }),
		).toBeInTheDocument();
		rerender(<StatCard label="Requests" value="12.4k" trend={{ value: -5 }} />);
		expect(screen.getByRole("img", { name: "Requests 12.4k -5%" })).toBeInTheDocument();
		rerender(<StatCard label="Requests" value="12.4k" trend={{ value: 0 }} />);
		expect(screen.getByRole("img", { name: "Requests 12.4k 0%" })).toBeInTheDocument();
	});

	it("lets an explicit ariaLabel replace the automatic name", () => {
		render(
			<StatCard
				label="Requests"
				value="12.4k"
				subtitle="this week"
				trend={{ value: 12 }}
				ariaLabel="Exact"
			/>,
		);
		expect(screen.getByRole("img", { name: "Exact" })).toBeInTheDocument();
		expect(screen.queryByRole("img", { name: "Requests 12.4k this week +12%" })).toBeNull();
	});

	it("shows subtitle only when provided", () => {
		const { rerender } = render(<StatCard value="12.4k" />);
		expect(screen.queryByText("vs last")).toBeNull();
		rerender(<StatCard value="12.4k" subtitle="vs last" />);
		expect(screen.getByText("vs last")).toBeInTheDocument();
	});

	it("renders an icon with iconColor and applies the outer className", () => {
		const { container, rerender } = render(
			<StatCard value="12.4k" icon={Activity} iconColor="text-red-500" className="outer-card" />,
		);
		expect(container.firstElementChild).toHaveClass("outer-card");
		expect(container.querySelector(".text-red-500")).toBeTruthy();
		expect(container.querySelector("svg")).toBeTruthy();
		rerender(<StatCard value="12.4k" />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("styles positive, negative, and zero trends and optional labels", () => {
		const { rerender } = render(<StatCard value="12.4k" trend={{ value: 12, label: "wow" }} />);
		const positive = screen.getByText("+12%");
		expect(positive).toHaveClass("text-basalt-heatmap-green-4");
		expect(screen.getByText("wow")).toBeInTheDocument();
		rerender(<StatCard value="12.4k" trend={{ value: -5 }} />);
		expect(screen.getByText("-5%")).toHaveClass("text-basalt-destructive");
		expect(screen.queryByText("wow")).toBeNull();
		rerender(<StatCard value="12.4k" trend={{ value: 0 }} />);
		expect(screen.getByText("0%")).toHaveClass("text-basalt-muted-foreground");
	});
});

describe("StatGrid", () => {
	it("defaults to four columns and maps explicit 2, 3, and 4 column layouts", () => {
		const { container, rerender } = render(
			<StatGrid className="grid-shell">
				<span>child-a</span>
			</StatGrid>,
		);
		const grid = container.firstElementChild;
		expect(grid).toHaveClass("grid", "gap-3", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-4");
		expect(grid).toHaveClass("grid-shell");
		expect(grid).toHaveTextContent("child-a");
		rerender(
			<StatGrid columns={2}>
				<span>child-a</span>
			</StatGrid>,
		);
		expect(container.firstElementChild).toHaveClass("sm:grid-cols-2");
		expect(container.firstElementChild).not.toHaveClass("lg:grid-cols-3");
		expect(container.firstElementChild).not.toHaveClass("lg:grid-cols-4");
		rerender(
			<StatGrid columns={3}>
				<span>child-a</span>
			</StatGrid>,
		);
		expect(container.firstElementChild).toHaveClass("lg:grid-cols-3");
		expect(container.firstElementChild).not.toHaveClass("lg:grid-cols-4");
		rerender(
			<StatGrid columns={4}>
				<span>child-a</span>
			</StatGrid>,
		);
		expect(container.firstElementChild).toHaveClass("lg:grid-cols-4");
	});
});

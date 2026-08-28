import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
	it("renders label and value", () => {
		render(<StatCard />);
		expect(screen.getByText("Requests")).toBeInTheDocument();
	});
});

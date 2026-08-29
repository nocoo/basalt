import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flow, FlowNode } from "./flow";

describe("Flow", () => {
	it("renders nodes", () => {
		render(
			<Flow>
				<FlowNode>Step 1</FlowNode>
			</Flow>,
		);
		expect(screen.getByText("Step 1")).toBeInTheDocument();
	});

	it("draws an arrow between sequential nodes", () => {
		const { container } = render(
			<Flow>
				<FlowNode>Step 1</FlowNode>
				<FlowNode>Step 2</FlowNode>
			</Flow>,
		);
		expect(screen.getByText("Step 1")).toBeInTheDocument();
		expect(screen.getByText("Step 2")).toBeInTheDocument();
		expect(container.querySelector("marker")).toBeTruthy();
		expect(container.querySelector("path[marker-end]")).toBeTruthy();
	});
});

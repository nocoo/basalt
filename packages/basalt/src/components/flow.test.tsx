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
});

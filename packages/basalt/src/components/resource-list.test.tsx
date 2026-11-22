import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ResourceList } from "./resource-list";

describe("ResourceList", () => {
	it("renders caller rows through the package table", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<ResourceList
				ref={ref}
				title="Projects"
				description="Active workspaces"
				data={[{ name: "Atlas", status: "Active" }]}
			/>,
		);
		expect(ref.current).toHaveAttribute("data-slot", "resource-list");
		expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
		expect(screen.getByText("Active workspaces")).toBeInTheDocument();
		expect(screen.getByText("Atlas")).toBeInTheDocument();
		expect(screen.getByText("Active")).toBeInTheDocument();
	});
});

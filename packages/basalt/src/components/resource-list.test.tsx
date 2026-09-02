import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResourceList } from "./resource-list";

describe("ResourceList", () => {
	it("renders caller rows through the package table", () => {
		render(
			<ResourceList
				title="Projects"
				description="Active workspaces"
				data={[{ name: "Atlas", status: "Active" }]}
			/>,
		);
		expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
		expect(screen.getByText("Active workspaces")).toBeInTheDocument();
		expect(screen.getByText("Atlas")).toBeInTheDocument();
		expect(screen.getByText("Active")).toBeInTheDocument();
	});
});

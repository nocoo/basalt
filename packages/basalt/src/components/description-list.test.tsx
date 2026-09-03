import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./description-list";

describe("DescriptionList", () => {
	it("stacks terms above values in a two-column list", () => {
		render(
			<DescriptionList>
				<DescriptionList.Item term="Status">Active</DescriptionList.Item>
				<DescriptionList.Item term="Plan">Enterprise</DescriptionList.Item>
			</DescriptionList>,
		);
		const list = screen.getByText("Status").closest("dl");
		expect(list?.className).toContain("sm:grid-cols-2");
		expect(screen.getByText("Status").tagName).toBe("DT");
		expect(screen.getByText("Active").tagName).toBe("DD");
		expect(screen.getByText("Active").className).not.toContain("font-medium");
		expect(list?.className).not.toContain("bg-basalt-card");
	});

	it("can render a single column", () => {
		render(
			<DescriptionList columns={1}>
				<DescriptionList.Item term="Status">Active</DescriptionList.Item>
			</DescriptionList>,
		);
		expect(screen.getByText("Status").closest("dl")?.className).toContain("sm:grid-cols-1");
	});
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./breadcrumbs";

describe("Breadcrumbs", () => {
	it("marks the current crumb", () => {
		render(<Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Settings" }]} />);
		expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
		expect(screen.getByText("Settings")).toHaveAttribute("aria-current", "page");
		expect(screen.queryByText("/")).not.toBeInTheDocument();
	});
});

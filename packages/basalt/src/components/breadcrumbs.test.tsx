import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./breadcrumbs";

describe("Breadcrumbs", () => {
	it("marks the current crumb", () => {
		render(<Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Docs" }]} />);
		expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
		expect(screen.getByText("Docs")).toBeInTheDocument();
	});
});

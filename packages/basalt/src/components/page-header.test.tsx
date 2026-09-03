import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
	it("renders a labelled header with a single title heading", () => {
		render(<PageHeader title="Dashboard" />);

		const banner = screen.getByRole("banner", { name: "Dashboard" });
		const heading = within(banner).getByRole("heading", { level: 1, name: "Dashboard" });
		expect(heading.tagName).toBe("H1");
		expect(banner).toHaveAttribute("aria-labelledby", heading.id);
		expect(within(banner).getAllByRole("heading")).toHaveLength(1);
		expect(screen.queryByRole("navigation", { name: "Breadcrumb" })).toBeNull();
	});

	it("renders optional eyebrow, description, breadcrumbs, and wrapping actions", () => {
		render(
			<PageHeader
				eyebrow="Workspace"
				breadcrumbs={[
					{ href: "/", label: "Home", icon: <span data-testid="crumb-icon">*</span> },
					{ label: "Dashboard" },
				]}
				title="Dashboard"
				description="Overview of recent project activity."
				actions={
					<>
						<button type="button">Share</button>
						<button type="button">Export</button>
					</>
				}
			/>,
		);

		const banner = screen.getByRole("banner", { name: "Dashboard" });
		expect(within(banner).getByText("Workspace").tagName).toBe("P");
		expect(within(banner).getByText("Overview of recent project activity.").tagName).toBe("P");
		expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "*Home" })).toHaveAttribute("href", "/");
		expect(screen.getByTestId("crumb-icon")).toBeInTheDocument();
		expect(
			screen.getByText("Dashboard", { selector: "[aria-current='page']" }),
		).toBeInTheDocument();
		expect(within(banner).getByRole("button", { name: "Share" })).toBeInTheDocument();
		expect(within(banner).getByRole("button", { name: "Export" })).toBeInTheDocument();
		expect(banner.className).not.toContain("rounded-");
		expect(banner.className).not.toContain("bg-basalt-");
		expect(banner.className).not.toContain("ring-1");
		expect(
			within(banner).getByRole("button", { name: "Export" }).parentElement?.className,
		).toContain("justify-end");
	});

	it("puts complex filters on their own row", () => {
		render(
			<PageHeader
				title="Projects"
				actions={<button type="button">New project</button>}
				filters={<input aria-label="Owner" />}
			/>,
		);
		const banner = screen.getByRole("banner", { name: "Projects" });
		const heading = within(banner).getByRole("heading", { level: 1 });
		const titleRow = heading.parentElement?.parentElement;
		const filter = within(banner).getByLabelText("Owner");
		expect(titleRow?.contains(filter)).toBe(false);
		expect(filter.parentElement).not.toBe(titleRow);
	});

	it("stacks the title and actions on small screens and wraps long content", () => {
		render(
			<PageHeader
				title="Quarterly operations review for the north-region delivery network"
				description="A long supporting summary that should wrap onto following lines instead of truncating."
				actions={<button type="button">Create report</button>}
			/>,
		);

		const banner = screen.getByRole("banner");
		const heading = within(banner).getByRole("heading", { level: 1 });
		const row = heading.parentElement?.parentElement;
		expect(row?.className).toContain("flex-col");
		expect(row?.className).toContain("md:flex-row");
		expect(heading.className).not.toContain("truncate");
		expect(within(banner).getByText(/long supporting summary/).className).not.toContain("truncate");
		expect(
			within(banner).getByRole("button", { name: "Create report" }).parentElement?.className,
		).toContain("flex-wrap");
	});
});

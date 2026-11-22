import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Banner } from "./banner";

describe("Banner", () => {
	it("renders title and description", () => {
		render(<Banner title="Update" description="A new version is ready." />);
		expect(screen.getByText("Update")).toBeInTheDocument();
		expect(screen.getByText("A new version is ready.")).toBeInTheDocument();
	});

	it("renders neutral surface by default and applies semantic tone classes", () => {
		const { rerender } = render(
			<Banner
				title="Update"
				description="A new version is ready."
				role="status"
				aria-label="Notice"
			/>,
		);
		const root = screen.getByRole("status", { name: "Notice" });
		expect(root).toHaveAttribute("data-basalt-surface");
		expect(root).toHaveClass("basalt-banner", "text-basalt-foreground");
		expect(screen.getByText("A new version is ready.")).toHaveClass("text-basalt-muted-foreground");
		expect(root.className).not.toContain("bg-basalt-info-tint");

		rerender(<Banner tone="info" title="Info" role="status" aria-label="Notice" />);
		expect(root).toHaveClass("bg-basalt-info-tint", "text-basalt-info");
		expect(root).not.toHaveAttribute("data-basalt-surface");

		rerender(<Banner tone="success" title="Done" role="status" aria-label="Notice" />);
		expect(root).toHaveClass("bg-basalt-success-tint", "text-basalt-success");

		rerender(<Banner tone="warning" title="Warn" role="status" aria-label="Notice" />);
		expect(root).toHaveClass("bg-basalt-warning-tint", "text-basalt-warning");

		rerender(<Banner tone="danger" title="Fail" role="status" aria-label="Notice" />);
		expect(root).toHaveClass("bg-basalt-danger-tint", "text-basalt-danger");
	});

	it("renders children without a title", () => {
		render(<Banner tone="warning">Just copy</Banner>);
		expect(screen.getByText("Just copy")).toBeInTheDocument();
	});

	it("renders neutral and compact sizes", () => {
		const { rerender } = render(
			<Banner tone="neutral" title="Maintenance scheduled" description="Ten minutes." />,
		);
		expect(screen.getByText("Maintenance scheduled")).toBeInTheDocument();
		rerender(<Banner size="sm" description="A DNS record already exists." />);
		expect(screen.getByText("A DNS record already exists.")).toBeInTheDocument();
	});

	it("renders destructive action on danger tone", () => {
		render(
			<Banner
				tone="danger"
				title="Save failed"
				description="Try again."
				action={
					<>
						<Banner.Action>Retry</Banner.Action>
						<Banner.Action variant="ghost" aria-label="Dismiss" />
					</>
				}
			/>,
		);
		expect(screen.getByRole("button", { name: "Retry" })).toHaveClass("bg-basalt-danger-solid");
		expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
	});

	it("falls back to neutral surface and base padding for null tone and size", () => {
		render(
			<Banner
				tone={null}
				size={null}
				title="Restored"
				description="Details stay neutral."
				role="status"
				aria-label="Notice"
			/>,
		);
		const root = screen.getByRole("status", { name: "Notice" });
		expect(screen.getByText("Restored")).toBeInTheDocument();
		expect(root).toHaveAttribute("data-basalt-surface");
		expect(root).toHaveClass("basalt-banner", "text-basalt-foreground");
		expect(root.className).not.toContain("bg-basalt-info-tint");
		expect(screen.getByText("Details stay neutral.")).toHaveClass("text-basalt-muted-foreground");
	});

	it("keeps a compact plain action inline when description is omitted", () => {
		render(
			<Banner
				size="sm"
				title="Compact"
				action={<button type="button">Fix</button>}
				role="status"
				aria-label="Compact notice"
			/>,
		);
		const root = screen.getByRole("status", { name: "Compact notice" });
		const action = screen.getByRole("button", { name: "Fix" });
		expect(screen.getByText("Compact")).toBeInTheDocument();
		expect(action).toBeInTheDocument();
		expect(root.children).toHaveLength(1);
		const content = root.children[0];
		expect(content).toHaveClass("min-w-0");
		expect(content).toHaveClass("flex-1");
		expect(content).not.toHaveClass("shrink-0");
		expect(content.children).toHaveLength(2);
		expect(content.children[0].tagName).toBe("P");
		expect(content.children[0]).toHaveTextContent("Compact");
		expect(content.children[1].tagName).toBe("DIV");
		expect(content.children[1].contains(action)).toBe(true);
	});
});

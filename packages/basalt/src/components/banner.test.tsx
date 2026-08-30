import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Banner } from "./banner";

describe("Banner", () => {
	it("renders title and description", () => {
		render(<Banner title="Update" description="A new version is ready." />);
		expect(screen.getByText("Update")).toBeInTheDocument();
		expect(screen.getByText("A new version is ready.")).toBeInTheDocument();
	});

	it("uses high-contrast tints instead of heatmap fills", () => {
		const { rerender } = render(<Banner title="Info" />);
		expect(screen.getByText("Info").parentElement?.parentElement?.className).toContain(
			"bg-basalt-info-tint",
		);
		rerender(<Banner variant="alert" title="Warn" />);
		expect(screen.getByText("Warn").parentElement?.parentElement?.className).toContain(
			"text-basalt-warning",
		);
		rerender(<Banner variant="error" title="Fail" />);
		expect(screen.getByText("Fail").parentElement?.parentElement?.className).toContain(
			"bg-basalt-danger-tint",
		);
	});

	it("renders children without a title", () => {
		render(<Banner variant="alert">Just copy</Banner>);
		expect(screen.getByText("Just copy")).toBeInTheDocument();
	});

	it("renders secondary and compact sizes", () => {
		const { rerender } = render(
			<Banner variant="secondary" title="Maintenance scheduled" description="Ten minutes." />,
		);
		expect(screen.getByText("Maintenance scheduled")).toBeInTheDocument();
		rerender(<Banner size="sm" description="A DNS record already exists." />);
		expect(screen.getByText("A DNS record already exists.")).toBeInTheDocument();
	});

	it("renders accent-aware actions", () => {
		render(
			<Banner
				variant="error"
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
		expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
	});

	it("falls back to default info tint and base padding for null variant and size", () => {
		render(
			<Banner variant={null} size={null} title="Restored" role="status" aria-label="Notice" />,
		);
		const root = screen.getByRole("status", { name: "Notice" });
		expect(screen.getByText("Restored")).toBeInTheDocument();
		expect(root).toHaveClass("bg-basalt-info-tint");
		expect(root).toHaveClass("text-basalt-info");
		expect(root).toHaveClass("px-4");
		expect(root).toHaveClass("py-3");
		expect(root).not.toHaveClass("px-3");
		expect(root).not.toHaveClass("py-2");
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
		expect(root).toHaveClass("px-3");
		expect(root).toHaveClass("py-2");
		expect(root).not.toHaveClass("px-4");
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

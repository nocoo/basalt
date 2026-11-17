import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MicroSceneWall } from "@/components/showcase/MicroSceneWall";
import { SurfaceDisciplineInspector } from "@/components/showcase/SurfaceDisciplineInspector";
import i18n from "@/i18n";
import ComponentsPage from "@/pages/ComponentsPage";
import LayoutPage from "@/pages/LayoutPage";

describe("MicroSceneWall", () => {
	it("filters and toggles attachments and controls", () => {
		render(<MicroSceneWall />);
		const available = screen.getByRole("group", { name: "Available attachments" });
		const attached = screen.getByRole("group", { name: "Attached files" });
		expect(within(available).getByRole("button", { name: "tokens.diff" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		fireEvent.click(within(attached).getByRole("button", { name: "Remove tokens.diff" }));
		expect(within(available).getByRole("button", { name: "tokens.diff" })).toHaveAttribute(
			"aria-pressed",
			"false",
		);
		fireEvent.click(within(available).getByRole("button", { name: "tokens.diff" }));
		expect(
			within(attached).getByRole("button", { name: "Remove tokens.diff" }),
		).toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Search attachments" }), {
			target: { value: "contrast" },
		});
		fireEvent.click(within(available).getByRole("button", { name: "contrast-report.csv" }));
		expect(
			within(attached).getByRole("button", { name: "Remove contrast-report.csv" }),
		).toBeInTheDocument();
		fireEvent.click(within(available).getByRole("button", { name: "contrast-report.csv" }));
		expect(
			within(attached).queryByRole("button", { name: "Remove contrast-report.csv" }),
		).not.toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Search attachments" }), {
			target: { value: "missing" },
		});
		expect(within(available).getByText("No matching files.")).toBeInTheDocument();
		const notifications = screen.getByRole("switch", { name: "Notify on completion" });
		const diff = screen.getByRole("checkbox", { name: "Include diff summary" });
		fireEvent.click(notifications);
		fireEvent.click(diff);
		expect(notifications).not.toBeChecked();
		expect(diff).toBeChecked();
	});

	it("selects navigation and decisions, expands trace and filters ledger", () => {
		render(<MicroSceneWall />);
		const navigation = screen.getByRole("navigation", { name: "Workspace navigation" });
		const inbox = within(navigation).getByRole("button", { name: "Inbox 12" });
		act(() => inbox.focus());
		expect(inbox).toHaveFocus();
		fireEvent.click(inbox);
		expect(inbox).toHaveAttribute("aria-current", "page");
		expect(within(navigation).getByRole("button", { name: "Overview" })).not.toHaveAttribute(
			"aria-current",
		);
		const trace = screen.getByRole("button", { name: /Indexed 148 tokens/ });
		expect(trace).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trace);
		expect(trace).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Indexed the current workspace files.")).toBeInTheDocument();
		expect(screen.getByRole("status", { name: "Running" })).toBeInTheDocument();
		expect(screen.getByText("68% · 1,360 / 2,000 tok")).toBeInTheDocument();
		const decision = screen.getByRole("button", { name: "Canary 10%" });
		fireEvent.click(decision);
		expect(decision).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByText("Selected: Canary 10%")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Staged workspace" }));
		expect(decision).toHaveAttribute("aria-pressed", "false");
		expect(screen.getByText("Selected: Staged workspace")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Hide changes" }));
		expect(screen.queryByText("+12%")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Show changes" }));
		expect(screen.getByText("+12%")).toBeInTheDocument();
		expect(screen.getByRole("meter", { name: "Compute" })).toHaveAttribute("aria-valuenow", "68");
		expect(screen.getByRole("meter", { name: "Storage" }).parentElement).toHaveClass(
			"[&_[data-slot=meter-indicator]]:bg-basalt-muted-foreground",
		);
		const table = screen.getByRole("table", { name: "Compact ledger" });
		expect(within(table).getAllByRole("row")).toHaveLength(5);
		expect(within(table).getByText("$1,240.00")).toBeInTheDocument();
		fireEvent.click(
			within(screen.getByRole("group", { name: "Filter invoices" })).getByRole("button", {
				name: "Failed",
			}),
		);
		expect(within(table).getAllByRole("row")).toHaveLength(2);
		expect(within(table).getByText("INV-2043")).toBeInTheDocument();
		expect(within(table).queryByText("INV-2041")).not.toBeInTheDocument();
	});
});

describe("surface discipline inspector", () => {
	it("compares matte, border and signal treatments across backdrop choices", async () => {
		const { container } = render(<SurfaceDisciplineInspector />);
		const stage = container.querySelector("[data-surface-inspector-stage]");
		expect(stage).toHaveAttribute("data-backdrop", "neutral");
		expect(screen.getByText("Matte luminance")).toBeInTheDocument();
		expect(screen.getByText("Double-border anti-pattern")).toBeInTheDocument();
		expect(screen.getByText("Signal overload anti-pattern")).toBeInTheDocument();
		expect(stage?.querySelector('[data-slot="card-well"]')).toBeInTheDocument();
		expect(screen.getByRole("status", { name: "Verifying release" })).toBeInTheDocument();
		const choices = screen.getByRole("radiogroup", { name: "Backdrop context" });
		const warm = within(choices).getByRole("radio", { name: "Warm Field" });
		act(() => warm.focus());
		expect(warm).toHaveFocus();
		fireEvent.click(warm);
		expect(stage).toHaveAttribute("data-backdrop", "warm");
		fireEvent.keyDown(warm, { key: "ArrowRight" });
		const brand = within(choices).getByRole("radio", { name: "Brand Tint" });
		await waitFor(() => expect(brand).toHaveFocus());
		fireEvent.keyDown(brand, { key: " " });
		fireEvent.click(brand);
		fireEvent.keyUp(brand, { key: " " });
		expect(stage).toHaveAttribute("data-backdrop", "brand");
		fireEvent.click(within(choices).getByRole("radio", { name: "Neutral Light" }));
		expect(stage).toHaveAttribute("data-backdrop", "neutral");
	});
});

describe("showcase integration", () => {
	it("renders the wall first and links to the templates gallery", () => {
		const { container } = render(<ComponentsPage />);
		expect(screen.getByRole("heading", { name: "Micro-scenes" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Explore templates" })).toHaveAttribute(
			"href",
			"/templates",
		);
		const sections = container.querySelectorAll("[data-showcase-page] > section");
		expect(sections[0]).toContainElement(container.querySelector("[data-micro-scene-wall]"));
		expect(screen.getByRole("heading", { name: "Metric Cards" })).toBeInTheDocument();
	});
	it("places the inspector immediately after the surface stack", () => {
		const { container } = render(<LayoutPage />);
		expect(
			screen.getByRole("heading", { name: "Surface & signal discipline" }),
		).toBeInTheDocument();
		const stack = screen.getByRole("heading", { name: "The stack" }).closest("section");
		const inspector = container.querySelector<HTMLElement>("[data-surface-inspector-stage]");
		expect(stack?.nextElementSibling).toContainElement(inspector);
		expect(screen.getByRole("heading", { name: "Body vs Well" })).toBeInTheDocument();
	});
	it("localizes both showcases in Chinese", async () => {
		const previous = i18n.language;
		try {
			await act(async () => i18n.changeLanguage("zh"));
			const wall = render(<MicroSceneWall />);
			expect(screen.getByRole("navigation", { name: "工作区导航" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "金丝雀 10%" })).toBeInTheDocument();
			wall.unmount();
			render(<SurfaceDisciplineInspector />);
			expect(screen.getByRole("radio", { name: "暖色背景" })).toBeInTheDocument();
			expect(screen.getByText("双重边框反例")).toBeInTheDocument();
		} finally {
			await act(async () => i18n.changeLanguage(previous));
		}
	});
});

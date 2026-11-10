import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { HeaderAction } from "./app-header";

function Glyph() {
	return <svg data-testid="glyph" aria-hidden="true" />;
}

describe("HeaderAction", () => {
	it("renders a labelled ghost icon button with a bottom tooltip", async () => {
		const onClick = vi.fn();
		const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
		render(
			<HeaderAction ref={ref} label="Notifications" onClick={onClick}>
				<Glyph />
			</HeaderAction>,
		);
		const action = screen.getByRole("button", { name: "Notifications" });
		expect(ref.current).toBe(action);
		expect(action).toHaveAttribute("type", "button");
		expect(action).toHaveAttribute("data-slot", "header-action");
		expect(action).toHaveClass(
			"basalt-action-icon",
			"text-basalt-muted-foreground",
			"hover:text-basalt-foreground",
		);
		fireEvent.click(action);
		expect(onClick).toHaveBeenCalledOnce();
		act(() => action.focus());
		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip).toHaveTextContent("Notifications");
		const content = document.querySelector('[data-slot="tooltip-content"], [data-side]');
		expect(content).toHaveAttribute("data-side", "bottom");
	});

	it("renders an external link with a new-tab name and screen-reader text", () => {
		render(
			<HeaderAction label="GitHub repository" href="https://github.com/nocoo/basalt">
				<Glyph />
			</HeaderAction>,
		);
		const link = screen.getByRole("link", { name: "GitHub repository (opens in a new tab)" });
		expect(link).toHaveAttribute("href", "https://github.com/nocoo/basalt");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
		expect(link).toHaveTextContent("GitHub repository");
		expect(link).toHaveClass("basalt-action-icon", "text-basalt-muted-foreground");
	});

	it("keeps internal links in the tab and honours custom tooltip and new-tab labels", async () => {
		const { rerender } = render(
			<HeaderAction label="Settings" href="/settings" external={false} tooltip={false}>
				<Glyph />
			</HeaderAction>,
		);
		const link = screen.getByRole("link", { name: "Settings" });
		expect(link).not.toHaveAttribute("target");
		expect(link).not.toHaveAttribute("rel");
		act(() => link.focus());
		expect(screen.queryByRole("tooltip")).toBeNull();
		rerender(
			<HeaderAction
				label="文档"
				href="https://docs.example"
				newTabLabel="（新标签页打开）"
				tooltip="打开文档"
			>
				<Glyph />
			</HeaderAction>,
		);
		const external = screen.getByRole("link", { name: "文档 （新标签页打开）" });
		act(() => external.focus());
		expect(await screen.findByRole("tooltip")).toHaveTextContent("打开文档");
	});
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
	AppHeader,
	AppHeaderMenuButton,
	GitHubLink,
	HeaderAction,
	HexlyLink,
	ProjectLinks,
} from "./app-header";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "./sheet";

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

describe("project links", () => {
	it("links GitHub repositories from owner/name or a full URL", () => {
		const { rerender } = render(<GitHubLink repo="nocoo/surety" />);
		const link = screen.getByRole("link", { name: "GitHub repository (opens in a new tab)" });
		expect(link).toHaveAttribute("href", "https://github.com/nocoo/surety");
		expect(link).toHaveAttribute("data-project-link", "github");
		expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
		rerender(<GitHubLink repo="https://github.com/nocoo/basalt" label="GitHub 仓库" />);
		expect(screen.getByRole("link", { name: "GitHub 仓库 (opens in a new tab)" })).toHaveAttribute(
			"href",
			"https://github.com/nocoo/basalt",
		);
	});

	it("links hexly.ai projects by slug with a product-name label", () => {
		const { rerender } = render(<HexlyLink project="surety" name="Surety" />);
		const link = screen.getByRole("link", { name: "Surety on hexly.ai (opens in a new tab)" });
		expect(link).toHaveAttribute("href", "https://hexly.ai/projects/surety");
		expect(link).toHaveAttribute("data-project-link", "hexly");
		rerender(<HexlyLink project="lyre" />);
		expect(
			screen.getByRole("link", { name: "lyre on hexly.ai (opens in a new tab)" }),
		).toBeVisible();
		rerender(<HexlyLink project="lyre" label="在 hexly.ai 查看" newTabLabel="（新标签页）" />);
		expect(screen.getByRole("link", { name: "在 hexly.ai 查看 （新标签页）" })).toBeVisible();
	});

	it("renders the GitHub then hexly pair and omits missing links", () => {
		const { container, rerender } = render(
			<div>
				<ProjectLinks
					github="nocoo/surety"
					hexly="surety"
					name="Surety"
					githubLabel="GitHub 仓库"
					hexlyLabel="Surety 在 hexly.ai"
					newTabLabel="（新标签页打开）"
				/>
			</div>,
		);
		const links = screen.getAllByRole("link");
		expect(links.map((link) => link.getAttribute("data-project-link"))).toEqual([
			"github",
			"hexly",
		]);
		expect(links[0]).toHaveAccessibleName("GitHub 仓库 （新标签页打开）");
		expect(links[1]).toHaveAccessibleName("Surety 在 hexly.ai （新标签页打开）");
		rerender(
			<div>
				<ProjectLinks hexly="surety" />
			</div>,
		);
		expect(screen.getAllByRole("link")).toHaveLength(1);
		expect(screen.getByRole("link")).toHaveAccessibleName(
			"surety on hexly.ai (opens in a new tab)",
		);
		rerender(
			<div>
				<ProjectLinks github="nocoo/surety" />
			</div>,
		);
		expect(screen.getByRole("link")).toHaveAccessibleName("GitHub repository (opens in a new tab)");
		rerender(
			<div>
				<ProjectLinks />
			</div>,
		);
		expect(container.querySelector("a")).toBeNull();
	});
});

describe("AppHeader breadcrumbs label", () => {
	it("passes breadcrumbsLabel to the breadcrumb landmark", () => {
		const { rerender } = render(
			<AppHeader breadcrumbs={[{ href: "/", label: "首页" }]} breadcrumbsLabel="面包屑导航" />,
		);
		expect(screen.getByRole("navigation", { name: "面包屑导航" })).toBeInTheDocument();
		rerender(<AppHeader breadcrumbs={[{ href: "/", label: "Home" }]} />);
		expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
	});
});

describe("AppHeaderMenuButton", () => {
	it("opens navigation with a default label, Menu glyph and forwarded ref", async () => {
		const onClick = vi.fn();
		const ref = createRef<HTMLButtonElement>();
		render(<AppHeader leading={<AppHeaderMenuButton ref={ref} onClick={onClick} />} />);
		const button = screen.getByRole("button", { name: "Open navigation" });
		expect(ref.current).toBe(button);
		expect(button).toHaveAttribute("data-app-header-menu");
		expect(button).toHaveClass("basalt-action-icon");
		expect(button.querySelector("svg.lucide-menu")).toHaveAttribute("aria-hidden", "true");
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
		act(() => button.focus());
		expect(await screen.findByRole("tooltip")).toHaveTextContent("Open navigation");
	});

	it("works as a SheetTrigger child with a custom label and glyph", () => {
		render(
			<Sheet>
				<SheetTrigger asChild>
					<AppHeaderMenuButton label="打开导航菜单" tooltip={false}>
						<Glyph />
					</AppHeaderMenuButton>
				</SheetTrigger>
				<SheetContent side="left">
					<SheetTitle>导航</SheetTitle>
					<SheetDescription>站点导航</SheetDescription>
				</SheetContent>
			</Sheet>,
		);
		const trigger = screen.getByRole("button", { name: "打开导航菜单" });
		expect(screen.getByTestId("glyph")).toBeInTheDocument();
		expect(trigger).toHaveAttribute("aria-expanded", "false");
		fireEvent.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByRole("dialog", { name: "导航" })).toBeInTheDocument();
	});
});

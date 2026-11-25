import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Link as RouterLink, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import TemplateDetailPage from "@/pages/TemplateDetailPage";

function TestLink({
	href,
	className,
	children,
	...props
}: { href: string; className?: string; children?: ReactNode } & Record<string, unknown>) {
	return (
		<RouterLink to={href} className={className} {...props}>
			{children}
		</RouterLink>
	);
}

function renderWorkbench(
	initialPath = "/templates/agent-workspace",
	theme: "light" | "dark" = "light",
) {
	return render(
		<ThemeProvider persist={false} theme={theme}>
			<MemoryRouter initialEntries={[initialPath]}>
				<LinkProvider render={TestLink}>
					<Routes>
						<Route path="/templates/:slug" element={<TemplateDetailPage />} />
					</Routes>
				</LinkProvider>
			</MemoryRouter>
		</ThemeProvider>,
	);
}

describe("TemplateDetailPage", () => {
	it("renders workbench controls, resizes viewport, overrides local theme, and copies source", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
		renderWorkbench("/templates/agent-workspace", "light");

		expect(screen.getByRole("heading", { name: "Agent workspace" })).toBeInTheDocument();
		const frame = screen.getByTitle("AgentWorkspaceTemplate.tsx") as HTMLIFrameElement;
		expect(frame).toHaveAttribute("src", "/view/agent-workspace?theme=light");
		expect(screen.getByRole("link", { name: "Open fullscreen" })).toHaveAttribute(
			"href",
			"/view/agent-workspace",
		);
		expect(screen.getByRole("link", { name: "View .md" })).toHaveAttribute(
			"href",
			"/templates/agent-workspace.md",
		);

		const post = vi.spyOn(frame.contentWindow as Window, "postMessage");
		fireEvent.load(frame);
		expect(post).toHaveBeenLastCalledWith(
			{ type: "basalt-template-theme", theme: "light" },
			window.location.origin,
		);

		fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
		expect(post).toHaveBeenLastCalledWith(
			{ type: "basalt-template-theme", theme: "dark" },
			window.location.origin,
		);
		expect(document.documentElement.dataset.mode).not.toBe("dark");

		fireEvent.click(screen.getByRole("radio", { name: "Mobile" }));
		expect(frame.parentElement).toHaveClass("max-w-[24.375rem]");

		fireEvent.click(screen.getByRole("button", { name: "Reload preview" }));
		expect(screen.getByTitle("AgentWorkspaceTemplate.tsx")).not.toBe(frame);

		fireEvent.click(screen.getByRole("radio", { name: "Code" }));
		expect(document.querySelector("iframe")).toBeNull();
		expect(document.querySelector("[data-basalt-code]")).toHaveTextContent(
			"export default function AgentWorkspaceTemplate",
		);

		fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
		await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
		expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
	});

	it("supports bidirectional anatomy focus between workbench and iframe", () => {
		renderWorkbench("/templates/ops-inbox", "light");
		const frame = screen.getByTitle("OpsInboxTemplate.tsx") as HTMLIFrameElement;
		const post = vi.spyOn(frame.contentWindow as Window, "postMessage");

		const locateButtons = screen.getAllByRole("button", { name: "Locate" });
		fireEvent.click(locateButtons[0]);
		expect(post).toHaveBeenCalledWith(
			{ type: "basalt-template-focus", partId: "ops-queue" },
			window.location.origin,
		);

		act(() => {
			window.dispatchEvent(
				new MessageEvent("message", {
					origin: window.location.origin,
					data: {
						type: "basalt-template-active-part",
						slug: "ops-inbox",
						partId: "ops-runbook",
					},
				}),
			);
		});
		expect(screen.getByRole("button", { name: "Focused" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Agent workspace" })).toHaveAttribute(
			"href",
			"/templates/agent-workspace",
		);
		expect(screen.getByRole("link", { name: "Workspace settings" })).toHaveAttribute(
			"href",
			"/templates/workspace-settings",
		);
	});

	it("switches back from code view and dispatches pending focus after iframe loads", () => {
		renderWorkbench("/templates/visitor-login", "light");
		fireEvent.click(screen.getByRole("radio", { name: "Code" }));
		expect(document.querySelector("iframe")).toBeNull();

		fireEvent.click(screen.getAllByRole("button", { name: "Locate" })[0]);
		const frame = screen.getByTitle("VisitorLoginTemplate.tsx") as HTMLIFrameElement;
		const post = vi.spyOn(frame.contentWindow as Window, "postMessage");
		fireEvent.load(frame);
		expect(post).toHaveBeenCalledWith(
			{ type: "basalt-template-focus", partId: "login-form" },
			window.location.origin,
		);
	});

	it("renders a helpful not-found workbench state for unknown template slugs", () => {
		renderWorkbench("/templates/does-not-exist", "light");
		expect(screen.getByRole("heading", { name: "Template not found" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Open Agent workspace" })).toHaveAttribute(
			"href",
			"/templates/agent-workspace",
		);
	});
});

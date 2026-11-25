import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TemplatesPage from "@/pages/TemplatesPage";

describe("TemplatesPage", () => {
	it("filters, resizes, reloads, views and copies a standalone source", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
		render(
			<ThemeProvider persist={false}>
				<TemplatesPage />
			</ThemeProvider>,
		);
		expect(screen.getAllByTitle(/Template\.tsx$/)).toHaveLength(7);
		fireEvent.click(
			within(screen.getByRole("radiogroup", { name: "Filter templates" })).getByRole("radio", {
				name: "Workspaces",
			}),
		);
		expect(screen.getAllByTitle(/Template\.tsx$/)).toHaveLength(3);
		const section = screen.getByRole("heading", { name: "Agent workspace" }).closest("section");
		if (!section) throw new Error("Missing template section");
		const controls = within(section);
		const iframe = controls.getByTitle("AgentWorkspaceTemplate.tsx");
		expect(iframe).toHaveAttribute("src", "/view/agent-workspace?theme=light");
		fireEvent.click(controls.getByRole("radio", { name: "Mobile" }));
		expect(iframe.parentElement).toHaveClass("max-w-[24.375rem]");
		fireEvent.click(controls.getByRole("button", { name: "Reload preview" }));
		expect(controls.getByTitle("AgentWorkspaceTemplate.tsx")).not.toBe(iframe);
		fireEvent.click(controls.getByRole("radio", { name: "Code" }));
		expect(section.querySelector("iframe")).toBeNull();
		expect(section.querySelector("[data-basalt-code]")).toHaveTextContent(
			"export default function AgentWorkspaceTemplate",
		);
		fireEvent.click(controls.getByRole("button", { name: "Copy code" }));
		await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
		expect(writeText.mock.calls[0][0]).toContain("export default function AgentWorkspaceTemplate");
		expect(await controls.findByRole("button", { name: "Copied" })).toBeInTheDocument();
		expect(controls.getByRole("link", { name: "Open standalone" })).toHaveAttribute(
			"href",
			"/view/agent-workspace",
		);
	});
	it("synchronizes the preview theme without changing the iframe URL", () => {
		const { rerender } = render(
			<ThemeProvider theme="light">
				<TemplatesPage />
			</ThemeProvider>,
		);
		const frame = screen.getByTitle("AgentWorkspaceTemplate.tsx") as HTMLIFrameElement;
		const post = vi.spyOn(frame.contentWindow as Window, "postMessage");
		fireEvent.load(frame);
		expect(post).toHaveBeenLastCalledWith(
			{ type: "basalt-template-theme", theme: "light" },
			window.location.origin,
		);
		rerender(
			<ThemeProvider theme="dark">
				<TemplatesPage />
			</ThemeProvider>,
		);
		expect(post).toHaveBeenLastCalledWith(
			{ type: "basalt-template-theme", theme: "dark" },
			window.location.origin,
		);
		expect(frame).toHaveAttribute("src", "/view/agent-workspace?theme=light");
	});
});

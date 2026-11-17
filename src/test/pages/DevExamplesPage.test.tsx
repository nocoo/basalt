import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import DevExamplesPage from "@/pages/DevExamplesPage";

function renderPage(
	path = "/dev/examples",
	extraPanels: { key: string; component: () => React.ReactNode }[] = [],
) {
	return render(
		<ThemeProvider applyToDocument={false}>
			<TooltipProvider>
				<MemoryRouter initialEntries={[path]}>
					<DevExamplesPage extraPanels={extraPanels} />
				</MemoryRouter>
			</TooltipProvider>
		</ThemeProvider>,
	);
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	localStorage.clear();
	window.history.replaceState({}, "", "/");
});

describe("dev examples", () => {
	it("mounts all independent panels and clears completion state on unmount", () => {
		const view = renderPage();
		expect(view.container.querySelector("[data-dev-examples]")).toBeInTheDocument();
		expect(
			Array.from(view.container.querySelectorAll("[data-dev-panel]"), (panel) =>
				panel.getAttribute("data-dev-panel"),
			),
		).toEqual(["controls", "data", "overlay", "micro-scenes", "surface-inspector", "templates"]);
		expect(window.__basaltExamplesDone).toBe(true);
		expect(window.__basaltFailures).toEqual({});
		view.unmount();
		expect(window.__basaltExamplesDone).toBeUndefined();
		expect(window.__basaltFailures).toBeUndefined();
	});

	it("filters panel keys case-insensitively and supports multiple substrings", () => {
		const view = renderPage("/dev/examples?q=CONTROLS,SCENES");
		expect(
			Array.from(view.container.querySelectorAll("[data-dev-panel]"), (panel) =>
				panel.getAttribute("data-dev-panel"),
			),
		).toEqual(["controls", "micro-scenes"]);
		view.unmount();
		const controls = renderPage("/dev/examples?q=controls");
		expect(controls.container.querySelectorAll("[data-dev-panel]")).toHaveLength(1);
		expect(controls.container.querySelector('[data-dev-panel="controls"]')).toBeInTheDocument();
	});

	it("isolates a throwing panel and records its failure", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		function Broken(): never {
			throw new Error("panel broke");
		}
		renderPage("/dev/examples?q=controls,broken", [{ key: "broken", component: Broken }]);
		expect(screen.getByText("broken failed to render.")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
		expect(window.__basaltFailures).toEqual({ broken: "panel broke" });
		expect(window.__basaltExamplesDone).toBe(true);
	});

	it("copies hover rules, tolerates inaccessible styles and invalid selectors, and cleans up", () => {
		const source = document.createElement("style");
		source.textContent =
			"@media screen { button:hover { color: red; } } tr:hover { opacity: 0.5; }";
		document.head.append(source);
		const sheets = Array.from(document.styleSheets);
		vi.spyOn(document, "styleSheets", "get").mockReturnValue([
			...sheets,
			{
				cssRules: [
					{
						selectorText: ".nested",
						style: { cssText: "display: flex;" },
						cssRules: [{ selectorText: "&:hover", style: { cssText: "opacity: 0.5;" } }],
					},
				],
			},
			{
				get cssRules() {
					throw new DOMException("Denied", "SecurityError");
				},
			},
		] as unknown as StyleSheetList);
		const view = renderPage("/dev/examples?q=controls&hover=button,div,%5B");
		const button = screen.getByRole("button", { name: "Primary" });
		const style = document.querySelector("style[data-basalt-hover]");
		expect(button).toHaveClass("__basalt_hover");
		expect(view.container.querySelector("[data-dev-examples] > div")).toHaveClass("__basalt_hover");
		expect(style?.textContent).toContain("button.__basalt_hover");
		expect(style?.textContent).toContain("@media screen");
		expect(style?.textContent).toContain("&.__basalt_hover");
		expect(style?.textContent).not.toContain("display: flex");
		expect(style?.textContent).toContain("transition: none !important");
		view.unmount();
		expect(button).not.toHaveClass("__basalt_hover");
		expect(document.querySelector("style[data-basalt-hover]")).toBeNull();
		source.remove();
	});

	it("opens the dialog and disclosure", () => {
		renderPage("/dev/examples?q=overlay");
		fireEvent.click(screen.getByRole("button", { name: "Show details" }));
		expect(screen.getByText("Example disclosure content.")).toBeVisible();
		fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
		expect(screen.getByRole("dialog")).toBeVisible();
		fireEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it.each(["/dev/examples", "/dev/examples/"])(
		"applies the requested theme without persisting on %s",
		async (path) => {
			localStorage.setItem("theme", "light");
			window.history.replaceState({}, "", `${path}?theme=dark&q=controls`);
			vi.spyOn(window, "scrollTo").mockImplementation(() => {});
			await act(async () => {
				render(<App />);
			});
			expect(await screen.findByRole("button", { name: "Primary" })).toBeInTheDocument();
			await waitFor(() => expect(document.documentElement.dataset.mode).toBe("dark"));
			expect(localStorage.getItem("theme")).toBe("light");
			await act(async () => {
				window.history.pushState({}, "", "/");
				window.dispatchEvent(new PopStateEvent("popstate"));
			});
			await waitFor(() => expect(document.documentElement.dataset.mode).toBe("light"));
			expect(localStorage.getItem("theme")).toBe("light");
		},
	);
});

import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import TemplateViewportPage from "@/pages/TemplateViewportPage";

describe("template viewport", () => {
	it("accepts only same-origin theme messages without persisting preview preferences", async () => {
		localStorage.setItem("theme", "system");
		render(
			<ThemeProvider applyToDocument={false}>
				<MemoryRouter initialEntries={["/view/visitor-login?theme=dark"]}>
					<Routes>
						<Route path="/view/:slug" element={<TemplateViewportPage />} />
					</Routes>
				</MemoryRouter>
			</ThemeProvider>,
		);
		await screen.findByRole("heading", { name: "Welcome back" });
		await waitFor(() => expect(document.documentElement.dataset.mode).toBe("dark"));
		act(() =>
			window.dispatchEvent(
				new MessageEvent("message", {
					origin: "https://untrusted.example",
					data: { type: "basalt-template-theme", theme: "light" },
				}),
			),
		);
		expect(document.documentElement.dataset.mode).toBe("dark");
		act(() =>
			window.dispatchEvent(
				new MessageEvent("message", {
					origin: window.location.origin,
					data: { type: "basalt-template-theme", theme: "light" },
				}),
			),
		);
		await waitFor(() => expect(document.documentElement.dataset.mode).toBe("light"));
		expect(localStorage.getItem("theme")).toBe("system");
	});
	it("inherits the site preference when no preview theme is requested", async () => {
		render(
			<ThemeProvider theme="dark" applyToDocument={false}>
				<MemoryRouter initialEntries={["/view/visitor-login"]}>
					<Routes>
						<Route path="/view/:slug" element={<TemplateViewportPage />} />
					</Routes>
				</MemoryRouter>
			</ThemeProvider>,
		);
		await screen.findByRole("heading", { name: "Welcome back" });
		await waitFor(() => expect(document.documentElement.dataset.mode).toBe("dark"));
	});
	it("renders not found for an unknown template", async () => {
		render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<MemoryRouter initialEntries={["/view/unknown"]}>
					<Routes>
						<Route path="/view/:slug" element={<TemplateViewportPage />} />
					</Routes>
				</MemoryRouter>
			</ThemeProvider>,
		);
		expect(await screen.findByText("404")).toBeInTheDocument();
	});
});

import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import TemplateViewportPage from "@/pages/TemplateViewportPage";

describe("template viewport", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

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

	it("scrolls and highlights targeted anatomy parts on same-origin focus messages", async () => {
		render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<MemoryRouter initialEntries={["/view/visitor-login"]}>
					<Routes>
						<Route path="/view/:slug" element={<TemplateViewportPage />} />
					</Routes>
				</MemoryRouter>
			</ThemeProvider>,
		);
		await screen.findByRole("heading", { name: "Welcome back" });
		const target = document.getElementById("login-form");
		expect(target).not.toBeNull();
		const scrollIntoView = vi.fn();
		if (target) {
			Object.defineProperty(target, "scrollIntoView", {
				value: scrollIntoView,
				configurable: true,
			});
		}

		act(() =>
			window.dispatchEvent(
				new MessageEvent("message", {
					origin: "https://untrusted.example",
					data: { type: "basalt-template-focus", partId: "login-form" },
				}),
			),
		);
		expect(scrollIntoView).not.toHaveBeenCalled();

		vi.useFakeTimers();
		act(() =>
			window.dispatchEvent(
				new MessageEvent("message", {
					origin: window.location.origin,
					data: { type: "basalt-template-focus", partId: "login-form" },
				}),
			),
		);
		expect(scrollIntoView).toHaveBeenCalledTimes(1);
		expect(target?.dataset.basaltTemplateFocus).toBe("true");

		act(() => {
			vi.advanceTimersByTime(1500);
		});
		expect(target?.dataset.basaltTemplateFocus).toBeUndefined();
	});

	it("reports the most visible template part to parent via IntersectionObserver", async () => {
		const postMessage = vi.fn();
		const fakeParent = { postMessage } as unknown as Window;
		vi.spyOn(window, "parent", "get").mockReturnValue(fakeParent);

		let observerCallback: IntersectionObserverCallback | null = null;
		const observedTargets: Element[] = [];
		class MockIntersectionObserver {
			constructor(callback: IntersectionObserverCallback) {
				observerCallback = callback;
			}
			observe(el: Element) {
				observedTargets.push(el);
			}
			disconnect() {}
			unobserve() {}
			takeRecords() {
				return [];
			}
			root = null;
			rootMargin = "";
			thresholds = [];
		}
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

		render(
			<ThemeProvider persist={false} applyToDocument={false}>
				<MemoryRouter initialEntries={["/view/visitor-login"]}>
					<Routes>
						<Route path="/view/:slug" element={<TemplateViewportPage />} />
					</Routes>
				</MemoryRouter>
			</ThemeProvider>,
		);
		await screen.findByRole("heading", { name: "Welcome back" });

		expect(postMessage).toHaveBeenCalledWith(
			{ type: "basalt-template-ready", slug: "visitor-login" },
			window.location.origin,
		);

		await waitFor(() => expect(observedTargets.length).toBeGreaterThanOrEqual(3));
		const formEl = document.getElementById("login-form") as Element;
		const footerEl = document.getElementById("login-footer") as Element;
		act(() => {
			observerCallback?.(
				[
					{
						target: formEl,
						isIntersecting: true,
						intersectionRatio: 0.35,
					} as IntersectionObserverEntry,
					{
						target: footerEl,
						isIntersecting: true,
						intersectionRatio: 0.85,
					} as IntersectionObserverEntry,
				],
				{} as IntersectionObserver,
			);
		});
		expect(postMessage).toHaveBeenLastCalledWith(
			{ type: "basalt-template-active-part", slug: "visitor-login", partId: "login-footer" },
			window.location.origin,
		);
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

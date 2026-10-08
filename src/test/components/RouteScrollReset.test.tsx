import { act, render, screen } from "@testing-library/react";
import { lazy, type ReactNode, Suspense } from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RouteScrollReset } from "@/components/RouteScrollReset";

let navigate: ReturnType<typeof useNavigate>;
const scrollTo = vi.fn();
const scrollIntoView = vi.fn();

function Navigation() {
	navigate = useNavigate();
	return null;
}

function renderRoutes(
	page: ReactNode = <section id="section">Content</section>,
	initialPath = "/first",
) {
	return render(
		<MemoryRouter initialEntries={[initialPath]}>
			<Navigation />
			<div data-doc-scroll>
				<Routes>
					<Route
						path="/:page"
						element={
							<Suspense fallback={<p>Loading</p>}>
								<RouteScrollReset>{page}</RouteScrollReset>
							</Suspense>
						}
					/>
				</Routes>
			</div>
		</MemoryRouter>,
	);
}

describe("route scroll ownership", () => {
	beforeEach(() => {
		vi.stubGlobal("scrollTo", scrollTo);
		Object.defineProperty(HTMLElement.prototype, "scrollTo", {
			configurable: true,
			value: scrollTo,
		});
		Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
			configurable: true,
			value: scrollIntoView,
		});
		window.history.scrollRestoration = "auto";
		scrollTo.mockClear();
		scrollIntoView.mockClear();
	});
	afterEach(() => {
		vi.unstubAllGlobals();
		Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
		Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
	});

	it("resets the document and content island on navigation, including browser history", async () => {
		const { unmount } = renderRoutes();
		expect(window.history.scrollRestoration).toBe("manual");
		expect(scrollTo).toHaveBeenCalledTimes(2);
		scrollTo.mockClear();
		await act(async () => {
			await navigate("/second");
		});
		expect(scrollTo).toHaveBeenCalledTimes(2);
		expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "instant" });
		scrollTo.mockClear();
		await act(async () => {
			await navigate(-1);
		});
		expect(scrollTo).toHaveBeenCalledTimes(2);
		unmount();
		expect(window.history.scrollRestoration).toBe("auto");
	});

	it("does not reset same-page searches or replace navigation", async () => {
		renderRoutes();
		scrollTo.mockClear();
		await act(async () => {
			await navigate("/first?filter=active");
		});
		await act(async () => {
			await navigate("/first?filter=all", { replace: true });
		});
		expect(scrollTo).not.toHaveBeenCalled();
	});

	it("honors anchors instead of resetting to zero", async () => {
		renderRoutes();
		const section = screen.getByText("Content");
		vi.spyOn(section, "getBoundingClientRect").mockReturnValue({ top: 240 } as DOMRect);
		scrollTo.mockClear();
		await act(async () => {
			await navigate("/second#section");
		});
		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 240, behavior: "instant" });
		scrollTo.mockClear();
		await act(async () => {
			await navigate("/second#missing");
		});
		expect(scrollTo).not.toHaveBeenCalled();
	});

	it("falls back to the top for missing or malformed anchors on new pages", async () => {
		renderRoutes();
		scrollTo.mockClear();
		await act(async () => {
			await navigate("/second#%zz");
		});
		expect(scrollTo).toHaveBeenCalledTimes(2);
		expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "instant" });
	});

	it("waits for lazy page content before applying its initial anchor", async () => {
		let resolvePage: (page: { default: () => ReactNode }) => void = () => {};
		const pending = new Promise<{ default: () => ReactNode }>((resolve) => {
			resolvePage = resolve;
		});
		const Page = lazy(() => pending);
		renderRoutes(<Page />, "/slow#loaded");
		expect(screen.getByText("Loading")).toBeInTheDocument();
		expect(scrollTo).not.toHaveBeenCalled();
		await act(async () => {
			resolvePage({ default: () => <section id="loaded">Loaded</section> });
			await pending;
		});
		expect(screen.getByText("Loaded")).toBeInTheDocument();
		expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, behavior: "instant" });
	});

	it("supports standalone document anchors without a content island", () => {
		render(
			<MemoryRouter initialEntries={["/static#heading"]}>
				<RouteScrollReset>
					<h1 id="heading">Heading</h1>
				</RouteScrollReset>
			</MemoryRouter>,
		);
		expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ behavior: "instant", block: "start" });
		expect(scrollTo).not.toHaveBeenCalled();
	});
});

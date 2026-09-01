import { act, render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogPageContent } from "./catalog-content";
import forms from "./catalog-content/families/forms";
import foundation from "./catalog-content/families/foundation";
import overlay from "./catalog-content/families/overlay";
import { UI_EXAMPLES } from "./demos";
import { CATALOG_DOCS } from "./docs";
import UiPlaceholderPage from "./UiPlaceholderPage";

const loadContent = vi.hoisted(() => vi.fn());

vi.mock("./catalog-content-loader", () => ({
	loadCatalogPageContent: loadContent,
}));

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((resolvePromise) => {
		resolve = resolvePromise;
	});
	return { promise, resolve };
}

function contentFor(slug: string): CatalogPageContent {
	const family = foundation[slug] ?? forms[slug] ?? overlay[slug];
	if (family) {
		return family;
	}
	const docs = CATALOG_DOCS[slug];
	const examples = UI_EXAMPLES[slug];
	if (!docs || !examples?.[0]) {
		throw new Error(`Missing test content for ${slug}`);
	}
	return { docs, examples };
}

function renderPage(path: string) {
	let navigate!: ReturnType<typeof useNavigate>;
	function NavigationProbe() {
		navigate = useNavigate();
		return null;
	}
	const result = render(
		<MemoryRouter initialEntries={[path]}>
			<NavigationProbe />
			<Suspense fallback={<p data-catalog-loading>Loading catalog page…</p>}>
				<Routes>
					<Route path="/ui/:slug" element={<UiPlaceholderPage />} />
				</Routes>
			</Suspense>
		</MemoryRouter>,
	);
	return { ...result, navigate };
}

beforeEach(() => {
	loadContent.mockReset();
});

describe("async catalog detail page", () => {
	it("never commits stale content after a fast slug switch", async () => {
		const button = deferred<CatalogPageContent | undefined>();
		const input = deferred<CatalogPageContent | undefined>();
		loadContent.mockImplementation((slug: string) =>
			slug === "button" ? button.promise : input.promise,
		);
		const { navigate } = renderPage("/ui/maps");
		expect(loadContent).not.toHaveBeenCalled();

		await act(async () => {
			navigate("/ui/button");
		});
		expect(loadContent).toHaveBeenCalledWith("button");

		await act(async () => {
			navigate("/ui/input");
		});
		expect(loadContent).toHaveBeenCalledWith("input");

		await act(async () => {
			button.resolve(contentFor("button"));
			await button.promise;
		});
		expect(document.querySelector('[data-status="ready"][data-slug="button"]')).toBeNull();
		expect(document.querySelector('[data-status="ready"][data-slug="input"]')).toBeNull();

		await act(async () => {
			input.resolve(contentFor("input"));
			await input.promise;
		});
		expect(await screen.findByRole("heading", { name: "Input", level: 1 })).toBeInTheDocument();
		expect(document.querySelector('[data-status="ready"][data-slug="input"]')).toBeTruthy();
		expect(document.querySelector('[data-status="ready"][data-slug="button"]')).toBeNull();
	});

	it("renders planned and missing pages without loading content", () => {
		const planned = renderPage("/ui/maps");
		expect(document.querySelector('[data-status="placeholder"][data-slug="maps"]')).toBeTruthy();
		expect(loadContent).not.toHaveBeenCalled();
		planned.unmount();

		renderPage("/ui/not-a-control");
		expect(document.querySelector("[data-status='missing']")).toBeTruthy();
		expect(loadContent).not.toHaveBeenCalled();
	});
});

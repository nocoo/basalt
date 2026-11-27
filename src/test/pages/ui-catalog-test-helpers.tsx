import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigationType } from "react-router";
import ComponentDocPage from "@/pages/ui/ComponentDocPage";
import { CATALOG } from "@/pages/ui/catalog";
import { loadCatalogPageContent } from "@/pages/ui/catalog-content-loader";
import { loadCatalogContentRecord } from "@/pages/ui/catalog-content-registry";
import { loadCatalogIndex } from "@/pages/ui/catalog-index-loader";
import UiIndexPage from "@/pages/ui/UiIndexPage";
import { UiSourceViewerPage } from "@/pages/ui/UiSourceViewerPage";

const catalogContent = await loadCatalogContentRecord();
export const CATALOG_DOCS = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.docs]),
);
export const UI_EXAMPLES = Object.fromEntries(
	Object.entries(catalogContent).map(([slug, content]) => [slug, content.examples]),
);
const catalogIndex = await loadCatalogIndex();
export const CATALOG_INDEX_GROUPS = catalogIndex.groups;
export const CATALOG_INDEX_ITEMS = catalogIndex.items;

export function catalogHeroScenario(slug: string) {
	return UI_EXAMPLES[slug]?.[0];
}

await Promise.all(CATALOG.map((entry) => loadCatalogPageContent(entry.slug)));

function RouterProbe() {
	const location = useLocation();
	const navigationType = useNavigationType();
	return (
		<span
			hidden
			data-router-location={`${location.pathname}${location.search}`}
			data-navigation-type={navigationType}
		/>
	);
}

export function renderCatalog(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<RouterProbe />
			<Routes>
				<Route path="/ui" element={<UiIndexPage />} />
				<Route path="/ui/:slug" element={<ComponentDocPage />} />
				<Route path="/ui/:slug/source" element={<UiSourceViewerPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

import { CATALOG_INDEX_ITEMS, CATALOG_INDEX_READY_COUNT } from "./catalog-index";
import { HomeGrid } from "./HomeGrid";

export default function UiIndexPage() {
	return (
		<div data-status="index" className="-m-3 md:-m-5">
			<header className="border-b border-border px-6 py-8 md:px-8 md:py-10">
				<h1 className="text-4xl font-semibold tracking-tight text-foreground">Component library</h1>
				<p className="mt-3 max-w-3xl text-lg leading-normal text-muted-foreground">
					Explore Basalt components, charts, and reusable blocks.
				</p>
				<p data-ready-summary className="mt-3 text-sm font-medium text-foreground">
					{CATALOG_INDEX_READY_COUNT} / {CATALOG_INDEX_ITEMS.length} ready
				</p>
			</header>
			<HomeGrid />
		</div>
	);
}

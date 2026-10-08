import { Button } from "@nocoo/basalt/components/button";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { ShowcasePage } from "@/components/ShowcasePage";
import { CATALOG_CATEGORIES } from "./catalog-categories";
import {
	type CatalogIndexCategory,
	type CatalogIndexQuery,
	type CatalogIndexRelease,
	type CatalogIndexStatus,
	DEFAULT_CATALOG_INDEX_QUERY,
	filterCatalogIndexGroups,
	parseCatalogIndexQuery,
	serializeCatalogIndexQuery,
} from "./catalog-index";
import { readCatalogIndex } from "./catalog-index-loader";
import { HomeGrid } from "./HomeGrid";

const RELEASE_OPTIONS: ReadonlyArray<{ value: CatalogIndexRelease; label: string }> = [
	{ value: "stable", label: "Stable" },
	{ value: "catalog", label: "Catalog" },
];

const STATUS_OPTIONS: ReadonlyArray<{ value: CatalogIndexStatus; label: string }> = [
	{ value: "ready", label: "Ready" },
	{ value: "planned", label: "Planned" },
];

function queryIsDefault(query: CatalogIndexQuery): boolean {
	return (
		query.q === "" && query.category === "all" && query.release === "all" && query.status === "all"
	);
}

function activeFilterCount(query: CatalogIndexQuery): number {
	return (
		Number(query.q !== "") +
		Number(query.category !== "all") +
		Number(query.release !== "all") +
		Number(query.status !== "all")
	);
}

export default function UiIndexPage() {
	const index = readCatalogIndex();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const query = parseCatalogIndexQuery(searchParams);
	const [searchValue, setSearchValue] = useState(query.q);
	const [filtersOpen, setFiltersOpen] = useState(() => !queryIsDefault(query));
	const canonicalSearchParams = serializeCatalogIndexQuery(query, searchParams);
	const groups = filterCatalogIndexGroups(index.groups, query);
	const resultCount = groups.reduce((count, group) => count + group.items.length, 0);
	const hasFilters = !queryIsDefault(query);
	const filterCount = activeFilterCount(query);

	useEffect(() => {
		if (canonicalSearchParams.toString() !== searchParams.toString()) {
			setSearchParams(canonicalSearchParams, { replace: true });
		}
	}, [canonicalSearchParams, searchParams, setSearchParams]);

	useEffect(() => {
		setSearchValue(query.q);
	}, [query.q]);

	function updateQuery(update: Partial<CatalogIndexQuery>) {
		setSearchParams(serializeCatalogIndexQuery({ ...query, ...update }, searchParams), {
			replace: true,
		});
	}

	function resetFilters() {
		setSearchParams(serializeCatalogIndexQuery(DEFAULT_CATALOG_INDEX_QUERY, searchParams), {
			replace: true,
		});
		searchInputRef.current?.focus();
	}

	return (
		<ShowcasePage
			variant="document"
			data-status="index"
			title="Component library"
			description={
				<>
					Explore Basalt components, charts, and reusable blocks.
					<span
						data-ready-summary
						className="mt-basalt-space-lg block text-basalt-sm tabular-nums text-basalt-muted-foreground"
					>
						{index.readyCount} / {index.items.length} ready
					</span>
				</>
			}
			actions={
				<Button
					variant={filtersOpen ? "secondary" : "outline"}
					size="sm"
					icon={<SlidersHorizontal />}
					aria-expanded={filtersOpen}
					aria-controls="catalog-filters"
					onClick={() => setFiltersOpen((open) => !open)}
				>
					Filters
					{filterCount > 0 ? (
						<span
							aria-hidden="true"
							className="flex h-4 min-w-4 items-center justify-center rounded-basalt-full bg-basalt-primary px-basalt-space-sm text-basalt-xs leading-basalt-tight text-basalt-primary-foreground"
						>
							{filterCount}
						</span>
					) : null}
				</Button>
			}
		>
			{filtersOpen ? (
				<div id="catalog-filters" className="space-y-basalt-space-lg">
					<div className="flex flex-col gap-basalt-space-lg xl:flex-row xl:flex-wrap xl:items-end">
						<div className="min-w-0 flex-1 space-y-basalt-space-lg xl:max-w-sm">
							<label
								htmlFor="catalog-search"
								className="block text-basalt-sm font-medium text-basalt-muted-foreground"
							>
								Search
							</label>
							<InputGroup>
								<InputGroup.Addon>
									<Search aria-hidden="true" />
								</InputGroup.Addon>
								<InputGroup.Input
									ref={searchInputRef}
									id="catalog-search"
									type="search"
									value={searchValue}
									onChange={(event) => {
										const nextValue = event.currentTarget.value;
										setSearchValue(nextValue);
										updateQuery({ q: nextValue });
									}}
									placeholder="Search components, charts, and blocks"
									autoComplete="off"
								/>
							</InputGroup>
						</div>
						<div className="space-y-basalt-space-lg">
							<label
								htmlFor="catalog-category"
								className="block text-basalt-sm font-medium text-basalt-muted-foreground"
							>
								Category
							</label>
							<Select
								value={query.category}
								onValueChange={(category) =>
									updateQuery({ category: category as CatalogIndexCategory })
								}
							>
								<SelectTrigger id="catalog-category">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									{CATALOG_CATEGORIES.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<SegmentControl
							legend="Release"
							value={query.release}
							options={RELEASE_OPTIONS}
							allOption={{ value: "all" }}
							onValueChange={(release) => updateQuery({ release: release as CatalogIndexRelease })}
						/>
						<SegmentControl
							legend="Page status"
							value={query.status}
							options={STATUS_OPTIONS}
							allOption={{ value: "all" }}
							onValueChange={(status) => updateQuery({ status: status as CatalogIndexStatus })}
						/>
					</div>
					<div className="flex min-h-8 flex-wrap items-center justify-between gap-basalt-space-lg">
						<p
							role="status"
							aria-live="polite"
							aria-atomic="true"
							data-result-summary
							className="text-basalt-base text-basalt-muted-foreground"
						>
							{resultCount} {resultCount === 1 ? "result" : "results"}
						</p>
						{hasFilters ? (
							<Button variant="ghost" size="sm" onClick={resetFilters}>
								Reset filters
							</Button>
						) : null}
					</div>
				</div>
			) : null}

			{resultCount > 0 ? (
				<HomeGrid groups={groups} />
			) : (
				<div className="py-basalt-space-lg text-center" data-empty-status>
					<p className="text-basalt-base font-medium text-basalt-foreground">
						No matching catalog items
					</p>
				</div>
			)}
		</ShowcasePage>
	);
}

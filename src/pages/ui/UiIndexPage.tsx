import { Button } from "@nocoo/basalt/components/button";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { ToggleGroup, ToggleGroupItem } from "@nocoo/basalt/components/toggle-group";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
	CATALOG_INDEX_GROUPS,
	CATALOG_INDEX_ITEMS,
	CATALOG_INDEX_READY_COUNT,
	type CatalogIndexCategory,
	type CatalogIndexQuery,
	type CatalogIndexRelease,
	type CatalogIndexStatus,
	DEFAULT_CATALOG_INDEX_QUERY,
	filterCatalogIndexGroups,
	parseCatalogIndexQuery,
	serializeCatalogIndexQuery,
} from "./catalog-index";
import { HomeGrid } from "./HomeGrid";

const CATEGORY_OPTIONS: ReadonlyArray<{ value: CatalogIndexCategory; label: string }> = [
	{ value: "all", label: "All" },
	{ value: "component", label: "Components" },
	{ value: "chart", label: "Charts" },
	{ value: "block", label: "Blocks" },
];

const RELEASE_OPTIONS: ReadonlyArray<{ value: CatalogIndexRelease; label: string }> = [
	{ value: "all", label: "All" },
	{ value: "stable", label: "Stable" },
	{ value: "catalog", label: "Catalog" },
];

const STATUS_OPTIONS: ReadonlyArray<{ value: CatalogIndexStatus; label: string }> = [
	{ value: "all", label: "All" },
	{ value: "ready", label: "Ready" },
	{ value: "planned", label: "Planned" },
];

function queryIsDefault(query: CatalogIndexQuery): boolean {
	return (
		query.q === "" && query.category === "all" && query.release === "all" && query.status === "all"
	);
}

interface FilterToggleProps<T extends string> {
	id: string;
	label: string;
	value: T;
	options: ReadonlyArray<{ value: T; label: string }>;
	onValueChange: (value: T) => void;
}

function FilterToggle<T extends string>({
	id,
	label,
	value,
	options,
	onValueChange,
}: FilterToggleProps<T>) {
	return (
		<div className="min-w-0 space-y-2">
			<p id={id} className="text-xs font-medium text-muted-foreground">
				{label}
			</p>
			<ToggleGroup
				type="single"
				value={value}
				onValueChange={(nextValue) => onValueChange((nextValue || "all") as T)}
				aria-labelledby={id}
				className="h-auto min-h-8 max-w-full flex-wrap"
			>
				{options.map((option) => (
					<ToggleGroupItem key={option.value} value={option.value}>
						{option.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

export default function UiIndexPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const query = parseCatalogIndexQuery(searchParams);
	const [searchValue, setSearchValue] = useState(query.q);
	const canonicalSearchParams = serializeCatalogIndexQuery(query, searchParams);
	const groups = filterCatalogIndexGroups(CATALOG_INDEX_GROUPS, query);
	const resultCount = groups.reduce((count, group) => count + group.items.length, 0);
	const hasFilters = !queryIsDefault(query);

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

			<div className="border-b border-border px-6 py-6 md:px-8">
				<div className="grid gap-5 xl:grid-cols-[minmax(16rem,1fr)_auto_auto_auto] xl:items-end">
					<div className="min-w-0 space-y-2">
						<label
							htmlFor="catalog-search"
							className="block text-xs font-medium text-muted-foreground"
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
					<FilterToggle
						id="catalog-category-filter"
						label="Category"
						value={query.category}
						options={CATEGORY_OPTIONS}
						onValueChange={(category) => updateQuery({ category })}
					/>
					<FilterToggle
						id="catalog-release-filter"
						label="Release"
						value={query.release}
						options={RELEASE_OPTIONS}
						onValueChange={(release) => updateQuery({ release })}
					/>
					<FilterToggle
						id="catalog-status-filter"
						label="Page status"
						value={query.status}
						options={STATUS_OPTIONS}
						onValueChange={(status) => updateQuery({ status })}
					/>
				</div>
				<div className="mt-5 flex min-h-8 flex-wrap items-center justify-between gap-3">
					<p
						role="status"
						aria-live="polite"
						aria-atomic="true"
						data-result-summary
						className="text-sm text-muted-foreground"
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

			{resultCount > 0 ? (
				<HomeGrid groups={groups} />
			) : (
				<div className="px-6 py-16 text-center md:px-8" data-empty-status>
					<p className="text-sm font-medium text-foreground">No matching catalog items</p>
				</div>
			)}
		</div>
	);
}

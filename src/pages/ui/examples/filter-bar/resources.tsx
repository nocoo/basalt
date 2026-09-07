import { FilterBar, FilterChip } from "@nocoo/basalt/components/filter-bar";
import { Input } from "@nocoo/basalt/components/input";
import { MultiSelect } from "@nocoo/basalt/components/multi-select";
import { useState } from "react";

const resources = [
	{ name: "Design system handbook", tag: "design", folder: "Library" },
	{ name: "Accessible charts", tag: "research", folder: "Reading" },
	{ name: "Interface patterns", tag: "design", folder: "Reading" },
	{ name: "API migration notes", tag: "engineering", folder: "Library" },
];
const tags = ["design", "research", "engineering"].map((value) => ({ value, label: value }));

export default function ResourceFilters() {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>(["design"]);
	const matches = resources.filter(
		(row) =>
			row.name.toLowerCase().includes(query.toLowerCase()) &&
			(!selected.length || selected.includes(row.tag)),
	);
	return (
		<div className="w-full space-y-5">
			<FilterBar
				label="Resource filters"
				active={!!query || selected.length > 0}
				onClear={() => {
					setQuery("");
					setSelected([]);
				}}
				chips={selected.map((tag) => (
					<FilterChip
						key={tag}
						label="Tag"
						value={tag}
						removeLabel={`Remove tag ${tag}`}
						onRemove={() => setSelected(selected.filter((value) => value !== tag))}
					/>
				))}
			>
				<Input
					className="w-full sm:w-56"
					aria-label="Search resources"
					placeholder="Search resources…"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
				<div className="w-full sm:w-60">
					<MultiSelect
						showChips={false}
						label="Resource tags"
						options={tags}
						value={selected}
						onValueChange={setSelected}
					/>
				</div>
			</FilterBar>
			<p role="status" className="text-xs text-basalt-muted-foreground">
				{matches.length} resources
			</p>
			<ul className="divide-y divide-basalt-border rounded-basalt-lg border border-basalt-border">
				{matches.map((row) => (
					<li key={row.name} className="flex flex-wrap items-center justify-between gap-2 p-3">
						<span className="text-sm">{row.name}</span>
						<span className="text-xs text-basalt-muted-foreground">
							{row.folder} · {row.tag}
						</span>
					</li>
				))}
			</ul>
			{!matches.length && (
				<p className="py-4 text-sm text-basalt-muted-foreground">
					No matching resources. Clear filters to start again.
				</p>
			)}
		</div>
	);
}

import { MultiSelect } from "@nocoo/basalt/components/multi-select";
import { useEffect, useState } from "react";

const models = [
	{ value: "atlas", label: "Atlas", description: "Reasoning · 128k context" },
	{ value: "cedar", label: "Cedar", description: "Fast responses · 64k context" },
	{ value: "ember", label: "Ember", description: "Vision · 256k context" },
];

export default function RemoteModelSelection() {
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>([]);
	const [options, setOptions] = useState(models);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		setLoading(true);
		// A local search adapter: cancel stale work when the query changes or on unmount.
		const timer = setTimeout(() => {
			setOptions(
				models.filter(
					(model) =>
						selected.includes(model.value) ||
						model.label.toLowerCase().includes(query.toLowerCase()),
				),
			);
			setLoading(false);
		}, 300);
		return () => clearTimeout(timer);
	}, [query, selected]);
	return (
		<div className="w-full max-w-md space-y-3">
			<h3 className="font-medium">Compare model usage</h3>
			<MultiSelect
				label="Models"
				value={selected}
				onValueChange={setSelected}
				query={query}
				onQueryChange={setQuery}
				options={options}
				filterOptions={false}
				loading={loading}
				emptyLabel="No models match this search."
			/>
			<p role="status" className="text-sm text-basalt-muted-foreground">
				{selected.length ? `Comparing ${selected.join(", ")}` : "Choose models to compare."}
			</p>
		</div>
	);
}

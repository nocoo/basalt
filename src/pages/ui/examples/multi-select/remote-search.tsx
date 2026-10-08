import { MultiSelect } from "@nocoo/basalt/components/multi-select";
import { useEffect, useState } from "react";

const models = [
	{ value: "atlas", label: "Atlas", description: "Primary care · North clinic" },
	{ value: "cedar", label: "Cedar", description: "Physical therapy · South clinic" },
	{ value: "ember", label: "Ember", description: "Nutrition · Central clinic" },
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
		<div className="w-full max-w-md space-y-basalt-space-lg">
			<h3 className="font-medium">Choose a care provider</h3>
			<MultiSelect
				label="Care providers"
				value={selected}
				onValueChange={setSelected}
				query={query}
				onQueryChange={setQuery}
				options={options}
				filterOptions={false}
				loading={loading}
				emptyLabel="No care providers match this search."
			/>
			<p role="status" className="text-basalt-base text-basalt-muted-foreground">
				{selected.length
					? `Comparing care providers ${selected.join(", ")}`
					: "Choose care providers to compare."}
			</p>
		</div>
	);
}

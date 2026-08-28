import { useState } from "react";
import { cn } from "../utils/cn";
import { Input } from "./input";

export function Combobox({
	items,
	value,
	defaultValue = "",
	onValueChange,
	name,
	placeholder = "Select…",
	className,
}: {
	items: string[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	name?: string;
	placeholder?: string;
	className?: string;
}) {
	const [uncontrolled, setUncontrolled] = useState(defaultValue);
	const [query, setQuery] = useState(value ?? defaultValue);
	const [open, setOpen] = useState(false);
	const selected = value ?? uncontrolled;
	const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));

	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
		}
		setQuery(next);
		setOpen(false);
		onValueChange?.(next);
	}

	return (
		<div className={cn("relative w-full", className)}>
			{name ? <input type="hidden" name={name} value={selected} /> : null}
			<Input
				value={query}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
				}}
				onFocus={() => setOpen(true)}
				placeholder={placeholder}
				aria-label={placeholder}
				aria-expanded={open}
				aria-autocomplete="list"
			/>
			{open && filtered.length > 0 ? (
				<ul className="absolute z-20 mt-1 w-full rounded-basalt-md border border-basalt-border bg-basalt-popover p-1">
					{filtered.map((item) => (
						<li key={item}>
							<button
								type="button"
								className="w-full rounded-basalt-sm px-2 py-1.5 text-left text-sm hover:bg-basalt-accent"
								onClick={() => commit(item)}
							>
								{item}
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

export const Autocomplete = Combobox;

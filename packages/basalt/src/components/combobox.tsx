import { useEffect, useState } from "react";
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
	const [active, setActive] = useState(0);
	const selected = value ?? uncontrolled;

	useEffect(() => {
		if (value !== undefined) {
			setQuery(value);
		}
	}, [value]);
	const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
	const activeItem = filtered[Math.min(active, Math.max(0, filtered.length - 1))];

	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
			setQuery(next);
		} else {
			setQuery(value);
		}
		setOpen(false);
		onValueChange?.(next);
	}

	return (
		<div
			className={cn("relative w-full", className)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setOpen(false);
					setQuery(selected);
				}
			}}
		>
			{name ? <input type="hidden" name={name} value={selected} /> : null}
			<Input
				value={query}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
					setActive(0);
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						setOpen(false);
						setQuery(selected);
						return;
					}
					if (event.key === "ArrowDown") {
						event.preventDefault();
						setOpen(true);
						setActive((current) => (filtered.length === 0 ? 0 : (current + 1) % filtered.length));
						return;
					}
					if (event.key === "ArrowUp") {
						event.preventDefault();
						setOpen(true);
						setActive((current) =>
							filtered.length === 0 ? 0 : (current - 1 + filtered.length) % filtered.length,
						);
						return;
					}
					if (event.key === "Enter" && open && activeItem) {
						event.preventDefault();
						commit(activeItem);
					}
				}}
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
								className={cn(
									"w-full rounded-basalt-sm px-2 py-1.5 text-left text-sm hover:bg-basalt-accent",
									item === activeItem && "bg-basalt-accent",
								)}
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

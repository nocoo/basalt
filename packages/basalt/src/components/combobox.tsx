import { useState } from "react";
import { cn } from "../utils/cn";
import { Input } from "./input";

export function Combobox({
	items,
	placeholder = "Select…",
	className,
}: {
	items: string[];
	placeholder?: string;
	className?: string;
}) {
	const [value, setValue] = useState("");
	const filtered = items.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
	return (
		<div className={cn("relative w-full", className)}>
			<Input
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder={placeholder}
				aria-label={placeholder}
			/>
			{value ? (
				<ul className="absolute z-20 mt-1 w-full rounded-basalt-md border border-basalt-border bg-basalt-popover p-1">
					{filtered.map((item) => (
						<li key={item}>
							<button
								type="button"
								className="w-full rounded-basalt-sm px-2 py-1.5 text-left text-sm hover:bg-basalt-accent"
								onClick={() => setValue(item)}
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

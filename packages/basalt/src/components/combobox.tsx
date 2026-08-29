import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Input } from "./input";
import { overlayItemClass, overlayPanelClass } from "./overlay";

export function Combobox({
	items,
	value,
	defaultValue = "",
	onValueChange,
	name,
	placeholder = "Select…",
	disabled = false,
	className,
}: {
	items: string[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	name?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}) {
	const [uncontrolled, setUncontrolled] = useState(defaultValue);
	const [query, setQuery] = useState(value ?? defaultValue);
	const [prevValue, setPrevValue] = useState(value);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const listId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const skipFocusOpen = useRef(false);
	const selected = value ?? uncontrolled;
	if (value !== prevValue) {
		setPrevValue(value);
		if (value !== undefined) {
			setQuery(value);
		} else if (prevValue !== undefined) {
			setUncontrolled(prevValue);
			setQuery(prevValue);
		}
	}
	useEffect(() => {
		const node = inputRef.current;
		const form = node?.form;
		if (!form || value !== undefined) {
			return;
		}
		const onReset = (event: Event) => {
			queueMicrotask(() => {
				if (event.defaultPrevented) {
					return;
				}
				setUncontrolled(defaultValue);
				setQuery(defaultValue);
				setOpen(false);
				setActive(0);
			});
		};
		form.addEventListener("reset", onReset);
		return () => form.removeEventListener("reset", onReset);
	}, [defaultValue, value]);
	const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
	const activeIndex = Math.min(active, Math.max(0, filtered.length - 1));
	const activeItem = filtered[activeIndex];
	const listOpen = open && filtered.length > 0;

	const prevQuery = useRef(query);
	const prevSelected = useRef(selected);
	useEffect(() => {
		const queryChanged = prevQuery.current !== query;
		const selectedChanged = prevSelected.current !== selected;
		prevQuery.current = query;
		prevSelected.current = selected;
		if (!open) {
			return;
		}
		const nextFiltered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
		if (queryChanged && !selectedChanged) {
			setActive((current) => Math.min(current, Math.max(0, nextFiltered.length - 1)));
			return;
		}
		const selectedIndex = nextFiltered.indexOf(selected);
		if (selectedIndex >= 0) {
			setActive(selectedIndex);
			return;
		}
		setActive((current) => Math.min(current, Math.max(0, nextFiltered.length - 1)));
	}, [items, open, query, selected]);

	function commit(next: string) {
		if (value === undefined) {
			setUncontrolled(next);
			setQuery(next);
		} else {
			setQuery(value);
		}
		setOpen(false);
		onValueChange?.(next);
		if (inputRef.current && document.activeElement !== inputRef.current) {
			skipFocusOpen.current = true;
			inputRef.current.focus();
		}
	}

	useEffect(() => {
		if (!open) {
			return;
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.isComposing) {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			setOpen(false);
			setQuery(selected);
			setActive(0);
		};
		window.addEventListener("keydown", onKey, true);
		document.addEventListener("keydown", onKey, true);
		return () => {
			window.removeEventListener("keydown", onKey, true);
			document.removeEventListener("keydown", onKey, true);
		};
	}, [open, selected]);

	return (
		<div
			className={cn("relative w-full", className)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setOpen(false);
					setQuery(selected);
					setActive(0);
				}
			}}
		>
			{name ? <input type="hidden" name={name} value={selected} /> : null}
			<Input
				ref={inputRef}
				value={query}
				disabled={disabled}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
					setActive(0);
				}}
				onFocus={() => {
					if (disabled) {
						return;
					}
					if (skipFocusOpen.current) {
						skipFocusOpen.current = false;
						return;
					}
					if (!open) {
						const selectedIndex = filtered.indexOf(selected);
						setActive(selectedIndex >= 0 ? selectedIndex : 0);
					}
					setOpen(true);
				}}
				onClick={() => {
					if (!open) {
						const selectedIndex = filtered.indexOf(selected);
						setActive(selectedIndex >= 0 ? selectedIndex : 0);
					}
					setOpen(true);
				}}
				onKeyDown={(event) => {
					if (event.nativeEvent.isComposing || event.key === "Process") {
						return;
					}
					if (event.key === "ArrowDown") {
						event.preventDefault();
						if (!open) {
							setActive(0);
						} else {
							setActive(filtered.length === 0 ? 0 : (activeIndex + 1) % filtered.length);
						}
						setOpen(true);
						return;
					}
					if (event.key === "ArrowUp") {
						event.preventDefault();
						if (!open) {
							setActive(0);
						} else {
							setActive(
								filtered.length === 0 ? 0 : (activeIndex - 1 + filtered.length) % filtered.length,
							);
						}
						setOpen(true);
						return;
					}
					if (event.key === "Enter" && open && activeItem) {
						event.preventDefault();
						commit(activeItem);
					}
				}}
				placeholder={placeholder}
				role="combobox"
				aria-label={placeholder}
				aria-expanded={listOpen}
				aria-autocomplete="list"
				aria-controls={listOpen ? listId : undefined}
				aria-activedescendant={listOpen && activeItem ? `${listId}-opt-${activeIndex}` : undefined}
			/>
			{listOpen ? (
				<div
					id={listId}
					role="listbox"
					className={overlayPanelClass("absolute top-full z-20 mt-1 w-full")}
				>
					{filtered.map((item, index) => (
						<button
							type="button"
							key={`${listId}-opt-${index}`}
							id={`${listId}-opt-${index}`}
							role="option"
							tabIndex={-1}
							aria-selected={index === activeIndex}
							className={cn(
								overlayItemClass("hover:bg-basalt-accent"),
								index === activeIndex && "bg-basalt-accent",
							)}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => commit(item)}
						>
							{item}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

export const Autocomplete = Combobox;

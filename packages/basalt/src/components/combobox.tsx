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
	const [active, setActive] = useState<number | null>(null);
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
				setActive(null);
			});
		};
		form.addEventListener("reset", onReset);
		return () => form.removeEventListener("reset", onReset);
	}, [defaultValue, value]);
	const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
	const activeIndex =
		active === null || filtered.length === 0 ? null : Math.min(active, filtered.length - 1);
	const activeItem = activeIndex === null ? undefined : filtered[activeIndex];
	const listOpen = open && filtered.length > 0;

	useEffect(() => {
		if (!open) {
			return;
		}
		const nextLen = items.filter((item) => item.toLowerCase().includes(query.toLowerCase())).length;
		setActive((current) => {
			if (current === null || nextLen === 0) {
				return null;
			}
			return Math.min(current, nextLen - 1);
		});
	}, [items, open, query]);

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
			setActive(null);
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
					setActive(null);
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
					setActive(null);
				}}
				onFocus={() => {
					if (disabled) {
						return;
					}
					if (skipFocusOpen.current) {
						skipFocusOpen.current = false;
						return;
					}
					setActive(null);
					setOpen(true);
				}}
				onClick={() => {
					if (!open) {
						setActive(null);
					}
					setOpen(true);
				}}
				onKeyDown={(event) => {
					if (event.nativeEvent.isComposing || event.key === "Process") {
						return;
					}
					if (event.key === "ArrowDown") {
						event.preventDefault();
						setOpen(true);
						if (filtered.length === 0) {
							setActive(null);
							return;
						}
						setActive((current) => (current === null ? 0 : (current + 1) % filtered.length));
						return;
					}
					if (event.key === "ArrowUp") {
						event.preventDefault();
						setOpen(true);
						if (filtered.length === 0) {
							setActive(null);
							return;
						}
						setActive((current) =>
							current === null
								? filtered.length - 1
								: (current - 1 + filtered.length) % filtered.length,
						);
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
				aria-activedescendant={
					listOpen && activeItem && activeIndex !== null
						? `${listId}-opt-${activeIndex}`
						: undefined
				}
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
							onMouseEnter={() => setActive(index)}
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

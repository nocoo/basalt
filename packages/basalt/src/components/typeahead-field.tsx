import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { Input, type InputSize } from "./input";
import { overlayItemClass, overlayPanelClass } from "./overlay";

export type TypeaheadItem = {
	value: string;
	label: string;
	disabled?: boolean;
};

export function TypeaheadField({
	items,
	value,
	defaultValue = "",
	onValueChange,
	name,
	placeholder = "Select…",
	disabled = false,
	loading = false,
	size = "default",
	className,
	id,
	allowFreeform,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
}: {
	items: TypeaheadItem[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	name?: string;
	placeholder?: string;
	disabled?: boolean;
	loading?: boolean;
	size?: InputSize;
	className?: string;
	id?: string;
	allowFreeform: boolean;
	"aria-label"?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
}) {
	const [uncontrolled, setUncontrolled] = useState(defaultValue);
	const selected = value ?? uncontrolled;
	const [query, setQuery] = useState(displayOf(items, selected));
	const [prevValue, setPrevValue] = useState(value);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState<number | null>(null);
	const listId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const skipFocusOpen = useRef(false);
	if (value !== prevValue) {
		setPrevValue(value);
		if (value !== undefined) {
			setQuery(displayOf(items, value));
		} else if (prevValue !== undefined) {
			setUncontrolled(prevValue);
			setQuery(displayOf(items, prevValue));
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
				setQuery(displayOf(items, defaultValue));
				setOpen(false);
				setActive(null);
			});
		};
		form.addEventListener("reset", onReset);
		return () => form.removeEventListener("reset", onReset);
	}, [defaultValue, items, value]);
	const filtered = filterItems(items, query, !allowFreeform);
	const activeIndex =
		active === null || filtered.length === 0 ? null : Math.min(active, filtered.length - 1);
	const activeItem = activeIndex === null ? undefined : filtered[activeIndex];
	const listOpen = open && filtered.length > 0;
	const busy = disabled || loading;

	useEffect(() => {
		if (!open) {
			return;
		}
		const nextLen = filterItems(items, query, !allowFreeform).length;
		setActive((current) => {
			if (current === null || nextLen === 0) {
				return null;
			}
			return Math.min(current, nextLen - 1);
		});
	}, [allowFreeform, items, open, query]);

	function commitValue(next: string, display: string) {
		if (value === undefined) {
			setUncontrolled(next);
			setQuery(display);
		} else {
			setQuery(displayOf(items, value));
		}
		setOpen(false);
		setActive(null);
		onValueChange?.(next);
		if (inputRef.current && document.activeElement !== inputRef.current) {
			skipFocusOpen.current = true;
			inputRef.current.focus();
		}
	}

	function commitItem(item: TypeaheadItem) {
		if (item.disabled) {
			return;
		}
		commitValue(item.value, item.label);
	}

	function commitFreeform(text: string) {
		const trimmed = text.trim();
		const match = items.find(
			(item) =>
				!item.disabled &&
				(item.label.toLowerCase() === trimmed.toLowerCase() || item.value === trimmed),
		);
		if (match) {
			commitItem(match);
			return;
		}
		commitValue(trimmed, trimmed);
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
			setQuery(displayOf(items, selected));
			setActive(null);
		};
		window.addEventListener("keydown", onKey, true);
		document.addEventListener("keydown", onKey, true);
		return () => {
			window.removeEventListener("keydown", onKey, true);
			document.removeEventListener("keydown", onKey, true);
		};
	}, [items, open, selected]);

	return (
		<div
			className={cn("relative w-full", className)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					if (allowFreeform) {
						if (query.trim() !== displayOf(items, selected)) {
							commitFreeform(query);
							return;
						}
					} else {
						setQuery(displayOf(items, selected));
					}
					setOpen(false);
					setActive(null);
				}
			}}
		>
			{name ? <input type="hidden" name={name} value={selected} /> : null}
			<Input
				ref={inputRef}
				id={id}
				value={query}
				disabled={busy}
				size={size}
				aria-busy={loading || undefined}
				aria-invalid={ariaInvalid}
				aria-describedby={ariaDescribedBy}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
					setActive(null);
				}}
				onFocus={() => {
					if (busy) {
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
					if (busy) {
						return;
					}
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
					if (event.key === "Enter") {
						if (open && activeItem) {
							event.preventDefault();
							commitItem(activeItem);
							return;
						}
						if (allowFreeform && query.trim() !== displayOf(items, selected)) {
							event.preventDefault();
							commitFreeform(query);
						}
					}
				}}
				placeholder={placeholder}
				role="combobox"
				aria-label={ariaLabel ?? (id ? undefined : placeholder)}
				aria-expanded={listOpen}
				aria-autocomplete={allowFreeform ? "both" : "list"}
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
							disabled={item.disabled}
							aria-disabled={item.disabled || undefined}
							aria-selected={index === activeIndex}
							className={cn(
								overlayItemClass("hover:bg-basalt-accent"),
								index === activeIndex && "bg-basalt-accent",
								item.disabled && "opacity-50",
							)}
							onMouseEnter={() => {
								if (!item.disabled) {
									setActive(index);
								}
							}}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => commitItem(item)}
						>
							{item.label}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

function displayOf(items: TypeaheadItem[], value: string) {
	return items.find((item) => item.value === value)?.label ?? value;
}

function filterItems(items: TypeaheadItem[], query: string, showAllWhenEmpty: boolean) {
	const needle = query.trim().toLowerCase();
	if (needle === "") {
		return showAllWhenEmpty ? items : [];
	}
	return items.filter((item) => item.label.toLowerCase().includes(needle));
}

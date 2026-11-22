import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_RING } from "../utils/overlay";

export type TextareaSize = "sm" | "md" | "lg";

const TEXTAREA_SIZE_CLASS: Record<TextareaSize, string> = {
	sm: "min-h-basalt-textarea-sm px-basalt-space-lg py-basalt-space-md text-basalt-md",
	md: "min-h-basalt-textarea px-basalt-control-x py-basalt-space-lg text-basalt-base",
	lg: "min-h-basalt-textarea-lg px-basalt-control-x-lg py-basalt-space-lg text-basalt-base",
};

const TEXTAREA_MAX_BLOCK_SIZE_PADDING: Record<TextareaSize, string> = {
	sm: "var(--basalt-space-md)",
	md: "var(--basalt-space-lg)",
	lg: "var(--basalt-space-lg)",
};

function supportsFieldSizing(): boolean {
	return (
		typeof CSS !== "undefined" &&
		typeof CSS.supports === "function" &&
		CSS.supports("field-sizing", "content")
	);
}

const PASSWORD_MANAGER_MARKERS = {
	"data-1p-ignore": "true",
	"data-bwignore": "true",
	"data-form-type": "other",
	"data-lpignore": "true",
} as const;

function syncTextareaHeight(element: HTMLTextAreaElement, maxRows?: number) {
	element.style.height = "auto";
	let nextHeight = element.scrollHeight;
	let clamped = false;
	if (maxRows !== undefined && maxRows > 0) {
		const computed = window.getComputedStyle(element);
		const parsedLine = Number.parseFloat(computed.lineHeight);
		const lineHeight = Number.isFinite(parsedLine) && parsedLine > 0 ? parsedLine : 20;
		const paddingY =
			(Number.parseFloat(computed.paddingTop) || 0) +
			(Number.parseFloat(computed.paddingBottom) || 0);
		const borderY =
			(Number.parseFloat(computed.borderTopWidth) || 0) +
			(Number.parseFloat(computed.borderBottomWidth) || 0);
		const maxHeight = Math.ceil(lineHeight * maxRows + paddingY + borderY);
		if (nextHeight > maxHeight) {
			nextHeight = maxHeight;
			clamped = true;
		}
	}
	element.style.height = `${nextHeight}px`;
	element.style.overflowY = clamped ? "auto" : "hidden";
}

export type TextareaProps = Omit<React.ComponentProps<"textarea">, "rows"> & {
	/**
	 * The visible text row count.
	 */
	rows?: number;
	/**
	 * The visual size of the text area.
	 * @default "md"
	 */
	size?: TextareaSize;
	/**
	 * Grow vertically with typed content instead of showing an internal scrollbar until clamped by `maxRows`.
	 * @default false
	 */
	autoResize?: boolean;
	/**
	 * Maximum line count when `autoResize` is enabled before scrolling internally.
	 */
	maxRows?: number;
	/**
	 * Ignore password managers on this field.
	 * @default false
	 */
	passwordManagerIgnore?: boolean;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			size = "md",
			autoResize = false,
			maxRows,
			passwordManagerIgnore = false,
			onChange,
			style,
			...props
		},
		ref,
	) => {
		const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
		const nativeAutoResize = autoResize && supportsFieldSizing();
		const assignRef = React.useCallback(
			(node: HTMLTextAreaElement | null) => {
				innerRef.current = node;
				if (typeof ref === "function") {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
				}
			},
			[ref],
		);

		// biome-ignore lint/correctness/useExhaustiveDependencies: re-measure height when controlled value or defaultValue changes.
		React.useLayoutEffect(() => {
			const el = innerRef.current;
			if (!el) return;
			if (autoResize && !nativeAutoResize) {
				syncTextareaHeight(el, maxRows);
			} else {
				el.style.height = "";
				el.style.overflowY = "";
			}
		}, [autoResize, nativeAutoResize, maxRows, props.value, props.defaultValue]);

		const autoResizeStyle =
			nativeAutoResize && maxRows !== undefined && maxRows > 0
				? {
						maxBlockSize: `calc(${maxRows}lh + 2 * ${TEXTAREA_MAX_BLOCK_SIZE_PADDING[size]} + 2 * var(--basalt-border-width))`,
					}
				: undefined;

		return (
			<textarea
				ref={assignRef}
				data-slot="textarea"
				style={autoResizeStyle || style ? { ...autoResizeStyle, ...style } : undefined}
				className={controlSurfaceClass(
					cn(
						"flex w-full text-basalt-foreground placeholder:text-basalt-muted-foreground disabled:cursor-not-allowed disabled:border-transparent disabled:text-basalt-muted-foreground/40",
						TEXTAREA_SIZE_CLASS[size],
						autoResize ? "resize-none" : "resize-y",
						nativeAutoResize && "[field-sizing:content]",
						FOCUS_RING,
						"aria-invalid:border-basalt-danger-solid aria-invalid:focus-visible:border-basalt-danger-solid",
						passwordManagerIgnore && "keeper-ignore",
						className,
					),
				)}
				{...props}
				onChange={(event) => {
					if (autoResize && !nativeAutoResize) {
						syncTextareaHeight(event.currentTarget, maxRows);
					}
					onChange?.(event);
				}}
				{...(passwordManagerIgnore ? PASSWORD_MANAGER_MARKERS : {})}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

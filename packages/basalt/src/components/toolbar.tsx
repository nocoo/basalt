import * as React from "react";
import { cn } from "../utils/cn";
import { Button, type ButtonProps } from "./button";
import { Input } from "./input";
import { FOCUS_INSET } from "./overlay";

const toolbarControlClass = cn(
	"relative min-w-0 rounded-none border-0 bg-transparent shadow-none",
	"first:rounded-l-basalt-md last:rounded-r-basalt-md",
	"focus-within:z-2 focus:z-2 focus-visible:z-2",
);

export type ToolbarProps = Omit<React.HTMLAttributes<HTMLDivElement>, "aria-label"> & {
	/**
	 * Accessible name for the toolbar.
	 */
	"aria-label"?: string;
};

function toolbarItems(root: HTMLElement) {
	return [
		...root.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])"),
	].filter((node) => node.closest('[role="toolbar"]') === root);
}

function setRovingTab(items: HTMLElement[], active: HTMLElement) {
	for (const item of items) {
		item.tabIndex = item === active ? 0 : -1;
	}
}

const ToolbarRoot = React.forwardRef<HTMLDivElement, ToolbarProps>(
	({ className, onKeyDown, onFocus, ...props }, ref) => {
		const innerRef = React.useRef<HTMLDivElement | null>(null);
		React.useLayoutEffect(() => {
			const root = innerRef.current;
			if (!root) {
				return;
			}
			const items = toolbarItems(root);
			const active =
				items.find((item) => item.tabIndex === 0 && !(item as HTMLButtonElement).disabled) ??
				items[0];
			if (active) {
				setRovingTab(items, active);
			}
		});
		return (
			<div
				ref={(node) => {
					innerRef.current = node;
					if (typeof ref === "function") {
						ref(node);
					} else if (ref) {
						ref.current = node;
					}
				}}
				{...props}
				role="toolbar"
				onFocus={(event) => {
					onFocus?.(event);
					const items = toolbarItems(event.currentTarget);
					const target = event.target as HTMLElement;
					if (items.includes(target)) {
						setRovingTab(items, target);
					}
				}}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (event.defaultPrevented || (event.key !== "ArrowRight" && event.key !== "ArrowLeft")) {
						return;
					}
					if (
						event.target instanceof HTMLInputElement ||
						event.target instanceof HTMLTextAreaElement
					) {
						const start = event.target.selectionStart ?? 0;
						const end = event.target.selectionEnd ?? start;
						if (start !== end) {
							return;
						}
						if (event.key === "ArrowLeft" && start > 0) {
							return;
						}
						if (event.key === "ArrowRight" && start < event.target.value.length) {
							return;
						}
					}
					const items = toolbarItems(event.currentTarget);
					const index = items.indexOf(event.target as HTMLElement);
					if (index < 0 || items.length === 0) {
						return;
					}
					event.preventDefault();
					const next =
						event.key === "ArrowRight"
							? (index + 1) % items.length
							: (index - 1 + items.length) % items.length;
					const node = items[next];
					if (node) {
						setRovingTab(items, node);
						node.focus();
					}
				}}
				className={cn(
					"inline-flex w-fit items-stretch rounded-basalt-md bg-basalt-secondary shadow-xs ring-1 ring-basalt-border",
					"[&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-basalt-border",
					className,
				)}
			/>
		);
	},
);
ToolbarRoot.displayName = "Toolbar";

export type ToolbarButtonProps = Omit<ButtonProps, "variant" | "disabled" | "asChild"> & {
	/**
	 * Disable the toolbar button.
	 * @default false
	 */
	disabled?: boolean;
};

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
	({ className, size, icon, children, ...props }, ref) => {
		const resolvedSize = size ?? (icon && children == null ? "icon" : "default");
		return (
			<Button
				ref={ref}
				icon={icon}
				className={cn(
					toolbarControlClass,
					"h-auto min-h-9 shrink-0",
					resolvedSize === "icon" && "w-9",
					className,
				)}
				{...props}
				variant="ghost"
				size={resolvedSize}
			>
				{children}
			</Button>
		);
	},
);
ToolbarButton.displayName = "Toolbar.Button";

export type ToolbarInputProps = Omit<React.ComponentPropsWithoutRef<typeof Input>, "disabled"> & {
	/**
	 * Disable the toolbar input.
	 * @default false
	 */
	disabled?: boolean;
};

export const ToolbarInput = React.forwardRef<HTMLInputElement, ToolbarInputProps>(
	({ className, ...props }, ref) => (
		<Input
			ref={ref}
			className={cn(toolbarControlClass, FOCUS_INSET, "h-auto min-h-9", className)}
			{...props}
		/>
	),
);
ToolbarInput.displayName = "Toolbar.Input";

export const Toolbar = Object.assign(ToolbarRoot, {
	Button: ToolbarButton,
	Input: ToolbarInput,
});

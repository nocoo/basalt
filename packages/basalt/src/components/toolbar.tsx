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

const ToolbarRoot = React.forwardRef<HTMLDivElement, ToolbarProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			{...props}
			role="toolbar"
			className={cn(
				"inline-flex w-fit items-stretch rounded-basalt-md bg-basalt-secondary shadow-xs ring-1 ring-basalt-border",
				"[&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-basalt-border",
				className,
			)}
		/>
	),
);
ToolbarRoot.displayName = "Toolbar";

export type ToolbarButtonProps = Omit<ButtonProps, "variant" | "disabled"> & {
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

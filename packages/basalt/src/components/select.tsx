import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { FOCUS_BORDER, OVERLAY_GAP, overlayItemClass, overlayPanelClass } from "./overlay";

export type SelectProps = Omit<
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
	"value" | "defaultValue" | "onValueChange"
> & {
	/**
	 * The controlled value of the select.
	 */
	value?: string;
	/**
	 * The uncontrolled initial value of the select.
	 */
	defaultValue?: string;
	/**
	 * Called when the selected value changes.
	 */
	onValueChange?: (value: string) => void;
};
export const Select: React.FC<SelectProps> = SelectPrimitive.Root;

export type SelectValueProps = Omit<
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>,
	"placeholder"
> & {
	/**
	 * Content shown when no value is selected.
	 */
	placeholder?: React.ReactNode;
};
export const SelectValue: React.ForwardRefExoticComponent<
	SelectValueProps & React.RefAttributes<React.ElementRef<typeof SelectPrimitive.Value>>
> = SelectPrimitive.Value;

export type SelectGroupProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>;
export const SelectGroup: React.ForwardRefExoticComponent<
	SelectGroupProps & React.RefAttributes<React.ElementRef<typeof SelectPrimitive.Group>>
> = SelectPrimitive.Group;

export type SelectSize = "sm" | "default" | "lg";

const SELECT_SIZE_CLASS: Record<SelectSize, string> = {
	sm: "h-8 px-2.5 text-xs",
	default: "h-9 px-3 text-sm",
	lg: "h-10 px-4 text-base",
};

export type SelectTriggerProps = Omit<
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
	"disabled"
> & {
	/**
	 * The visual size of the trigger.
	 * @default default
	 */
	size?: SelectSize;
	/**
	 * Disable the trigger and mark it busy.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Disable the trigger.
	 * @default false
	 */
	disabled?: boolean;
};

export const SelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	SelectTriggerProps
>(({ className, children, size = "default", loading = false, disabled = false, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		{...props}
		disabled={disabled || loading}
		aria-busy={loading || undefined}
		className={controlSurfaceClass(
			cn(
				"flex w-full items-center justify-between",
				SELECT_SIZE_CLASS[size],
				FOCUS_BORDER,
				"aria-invalid:border-basalt-destructive aria-invalid:focus-visible:border-basalt-destructive",
				className,
			),
		)}
	>
		{children}
		<ChevronDown className="h-4 w-4 opacity-50" />
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export type SelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;

export const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	SelectLabelProps
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn("px-2 py-1.5 text-xs text-basalt-muted-foreground", className)}
		{...props}
	/>
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export type SelectContentProps = Omit<
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
	"position" | "sideOffset"
> & {
	/**
	 * The positioning mode for the select content.
	 * @default popper
	 */
	position?: "item-aligned" | "popper";
	/**
	 * The distance between the trigger and the select content.
	 * @default 4
	 */
	sideOffset?: number;
};

export const SelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	SelectContentProps
>(({ className, children, position = "popper", sideOffset = OVERLAY_GAP, ...props }, ref) => (
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			ref={ref}
			position={position}
			sideOffset={sideOffset}
			className={overlayPanelClass(
				cn(position === "popper" && "w-[var(--radix-select-trigger-width)]", className),
			)}
			{...props}
		>
			<SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export type SelectItemProps = Omit<
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
	"value"
> & {
	/**
	 * The value associated with the select item.
	 */
	value: string;
};

export const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	SelectItemProps
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={overlayItemClass(
			cn(
				"relative pr-8 outline-hidden hover:bg-basalt-accent focus-visible:bg-basalt-accent",
				className,
			),
		)}
		{...props}
	>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		<SelectPrimitive.ItemIndicator className="absolute right-2">
			<Check className="h-3.5 w-3.5" />
		</SelectPrimitive.ItemIndicator>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { useHoverHighlight } from "../utils/use-hover-highlight";
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

type RadixSelectGroupProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>;
export type SelectGroupProps = Omit<RadixSelectGroupProps, "asChild"> & {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Group forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixSelectGroupProps["asChild"];
};
export const SelectGroup: React.ForwardRefExoticComponent<
	SelectGroupProps & React.RefAttributes<React.ElementRef<typeof SelectPrimitive.Group>>
> = SelectPrimitive.Group;

export type SelectSize = "sm" | "default" | "lg";

const SELECT_SIZE_CLASS: Record<SelectSize, string> = {
	sm: "basalt-action basalt-action-sm",
	default: "basalt-action",
	lg: "basalt-action basalt-action-lg",
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
				"group/select flex w-full items-center justify-between",
				SELECT_SIZE_CLASS[size],
				FOCUS_BORDER,
				"aria-invalid:border-basalt-destructive aria-invalid:focus-visible:border-basalt-destructive",
				className,
			),
		)}
	>
		{children}
		<ChevronDown
			aria-hidden="true"
			className="h-basalt-4 w-basalt-4 opacity-50 transition-transform basalt-motion duration-basalt-normal group-data-[state=open]/select:rotate-180 motion-reduce:transition-none"
		/>
	</SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

type RadixSelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;
export type SelectLabelProps = Omit<RadixSelectLabelProps, "asChild"> & {
	/**
	 * Change the default rendered div element to the child element, merging props and behavior.
	 * Label forwards ref to HTMLDivElement and inherits native div attributes.
	 * @default false
	 */
	asChild?: RadixSelectLabelProps["asChild"];
};

export const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	SelectLabelProps
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn(
			"px-basalt-space-lg py-basalt-space-md text-basalt-sm text-basalt-muted-foreground",
			className,
		)}
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
>(({ className, children, position = "popper", sideOffset = OVERLAY_GAP, ...props }, ref) => {
	const highlightRef = useHoverHighlight();
	return (
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
				<SelectPrimitive.Viewport ref={highlightRef} className="basalt-hover-list">
					{children}
				</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
});
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
		data-basalt-hover-item=""
		ref={ref}
		className={overlayItemClass(
			cn(
				"relative outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent",
				className,
			),
		)}
		{...props}
	>
		<SelectPrimitive.ItemText className="min-w-0 flex-1">{children}</SelectPrimitive.ItemText>
		<span className="inline-flex w-basalt-icon shrink-0 justify-end">
			<SelectPrimitive.ItemIndicator>
				<Check className="size-basalt-icon" />
			</SelectPrimitive.ItemIndicator>
		</span>
	</SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

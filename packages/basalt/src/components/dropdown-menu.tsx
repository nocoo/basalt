import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, overlayItemClass, overlayPanelClass } from "./overlay";

export type DropdownMenuProps = Omit<
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>,
	"open" | "defaultOpen" | "onOpenChange"
> & {
	/**
	 * The controlled open state.
	 */
	open?: boolean;
	/**
	 * The uncontrolled initial open state.
	 * @default false
	 */
	defaultOpen?: boolean;
	/**
	 * Called when the open state changes.
	 */
	onOpenChange?: (open: boolean) => void;
};
export const DropdownMenu: React.FC<DropdownMenuProps> = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = MENU_GAP, ...props }, ref) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			ref={ref}
			sideOffset={sideOffset}
			className={overlayPanelClass(cn("min-w-40", className))}
			{...props}
		/>
	</DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export type DropdownMenuItemProps = Omit<
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
	"disabled"
> & {
	/**
	 * Disable the menu item.
	 * @default false
	 */
	disabled?: boolean;
};

export const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	DropdownMenuItemProps
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		className={overlayItemClass(
			cn(
				"relative outline-hidden focus:bg-basalt-accent data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			),
		)}
		{...props}
	/>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

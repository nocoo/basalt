import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";
import { cn } from "../utils/cn";
import { MENU_GAP, OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

export const POPOVER_SIDES = ["top", "bottom", "left", "right"] as const;
export type PopoverSide = (typeof POPOVER_SIDES)[number];

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

export type PopoverContentProps = React.ComponentPropsWithoutRef<
	typeof PopoverPrimitive.Content
> & {
	arrow?: boolean;
};

export const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(
	(
		{
			className,
			align = "center",
			side = "bottom",
			sideOffset = MENU_GAP,
			arrow = true,
			children,
			...props
		},
		ref,
	) => (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				side={side}
				sideOffset={sideOffset}
				className={cn(
					OVERLAY_LAYER,
					OVERLAY_MOTION,
					"rounded-basalt-md border border-basalt-border bg-basalt-popover px-4 py-3 text-sm text-basalt-popover-foreground shadow-md outline-hidden",
					className,
				)}
				{...props}
			>
				{children}
				{arrow ? (
					<PopoverPrimitive.Arrow asChild width={20} height={10}>
						<ArrowSvg />
					</PopoverPrimitive.Arrow>
				) : null}
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Portal>
	),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export const PopoverTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn("m-0 text-base font-medium leading-6 text-basalt-foreground", className)}
		{...props}
	/>
));
PopoverTitle.displayName = "PopoverTitle";

export const PopoverDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("m-0 text-base leading-6 text-basalt-muted-foreground", className)}
		{...props}
	/>
));
PopoverDescription.displayName = "PopoverDescription";

function ArrowSvg(props: React.ComponentProps<"svg">) {
	return (
		<svg width={20} height={10} aria-hidden {...props}>
			<svg width="100%" height="100%" viewBox="0 0 20 10" preserveAspectRatio="none" aria-hidden>
				<path
					d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
					className="fill-basalt-popover"
				/>
				<path
					d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
					className="fill-basalt-border"
				/>
			</svg>
		</svg>
	);
}

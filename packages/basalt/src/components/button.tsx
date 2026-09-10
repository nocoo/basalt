import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { FOCUS_RING } from "./overlay";

const buttonVariants = cva(
	`${BASALT_UI_CLASS} inline-flex items-center justify-center gap-2 rounded-basalt-md text-sm font-medium transition-colors ${FOCUS_RING} disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
	{
		variants: {
			variant: {
				default: "bg-basalt-primary text-basalt-primary-foreground hover:bg-basalt-primary/90",
				secondary: "bg-basalt-control text-basalt-foreground hover:bg-basalt-accent",
				destructive:
					"bg-basalt-destructive text-basalt-destructive-foreground hover:bg-basalt-destructive/90",
				outline:
					"border border-basalt-border bg-basalt-control hover:bg-basalt-accent hover:text-basalt-accent-foreground",
				ghost: "hover:bg-basalt-accent hover:text-basalt-accent-foreground",
				link: "text-basalt-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 rounded-basalt-md px-3 text-xs",
				lg: "h-10 rounded-basalt-md px-6",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
		Omit<VariantProps<typeof buttonVariants>, "variant" | "size"> {
	/**
	 * Visual style variant.
	 * @default "default"
	 */
	variant?: VariantProps<typeof buttonVariants>["variant"];
	/**
	 * Sizing preset.
	 * @default "default"
	 */
	size?: VariantProps<typeof buttonVariants>["size"];
	/**
	 * Pass control to child element slot.
	 *
	 * Note: Child element must forward props and ref in all states. When disabled or loading,
	 * asChild suppresses click, keyboard activation (Enter/Space), and pointer handlers on both
	 * child and parent while retaining browser default Tab navigation without trapping focus.
	 * To preserve single DOM node layout and avoid unexpected child layout shifts, no internal
	 * spinner is inserted in asChild loading mode; visual disabled state is expressed via aria-disabled.
	 *
	 * @default false
	 */
	asChild?: boolean;
	/**
	 * Button type attribute.
	 * @default "button"
	 */
	type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
	/**
	 * Display loading spinner and disable interactions.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Optional leading icon slot.
	 */
	icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			type = "button",
			loading = false,
			icon,
			children,
			disabled,
			...props
		},
		ref,
	) => {
		const isDisabled = Boolean(disabled || loading);

		if (asChild) {
			if (isDisabled && React.isValidElement(children)) {
				const childElement = children as React.ReactElement<Record<string, unknown>>;
				const isNativeButton =
					typeof childElement.type === "string" && childElement.type.toLowerCase() === "button";

				const blockActivationEvent = (event: React.SyntheticEvent | Event) => {
					event.preventDefault();
					event.stopPropagation();
					if (
						"stopImmediatePropagation" in event &&
						typeof event.stopImmediatePropagation === "function"
					) {
						event.stopImmediatePropagation();
					}
				};

				const handleKeyEvent = (event: React.KeyboardEvent) => {
					if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
						event.preventDefault();
					}
					event.stopPropagation();
					if (typeof event.nativeEvent?.stopImmediatePropagation === "function") {
						event.nativeEvent.stopImmediatePropagation();
					}
				};

				const blockedHandlers = {
					onClick: blockActivationEvent,
					onClickCapture: blockActivationEvent,
					onKeyDown: handleKeyEvent,
					onKeyDownCapture: handleKeyEvent,
					onKeyUp: handleKeyEvent,
					onKeyUpCapture: handleKeyEvent,
					onKeyPress: handleKeyEvent,
					onKeyPressCapture: handleKeyEvent,
					onMouseDown: blockActivationEvent,
					onMouseDownCapture: blockActivationEvent,
					onMouseUp: blockActivationEvent,
					onMouseUpCapture: blockActivationEvent,
					onPointerDown: blockActivationEvent,
					onPointerDownCapture: blockActivationEvent,
					onPointerUp: blockActivationEvent,
					onPointerUpCapture: blockActivationEvent,
					onAuxClick: blockActivationEvent,
					onAuxClickCapture: blockActivationEvent,
				};

				const sanitizedChild = React.cloneElement(childElement, {
					...blockedHandlers,
					...(isNativeButton ? { disabled: true } : {}),
					"aria-disabled": true,
					"aria-busy": loading ? true : undefined,
					tabIndex: -1,
				});

				const slotProps: Record<string, unknown> = {
					...props,
					...blockedHandlers,
					"aria-disabled": true,
					"aria-busy": loading ? "true" : undefined,
					tabIndex: -1,
				};
				if (isNativeButton) {
					slotProps.disabled = true;
				}

				return (
					<Slot
						className={cn(buttonVariants({ variant, size }), className)}
						ref={ref}
						{...slotProps}
					>
						{sanitizedChild}
					</Slot>
				);
			}

			return (
				<Slot className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
					{children}
				</Slot>
			);
		}

		const iconNode = loading ? (
			<Loader2 className="animate-basalt-spin motion-reduce:animate-none" aria-hidden="true" />
		) : (
			icon
		);
		return (
			<button
				className={cn(buttonVariants({ variant, size }), className)}
				ref={ref}
				type={type}
				disabled={isDisabled}
				aria-busy={loading || undefined}
				{...props}
			>
				{iconNode}
				{children}
			</button>
		);
	},
);
Button.displayName = "Button";

export interface LinkButtonProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		Omit<VariantProps<typeof buttonVariants>, "variant" | "size"> {
	/**
	 * Visual style variant.
	 * @default "default"
	 */
	variant?: VariantProps<typeof buttonVariants>["variant"];
	/**
	 * Sizing preset.
	 * @default "default"
	 */
	size?: VariantProps<typeof buttonVariants>["size"];
	/**
	 * Optional leading icon slot.
	 */
	icon?: React.ReactNode;
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
	({ className, variant, size, icon, children, ...props }, ref) => (
		<a ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
			{icon}
			{children}
		</a>
	),
);
LinkButton.displayName = "LinkButton";

export { buttonVariants };

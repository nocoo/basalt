import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../utils/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-basalt-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-basalt-background",
	{
		variants: {
			variant: {
				default: "bg-basalt-primary text-basalt-primary-foreground hover:bg-basalt-primary/90",
				secondary: "bg-basalt-secondary text-basalt-foreground hover:bg-basalt-accent",
				destructive:
					"bg-basalt-destructive text-basalt-destructive-foreground hover:bg-basalt-destructive/90",
				outline:
					"border border-basalt-input bg-basalt-background hover:bg-basalt-accent hover:text-basalt-accent-foreground",
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
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size }), className)}
				ref={ref}
				{...(!asChild ? { type } : {})}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export interface LinkButtonProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof buttonVariants> {}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<a ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
	),
);
LinkButton.displayName = "LinkButton";

export { buttonVariants };

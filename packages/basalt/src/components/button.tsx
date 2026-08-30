import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { FOCUS_RING } from "./overlay";

const buttonVariants = cva(
	`inline-flex items-center justify-center gap-2 rounded-basalt-md text-sm font-medium transition-colors ${FOCUS_RING} disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`,
	{
		variants: {
			variant: {
				default: "bg-basalt-primary text-basalt-primary-foreground hover:bg-basalt-primary/90",
				secondary: "bg-basalt-secondary text-basalt-foreground hover:bg-basalt-accent",
				destructive:
					"bg-basalt-destructive text-basalt-destructive-foreground hover:bg-basalt-destructive/90",
				outline:
					"border border-basalt-border bg-basalt-secondary hover:bg-basalt-accent hover:text-basalt-accent-foreground",
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
	loading?: boolean;
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
		const Comp = asChild ? Slot : "button";
		if (asChild) {
			return (
				<Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
					{children}
				</Comp>
			);
		}
		const iconNode = loading ? (
			<Loader2 className="animate-basalt-spin" aria-hidden="true" />
		) : (
			icon
		);
		return (
			<button
				className={cn(buttonVariants({ variant, size }), className)}
				ref={ref}
				type={type}
				disabled={disabled || loading}
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
		VariantProps<typeof buttonVariants> {
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

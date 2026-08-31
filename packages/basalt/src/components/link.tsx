import type * as React from "react";
import { useLinkComponent } from "../providers/link";
import { cn } from "../utils/cn";

export type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
	Record<string, unknown> & {
		/**
		 * The link destination.
		 */
		href: string;
	};

export function Link({ className, href, children, ...props }: LinkProps) {
	const Comp = useLinkComponent();
	return (
		<Comp
			href={href}
			className={cn("text-basalt-primary underline-offset-4 hover:underline", className)}
			{...props}
		>
			{children}
		</Comp>
	);
}

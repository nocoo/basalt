import type { ReactNode } from "react";
import { useLinkComponent } from "../providers/link";
import { cn } from "../utils/cn";

export function Link({
	className,
	href,
	children,
	...props
}: {
	href: string;
	className?: string;
	children?: ReactNode;
} & Record<string, unknown>) {
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

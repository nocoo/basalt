import * as React from "react";
import { cn } from "../utils/cn";

export const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
	),
);
InputGroup.displayName = "InputGroup";

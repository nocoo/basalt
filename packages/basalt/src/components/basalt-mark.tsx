import { Mountain } from "lucide-react";
import type { SVGAttributes } from "react";
import { cn } from "../utils/cn";

export function BasaltMark({ className, ...props }: SVGAttributes<SVGSVGElement>) {
	return (
		<Mountain
			className={cn("h-5 w-5 text-basalt-primary", className)}
			strokeWidth={1.5}
			aria-label="Basalt"
			{...props}
		/>
	);
}

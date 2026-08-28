import { Loader2 } from "lucide-react";
import type { SVGAttributes } from "react";
import { cn } from "../utils/cn";

export function Loader({ className, ...props }: SVGAttributes<SVGSVGElement>) {
	return (
		<Loader2
			className={cn("h-5 w-5 animate-basalt-spin text-basalt-primary", className)}
			aria-label="Loading"
			{...props}
		/>
	);
}

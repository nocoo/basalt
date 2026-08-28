import { Loader2 } from "lucide-react";
import type { SVGAttributes } from "react";
import { cn } from "../utils/cn";

export function Loader({
	className,
	size = 20,
	...props
}: SVGAttributes<SVGSVGElement> & { size?: number }) {
	return (
		<Loader2
			className={cn("animate-basalt-spin text-basalt-primary", className)}
			width={size}
			height={size}
			aria-label="Loading"
			{...props}
		/>
	);
}

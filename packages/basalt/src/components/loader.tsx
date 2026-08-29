import { type SVGAttributes, useId } from "react";
import { cn } from "../utils/cn";

export function Loader({
	className,
	size = 24,
	...props
}: SVGAttributes<SVGSVGElement> & { size?: number }) {
	const gradientId = `basalt-loader-${useId().replace(/:/g, "")}`;
	return (
		<svg
			viewBox="0 0 24 24"
			role="status"
			aria-label="Loading"
			{...props}
			width={size}
			height={size}
			className={cn(
				"origin-center animate-basalt-loader text-basalt-primary motion-reduce:animate-none",
				className,
			)}
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0" />
					<stop offset="55%" stopColor="currentColor" stopOpacity="0.35" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="1" />
				</linearGradient>
			</defs>
			<circle
				cx="12"
				cy="12"
				r="9.5"
				fill="none"
				opacity="0.12"
				stroke="currentColor"
				strokeWidth="2.25"
			/>
			<circle
				cx="12"
				cy="12"
				r="9.5"
				fill="none"
				stroke={`url(#${gradientId})`}
				strokeWidth="2.25"
				strokeLinecap="round"
				strokeDasharray="36 60"
			/>
		</svg>
	);
}

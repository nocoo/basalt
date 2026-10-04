import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { useLoaderViewModel } from "../viewmodels/use-loader";

export interface LoaderProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	/** Width and height of the pixel grid in CSS pixels. @default 16 */
	size?: number;
	/** Visible loading text and default accessible name. @default "Loading" */
	label?: string;
	/** Display the text next to the grid. @default true */
	showLabel?: boolean;
	/** Display elapsed time after the delay. Time starts on mount. @default true */
	showElapsed?: boolean;
	/** Milliseconds before elapsed time is shown. @default 5000 */
	elapsedDelayMs?: number;
	/** Animate the clockwise trail around the eight perimeter cells. @default true */
	animate?: boolean;
	/** Apply a sweeping highlight to the label. @default true */
	shimmer?: boolean;
}

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];

export function Loader({
	className,
	size = 16,
	label = "Loading",
	showLabel = true,
	showElapsed = true,
	elapsedDelayMs = 5000,
	animate = true,
	shimmer = true,
	...props
}: LoaderProps) {
	const vm = useLoaderViewModel(showElapsed, elapsedDelayMs);
	return (
		<span
			role="status"
			aria-label={label}
			className={cn(
				BASALT_UI_CLASS,
				"inline-flex items-center gap-basalt-2_5 text-sm text-basalt-muted-foreground",
				className,
			)}
			{...props}
		>
			<span
				aria-hidden="true"
				data-basalt-loader=""
				data-animated={animate}
				className="grid shrink-0 grid-cols-3 gap-[1.5px]"
				style={{ width: size, height: size }}
			>
				{ORBIT_ORDER.map((cell, step) => (
					<span
						key={`pixel-${cell}`}
						data-step={step}
						className="rounded-[1px] bg-current"
						style={
							{
								"--basalt-pixel-delay": `${step * 100 - 800}ms`,
								gridArea: `${Math.floor(cell / 3) + 1} / ${(cell % 3) + 1}`,
							} as CSSProperties
						}
					/>
				))}
			</span>
			{showLabel && (
				<span
					className={cn("text-[13px] font-medium", shimmer && animate && "basalt-shimmer-label")}
				>
					{label}
				</span>
			)}
			{vm.visible && (
				<span aria-hidden="true" data-basalt-elapsed="" className="font-mono text-xs tabular-nums">
					{vm.text}
				</span>
			)}
		</span>
	);
}

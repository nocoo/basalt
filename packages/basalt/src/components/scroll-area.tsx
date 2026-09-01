import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";
import { cn } from "../utils/cn";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

type RootProps = Omit<
	React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
	| "aria-describedby"
	| "aria-label"
	| "aria-labelledby"
	| "asChild"
	| "children"
	| "className"
	| "onScroll"
	| "role"
	| "tabIndex"
>;

type ViewportProps = Pick<
	React.ComponentPropsWithoutRef<"div">,
	| "aria-describedby"
	| "aria-label"
	| "aria-labelledby"
	| "children"
	| "onScroll"
	| "role"
	| "tabIndex"
>;

export interface ScrollAreaProps extends RootProps, ViewportProps {
	/** Classes applied to the non-scrolling root. */
	className?: string;
	/** Axes that may scroll. @default "vertical" */
	orientation?: ScrollAreaOrientation;
	/** Classes applied to the actual scrolling viewport. */
	viewportClassName?: string;
}

const SCROLLBAR_CLASSES =
	"flex touch-none select-none p-px transition-colors motion-reduce:transition-none";

function ScrollBar({ orientation }: { orientation: "horizontal" | "vertical" }) {
	return (
		<ScrollAreaPrimitive.Scrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				SCROLLBAR_CLASSES,
				orientation === "vertical"
					? "h-full w-2.5 border-l border-l-transparent"
					: "h-2.5 flex-col border-t border-t-transparent",
			)}
		>
			<ScrollAreaPrimitive.Thumb
				data-slot="scroll-area-thumb"
				className="relative flex-1 rounded-full bg-basalt-border"
			/>
		</ScrollAreaPrimitive.Scrollbar>
	);
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
	(
		{
			"aria-describedby": ariaDescribedBy,
			"aria-label": ariaLabel,
			"aria-labelledby": ariaLabelledBy,
			children,
			className,
			onScroll,
			orientation = "vertical",
			role,
			tabIndex = 0,
			viewportClassName,
			...props
		},
		ref,
	) => {
		const hasVertical = orientation !== "horizontal";
		const hasHorizontal = orientation !== "vertical";
		const viewportRole = role ?? (ariaLabel || ariaLabelledBy ? "region" : undefined);

		return (
			<ScrollAreaPrimitive.Root
				data-slot="scroll-area"
				className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}
				{...props}
			>
				<ScrollAreaPrimitive.Viewport
					ref={ref}
					data-orientation={orientation}
					data-slot="scroll-area-viewport"
					aria-describedby={ariaDescribedBy}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
					role={viewportRole}
					tabIndex={tabIndex}
					onScroll={onScroll}
					className={cn(
						"size-full rounded-[inherit] outline-hidden focus-visible:ring-2 focus-visible:ring-basalt-ring focus-visible:ring-offset-2 focus-visible:ring-offset-basalt-background",
						orientation === "vertical" && "overflow-x-hidden!",
						orientation === "horizontal" && "overflow-y-hidden!",
						viewportClassName,
					)}
				>
					{children}
				</ScrollAreaPrimitive.Viewport>
				{hasVertical ? <ScrollBar orientation="vertical" /> : null}
				{hasHorizontal ? <ScrollBar orientation="horizontal" /> : null}
				{hasVertical && hasHorizontal ? (
					<ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
				) : null}
			</ScrollAreaPrimitive.Root>
		);
	},
);
ScrollArea.displayName = "ScrollArea";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import * as React from "react";
import { cn } from "../utils/cn";
import { useSelectionIndicator } from "../utils/selection-indicator";
import { FOCUS_RING } from "./overlay";

const ToggleGroupMode = React.createContext<"single" | "multiple">("single");

export const ToggleGroup = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, children, ...props }, ref) => {
	const sliding = props.type === "single";
	const { bindRef, state, motionClassName } = useSelectionIndicator({
		itemSelector: '[data-state="on"]',
		enabled: sliding,
	});

	return (
		<ToggleGroupMode.Provider value={props.type}>
			<ToggleGroupPrimitive.Root
				ref={bindRef(ref)}
				className={cn(
					"relative inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-basalt-muted p-0.5 ring-1 ring-basalt-border/70",
					className,
				)}
				{...props}
			>
				{sliding ? (
					<span
						aria-hidden="true"
						data-slot="selection-indicator"
						className={cn(
							"pointer-events-none absolute rounded-full bg-basalt-primary shadow-sm",
							motionClassName,
						)}
						style={{
							left: state.left,
							width: state.visible ? state.width : 0,
							top: state.top,
							height: state.visible ? state.height : 0,
						}}
					/>
				) : null}
				{children}
			</ToggleGroupPrimitive.Root>
		</ToggleGroupMode.Provider>
	);
});
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export const ToggleGroupItem = React.forwardRef<
	React.ElementRef<typeof ToggleGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
	const mode = React.useContext(ToggleGroupMode);
	return (
		<ToggleGroupPrimitive.Item
			ref={ref}
			className={cn(
				"relative inline-flex h-7 items-center rounded-full px-2.5 text-[11px] font-semibold tracking-wide text-basalt-muted-foreground transition-colors",
				"hover:text-basalt-foreground",
				FOCUS_RING,
				"data-[state=on]:text-basalt-primary-foreground",
				mode === "multiple" && "data-[state=on]:bg-basalt-primary data-[state=on]:shadow-sm",
				"disabled:pointer-events-none disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

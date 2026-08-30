import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";
import { cn } from "../utils/cn";

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") {
		ref(value);
	} else if (ref) {
		(ref as React.MutableRefObject<T | null>).current = value;
	}
}

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { showIndicator?: boolean }
>(({ className, children, showIndicator = true, ...props }, ref) => {
	const listRef = React.useRef<HTMLDivElement>(null);
	const [indicator, setIndicator] = React.useState({ left: 0, width: 0, top: 0, ready: false });

	const sync = React.useCallback(() => {
		const list = listRef.current;
		if (!list) {
			return;
		}
		const active = list.querySelector<HTMLElement>('[data-state="active"]');
		if (!active) {
			return;
		}
		setIndicator({
			left: active.offsetLeft,
			width: active.offsetWidth,
			top: active.offsetTop + active.offsetHeight,
			ready: true,
		});
	}, []);

	React.useLayoutEffect(() => {
		sync();
		const list = listRef.current;
		if (!list) {
			return;
		}
		const mo = new MutationObserver(sync);
		mo.observe(list, { attributes: true, subtree: true, attributeFilter: ["data-state"] });
		const ro = new ResizeObserver(sync);
		ro.observe(list);
		return () => {
			mo.disconnect();
			ro.disconnect();
		};
	}, [sync]);

	return (
		<TabsPrimitive.List
			ref={(node) => {
				listRef.current = node;
				assignRef(ref, node);
			}}
			className={cn(
				"relative flex flex-wrap items-center gap-1 border-b border-basalt-border",
				className,
			)}
			{...props}
		>
			{children}
			{showIndicator ? (
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute h-0.5 bg-basalt-primary",
						indicator.ready && "transition-[left,width,top] duration-200 ease-out",
					)}
					style={{ left: indicator.left, width: indicator.width, top: indicator.top }}
				/>
			) : null}
		</TabsPrimitive.List>
	);
});
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-basalt-muted-foreground transition-colors hover:text-basalt-foreground data-[state=active]:text-basalt-primary",
			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-3 text-sm text-basalt-foreground data-[state=active]:animate-basalt-tab-in",
			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

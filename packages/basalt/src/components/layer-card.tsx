import { Slot } from "@radix-ui/react-slot";
import {
	Children,
	Fragment,
	forwardRef,
	type HTMLAttributes,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Empty } from "./empty";
import { FOCUS_INSET } from "./overlay";
import { SkeletonLine } from "./skeleton-line";

const ROOT_CLASSES = `${BASALT_UI_CLASS} overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border/50 text-basalt-foreground`;
const PADDING_CLASSES = {
	none: "",
	sm: "p-basalt-card-sm",
	md: "p-basalt-card",
	lg: "p-basalt-card-lg",
	xl: "p-basalt-card-xl",
} as const;

export type LayerCardPadding = keyof typeof PADDING_CLASSES;

export type LayerCardProps = Omit<HTMLAttributes<HTMLDivElement>, "className"> & {
	/**
	 * Additional classes for the card root.
	 */
	className?: string;
	/**
	 * Strengthen the default perimeter hairline.
	 * @default false
	 */
	outlined?: boolean;
	/**
	 * Inner spacing for unstructured card content.
	 * @default "md"
	 */
	padding?: LayerCardPadding;
};
export type LayerCardSectionProps = HTMLAttributes<HTMLDivElement>;
export type LayerCardHeaderProps = LayerCardSectionProps & {
	/** Apply header insets to one child, such as a CollapsibleTrigger, without another wrapper. @default false */
	asChild?: boolean;
	/** Separate the header from its body with a divider. @default false */
	divided?: boolean;
};
export type LayerCardWellProps = LayerCardSectionProps & {
	/**
	 * Draw a hairline ring on a nested well.
	 * @default false
	 */
	outlined?: boolean;
};
export type LayerCardLoadingProps = Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> & {
	/**
	 * Accessible label announced for the loading state.
	 * @default "Loading"
	 */
	label?: string;
};
export type LayerCardEmptyProps = Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> & {
	/**
	 * Empty-state heading.
	 * @default "No content"
	 */
	title?: string;
	/**
	 * Supporting empty-state text.
	 */
	description?: string;
	/**
	 * Optional empty-state icon.
	 */
	icon?: ReactNode;
	/**
	 * Optional interactive action element rendered below empty content.
	 */
	action?: ReactNode;
	/**
	 * Custom supporting content or custom layout rendered between description and action.
	 */
	children?: ReactNode;
};

function isElement(child: ReactNode): child is ReactElement<{ children?: ReactNode }> {
	return isValidElement(child);
}

function hasSlot(children: ReactNode, match: (type: unknown) => boolean): boolean {
	return Children.toArray(children).some((child) => {
		if (!isElement(child)) {
			return false;
		}
		if (match(child.type)) {
			return true;
		}
		if (child.type === Fragment) {
			return hasSlot(child.props.children, match);
		}
		return false;
	});
}

const LayerCardRoot = forwardRef<HTMLDivElement, LayerCardProps>(
	({ className, children, outlined = false, padding = "md", ...props }, ref) => {
		const structured = hasSlot(children, (type) => STRUCTURED_TYPES.has(type));
		return (
			<div
				ref={ref}
				data-basalt-surface=""
				data-card-structured={structured || undefined}
				className={cn(
					ROOT_CLASSES,
					structured ? "flex w-full flex-col" : PADDING_CLASSES[padding],
					outlined && "ring-basalt-border",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
LayerCardRoot.displayName = "LayerCard";

function LayerCardHeader({
	className,
	asChild = false,
	divided = false,
	...props
}: LayerCardHeaderProps) {
	const Component = asChild ? Slot : "div";
	return (
		<Component
			data-slot="card-header"
			className={cn(
				"flex min-w-0 justify-between gap-basalt-space-lg text-basalt-base font-medium tracking-tight text-basalt-foreground",
				asChild
					? "w-full items-center rounded-none rounded-t-basalt-lg last:rounded-b-basalt-lg data-[state=closed]:rounded-b-basalt-lg px-basalt-card py-basalt-card-sm data-[state=open]:border-b data-[state=open]:border-basalt-border"
					: divided
						? "items-start p-basalt-card border-b border-basalt-border"
						: "items-start px-basalt-card pt-basalt-card pb-0",
				asChild && FOCUS_INSET,
				className,
			)}
			{...props}
		/>
	);
}
LayerCardHeader.displayName = "LayerCard.Header";

function LayerCardBody({ className, ...props }: LayerCardSectionProps) {
	return (
		<div data-slot="card-body" className={cn("min-w-0 p-basalt-card", className)} {...props} />
	);
}
LayerCardBody.displayName = "LayerCard.Body";

function LayerCardWell({ className, outlined = false, ...props }: LayerCardWellProps) {
	return (
		<div
			data-basalt-surface=""
			className={cn("min-w-0 p-basalt-card", outlined && "ring-1 ring-basalt-border/40", className)}
			{...props}
		/>
	);
}
LayerCardWell.displayName = "LayerCard.Well";

function LayerCardPrimary(props: LayerCardWellProps) {
	return <LayerCardWell {...props} />;
}
LayerCardPrimary.displayName = "LayerCard.Primary";

function LayerCardSecondary(props: LayerCardHeaderProps) {
	return <LayerCardHeader {...props} />;
}
LayerCardSecondary.displayName = "LayerCard.Secondary";

function LayerCardFooter({ className, ...props }: LayerCardSectionProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-end gap-basalt-space-lg border-t border-basalt-border px-basalt-card py-basalt-card-sm",
				className,
			)}
			{...props}
		/>
	);
}
LayerCardFooter.displayName = "LayerCard.Footer";

function LayerCardLoading({ label = "Loading", className, ...props }: LayerCardLoadingProps) {
	return (
		<div
			role="status"
			aria-label={label}
			className={cn("space-y-basalt-space-lg p-basalt-card", className)}
			{...props}
		>
			<SkeletonLine minWidth={100} maxWidth={100} />
			<SkeletonLine minWidth={72} maxWidth={72} />
			<SkeletonLine minWidth={88} maxWidth={88} />
		</div>
	);
}
LayerCardLoading.displayName = "LayerCard.Loading";

function LayerCardEmpty({ title = "No content", className, ...props }: LayerCardEmptyProps) {
	return <Empty title={title} className={cn("p-basalt-card", className)} {...props} />;
}
LayerCardEmpty.displayName = "LayerCard.Empty";

const STRUCTURED_TYPES = new Set<unknown>([
	LayerCardHeader,
	LayerCardBody,
	LayerCardWell,
	LayerCardFooter,
	LayerCardLoading,
	LayerCardEmpty,
	LayerCardPrimary,
	LayerCardSecondary,
]);

export const LayerCard = Object.assign(LayerCardRoot, {
	Primary: LayerCardPrimary,
	Secondary: LayerCardSecondary,
	Header: LayerCardHeader,
	Body: LayerCardBody,
	Well: LayerCardWell,
	Footer: LayerCardFooter,
	Loading: LayerCardLoading,
	Empty: LayerCardEmpty,
});

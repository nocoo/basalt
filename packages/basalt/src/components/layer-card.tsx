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
import { FOCUS_INSET } from "../utils/overlay";
import { Empty } from "./empty";
import { Skeleton } from "./skeleton";

const ROOT_CLASSES = `${BASALT_UI_CLASS} overflow-hidden rounded-basalt-card ring-1 ring-basalt-border/80 text-basalt-foreground shadow-basalt-card`;
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
	 * Merge card surface, border, and shadow directly onto a single child element (such as a link).
	 * @default false
	 */
	asChild?: boolean;
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
export type LayerCardTitleProps = Omit<HTMLAttributes<HTMLHeadingElement>, "className"> & {
	/** Merge heading typography onto a child element. @default false */
	asChild?: boolean;
	/** Additional classes for the card title. */
	className?: string;
};
export type LayerCardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
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
	({ className, children, asChild = false, outlined = false, padding = "md", ...props }, ref) => {
		const Component = asChild ? Slot : "div";
		const structured = !asChild && hasSlot(children, (type) => STRUCTURED_TYPES.has(type));
		return (
			<Component
				ref={ref}
				data-basalt-surface=""
				data-card-structured={structured || undefined}
				data-outlined={outlined || undefined}
				className={cn(
					ROOT_CLASSES,
					structured
						? "flex w-full flex-col [&>[data-slot=card-header]:not([data-divided])+[data-slot=card-body]]:pt-basalt-card-sm [&>[data-slot=card-header]:not([data-divided]):has(+[data-slot=card-well])]:pb-basalt-card-sm [&>[data-slot=card-header]:not([data-divided])+[data-slot=card-well]]:border-t [&>[data-slot=card-header]:not([data-divided])+[data-slot=card-well]]:border-basalt-border/60 [&>[data-slot=card-body]+[data-slot=card-well]]:border-t [&>[data-slot=card-body]+[data-slot=card-well]]:border-basalt-border/60 [&>[data-slot=card-header]:not([data-divided]):not([data-as-child]):not(:has(+[data-slot=card-body])):not(:has(+[data-slot=card-well]))]:pb-basalt-card [&>[data-slot=card-header][data-divided]+[data-basalt-code][data-code-attached]]:border-t-0"
						: PADDING_CLASSES[padding],
					outlined && "ring-basalt-border",
					className,
				)}
				{...props}
			>
				{children}
			</Component>
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
			data-as-child={asChild || undefined}
			data-divided={divided || undefined}
			className={cn(
				"flex min-w-0 items-center justify-between gap-basalt-space-lg text-basalt-foreground",
				asChild ? "text-basalt-base font-medium" : "text-basalt-lg font-semibold",
				asChild
					? "w-full rounded-none rounded-t-basalt-card last:rounded-b-basalt-card data-[state=closed]:rounded-b-basalt-card px-basalt-card py-basalt-card-sm data-[state=open]:border-b data-[state=open]:border-basalt-border"
					: divided
						? "p-basalt-card border-b border-basalt-border"
						: "px-basalt-card pt-basalt-card pb-0",
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

const LayerCardTitle = forwardRef<HTMLHeadingElement, LayerCardTitleProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot : "h3";
		return (
			<Component
				ref={ref}
				data-slot="card-title"
				className={cn("min-w-0 text-basalt-lg font-semibold text-basalt-foreground", className)}
				{...props}
			/>
		);
	},
);
LayerCardTitle.displayName = "LayerCard.Title";

const LayerCardDescription = forwardRef<HTMLParagraphElement, LayerCardDescriptionProps>(
	({ className, ...props }, ref) => (
		<p
			ref={ref}
			data-slot="card-description"
			className={cn("min-w-0 text-basalt-sm text-basalt-muted-foreground", className)}
			{...props}
		/>
	),
);
LayerCardDescription.displayName = "LayerCard.Description";

function LayerCardWell({ className, outlined = false, ...props }: LayerCardWellProps) {
	return (
		<div
			data-slot="card-well"
			data-basalt-surface=""
			data-outlined={outlined || undefined}
			className={cn(
				"min-w-0 flex-1 p-basalt-card",
				outlined && "ring-1 ring-basalt-border/40",
				className,
			)}
			{...props}
		/>
	);
}
LayerCardWell.displayName = "LayerCard.Well";

function LayerCardFooter({ className, ...props }: LayerCardSectionProps) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				"mt-auto flex flex-wrap items-center justify-end gap-basalt-space-lg border-t border-basalt-border px-basalt-card py-basalt-card-sm",
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
			<Skeleton width="100%" />
			<Skeleton width="72%" />
			<Skeleton width="88%" />
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
]);

export const LayerCard = Object.assign(LayerCardRoot, {
	Title: LayerCardTitle,
	Description: LayerCardDescription,
	Header: LayerCardHeader,
	Body: LayerCardBody,
	Well: LayerCardWell,
	Footer: LayerCardFooter,
	Loading: LayerCardLoading,
	Empty: LayerCardEmpty,
});

import { Slot } from "@radix-ui/react-slot";
import {
	Children,
	cloneElement,
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
import { SkeletonLine } from "./skeleton-line";

const ROOT_CLASSES = `${BASALT_UI_CLASS} overflow-hidden rounded-basalt-lg text-basalt-foreground`;
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
	 * Draw a hairline ring. Default grouping is luminance only.
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

function decorateHeaders(children: ReactNode, divided: boolean): ReactNode {
	if (!divided) {
		return children;
	}
	return Children.map(children, (child) => {
		if (!isElement(child)) {
			return child;
		}
		if (child.type === Fragment) {
			return cloneElement(child, {
				children: decorateHeaders(child.props.children, divided),
			});
		}
		if (child.type === LayerCardHeader || child.type === LayerCardSecondary) {
			const typed = child as ReactElement<{ className?: string }>;
			return cloneElement(typed, {
				className: cn(typed.props.className, "border-b border-basalt-border"),
			});
		}
		return child;
	});
}

const LayerCardRoot = forwardRef<HTMLDivElement, LayerCardProps>(
	({ className, children, outlined = false, padding = "md", ...props }, ref) => {
		const structured = hasSlot(children, (type) => STRUCTURED_TYPES.has(type));
		const hasWell = hasSlot(
			children,
			(type) => type === LayerCardWell || type === LayerCardPrimary,
		);
		const hasBody = hasSlot(children, (type) => type === LayerCardBody);
		const headerDivided = hasBody && !hasWell;
		return (
			<div
				ref={ref}
				data-basalt-surface=""
				data-card-structured={structured || undefined}
				className={cn(
					ROOT_CLASSES,
					structured ? "flex w-full flex-col" : PADDING_CLASSES[padding],
					outlined && "ring-1 ring-basalt-border/40",
					className,
				)}
				{...props}
			>
				{decorateHeaders(children, headerDivided)}
			</div>
		);
	},
);
LayerCardRoot.displayName = "LayerCard";

function LayerCardHeader({ className, asChild = false, ...props }: LayerCardHeaderProps) {
	const Component = asChild ? Slot : "div";
	return (
		<Component
			data-slot="card-header"
			className={cn(
				"flex min-w-0 justify-between gap-basalt-card px-basalt-card py-basalt-card-sm text-basalt-muted-foreground",
				asChild ? "w-full items-center" : "items-start",
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

function LayerCardSecondary(props: LayerCardSectionProps) {
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

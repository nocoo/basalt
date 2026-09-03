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
import { Empty } from "./empty";
import { SkeletonLine } from "./skeleton-line";

const ROOT_CLASSES = "overflow-hidden rounded-basalt-lg text-basalt-foreground";
const PADDING_CLASSES = {
	none: "",
	sm: "p-3",
	md: "p-4",
	lg: "p-6",
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
export type LayerCardEmptyProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
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
};

function isElement(child: ReactNode): child is ReactElement<{ children?: ReactNode }> {
	return isValidElement(child);
}

function childType(child: ReactElement): unknown {
	return child.type;
}

function hasSlot(children: ReactNode, match: (type: unknown) => boolean): boolean {
	return Children.toArray(children).some((child) => {
		if (!isElement(child)) {
			return false;
		}
		if (match(childType(child))) {
			return true;
		}
		if (childType(child) === Fragment) {
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
		if (childType(child) === Fragment) {
			return cloneElement(child, {
				children: decorateHeaders(child.props.children, divided),
			});
		}
		if (childType(child) === LayerCardHeader || childType(child) === LayerCardSecondary) {
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

function LayerCardHeader({ className, ...props }: LayerCardSectionProps) {
	return (
		<div
			className={cn(
				"flex min-w-0 items-start justify-between gap-4 px-4 py-3 text-basalt-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}
LayerCardHeader.displayName = "LayerCard.Header";

function LayerCardBody({ className, ...props }: LayerCardSectionProps) {
	return <div className={cn("min-w-0 p-4", className)} {...props} />;
}
LayerCardBody.displayName = "LayerCard.Body";

function LayerCardWell({ className, outlined = false, ...props }: LayerCardWellProps) {
	return (
		<div
			data-basalt-surface=""
			className={cn("min-w-0 p-4", outlined && "ring-1 ring-basalt-border/40", className)}
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
				"flex flex-wrap items-center justify-end gap-2 border-t border-basalt-border px-4 py-3",
				className,
			)}
			{...props}
		/>
	);
}
LayerCardFooter.displayName = "LayerCard.Footer";

function LayerCardLoading({ label = "Loading", className, ...props }: LayerCardLoadingProps) {
	return (
		<div role="status" aria-label={label} className={cn("space-y-3 p-4", className)} {...props}>
			<SkeletonLine minWidth={100} maxWidth={100} />
			<SkeletonLine minWidth={72} maxWidth={72} />
			<SkeletonLine minWidth={88} maxWidth={88} />
		</div>
	);
}
LayerCardLoading.displayName = "LayerCard.Loading";

function LayerCardEmpty({
	title = "No content",
	description,
	icon,
	className,
	...props
}: LayerCardEmptyProps) {
	return (
		<Empty
			title={title}
			description={description}
			icon={icon}
			className={cn("p-8", className)}
			{...props}
		/>
	);
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

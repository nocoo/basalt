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
import { Empty } from "./empty";
import { SkeletonLine } from "./skeleton-line";

const SURFACE_CLASSES =
	"overflow-hidden rounded-basalt-lg bg-basalt-bright shadow-xs ring-1 ring-basalt-border";
const LAYERED_ROOT_CLASSES =
	"flex w-full flex-col overflow-hidden rounded-basalt-lg bg-basalt-muted text-base ring-1 ring-basalt-border";
const SECONDARY_CLASSES =
	"-my-2 flex items-center gap-2 bg-basalt-muted p-4 text-base font-medium text-basalt-muted-foreground";
const PRIMARY_CLASSES =
	"relative flex flex-col gap-2 overflow-hidden rounded-basalt-lg bg-basalt-bright p-4 pr-3 text-basalt-foreground ring-1 ring-basalt-border";
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
	 * Inner spacing for unstructured card content.
	 * @default "none"
	 */
	padding?: LayerCardPadding;
};
export type LayerCardSectionProps = HTMLAttributes<HTMLDivElement>;
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

function hasLayerCardSections(children: ReactNode): boolean {
	return Children.toArray(children).some((child): boolean => {
		if (!isValidElement(child)) {
			return false;
		}
		if (child.type === LayerCardPrimary || child.type === LayerCardSecondary) {
			return true;
		}
		if (child.type === Fragment) {
			const fragmentChild = child as ReactElement<{ children?: ReactNode }>;
			return hasLayerCardSections(fragmentChild.props.children);
		}
		return false;
	});
}

const LayerCardRoot = forwardRef<HTMLDivElement, LayerCardProps>(
	({ className, children, padding = "none", ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				hasLayerCardSections(children) ? LAYERED_ROOT_CLASSES : SURFACE_CLASSES,
				PADDING_CLASSES[padding],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	),
);
LayerCardRoot.displayName = "LayerCard";

function LayerCardSecondary({ className, ...props }: LayerCardSectionProps) {
	return <div className={cn(SECONDARY_CLASSES, className)} {...props} />;
}
LayerCardSecondary.displayName = "LayerCard.Secondary";

function LayerCardPrimary({ className, ...props }: LayerCardSectionProps) {
	return <div className={cn(PRIMARY_CLASSES, className)} {...props} />;
}
LayerCardPrimary.displayName = "LayerCard.Primary";

function LayerCardHeader({ className, ...props }: LayerCardSectionProps) {
	return (
		<div
			className={cn(
				"flex min-w-0 items-start justify-between gap-4 border-b border-basalt-border px-4 py-3",
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

export const LayerCard = Object.assign(LayerCardRoot, {
	Primary: LayerCardPrimary,
	Secondary: LayerCardSecondary,
	Header: LayerCardHeader,
	Body: LayerCardBody,
	Footer: LayerCardFooter,
	Loading: LayerCardLoading,
	Empty: LayerCardEmpty,
});

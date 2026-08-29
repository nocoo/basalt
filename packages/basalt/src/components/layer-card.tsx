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

const SURFACE_CLASSES =
	"overflow-hidden rounded-basalt-lg bg-white shadow-xs ring-1 ring-basalt-border";
const LAYERED_ROOT_CLASSES =
	"flex w-full flex-col overflow-hidden rounded-basalt-lg bg-basalt-muted text-base ring-1 ring-basalt-border";
const SECONDARY_CLASSES =
	"-my-2 flex items-center gap-2 bg-basalt-muted p-4 text-base font-medium text-basalt-muted-foreground";
const PRIMARY_CLASSES =
	"relative flex flex-col gap-2 overflow-hidden rounded-basalt-lg bg-white p-4 pr-3 text-basalt-foreground ring-1 ring-basalt-border";

export type LayerCardProps = HTMLAttributes<HTMLDivElement>;
export type LayerCardSectionProps = HTMLAttributes<HTMLDivElement>;

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
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				hasLayerCardSections(children) ? LAYERED_ROOT_CLASSES : SURFACE_CLASSES,
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

export const LayerCard = Object.assign(LayerCardRoot, {
	Primary: LayerCardPrimary,
	Secondary: LayerCardSecondary,
});

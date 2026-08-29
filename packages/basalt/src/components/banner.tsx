import { cva, type VariantProps } from "class-variance-authority";
import { Children, createContext, type HTMLAttributes, type ReactNode, useContext } from "react";
import { cn } from "../utils/cn";
import { Button, type ButtonProps } from "./button";

const bannerVariants = cva("flex w-full items-start gap-3 rounded-basalt-md text-sm", {
	variants: {
		variant: {
			default: "bg-basalt-info-tint text-basalt-info",
			alert: "bg-basalt-warning-tint text-basalt-warning",
			error: "bg-basalt-danger-tint text-basalt-danger",
			secondary: "bg-basalt-muted text-basalt-foreground",
		},
		size: {
			base: "px-4 py-3",
			sm: "px-3 py-2",
		},
	},
	defaultVariants: { variant: "default", size: "base" },
});

type BannerVariant = NonNullable<VariantProps<typeof bannerVariants>["variant"]>;
type BannerSize = NonNullable<VariantProps<typeof bannerVariants>["size"]>;

const BannerContext = createContext<{ variant: BannerVariant; size: BannerSize }>({
	variant: "default",
	size: "base",
});

export interface BannerProps
	extends HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof bannerVariants> {
	title?: string;
	description?: ReactNode;
	icon?: ReactNode;
	action?: ReactNode;
}

function isBannerAction(node: ReactNode): boolean {
	return (
		typeof node === "object" &&
		node !== null &&
		"type" in node &&
		(node as { type: unknown }).type === BannerAction
	);
}

function BannerRoot({
	className,
	variant = "default",
	size = "base",
	title,
	description,
	icon,
	action,
	children,
	...props
}: BannerProps) {
	const resolvedVariant = variant ?? "default";
	const resolvedSize = size ?? "base";
	const structured = title != null || description != null;
	const nodes = Children.toArray(action);
	const ctas = nodes.filter(isBannerAction);
	const other = nodes.filter((node) => !isBannerAction(node));
	const trailing = resolvedSize === "sm" ? ctas : [...other, ...ctas];
	const inlineActions = resolvedSize === "sm" ? other : [];

	return (
		<BannerContext.Provider value={{ variant: resolvedVariant, size: resolvedSize }}>
			<div
				className={cn(bannerVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
				{...props}
			>
				{icon ? <span className="mt-0.5 inline-flex shrink-0 [&_svg]:size-5">{icon}</span> : null}
				<div className="min-w-0 flex-1 space-y-0.5">
					{title ? <p className="font-medium">{title}</p> : null}
					{description ? (
						<div
							className={cn(
								resolvedVariant === "secondary" ? "text-basalt-muted-foreground" : "text-current",
							)}
						>
							{description}
							{inlineActions.length > 0 ? <> {inlineActions}</> : null}
						</div>
					) : inlineActions.length > 0 ? (
						<div>{inlineActions}</div>
					) : null}
					{structured ? null : children}
				</div>
				{trailing.length > 0 ? (
					<div className="flex shrink-0 items-center gap-2">{trailing}</div>
				) : null}
			</div>
		</BannerContext.Provider>
	);
}

export function BannerAction({
	className,
	variant = "default",
	size,
	icon,
	children,
	...props
}: ButtonProps) {
	const banner = useContext(BannerContext);
	const mapped =
		variant === "ghost"
			? "ghost"
			: variant === "secondary"
				? "secondary"
				: banner.variant === "error"
					? "destructive"
					: "default";
	const iconOnly = children == null || children === "";
	return (
		<Button
			variant={mapped}
			size={size ?? (iconOnly ? "icon" : banner.size === "sm" ? "sm" : "default")}
			icon={icon}
			className={cn(iconOnly && "size-8", className)}
			{...props}
		>
			{children}
		</Button>
	);
}
BannerAction.displayName = "Banner.Action";

export const Banner = Object.assign(BannerRoot, { Action: BannerAction });

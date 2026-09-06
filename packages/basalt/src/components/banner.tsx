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
	extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children">,
		Omit<VariantProps<typeof bannerVariants>, "variant" | "size"> {
	/**
	 * Visual tone variant of the banner.
	 *
	 * Note: Defaults to "default" (informational). Passing null falls back to "default".
	 *
	 * @default "default"
	 */
	variant?: VariantProps<typeof bannerVariants>["variant"];

	/**
	 * Sizing preset controlling padding geometry and action placement.
	 *
	 * Note: Defaults to "base". In compact mode ("sm"), only direct `<Banner.Action>` elements
	 * are placed in the trailing slot, while other action content renders inline next to the description.
	 * Passing null falls back to "base".
	 *
	 * @default "base"
	 */
	size?: VariantProps<typeof bannerVariants>["size"];

	/**
	 * Primary heading text.
	 *
	 * Note: When present (or when description is present), structured mode is enabled
	 * and standard children are not rendered.
	 */
	title?: string;

	/**
	 * Secondary copy rendered below the title.
	 */
	description?: ReactNode;

	/**
	 * Visual icon rendered before the banner content.
	 */
	icon?: ReactNode;

	/**
	 * Trailing or inline call-to-action slot.
	 * Pass `<Banner.Action>` elements for contextual styling.
	 * In compact mode ("sm"), only direct `<Banner.Action>` elements are placed in the trailing slot,
	 * while other action content renders inline next to the description.
	 */
	action?: ReactNode;

	/**
	 * Unstructured child content rendered only when both title and description are null or undefined.
	 * When title or description is non-null/non-undefined (including empty string or false),
	 * structured mode is active and children are ignored.
	 */
	children?: HTMLAttributes<HTMLDivElement>["children"];
}

export interface BannerActionProps
	extends Omit<
		ButtonProps,
		"variant" | "size" | "asChild" | "type" | "loading" | "icon" | "children"
	> {
	/**
	 * Visual style variant. Preserves "ghost" and "secondary"; all other values
	 * are mapped contextually to "destructive" (when parent Banner variant is "error")
	 * or "default".
	 *
	 * Note: Ordinary function component without forwarded ref.
	 *
	 * @default "default"
	 */
	variant?: ButtonProps["variant"];

	/**
	 * Sizing preset. When unspecified or null, resolves to "icon" if children are omitted,
	 * null, or an empty string, "sm" when parent Banner is compact ("sm"), or "default" otherwise.
	 * When iconOnly mode is resolved, an additional "size-8" class is attached.
	 */
	size?: ButtonProps["size"];

	/**
	 * Pass control to child element slot.
	 *
	 * @default false
	 */
	asChild?: ButtonProps["asChild"];

	/**
	 * Button type attribute.
	 *
	 * @default "button"
	 */
	type?: ButtonProps["type"];

	/**
	 * Display loading spinner and disable interactions.
	 *
	 * @default false
	 */
	loading?: ButtonProps["loading"];

	/**
	 * Optional leading icon slot.
	 */
	icon?: ButtonProps["icon"];

	/**
	 * Action label content. When null, undefined, or empty string, enables iconOnly sizing mode.
	 */
	children?: ButtonProps["children"];
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
}: BannerActionProps) {
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

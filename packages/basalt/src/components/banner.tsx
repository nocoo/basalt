import { cva, type VariantProps } from "class-variance-authority";
import {
	Children,
	createContext,
	type HTMLAttributes,
	isValidElement,
	type ReactNode,
	useContext,
} from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button, type ButtonProps } from "./button";

const bannerVariants = cva(
	"basalt-banner flex w-full items-start gap-basalt-space-lg rounded-basalt-md",
	{
		variants: {
			tone: {
				neutral: "text-basalt-foreground",
				info: "bg-basalt-info-tint text-basalt-info",
				success: "bg-basalt-success-tint text-basalt-success",
				warning: "bg-basalt-warning-tint text-basalt-warning",
				danger: "bg-basalt-danger-tint text-basalt-danger",
			},
			size: {
				md: "",
				sm: "",
			},
		},
		defaultVariants: { tone: "neutral", size: "md" },
	},
);

type BannerTone = NonNullable<VariantProps<typeof bannerVariants>["tone"]>;
type BannerSize = NonNullable<VariantProps<typeof bannerVariants>["size"]>;

const BannerContext = createContext<{ tone: BannerTone; size: BannerSize }>({
	tone: "neutral",
	size: "md",
});

export interface BannerProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children">,
		Omit<VariantProps<typeof bannerVariants>, "tone" | "size"> {
	/**
	 * Semantic tone of the banner.
	 *
	 * Note: Defaults to "neutral" (surface card with foreground text). Passing null falls back to "neutral".
	 *
	 * @default "neutral"
	 */
	tone?: VariantProps<typeof bannerVariants>["tone"];

	/**
	 * Sizing preset controlling action placement; shared banner padding stays consistent.
	 *
	 * Note: Defaults to "md". In compact mode ("sm"), only direct `<Banner.Action>` elements
	 * are placed in the trailing slot, while other action content renders inline next to the description.
	 * Passing null falls back to "md".
	 *
	 * @default "md"
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
	 * are mapped contextually to "destructive" (when parent Banner tone is "danger")
	 * or "default".
	 *
	 * Note: Ordinary function component without forwarded ref.
	 *
	 * @default "default"
	 */
	variant?: ButtonProps["variant"];

	/**
	 * Sizing preset. When unspecified or null, resolves to "icon" if children are omitted,
	 * null, or an empty string, "sm" when parent Banner is compact ("sm"), or "md" otherwise.
	 * Icon-only mode uses the shared intrinsic icon action size.
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
	return isValidElement(node) && node.type === BannerAction;
}

function BannerRoot({
	className,
	tone = "neutral",
	size = "md",
	title,
	description,
	icon,
	action,
	children,
	...props
}: BannerProps) {
	const resolvedTone = tone ?? "neutral";
	const resolvedSize = size ?? "md";
	const structured = title != null || description != null;
	const nodes = Children.toArray(action);
	const ctas = nodes.filter(isBannerAction);
	const other = nodes.filter((node) => !isBannerAction(node));
	const trailing = resolvedSize === "sm" ? ctas : [...other, ...ctas];
	const inlineActions = resolvedSize === "sm" ? other : [];

	return (
		<BannerContext.Provider value={{ tone: resolvedTone, size: resolvedSize }}>
			<div
				data-basalt-surface={resolvedTone === "neutral" ? "" : undefined}
				className={cn(
					BASALT_UI_CLASS,
					bannerVariants({ tone: resolvedTone, size: resolvedSize }),
					className,
				)}
				{...props}
			>
				{icon ? (
					<span className="inline-flex h-[1lh] shrink-0 items-center [&_svg]:size-basalt-icon-lg">
						{icon}
					</span>
				) : null}
				<div className="min-w-0 flex-1 space-y-basalt-space-xs">
					{title ? <p className="font-medium">{title}</p> : null}
					{description ? (
						<div
							className={cn(
								resolvedTone === "neutral" ? "text-basalt-muted-foreground" : "text-current",
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
					<div className="flex shrink-0 items-center gap-basalt-space-lg">{trailing}</div>
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
				: banner.tone === "danger"
					? "destructive"
					: "default";
	const iconOnly = children == null || children === "";
	return (
		<Button
			variant={mapped}
			size={size ?? (iconOnly ? "icon" : banner.size === "sm" ? "sm" : "md")}
			icon={icon}
			className={cn(iconOnly && "basalt-action-icon", className)}
			{...props}
		>
			{children}
		</Button>
	);
}
BannerAction.displayName = "Banner.Action";

export const Banner = Object.assign(BannerRoot, { Action: BannerAction });

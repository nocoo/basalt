import { ChevronRight } from "lucide-react";
import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	type Ref,
} from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Breadcrumbs } from "./breadcrumbs";
import { Button, LinkButton } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

/** Muted 34px ghost icon control with an 18px glyph, shared by every top-right header action. */
const HEADER_ACTION_CLASS =
	"text-basalt-muted-foreground hover:text-basalt-foreground [&_svg]:size-[1.125rem]";

export interface HeaderActionProps
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> {
	/**
	 * Accessible name and default tooltip text.
	 */
	label: string;
	/**
	 * Icon glyph (lucide icon or inline `svg` with `aria-hidden`). Sized to 18px by the action.
	 */
	children: ReactNode;
	/**
	 * Tooltip content below the action; `false` renders no tooltip.
	 * @default label
	 */
	tooltip?: ReactNode | false;
	/**
	 * Renders an anchor instead of a button.
	 */
	href?: string;
	/**
	 * With `href`: open in a new tab (`target="_blank"`, `rel="noopener noreferrer"`) and append
	 * `newTabLabel` to the accessible name.
	 * @default true
	 */
	external?: boolean;
	/**
	 * Suffix appended to the accessible name of an external link.
	 * @default "(opens in a new tab)"
	 */
	newTabLabel?: string;
}

/**
 * Top-right `AppHeader` icon action: a ghost icon button (or link with `href`) whose `label` is
 * both the accessible name and a bottom tooltip. Carries its own `TooltipProvider` and forwards
 * its ref, so it also works as a `SheetTrigger`/`DropdownMenuTrigger` child.
 */
export const HeaderAction = forwardRef<HTMLButtonElement | HTMLAnchorElement, HeaderActionProps>(
	function HeaderAction(
		{
			label,
			children,
			tooltip,
			href,
			external = true,
			newTabLabel = "(opens in a new tab)",
			className,
			type,
			...props
		},
		ref,
	) {
		const classes = cn(HEADER_ACTION_CLASS, className);
		const control =
			href !== undefined ? (
				<LinkButton
					ref={ref as Ref<HTMLAnchorElement>}
					data-slot="header-action"
					variant="ghost"
					size="icon"
					href={href}
					aria-label={external ? `${label} ${newTabLabel}` : label}
					target={external ? "_blank" : undefined}
					rel={external ? "noopener noreferrer" : undefined}
					className={classes}
					{...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
				>
					{children}
					<span className="sr-only">{label}</span>
				</LinkButton>
			) : (
				<Button
					ref={ref as Ref<HTMLButtonElement>}
					data-slot="header-action"
					type={type ?? "button"}
					variant="ghost"
					size="icon"
					aria-label={label}
					className={classes}
					{...props}
				>
					{children}
				</Button>
			);
		if (tooltip === false) return control;
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>{control}</TooltipTrigger>
					<TooltipContent side="bottom" sideOffset={6}>
						{tooltip ?? label}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	},
);

export function AppHeader({
	leading,
	breadcrumbs,
	title,
	actions,
	sticky = false,
	density = "comfortable",
	className,
	...props
}: HTMLAttributes<HTMLElement> & {
	leading?: ReactNode;
	breadcrumbs?: { href?: string; label: ReactNode }[];
	title?: ReactNode;
	actions?: ReactNode;
	/** Keep this row visible in its current scroll owner, including the shell safe area. */
	sticky?: boolean;
	/** Compact is a 52px row; comfortable is 56px. */
	density?: "comfortable" | "compact";
}) {
	return (
		<header
			data-basalt-header=""
			data-sticky={sticky || undefined}
			data-density={density}
			className={cn(
				BASALT_UI_CLASS,
				"flex shrink-0 items-center justify-between gap-basalt-space-lg px-basalt-space-lg md:px-basalt-layout-sm",
				density === "compact" ? "h-[3.25rem]" : "h-basalt-14",
				className,
			)}
			{...props}
		>
			<div className="flex min-w-0 items-center gap-basalt-space-lg">
				{leading ? (
					<div data-basalt-header-leading="" className="flex shrink-0 items-center">
						{leading}
					</div>
				) : null}
				<div className="flex min-w-0 items-center gap-basalt-space-sm">
					{breadcrumbs && breadcrumbs.length > 0 ? (
						<>
							<Breadcrumbs items={breadcrumbs} className="min-w-0" />
							{title ? (
								<ChevronRight
									className="size-basalt-icon-sm shrink-0 text-basalt-muted-foreground"
									aria-hidden="true"
								/>
							) : null}
						</>
					) : null}
					{title ? (
						<h1 className="truncate text-basalt-base font-normal text-basalt-foreground">
							{title}
						</h1>
					) : null}
				</div>
			</div>
			{actions ? (
				<div
					data-basalt-header-actions=""
					className="flex shrink-0 items-center gap-basalt-space-sm"
				>
					{actions}
				</div>
			) : null}
		</header>
	);
}

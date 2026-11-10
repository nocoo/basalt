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

function GitHubGlyph() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
			<path d="M9 18c-4.51 2-5-2-7-2" />
		</svg>
	);
}

function HexlyGlyph() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="m12 2 8.66 5v10L12 22l-8.66-5V7Z" />
			<path d="M12 2v20M3.34 7l17.32 10m0-10L3.34 17" />
		</svg>
	);
}

export interface GitHubLinkProps
	extends Omit<HeaderActionProps, "label" | "children" | "href" | "external"> {
	/**
	 * Repository as `owner/name`, or a full URL.
	 */
	repo: string;
	/**
	 * Accessible name and tooltip.
	 * @default "GitHub repository"
	 */
	label?: string;
}

/** Header link to the project's GitHub repository (new tab), drawn with the GitHub glyph. */
export function GitHubLink({ repo, label = "GitHub repository", ...props }: GitHubLinkProps) {
	const href = /^https?:\/\//.test(repo) ? repo : `https://github.com/${repo}`;
	return (
		<HeaderAction {...props} label={label} href={href} data-project-link="github">
			<GitHubGlyph />
		</HeaderAction>
	);
}

export interface HexlyLinkProps
	extends Omit<HeaderActionProps, "label" | "children" | "href" | "external"> {
	/**
	 * hexly.ai project slug, as in `https://hexly.ai/projects/<project>`.
	 */
	project: string;
	/**
	 * Product name used in the default label.
	 * @default project
	 */
	name?: string;
	/**
	 * Accessible name and tooltip.
	 * @default "<name> on hexly.ai"
	 */
	label?: string;
}

/** Header link to the project's hexly.ai page (new tab), drawn with the hexly glyph. */
export function HexlyLink({ project, name, label, ...props }: HexlyLinkProps) {
	return (
		<HeaderAction
			{...props}
			label={label ?? `${name ?? project} on hexly.ai`}
			href={`https://hexly.ai/projects/${encodeURIComponent(project)}`}
			data-project-link="hexly"
		>
			<HexlyGlyph />
		</HeaderAction>
	);
}

export interface ProjectLinksProps {
	/**
	 * GitHub repository (`owner/name` or URL); omitted renders no GitHub link.
	 */
	github?: string;
	/**
	 * hexly.ai project slug; omitted renders no hexly link.
	 */
	hexly?: string;
	/**
	 * Product name for the hexly label.
	 * @default hexly
	 */
	name?: string;
	/**
	 * GitHub link label.
	 * @default "GitHub repository"
	 */
	githubLabel?: string;
	/**
	 * hexly link label.
	 * @default "<name> on hexly.ai"
	 */
	hexlyLabel?: string;
	/**
	 * Suffix for both links' accessible names.
	 * @default "(opens in a new tab)"
	 */
	newTabLabel?: string;
}

/** The standard GitHub + hexly.ai pair, in that order, for `AppHeader.actions` before `ThemeToggle`. */
export function ProjectLinks({
	github,
	hexly,
	name,
	githubLabel,
	hexlyLabel,
	newTabLabel,
}: ProjectLinksProps) {
	return (
		<>
			{github ? (
				<GitHubLink
					repo={github}
					{...(githubLabel !== undefined ? { label: githubLabel } : {})}
					{...(newTabLabel !== undefined ? { newTabLabel } : {})}
				/>
			) : null}
			{hexly ? (
				<HexlyLink
					project={hexly}
					{...(name !== undefined ? { name } : {})}
					{...(hexlyLabel !== undefined ? { label: hexlyLabel } : {})}
					{...(newTabLabel !== undefined ? { newTabLabel } : {})}
				/>
			) : null}
		</>
	);
}

export function AppHeader({
	leading,
	breadcrumbs,
	breadcrumbsLabel,
	title,
	actions,
	sticky = false,
	density = "comfortable",
	className,
	...props
}: HTMLAttributes<HTMLElement> & {
	leading?: ReactNode;
	breadcrumbs?: { href?: string; label: ReactNode }[];
	/** Accessible name of the breadcrumb landmark; defaults to Breadcrumbs' "Breadcrumb". */
	breadcrumbsLabel?: string;
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
							<Breadcrumbs
								items={breadcrumbs}
								className="min-w-0"
								{...(breadcrumbsLabel !== undefined ? { "aria-label": breadcrumbsLabel } : {})}
							/>
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

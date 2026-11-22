import { forwardRef } from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { Check, CircleAlert, Copy } from "../utils/internal-icons";
import { useCopy } from "../utils/use-copy";
import { Button } from "./button";

export interface ClipboardTextProps {
	/**
	 * Text string displayed in the inline code block and default text copied to the clipboard.
	 */
	text: string;
	/**
	 * Optional alternate text string written to clipboard instead of `text`.
	 * @default text
	 */
	copyText?: string;
	/**
	 * Accessible label for the copy button. Override when multiple copy controls appear on the same page.
	 * @default "Copy"
	 */
	copyLabel?: string;
	/**
	 * Additional CSS classes applied to the root container.
	 */
	className?: string;
}

export const ClipboardText = forwardRef<HTMLDivElement, ClipboardTextProps>(
	({ text, copyText, copyLabel = "Copy", className }, ref) => {
		const { status, announcementCount, copy } = useCopy();
		return (
			<div
				ref={ref}
				data-slot="clipboard-text"
				data-status={status}
				className={controlSurfaceClass(
					cn(
						"inline-flex min-h-basalt-control max-w-full items-stretch",
						status === "error" && "border-basalt-danger-solid",
						className,
					),
				)}
			>
				<code className="flex min-w-0 items-center truncate rounded-l-basalt-md bg-transparent px-basalt-space-lg font-basalt-mono text-basalt-md text-basalt-foreground">
					{text}
				</code>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					aria-label={copyLabel}
					className={cn(
						"basalt-action-inset w-basalt-control shrink-0 rounded-none rounded-r-basalt-md border-0 border-l border-basalt-border shadow-none",
						status === "error" && "text-basalt-danger",
					)}
					onClick={() => void copy(copyText ?? text)}
				>
					{status === "copied" ? (
						<Check aria-hidden="true" />
					) : status === "error" ? (
						<CircleAlert aria-hidden="true" />
					) : (
						<Copy aria-hidden="true" />
					)}
				</Button>
				<span role="status" className="sr-only">
					{status === "copied"
						? `Copied${announcementCount % 2 === 0 ? "\u00A0" : ""}`
						: status === "error"
							? `Copy failed${announcementCount % 2 === 0 ? "\u00A0" : ""}`
							: ""}
				</span>
			</div>
		);
	},
);
ClipboardText.displayName = "ClipboardText";

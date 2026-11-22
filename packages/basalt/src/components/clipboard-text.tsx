import { forwardRef } from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { Check, Copy } from "../utils/internal-icons";
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
	 * Additional CSS classes applied to the root container.
	 */
	className?: string;
}

export const ClipboardText = forwardRef<HTMLDivElement, ClipboardTextProps>(
	({ text, copyText, className }, ref) => {
		const { copied, copy } = useCopy();
		return (
			<div
				ref={ref}
				data-slot="clipboard-text"
				className={controlSurfaceClass(
					cn("inline-flex min-h-basalt-control max-w-full items-stretch", className),
				)}
			>
				<code className="flex min-w-0 items-center truncate rounded-l-basalt-md bg-transparent px-basalt-space-lg font-basalt-mono text-basalt-md text-basalt-foreground">
					{text}
				</code>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					aria-label="Copy"
					className="basalt-action-inset w-basalt-control shrink-0 rounded-none rounded-r-basalt-md border-0 border-l border-basalt-border shadow-none"
					onClick={() => void copy(copyText ?? text)}
				>
					{copied ? <Check /> : <Copy />}
				</Button>
			</div>
		);
	},
);
ClipboardText.displayName = "ClipboardText";

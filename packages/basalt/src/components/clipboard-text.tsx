import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { controlSurfaceClass } from "./control-surface";

export function ClipboardText({
	text,
	copyText,
	className,
}: {
	text: string;
	copyText?: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	return (
		<div
			data-slot="clipboard-text"
			className={controlSurfaceClass(
				cn("inline-flex h-9 max-w-full items-stretch shadow-xs", className),
			)}
		>
			<code className="flex h-full min-w-0 items-center truncate rounded-l-basalt-md bg-transparent px-4 font-mono text-sm text-basalt-foreground">
				{text}
			</code>
			<Button
				type="button"
				size="icon"
				variant="ghost"
				aria-label="Copy"
				className="h-full min-h-0 w-9 shrink-0 rounded-none rounded-r-basalt-md border-0 border-l border-basalt-border shadow-none"
				onClick={async () => {
					await navigator.clipboard.writeText(copyText ?? text);
					setCopied(true);
				}}
			>
				{copied ? <Check /> : <Copy />}
			</Button>
		</div>
	);
}

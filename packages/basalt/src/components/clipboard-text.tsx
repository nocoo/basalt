import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";

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
			className={cn(
				"inline-flex max-w-full items-stretch rounded-basalt-lg border border-basalt-border bg-basalt-background text-sm shadow-xs",
				className,
			)}
		>
			<code className="flex min-w-0 items-center truncate rounded-l-basalt-lg bg-transparent px-4 py-2 font-mono text-sm text-basalt-foreground">
				{text}
			</code>
			<Button
				type="button"
				size="icon"
				variant="ghost"
				aria-label="Copy"
				className="h-auto min-h-9 w-9 shrink-0 rounded-none rounded-r-basalt-lg border-0 border-l border-basalt-border shadow-none"
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

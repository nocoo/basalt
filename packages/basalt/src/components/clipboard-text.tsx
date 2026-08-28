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
		<div className={cn("inline-flex max-w-full items-center gap-2", className)}>
			<code className="truncate rounded-basalt-sm bg-basalt-secondary px-2 py-1 font-mono text-xs">
				{text}
			</code>
			<Button
				type="button"
				size="icon"
				variant="ghost"
				aria-label="Copy"
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

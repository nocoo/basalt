import { Check, Copy } from "lucide-react";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

const TOKEN =
	/(\/\/[^\n]*)|("[^"]*"|'[^']*'|`[^`]*`)|\b(import|from|export|default|function|return|const|let|type|interface|as)\b|(<\/?[A-Za-z][\w.-]*)/g;

function highlight(code: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let last = 0;
	let key = 0;
	for (const match of code.matchAll(TOKEN)) {
		const index = match.index ?? 0;
		if (index > last) {
			nodes.push(code.slice(last, index));
		}
		const className = match[1]
			? "text-muted-foreground"
			: match[2]
				? "text-foreground"
				: match[3]
					? "text-destructive"
					: "text-primary";
		nodes.push(
			<span key={key} className={className}>
				{match[0]}
			</span>,
		);
		key += 1;
		last = index + match[0].length;
	}
	if (last < code.length) {
		nodes.push(code.slice(last));
	}
	return nodes;
}

export function DocCode({ code, attached = false }: { code: string; attached?: boolean }) {
	const [copied, setCopied] = useState(false);
	return (
		<div
			className={cn(
				"relative bg-secondary",
				attached ? "border-t border-border" : "overflow-hidden rounded-lg border border-border",
			)}
		>
			<button
				type="button"
				aria-label="Copy"
				className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				onClick={async () => {
					await navigator.clipboard.writeText(code);
					setCopied(true);
				}}
			>
				{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
			</button>
			<pre className="overflow-x-auto p-4 pr-12 text-[13px] leading-6 text-foreground">
				<code>{highlight(code)}</code>
			</pre>
		</div>
	);
}

export function DocExample({ children, code }: { children: ReactNode; code: string }) {
	return (
		<div className="overflow-hidden rounded-lg border border-border">
			<div className="flex min-h-[140px] items-center justify-center bg-bright p-6 md:p-8">
				{children}
			</div>
			<DocCode code={code} attached />
		</div>
	);
}

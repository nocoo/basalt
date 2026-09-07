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
				"relative min-w-0 max-w-full bg-secondary",
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
			<pre
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow regions need keyboard scrolling.
				tabIndex={0}
				role="region"
				aria-label="Code example"
				className="max-w-full overflow-x-auto p-4 pr-12 text-[13px] leading-6 text-foreground focus-visible:outline-2 focus-visible:outline-primary"
			>
				<code>{highlight(code)}</code>
			</pre>
		</div>
	);
}

export function DocExample({
	children,
	code,
	wide = false,
}: {
	children: ReactNode;
	code: string;
	wide?: boolean;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-border">
			<div
				className={cn(
					"flex min-h-[140px] items-center justify-center bg-bright",
					wide
						? "p-3 sm:p-6 [&>div]:w-full [&>div]:min-w-0"
						: "min-w-0 p-4 sm:p-6 md:p-8 [&>*]:max-w-full",
				)}
			>
				{children}
			</div>
			{wide ? (
				<details className="border-t border-border">
					<summary className="cursor-pointer px-4 py-3 text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary">
						View example code
					</summary>
					<DocCode code={code} attached />
				</details>
			) : (
				<DocCode code={code} attached />
			)}
		</div>
	);
}

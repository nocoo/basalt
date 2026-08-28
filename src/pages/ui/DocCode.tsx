import { type ReactNode, useState } from "react";

const TOKEN =
	/(\/\/[^\n]*)|("[^"]*"|'[^']*')|\b(import|from|export|default|function|return|const|let|type|interface)\b/g;

function highlight(code: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let last = 0;
	let key = 0;
	for (const match of code.matchAll(TOKEN)) {
		const index = match.index ?? 0;
		if (index > last) {
			nodes.push(code.slice(last, index));
		}
		if (match[1]) {
			nodes.push(
				<span key={key} className="text-muted-foreground">
					{match[1]}
				</span>,
			);
		} else if (match[2]) {
			nodes.push(
				<span key={key} className="text-primary">
					{match[2]}
				</span>,
			);
		} else {
			nodes.push(
				<span key={key} className="text-primary">
					{match[0]}
				</span>,
			);
		}
		key += 1;
		last = index + match[0].length;
	}
	if (last < code.length) {
		nodes.push(code.slice(last));
	}
	return nodes;
}

export function DocCode({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<div className="relative rounded-widget border border-border bg-card">
			<button
				type="button"
				className="absolute right-2 top-2 text-xs underline underline-offset-4 text-foreground"
				onClick={async () => {
					await navigator.clipboard.writeText(code);
					setCopied(true);
				}}
			>
				{copied ? "Copied" : "Copy"}
			</button>
			<pre className="overflow-x-auto p-3 pr-16 text-xs text-foreground">
				<code>{highlight(code)}</code>
			</pre>
		</div>
	);
}

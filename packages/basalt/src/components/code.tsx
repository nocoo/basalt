import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";

const TOKEN =
	/(\/\/[^\n]*)|("[^"]*"|'[^']*'|`[^`]*`)|\b(import|from|export|default|async|await|function|return|const|let|var|type|interface|as|if|else|throw|new|typeof)\b|(\b\d+\b)|(<\/?[A-Za-z][\w.-]*)/g;

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
			? "text-basalt-muted-foreground"
			: match[2]
				? "text-basalt-chart-5"
				: match[3]
					? "text-basalt-primary"
					: match[4]
						? "text-basalt-chart-4"
						: "text-basalt-primary";
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

export function Code({ className, ...props }: HTMLAttributes<HTMLElement>) {
	return (
		<code
			className={cn(
				"rounded-basalt-sm bg-basalt-secondary px-1.5 py-0.5 font-mono text-[13px] text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function CodeBlock({ className, ...props }: HTMLAttributes<HTMLPreElement>) {
	return (
		<pre
			className={controlSurfaceClass(
				cn("overflow-x-auto p-4 font-mono text-basalt-foreground", className),
			)}
			{...props}
		/>
	);
}

export function CodeHighlighted({
	code,
	className,
	...props
}: HTMLAttributes<HTMLPreElement> & { code: string }) {
	return (
		<pre
			className={controlSurfaceClass(cn("overflow-x-auto p-4 text-basalt-foreground", className))}
			{...props}
		>
			<code className="font-mono leading-6">{highlight(code)}</code>
		</pre>
	);
}

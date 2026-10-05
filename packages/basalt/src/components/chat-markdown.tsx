import { type MarkedToken, marked, type Token } from "marked";
import { Fragment, type ReactNode, useMemo, useState } from "react";
import { contextSourceHref } from "../models/context-cards";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { CodeHighlighted } from "./code";

export interface ChatMarkdownProps {
	/** Untrusted Markdown. Raw HTML is rendered as text, never injected. */
	content: string;
	className?: string;
}

function CodeFence({ text, language }: { text: string; language?: string }) {
	const [copy, setCopy] = useState("Copy code");
	return (
		<div className="overflow-hidden rounded-basalt-md border border-basalt-border">
			<div className="flex items-center justify-between gap-basalt-2 bg-basalt-secondary px-basalt-3 py-basalt-1">
				<span className="font-mono text-xs text-basalt-muted-foreground">{language || "text"}</span>
				<Button
					size="sm"
					variant="ghost"
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(text);
							setCopy("Copied");
						} catch {
							setCopy("Copy failed");
						}
					}}
				>
					{copy}
				</Button>
			</div>
			<CodeHighlighted code={text} className="max-w-full border-0 rounded-none text-xs" />
		</div>
	);
}

function nodes(tokens: readonly Token[]): ReactNode {
	return tokens.map((raw, index) => {
		const token = raw as MarkedToken;
		let node: ReactNode;
		switch (token.type) {
			case "space":
			case "def":
				return null;
			case "heading": {
				const Heading = `h${Math.min(6, token.depth + 1)}` as "h2";
				node = <Heading className="font-semibold text-base">{nodes(token.tokens)}</Heading>;
				break;
			}
			case "paragraph":
				node = <p>{nodes(token.tokens)}</p>;
				break;
			case "text":
				node = token.tokens ? nodes(token.tokens) : token.text;
				break;
			case "strong":
				node = <strong>{nodes(token.tokens)}</strong>;
				break;
			case "em":
				node = <em>{nodes(token.tokens)}</em>;
				break;
			case "del":
				node = <del>{nodes(token.tokens)}</del>;
				break;
			case "codespan":
				node = (
					<code className="rounded-basalt-sm bg-basalt-accent px-basalt-1 py-basalt-0_5 font-mono text-[0.9em]">
						{token.text}
					</code>
				);
				break;
			case "code":
				node = <CodeFence text={token.text} language={token.lang} />;
				break;
			case "blockquote":
				node = (
					<blockquote className="border-l-2 border-basalt-border pl-basalt-3 text-basalt-muted-foreground">
						{nodes(token.tokens)}
					</blockquote>
				);
				break;
			case "list": {
				const List = token.ordered ? "ol" : "ul";
				node = (
					<List
						start={token.ordered ? Number(token.start) || 1 : undefined}
						className={cn(
							"space-y-basalt-1 pl-basalt-5",
							token.ordered ? "list-decimal" : "list-disc",
						)}
					>
						{token.items.map((item, i) => (
							<li key={`${index}-${i}`}>
								{item.task && (
									<span aria-label={item.checked ? "Complete" : "Incomplete"} role="img">
										{item.checked ? "☑ " : "☐ "}
									</span>
								)}
								{nodes(item.tokens)}
							</li>
						))}
					</List>
				);
				break;
			}
			case "link":
			case "image": {
				const href = contextSourceHref(token.href);
				const text = token.type === "link" ? nodes(token.tokens) : token.text;
				node = href ? (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="text-basalt-primary underline underline-offset-4"
					>
						{text}
					</a>
				) : (
					text
				);
				break;
			}
			case "table":
				node = (
					<div className="max-w-full overflow-x-auto">
						<table className="w-full border-collapse text-left text-xs">
							<thead>
								<tr>
									{token.header.map((cell, i) => (
										<th
											key={i}
											className="whitespace-nowrap border-b border-basalt-border px-basalt-2 py-basalt-1_5"
										>
											{nodes(cell.tokens)}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{token.rows.map((row, i) => (
									<tr key={i}>
										{row.map((cell, j) => (
											<td
												key={j}
												className="border-b border-basalt-border px-basalt-2 py-basalt-1_5"
											>
												{nodes(cell.tokens)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				);
				break;
			case "br":
				node = <br />;
				break;
			case "hr":
				node = <hr className="border-basalt-border" />;
				break;
			default:
				node = "text" in token ? String(token.text) : token.raw;
		}
		return <Fragment key={index}>{node}</Fragment>;
	});
}

export function ChatMarkdown({ content, className }: ChatMarkdownProps) {
	const tokens = useMemo(() => marked.lexer(content, { gfm: true }), [content]);
	return (
		<div
			className={cn(
				"min-w-0 space-y-basalt-3 break-words text-sm leading-[var(--basalt-line-relaxed)] [&_p]:whitespace-pre-wrap",
				className,
			)}
		>
			{nodes(tokens)}
		</div>
	);
}

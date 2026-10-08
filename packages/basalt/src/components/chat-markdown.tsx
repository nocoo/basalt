import { decodeHTML } from "entities";
import { type MarkedToken, marked, type Token } from "marked";
import { Fragment, type ReactNode, useMemo } from "react";
import { contextSourceHref } from "../models/context-cards";
import { cn } from "../utils/cn";
import { CodeHighlighted } from "./code";

export interface ChatMarkdownProps {
	/** Untrusted Markdown. Raw HTML is rendered as text, never injected. */
	content: string;
	/** Animate newly appended prose words; disable for static output. */
	streaming?: boolean;
	className?: string;
}

function nodes(tokens: readonly Token[], streaming = false): ReactNode {
	return tokens.map((raw, index) => {
		const token = raw as MarkedToken;
		let node: ReactNode;
		switch (token.type) {
			case "space":
			case "def":
				return null;
			case "heading": {
				const Heading = `h${Math.min(6, token.depth + 1)}` as "h2";
				node = (
					<Heading className="font-semibold text-basalt-lg">
						{nodes(token.tokens, streaming)}
					</Heading>
				);
				break;
			}
			case "paragraph":
				node = <p>{nodes(token.tokens, streaming)}</p>;
				break;
			case "text":
				node = token.tokens
					? nodes(token.tokens, streaming)
					: streaming
						? decodeHTML(token.text)
								.split(/(\s+)/)
								.map((word, i) =>
									/\S/.test(word) ? (
										<span key={i} className="basalt-chat-word">
											{word}
										</span>
									) : (
										word
									),
								)
						: decodeHTML(token.text);
				break;
			case "strong":
				node = <strong>{nodes(token.tokens, streaming)}</strong>;
				break;
			case "em":
				node = <em>{nodes(token.tokens, streaming)}</em>;
				break;
			case "del":
				node = <del>{nodes(token.tokens, streaming)}</del>;
				break;
			case "codespan":
				node = (
					<code className="rounded-basalt-sm bg-basalt-accent px-basalt-space-sm py-basalt-space-xs font-mono text-basalt-sm">
						{token.text}
					</code>
				);
				break;
			case "code":
				node = <CodeHighlighted code={token.text} title={token.lang || "text"} lineNumbers />;
				break;
			case "blockquote":
				node = (
					<blockquote className="border-l-2 border-basalt-border pl-basalt-space-lg text-basalt-muted-foreground">
						{nodes(token.tokens, streaming)}
					</blockquote>
				);
				break;
			case "list": {
				const List = token.ordered ? "ol" : "ul";
				node = (
					<List
						start={token.ordered ? Number(token.start) || 1 : undefined}
						className={cn(
							"space-y-basalt-space-sm pl-basalt-space-lg",
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
								{nodes(item.tokens, streaming)}
							</li>
						))}
					</List>
				);
				break;
			}
			case "link":
			case "image": {
				const href = contextSourceHref(decodeHTML(token.href));
				const text =
					token.type === "link" ? nodes(token.tokens, streaming) : decodeHTML(token.text);
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
						<table className="w-full border-collapse text-left text-basalt-sm">
							<thead>
								<tr>
									{token.header.map((cell, i) => (
										<th
											key={i}
											className="whitespace-nowrap border-b border-basalt-border px-basalt-space-lg py-basalt-space-md"
										>
											{nodes(cell.tokens, streaming)}
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
												className="border-b border-basalt-border px-basalt-space-lg py-basalt-space-md"
											>
												{nodes(cell.tokens, streaming)}
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

export function ChatMarkdown({ content, streaming = false, className }: ChatMarkdownProps) {
	const rendered = useMemo(
		() => nodes(marked.lexer(content, { gfm: true }), streaming),
		[content, streaming],
	);
	return (
		<div
			className={cn(
				"basalt-ui min-w-0 space-y-basalt-space-lg break-words text-basalt-base leading-[var(--basalt-line-relaxed)] [&_p]:whitespace-pre-wrap",
				className,
			)}
		>
			{rendered}
		</div>
	);
}

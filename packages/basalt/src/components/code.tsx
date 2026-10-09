import { Check, Copy, FileCode2 } from "lucide-react";
import { type HTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { useCodeBlock } from "../viewmodels/use-code-block";
import { Button } from "./button";

export type CodeProps = {
	/** Additional classes for the inline code. */
	className?: string;
};

export function Code({ className, ...props }: CodeProps & HTMLAttributes<HTMLElement>) {
	return (
		<code
			className={cn(
				"rounded-basalt-sm bg-basalt-secondary px-basalt-space-md py-basalt-space-xs font-mono text-basalt-sm text-basalt-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export interface CodeBlockProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title" | "className"> {
	/** Exact source text. Copy preserves whitespace and original line endings. */
	children: string;
	/** Filename or label shown in the header. Defaults to "Code" when copyable. */
	title?: string;
	/** Decorative header icon. Defaults to a file-code glyph; pass null to hide. */
	icon?: ReactNode;
	/** Show the copy control and its success/error feedback. @default true */
	copyable?: boolean;
	/** Show a non-selectable, screen-reader-hidden line-number gutter. @default false */
	lineNumbers?: boolean;
	/** Join a card edge without an outer frame. Code retains its own header and content insets. @default false */
	attached?: boolean;
	/** Additional classes for the panel root, not the inner pre element. */
	className?: string;
}

export function CodeBlock(props: CodeBlockProps) {
	return <CodePanel {...props} />;
}

export interface CodeHighlightedProps extends Omit<CodeBlockProps, "children"> {
	/** Source text to highlight with the built-in lightweight tokenizer. */
	code: string;
}

export function CodeHighlighted({ code, ...props }: CodeHighlightedProps) {
	return (
		<CodePanel {...props} highlighted>
			{code}
		</CodePanel>
	);
}

function CodePanel({
	children: code,
	title,
	icon = <FileCode2 strokeWidth={1.5} />,
	copyable = true,
	lineNumbers = false,
	attached = false,
	className,
	highlighted = false,
	...props
}: CodeBlockProps & { highlighted?: boolean }) {
	const vm = useCodeBlock(code, highlighted);
	const id = useId();
	const heading = title || "Code";
	const header = Boolean(title) || copyable;
	const copyLabel =
		vm.status === "copied" ? "Copied" : vm.status === "error" ? "Copy failed" : "Copy code";
	return (
		<div
			data-basalt-code=""
			data-code-attached={attached || undefined}
			className={controlSurfaceClass(
				cn(
					"flex min-h-0 min-w-0 max-w-full flex-col overflow-hidden text-basalt-foreground",
					attached && "rounded-none border-0 border-t",
					className,
				),
			)}
			{...props}
		>
			{header && (
				<div
					data-slot="code-header"
					className="flex shrink-0 flex-wrap items-center justify-between gap-basalt-space-lg border-b border-basalt-border px-basalt-panel-x py-basalt-panel-y"
				>
					<div className="flex min-w-0 flex-1 items-center gap-basalt-row-gap">
						{icon && (
							<span
								aria-hidden="true"
								className="flex size-basalt-icon shrink-0 items-center justify-center text-basalt-muted-foreground [&_svg]:size-basalt-icon"
							>
								{icon}
							</span>
						)}
						<span
							id={id}
							title={heading}
							className="min-w-0 break-words font-mono text-basalt-code leading-[var(--basalt-line-row)] [overflow-wrap:anywhere]"
						>
							{heading}
						</span>
					</div>
					{copyable && (
						<Button
							variant="ghost"
							className="shrink-0 border-0 px-basalt-space-md font-normal text-basalt-muted-foreground [&_svg]:size-basalt-icon-sm"
							aria-label={copyLabel}
							disabled={vm.status === "pending"}
							onClick={() => void vm.copy((text) => navigator.clipboard.writeText(text))}
						>
							{vm.status === "copied" ? (
								<Check aria-hidden="true" strokeWidth={1.5} />
							) : (
								<Copy aria-hidden="true" strokeWidth={1.5} />
							)}
							<span>{copyLabel}</span>
						</Button>
					)}
				</div>
			)}
			<pre
				role="region"
				aria-labelledby={header ? id : undefined}
				aria-label={header ? undefined : "Code"}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Named code overflow region must support keyboard scrolling.
				tabIndex={0}
				onKeyDown={(event) => {
					if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
					if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
					event.preventDefault();
					event.currentTarget.scrollLeft +=
						((event.key === "ArrowRight" ? 1 : -1) * event.currentTarget.clientWidth) / 4;
				}}
				className="min-h-0 min-w-0 overflow-auto overscroll-x-contain overscroll-y-auto py-basalt-panel-y font-mono text-basalt-sm leading-[var(--basalt-line-body)] outline-hidden focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-basalt-ring"
			>
				<span className="flex min-w-max">
					{lineNumbers && (
						<span
							aria-hidden="true"
							className="shrink-0 select-none border-r border-basalt-border text-right text-basalt-xs tabular-nums text-basalt-muted-foreground"
							style={{
								width: `calc(${String(vm.lines.length).length}ch + 2 * var(--basalt-space-row-x))`,
							}}
						>
							{vm.lines.map((_, index) => (
								<span
									key={index}
									data-line-number={index + 1}
									className="block h-[var(--basalt-line-body)] px-basalt-row-x before:content-[attr(data-line-number)]"
								/>
							))}
						</span>
					)}
					<code
						className="block flex-1 whitespace-pre px-basalt-panel-x font-mono"
						style={{ minHeight: `calc(${vm.lines.length} * var(--basalt-line-body))` }}
					>
						{vm.lines.map((line, index) => (
							<span key={index} data-code-line="">
								{line.map((token, tokenIndex) =>
									token.className ? (
										<span key={tokenIndex} className={token.className}>
											{token.text}
										</span>
									) : (
										token.text
									),
								)}
								{index < vm.lines.length - 1 ? "\n" : ""}
							</span>
						))}
					</code>
				</span>
			</pre>
			{copyable && (
				<span role={vm.status === "error" ? "alert" : "status"} className="sr-only">
					{vm.status === "copied"
						? "Code copied"
						: vm.status === "error"
							? "Could not copy code. Try again."
							: ""}
				</span>
			)}
		</div>
	);
}

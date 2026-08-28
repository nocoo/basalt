import * as React from "react";
import { cn } from "../utils/cn";
import { Label } from "./label";

export function Field({
	label,
	htmlFor,
	error,
	hint,
	className,
	children,
}: {
	label: string;
	htmlFor?: string;
	error?: string;
	hint?: string;
	className?: string;
	children: React.ReactNode;
}) {
	const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
	const errorId = htmlFor ? `${htmlFor}-error` : undefined;
	const describedBy = [error ? errorId : null, !error && hint ? hintId : null]
		.filter(Boolean)
		.join(" ");
	const child = React.isValidElement(children)
		? (children as React.ReactElement<{
				"aria-describedby"?: string;
				"aria-invalid"?: boolean | "true" | "false";
			}>)
		: null;
	const mergedDescribedBy = [describedBy, child?.props["aria-describedby"]]
		.filter(Boolean)
		.join(" ");
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<Label htmlFor={htmlFor}>{label}</Label>
			{child
				? React.cloneElement(child, {
						"aria-invalid": error ? true : child.props["aria-invalid"],
						"aria-describedby": mergedDescribedBy || undefined,
					})
				: children}
			{hint && !error ? (
				<p id={hintId} className="text-xs text-basalt-muted-foreground">
					{hint}
				</p>
			) : null}
			{error ? (
				<p id={errorId} className="text-xs text-basalt-destructive" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}

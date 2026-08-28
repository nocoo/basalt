import type * as React from "react";
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
	return (
		<div className={cn("flex flex-col gap-1.5", className)}>
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			{hint && !error ? <p className="text-xs text-basalt-muted-foreground">{hint}</p> : null}
			{error ? (
				<p className="text-xs text-basalt-destructive" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}

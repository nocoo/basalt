import * as React from "react";
import { cn } from "../utils/cn";
import { Label } from "./label";

export type FieldError = Exclude<React.ReactNode, undefined> | { message: React.ReactNode };

type FieldControlProps = {
	id?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean | "true" | "false";
};

export interface FieldProps
	extends Omit<React.ComponentPropsWithoutRef<"div">, "children" | "className"> {
	/**
	 * Visible label.
	 */
	label: React.ReactNode;
	/**
	 * Associates the label and described-by ids.
	 */
	htmlFor?: string;
	/**
	 * Supporting text when there is no error.
	 */
	hint?: React.ReactNode;
	/**
	 * Replaces the hint and marks the control invalid.
	 */
	error?: FieldError;
	/**
	 * When false, show (optional) after the label.
	 */
	required?: boolean;
	/**
	 * Info icon with hover text on the label.
	 */
	labelTooltip?: React.ReactNode;
	/**
	 * Additional classes for the field root.
	 */
	className?: string;
	/**
	 * The control or content to render.
	 */
	children: React.ReactNode;
}

function isStructuredError(error: FieldError): error is { message: React.ReactNode } {
	return (
		typeof error === "object" &&
		error !== null &&
		!Array.isArray(error) &&
		!React.isValidElement(error) &&
		"message" in error
	);
}

function fieldErrorMessage(error: FieldError | undefined): React.ReactNode | undefined {
	if (error == null) {
		return undefined;
	}
	return isStructuredError(error) ? error.message : error;
}

function hasFieldError(message: React.ReactNode | undefined): boolean {
	return Boolean(message);
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
	({ label, htmlFor, hint, error, required, labelTooltip, className, children, ...props }, ref) => {
		const generatedId = React.useId();
		const child = React.isValidElement(children)
			? (children as React.ReactElement<FieldControlProps>)
			: null;
		const controlId = child ? (htmlFor ?? child.props.id ?? generatedId) : htmlFor;
		const hintId = controlId ? `${controlId}-hint` : undefined;
		const errorId = controlId ? `${controlId}-error` : undefined;
		const errorMessage = fieldErrorMessage(error);
		const hasError = hasFieldError(errorMessage);
		const describedBy = [hasError ? errorId : null, !hasError && hint ? hintId : null]
			.filter(Boolean)
			.join(" ");
		const mergedDescribedBy = [describedBy, child?.props["aria-describedby"]]
			.filter(Boolean)
			.join(" ");
		return (
			<div ref={ref} {...props} className={cn("flex flex-col gap-1.5", className)}>
				<Label htmlFor={controlId} showOptional={required === false} tooltip={labelTooltip}>
					{label}
				</Label>
				{child
					? React.cloneElement(child, {
							id: controlId,
							"aria-invalid": hasError ? true : child.props["aria-invalid"],
							"aria-describedby": mergedDescribedBy || undefined,
						})
					: children}
				{hint && !hasError ? (
					<p id={hintId} className="text-xs text-basalt-muted-foreground">
						{hint}
					</p>
				) : null}
				{hasError ? (
					<p id={errorId} className="text-xs text-basalt-destructive" role="alert">
						{errorMessage}
					</p>
				) : null}
			</div>
		);
	},
);
Field.displayName = "Field";

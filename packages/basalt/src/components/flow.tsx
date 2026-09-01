import { Children, Fragment, type ReactNode, useId } from "react";
import { cn } from "../utils/cn";

function FlowArrow() {
	const id = `flow-arrow-${useId().replace(/:/g, "")}`;
	return (
		<li aria-hidden="true" className="flex w-10 shrink-0 items-center text-basalt-muted-foreground">
			<svg
				viewBox="0 0 40 16"
				className="h-4 w-10 overflow-visible"
				overflow="visible"
				aria-hidden="true"
			>
				<defs>
					<marker
						id={id}
						markerWidth="8"
						markerHeight="8"
						refX="0"
						refY="4"
						orient="auto"
						markerUnits="userSpaceOnUse"
					>
						<path
							d="M 0,1.5 Q 0,0 1.5,0 Q 3.5,1 5.8,3.2 Q 6.5,4 5.8,4.8 Q 3.5,7 1.5,8 Q 0,8 0,6.5 Z"
							fill="currentColor"
							stroke="none"
						/>
					</marker>
				</defs>
				<path
					d="M 0 8 L 32 8"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					markerEnd={`url(#${id})`}
				/>
			</svg>
		</li>
	);
}

export type FlowProps = {
	/**
	 * Accessible name for the step list.
	 * @default "Flow"
	 */
	"aria-label"?: string;
	/**
	 * Additional classes for the list.
	 */
	className?: string;
	/**
	 * Step nodes.
	 */
	children: ReactNode;
};

export function Flow({ className, children, "aria-label": ariaLabel = "Flow" }: FlowProps) {
	const nodes = Children.toArray(children);
	return (
		<ol aria-label={ariaLabel} className={cn("flex items-center", className)}>
			{nodes.map((child, index) => (
				<Fragment key={index}>
					{child}
					{index < nodes.length - 1 ? <FlowArrow /> : null}
				</Fragment>
			))}
		</ol>
	);
}

export type FlowNodeProps = {
	/**
	 * Label for the step.
	 */
	children: ReactNode;
};

export function FlowNode({ children }: FlowNodeProps) {
	return (
		<li className="rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 py-2 text-sm">
			{children}
		</li>
	);
}

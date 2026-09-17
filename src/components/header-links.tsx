"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import type { ReactElement } from "react";

export function HeaderTooltip({ label, children }: { label: string; children: ReactElement }) {
	return (
		<TooltipProvider delayDuration={0}>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent side="bottom" sideOffset={6}>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export function HexlyLink({ className }: { className?: string } = {}) {
	return (
		<HeaderTooltip label="Basalt on hexly.ai">
			<a
				href="https://hexly.ai/projects/basalt"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Basalt on hexly.ai (opens in a new tab)"
				className={
					className ??
					"relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-basalt-muted-foreground transition-colors before:absolute before:inset-0 hover:bg-basalt-accent hover:text-basalt-foreground"
				}
			>
				<span className="sr-only">Basalt on hexly.ai</span>
				<svg
					className="pointer-events-none size-[18px]"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={1.5}
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="m12 2 8.66 5v10L12 22l-8.66-5V7Z" />
					<path d="M12 2v20M3.34 7l17.32 10m0-10L3.34 17" />
				</svg>
			</a>
		</HeaderTooltip>
	);
}

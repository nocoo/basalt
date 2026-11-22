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

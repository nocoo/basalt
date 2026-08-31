import { Button } from "@nocoo/basalt/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";

export default function TooltipMultipleTooltips() {
	return (
		<TooltipProvider>
			<div className="flex flex-wrap items-center gap-3">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">One</Button>
					</TooltipTrigger>
					<TooltipContent>First</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="outline">Two</Button>
					</TooltipTrigger>
					<TooltipContent>Second</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}

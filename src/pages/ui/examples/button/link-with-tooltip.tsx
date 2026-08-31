import { LinkButton } from "@nocoo/basalt/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";

export default function ButtonLinkWithTooltip() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<LinkButton href="#docs">Docs</LinkButton>
				</TooltipTrigger>
				<TooltipContent>Open documentation</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

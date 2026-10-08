import { CodeHighlighted } from "@nocoo/basalt/components/code";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DocCode({ code, attached = false }: { code: string; attached?: boolean }) {
	return <CodeHighlighted code={code} title="Code example" attached={attached} />;
}

export function DocExample({
	children,
	code,
	wide = false,
}: {
	children: ReactNode;
	code: string;
	wide?: boolean;
}) {
	return (
		<LayerCard>
			<LayerCard.Body
				data-example-preview=""
				className={cn(
					"flex min-h-[8.75rem] items-center justify-center",
					wide ? "[&>div]:w-full [&>div]:min-w-0" : "[&>*]:max-w-full",
				)}
			>
				{children}
			</LayerCard.Body>
			{wide ? (
				<Collapsible data-example-disclosure="" className="border-t border-basalt-border">
					<LayerCard.Header asChild>
						<CollapsibleTrigger className="w-full hover:bg-basalt-hover">
							View example code
						</CollapsibleTrigger>
					</LayerCard.Header>
					<CollapsibleContent unstyled>
						<DocCode code={code} attached />
					</CollapsibleContent>
				</Collapsible>
			) : (
				<DocCode code={code} attached />
			)}
		</LayerCard>
	);
}

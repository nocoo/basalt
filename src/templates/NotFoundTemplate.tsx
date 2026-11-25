"use client";

import { Badge } from "@nocoo/basalt/components/badge";
import { LinkButton } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowLeft } from "lucide-react";

export const NOT_FOUND_CONFIG = {
	code: "404",
	title: "Page not found",
	description: "The requested route does not exist or has moved to a new location.",
	actionLabel: "Back to Homepage",
	actionHref: "/",
} as const;

export default function NotFoundTemplate() {
	return (
		<div
			data-basalt-surface-root=""
			className="flex min-h-dvh items-center justify-center bg-basalt-background p-basalt-layout"
		>
			<main className="w-full" style={{ maxWidth: "22rem" }}>
				<LayerCard id="not-found-card" padding="xl" className="text-center">
					<div className="flex flex-col items-center space-y-basalt-card">
						<Badge variant="outline">{NOT_FOUND_CONFIG.code}</Badge>
						<div className="space-y-basalt-space-sm">
							<h1 className="font-basalt-display text-basalt-3xl font-semibold text-basalt-foreground">
								{NOT_FOUND_CONFIG.title}
							</h1>
							<p className="text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
								{NOT_FOUND_CONFIG.description}
							</p>
						</div>
						<LinkButton href={NOT_FOUND_CONFIG.actionHref} variant="outline" size="sm">
							<ArrowLeft className="size-basalt-icon" aria-hidden="true" />
							{NOT_FOUND_CONFIG.actionLabel}
						</LinkButton>
					</div>
				</LayerCard>
			</main>
		</div>
	);
}

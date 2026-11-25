"use client";

import { Badge } from "@nocoo/basalt/components/badge";
import { LinkButton } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowLeft, FileText } from "lucide-react";

export const DOCUMENT_CONFIG = {
	title: "Terms of Service",
	category: "Legal & Policy",
	updatedAt: "Last updated: January 1, 2026",
	backHref: "/",
	backLabel: "Back",
	footerNote:
		"By using this service, you acknowledge that you have read these terms and agree to abide by them. For questions, contact support.",
} as const;

export const DOCUMENT_SECTIONS: readonly {
	title: string;
	body: string;
	items?: readonly string[];
}[] = [
	{
		title: "1. Acceptance of Terms",
		body: "By accessing or using this service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this service.",
	},
	{
		title: "2. Service Description",
		body: "This application provides the following features:",
		items: [
			"Feature overview and dashboard analytics",
			"Account management and tracking",
			"Data visualization and reporting",
			"Import and export capabilities",
		],
	},
	{
		title: "3. User Responsibilities",
		body: "When using this service, you agree to:",
		items: [
			"Provide accurate and truthful registration information",
			"Safeguard your account credentials",
			"Be responsible for all activity under your account",
			"Not use the service for any unlawful purpose",
		],
	},
	{
		title: "4. Limitation of Liability",
		body: "To the maximum extent permitted by law, the service provider shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of or inability to use this service.",
	},
	{
		title: "5. Modifications",
		body: "We reserve the right to modify or discontinue this service at any time. We will provide notice of significant changes through the application or via email.",
	},
];

export default function DocumentPageTemplate() {
	return (
		<div
			data-basalt-surface-root=""
			className="min-h-dvh bg-basalt-background px-basalt-layout py-basalt-layout-lg"
		>
			<div className="mx-auto space-y-basalt-layout" style={{ maxWidth: "42rem" }}>
				<div>
					<LinkButton href={DOCUMENT_CONFIG.backHref} variant="ghost" size="sm">
						<ArrowLeft className="size-basalt-icon" aria-hidden="true" />
						<span>{DOCUMENT_CONFIG.backLabel}</span>
					</LinkButton>
				</div>

				<main>
					<article>
						<LayerCard padding="none">
							<LayerCard.Header id="doc-header" divided className="flex-col items-start">
								<div className="flex items-center gap-basalt-space-md">
									<FileText
										className="size-basalt-icon text-basalt-muted-foreground"
										aria-hidden="true"
									/>
									<Badge variant="outline">{DOCUMENT_CONFIG.category}</Badge>
								</div>
								<h1 className="font-basalt-display text-basalt-3xl font-semibold text-basalt-foreground">
									{DOCUMENT_CONFIG.title}
								</h1>
								<p className="text-basalt-sm text-basalt-muted-foreground">
									{DOCUMENT_CONFIG.updatedAt}
								</p>
							</LayerCard.Header>

							<LayerCard.Body id="doc-sections" className="space-y-basalt-card-lg">
								{DOCUMENT_SECTIONS.map((section) => (
									<section key={section.title} className="space-y-basalt-space-sm">
										<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
											{section.title}
										</h2>
										<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
											{section.body}
										</p>
										{section.items ? (
											<ul className="space-y-basalt-space-sm text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
												{section.items.map((item) => (
													<li key={item} className="flex items-start gap-basalt-space-md">
														<span aria-hidden="true">·</span>
														<span>{item}</span>
													</li>
												))}
											</ul>
										) : null}
									</section>
								))}
							</LayerCard.Body>

							<LayerCard.Footer id="doc-footer">
								<p className="text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
									{DOCUMENT_CONFIG.footerNote}
								</p>
							</LayerCard.Footer>
						</LayerCard>
					</article>
				</main>
			</div>
		</div>
	);
}

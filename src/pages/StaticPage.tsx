import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ArrowLeft } from "lucide-react";
import { useSiteTitle } from "@/hooks/use-site-title";

const TOP_AMBIENT = [
	"radial-gradient(ellipse 80% 35% at 50% 0%,",
	"hsl(var(--basalt-foreground) / 0.035) 0%,",
	"hsl(var(--basalt-foreground) / 0.015) 45%,",
	"transparent 100%)",
].join(" ");

interface SectionSpec {
	title: string;
	body: string;
	items?: readonly string[];
}

const SECTIONS: readonly SectionSpec[] = [
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

export default function StaticPage() {
	useSiteTitle("Static Page");

	return (
		<div
			data-basalt-surface-root=""
			className="relative min-h-dvh px-basalt-layout py-basalt-layout-lg lg:py-basalt-layout-xl"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 top-0 h-basalt-96"
				style={{ background: TOP_AMBIENT }}
			/>
			<div className="relative mx-auto max-w-2xl space-y-basalt-layout">
				<Link
					href="/"
					aria-label="Back"
					className="basalt-focus inline-flex items-center gap-basalt-space-md rounded-basalt-sm text-basalt-md text-basalt-muted-foreground no-underline transition-colors basalt-motion hover:text-basalt-foreground"
				>
					<ArrowLeft className="size-basalt-icon" aria-hidden="true" />
					<span>Back</span>
				</Link>

				<main>
					<article>
						<LayerCard padding="lg" className="space-y-basalt-card-lg">
							<header className="space-y-basalt-space-sm border-b border-basalt-border pb-basalt-card-lg">
								<h1 className="font-basalt-display text-basalt-3xl font-semibold tracking-tight text-basalt-foreground">
									Terms of Service
								</h1>
								<p className="text-basalt-sm text-basalt-muted-foreground">
									Last updated: January 1, 2026
								</p>
							</header>

							<div className="space-y-basalt-card-lg">
								{SECTIONS.map((section) => (
									<section key={section.title} className="space-y-basalt-space-sm">
										<h2 className="text-basalt-lg font-semibold tracking-tight text-basalt-foreground">
											{section.title}
										</h2>
										<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
											{section.body}
										</p>
										{section.items ? (
											<ul className="list-disc space-y-basalt-space-sm pl-basalt-card text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
												{section.items.map((item) => (
													<li key={item}>{item}</li>
												))}
											</ul>
										) : null}
									</section>
								))}
							</div>

							<footer className="border-t border-basalt-border pt-basalt-card">
								<p className="text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
									By using this service, you acknowledge that you have read these terms and agree to
									abide by them. For questions, contact support.
								</p>
							</footer>
						</LayerCard>
					</article>
				</main>
			</div>
		</div>
	);
}

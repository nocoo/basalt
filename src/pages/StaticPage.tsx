import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSiteTitle } from "@/hooks/use-site-title";

const TOP_AMBIENT = [
	"radial-gradient(ellipse 80% 35% at 50% 0%,",
	"hsl(var(--basalt-foreground) / 0.035) 0%,",
	"hsl(var(--basalt-foreground) / 0.015) 45%,",
	"transparent 100%)",
].join(" ");

interface SectionSpec {
	titleKey: string;
	bodyKey: string;
	itemKeys?: readonly string[];
}

const SECTIONS: readonly SectionSpec[] = [
	{
		titleKey: "pages.static.section1Title",
		bodyKey: "pages.static.section1Body",
	},
	{
		titleKey: "pages.static.section2Title",
		bodyKey: "pages.static.section2Body",
		itemKeys: [
			"pages.static.section2Item1",
			"pages.static.section2Item2",
			"pages.static.section2Item3",
			"pages.static.section2Item4",
		],
	},
	{
		titleKey: "pages.static.section3Title",
		bodyKey: "pages.static.section3Body",
		itemKeys: [
			"pages.static.section3Item1",
			"pages.static.section3Item2",
			"pages.static.section3Item3",
			"pages.static.section3Item4",
		],
	},
	{
		titleKey: "pages.static.section4Title",
		bodyKey: "pages.static.section4Body",
	},
	{
		titleKey: "pages.static.section5Title",
		bodyKey: "pages.static.section5Body",
	},
];

export default function StaticPage() {
	const { t } = useTranslation();
	useSiteTitle(t("nav.staticPage"));

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
					aria-label={t("common.back")}
					className="basalt-focus inline-flex items-center gap-basalt-space-md rounded-basalt-sm text-basalt-md text-basalt-muted-foreground no-underline transition-colors basalt-motion hover:text-basalt-foreground"
				>
					<ArrowLeft className="size-basalt-icon" strokeWidth={1.5} aria-hidden="true" />
					<span>{t("common.back")}</span>
				</Link>

				<main>
					<article>
						<LayerCard padding="lg" className="space-y-basalt-card-lg">
							<header className="space-y-basalt-space-sm border-b border-basalt-border pb-basalt-card-lg">
								<h1 className="font-basalt-display text-basalt-3xl font-semibold tracking-tight text-basalt-foreground">
									{t("pages.static.termsOfService")}
								</h1>
								<p className="text-basalt-sm text-basalt-muted-foreground">
									{t("pages.static.lastUpdated")}
								</p>
							</header>

							<div className="space-y-basalt-card-lg">
								{SECTIONS.map((section) => (
									<section key={section.titleKey} className="space-y-basalt-space-sm">
										<h2 className="text-basalt-lg font-semibold tracking-tight text-basalt-foreground">
											{t(section.titleKey)}
										</h2>
										<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
											{t(section.bodyKey)}
										</p>
										{section.itemKeys ? (
											<ul className="list-disc space-y-basalt-space-sm pl-basalt-card text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
												{section.itemKeys.map((itemKey) => (
													<li key={itemKey}>{t(itemKey)}</li>
												))}
											</ul>
										) : null}
									</section>
								))}
							</div>

							<footer className="border-t border-basalt-border pt-basalt-card">
								<p className="text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
									{t("pages.static.footerText")}
								</p>
							</footer>
						</LayerCard>
					</article>
				</main>
			</div>
		</div>
	);
}

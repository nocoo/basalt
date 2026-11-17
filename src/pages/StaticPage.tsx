import { Badge } from "@nocoo/basalt/components/badge";
import { LinkButton } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { ArrowLeft, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BasaltLogo } from "@/components/BasaltLogo";
import { useSiteTitle } from "@/hooks/use-site-title";

const TOP_AMBIENT = [
	"radial-gradient(ellipse 80% 35% at 50% 0%,",
	"hsl(var(--basalt-foreground) / 0.035) 0%,",
	"hsl(var(--basalt-foreground) / 0.015) 45%,",
	"transparent 100%)",
].join(" ");

interface ClauseSpec {
	id: string;
	num: string;
	titleKey: string;
	bodyKey: string;
	itemKeys?: readonly string[];
}

const CLAUSES: readonly ClauseSpec[] = [
	{
		id: "clause-1",
		num: "01",
		titleKey: "pages.static.section1Title",
		bodyKey: "pages.static.section1Body",
	},
	{
		id: "clause-2",
		num: "02",
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
		id: "clause-3",
		num: "03",
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
		id: "clause-4",
		num: "04",
		titleKey: "pages.static.section4Title",
		bodyKey: "pages.static.section4Body",
	},
	{
		id: "clause-5",
		num: "05",
		titleKey: "pages.static.section5Title",
		bodyKey: "pages.static.section5Body",
	},
];

function stripClauseNumber(title: string): string {
	return title.replace(/^\d+\.\s*/, "");
}

export default function StaticPage() {
	const { t } = useTranslation();
	useSiteTitle(t("nav.staticPage"));

	return (
		<div data-basalt-surface-root="" className="relative min-h-dvh overflow-x-clip">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 top-0 h-basalt-96"
				style={{ background: TOP_AMBIENT }}
			/>
			<div className="relative mx-auto max-w-4xl space-y-basalt-layout-lg px-basalt-layout py-basalt-layout-lg lg:py-basalt-layout-xl">
				<header className="flex flex-wrap items-center justify-between gap-basalt-space-lg">
					<Link
						href="/"
						aria-label={t("common.back")}
						className="basalt-focus inline-flex items-center gap-basalt-space-md rounded-basalt-md text-basalt-md font-medium text-basalt-muted-foreground no-underline transition-colors basalt-motion hover:text-basalt-foreground"
					>
						<ArrowLeft className="size-basalt-icon" strokeWidth={1.5} aria-hidden="true" />
						<span>{t("common.back")}</span>
					</Link>
					<div className="flex items-center gap-basalt-space-md">
						<div className="flex items-center gap-basalt-space-sm">
							<BasaltLogo className="size-basalt-5 object-contain" sizes="1.5rem" />
							<span className="text-basalt-base font-semibold tracking-tight text-basalt-foreground">
								basalt.
							</span>
						</div>
						<ThemeToggle tooltip={false} />
					</div>
				</header>

				<div className="space-y-basalt-space-lg">
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<Badge variant="outline">{t("pages.static.docBadge")}</Badge>
						<span className="font-basalt-mono text-basalt-xs text-basalt-muted-foreground">
							{t("pages.static.docCode")}
						</span>
					</div>
					<h1 className="font-basalt-display text-basalt-3xl font-semibold tracking-tight text-basalt-foreground">
						{t("pages.static.termsOfService")}
					</h1>
					<p className="text-basalt-base text-basalt-muted-foreground">
						{t("pages.static.lastUpdated")}
					</p>
				</div>

				<div className="grid grid-cols-1 items-start gap-basalt-layout-lg lg:grid-cols-[14rem_minmax(0,1fr)]">
					<aside className="lg:sticky lg:top-basalt-layout-lg">
						<LayerCard padding="none">
							<LayerCard.Header divided>{t("pages.static.contentsTitle")}</LayerCard.Header>
							<LayerCard.Body className="space-y-basalt-space-xs">
								<nav aria-label={t("pages.static.contentsTitle")}>
									<ul className="space-y-basalt-space-xs">
										{CLAUSES.map((clause) => (
											<li key={clause.id}>
												<a
													href={`#${clause.id}`}
													className="basalt-focus flex items-center gap-basalt-space-md rounded-basalt-sm px-basalt-space-md py-basalt-space-xs text-basalt-md text-basalt-muted-foreground no-underline transition-colors basalt-motion hover:bg-basalt-hover hover:text-basalt-foreground"
												>
													<span className="font-basalt-mono text-basalt-xs tabular-nums text-basalt-muted-foreground">
														{clause.num}
													</span>
													<span className="truncate">{stripClauseNumber(t(clause.titleKey))}</span>
												</a>
											</li>
										))}
									</ul>
								</nav>
							</LayerCard.Body>
						</LayerCard>
					</aside>

					<main className="min-w-0">
						<article>
							<LayerCard padding="none">
								<LayerCard.Body className="divide-y divide-basalt-border/70">
									{CLAUSES.map((clause) => (
										<section
											key={clause.id}
											id={clause.id}
											className="scroll-mt-6 space-y-basalt-card-sm py-basalt-card-lg first:pt-0 last:pb-0"
										>
											<div className="flex items-center gap-basalt-space-lg">
												<Badge
													variant="outline"
													className="font-basalt-mono font-normal tabular-nums text-basalt-muted-foreground"
												>
													{clause.num}
												</Badge>
												<h2 className="text-basalt-lg font-semibold tracking-tight text-basalt-foreground">
													{stripClauseNumber(t(clause.titleKey))}
												</h2>
											</div>
											<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
												{t(clause.bodyKey)}
											</p>
											{clause.itemKeys ? (
												<ul className="space-y-basalt-space-md pt-basalt-space-xs">
													{clause.itemKeys.map((itemKey) => (
														<li
															key={itemKey}
															className="flex items-start gap-basalt-space-lg text-basalt-md leading-basalt-body text-basalt-foreground"
														>
															<Check
																aria-hidden="true"
																className="mt-basalt-space-xs size-basalt-icon shrink-0 text-basalt-primary"
																strokeWidth={1.5}
															/>
															<span>{t(itemKey)}</span>
														</li>
													))}
												</ul>
											) : null}
										</section>
									))}
								</LayerCard.Body>
								<LayerCard.Well className="flex flex-col gap-basalt-card-sm sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-start gap-basalt-space-lg">
										<span
											aria-hidden="true"
											className="mt-basalt-space-sm size-basalt-1_5 shrink-0 rounded-basalt-full bg-basalt-success"
										/>
										<p className="text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
											{t("pages.static.footerText")}
										</p>
									</div>
									<LinkButton href="/" variant="outline" size="sm" className="shrink-0">
										{t("pages.notFound.backHome")}
									</LinkButton>
								</LayerCard.Well>
							</LayerCard>
						</article>
					</main>
				</div>
			</div>
		</div>
	);
}

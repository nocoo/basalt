import { Link } from "@nocoo/basalt/components/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSiteTitle } from "@/hooks/use-site-title";

export default function StaticPage() {
	const { t } = useTranslation();
	useSiteTitle(t("nav.staticPage"));

	return (
		<div className="min-h-screen bg-background p-basalt-space-lg flex items-center justify-center">
			<article
				data-basalt-surface-root=""
				className="mx-auto w-full max-w-2xl rounded-basalt-lg bg-card p-basalt-space-lg"
			>
				{/* Header */}
				<div className="space-y-basalt-space-lg mb-basalt-space-lg">
					<div className="flex items-center gap-basalt-space-lg">
						<Link
							href="/"
							aria-label={t("common.back")}
							className="text-muted-foreground no-underline hover:text-foreground"
						>
							<ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
						</Link>
						<h1 className="text-basalt-3xl font-semibold text-foreground">
							{t("pages.static.termsOfService")}
						</h1>
					</div>
					<p className="text-basalt-base text-muted-foreground">{t("pages.static.lastUpdated")}</p>
				</div>

				{/* Body */}
				<div className="space-y-basalt-space-lg text-basalt-base">
					<section>
						<h2 className="font-semibold mb-basalt-space-lg text-basalt-lg">
							{t("pages.static.section1Title")}
						</h2>
						<p className="text-muted-foreground leading-basalt-relaxed">
							{t("pages.static.section1Body")}
						</p>
					</section>

					<section>
						<h2 className="font-semibold mb-basalt-space-lg text-basalt-lg">
							{t("pages.static.section2Title")}
						</h2>
						<p className="text-muted-foreground leading-basalt-relaxed mb-basalt-space-lg">
							{t("pages.static.section2Body")}
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-basalt-space-sm ml-basalt-space-lg">
							<li>{t("pages.static.section2Item1")}</li>
							<li>{t("pages.static.section2Item2")}</li>
							<li>{t("pages.static.section2Item3")}</li>
							<li>{t("pages.static.section2Item4")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold mb-basalt-space-lg text-basalt-lg">
							{t("pages.static.section3Title")}
						</h2>
						<p className="text-muted-foreground leading-basalt-relaxed mb-basalt-space-lg">
							{t("pages.static.section3Body")}
						</p>
						<ul className="list-disc list-inside text-muted-foreground space-y-basalt-space-sm ml-basalt-space-lg">
							<li>{t("pages.static.section3Item1")}</li>
							<li>{t("pages.static.section3Item2")}</li>
							<li>{t("pages.static.section3Item3")}</li>
							<li>{t("pages.static.section3Item4")}</li>
						</ul>
					</section>

					<section>
						<h2 className="font-semibold mb-basalt-space-lg text-basalt-lg">
							{t("pages.static.section4Title")}
						</h2>
						<p className="text-muted-foreground leading-basalt-relaxed">
							{t("pages.static.section4Body")}
						</p>
					</section>

					<section>
						<h2 className="font-semibold mb-basalt-space-lg text-basalt-lg">
							{t("pages.static.section5Title")}
						</h2>
						<p className="text-muted-foreground leading-basalt-relaxed">
							{t("pages.static.section5Body")}
						</p>
					</section>

					{/* Footer divider */}
					<div className="pt-basalt-space-lg border-t">
						<p className="text-muted-foreground text-basalt-sm">{t("pages.static.footerText")}</p>
					</div>
				</div>
			</article>
		</div>
	);
}

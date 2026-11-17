import { Badge } from "@nocoo/basalt/components/badge";
import { LinkButton } from "@nocoo/basalt/components/button";
import { Code } from "@nocoo/basalt/components/code";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { BasaltLogo } from "@/components/BasaltLogo";
import { useSiteTitle } from "@/hooks/use-site-title";

const AMBIENT_BACKDROP = [
	"radial-gradient(ellipse 70% 55% at 50% 45%,",
	"hsl(var(--basalt-foreground) / 0.04) 0%,",
	"hsl(var(--basalt-foreground) / 0.025) 30%,",
	"hsl(var(--basalt-foreground) / 0.01) 58%,",
	"transparent 100%)",
].join(" ");

export default function NotFound() {
	const { t } = useTranslation();
	const { pathname } = useLocation();
	useSiteTitle(t("nav.notFoundPage"));

	return (
		<div
			data-basalt-surface-root=""
			className="relative flex min-h-dvh items-center justify-center overflow-hidden p-basalt-layout"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
				style={{ background: AMBIENT_BACKDROP }}
			/>
			<main className="relative w-full max-w-[26rem]">
				<LayerCard padding="none">
					<LayerCard.Header divided className="items-center">
						<div className="flex items-center gap-basalt-space-lg">
							<BasaltLogo className="size-basalt-6 object-contain" sizes="2rem" />
							<span className="text-basalt-base font-semibold tracking-tight">basalt.</span>
						</div>
						<div className="flex items-center gap-basalt-space-sm">
							<Badge
								variant="outline"
								className="font-basalt-mono font-normal tabular-nums text-basalt-muted-foreground"
							>
								HTTP 404
							</Badge>
							<ThemeToggle tooltip={false} />
						</div>
					</LayerCard.Header>
					<LayerCard.Body className="flex flex-col items-center gap-basalt-card-sm text-center">
						<p
							aria-hidden="true"
							className="select-none font-basalt-display text-basalt-10xl font-semibold leading-basalt-tight tracking-tighter text-basalt-foreground/12"
						>
							{t("pages.notFound.title")}
						</p>
						<h1 className="text-basalt-xl font-semibold tracking-tight text-basalt-foreground">
							{t("pages.notFound.heading")}
						</h1>
						<p className="max-w-[32ch] text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
							{t("pages.notFound.description")}
						</p>
						<Code className="max-w-full truncate">{pathname}</Code>
						<div className="flex w-full flex-wrap items-center justify-center gap-basalt-space-lg pt-basalt-space-sm">
							<LinkButton href="/">{t("pages.notFound.backHome")}</LinkButton>
							<LinkButton href="/dashboard" variant="outline">
								{t("pages.notFound.openCatalog")}
							</LinkButton>
						</div>
					</LayerCard.Body>
					<LayerCard.Well className="flex items-center justify-between gap-basalt-space-lg text-basalt-xs text-basalt-muted-foreground">
						<span className="inline-flex items-center gap-basalt-space-md">
							<span
								aria-hidden="true"
								className="size-basalt-1_5 rounded-basalt-full bg-basalt-warning"
							/>
							<span>{t("pages.notFound.statusHint")}</span>
						</span>
						<Link
							href="/ui"
							className="font-medium text-basalt-muted-foreground no-underline hover:text-basalt-foreground"
						>
							{t("nav.kitIndex")}
						</Link>
					</LayerCard.Well>
				</LayerCard>
			</main>
		</div>
	);
}

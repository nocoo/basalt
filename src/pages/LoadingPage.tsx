import { Badge } from "@nocoo/basalt/components/badge";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { BasaltLogo } from "@/components/BasaltLogo";
import { useSiteTitle } from "@/hooks/use-site-title";

const AMBIENT_BACKDROP = [
	"radial-gradient(ellipse 70% 55% at 50% 45%,",
	"hsl(var(--basalt-foreground) / 0.04) 0%,",
	"hsl(var(--basalt-foreground) / 0.025) 30%,",
	"hsl(var(--basalt-foreground) / 0.01) 58%,",
	"transparent 100%)",
].join(" ");

export default function LoadingPage() {
	const { t } = useTranslation();
	useSiteTitle(t("nav.loading"));

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
			<main className="relative w-full max-w-[24rem]">
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
								{t("pages.loading.badge")}
							</Badge>
							<ThemeToggle tooltip={false} />
						</div>
					</LayerCard.Header>
					<LayerCard.Body className="flex flex-col items-center gap-basalt-card text-center">
						<BasaltLogo className="size-basalt-16 object-contain" sizes="4rem" />
						<Loader
							size={16}
							label={t("pages.loading.status")}
							className="text-basalt-foreground"
						/>
						<p className="max-w-[28ch] text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
							{t("pages.loading.description")}
						</p>
						<Meter label={t("pages.loading.stageLabel")} value={68} size="sm" className="w-full" />
					</LayerCard.Body>
					<LayerCard.Well className="flex items-center justify-between gap-basalt-space-lg">
						<span className="inline-flex items-center gap-basalt-space-md text-basalt-xs text-basalt-muted-foreground">
							<span
								aria-hidden="true"
								className="size-basalt-1_5 rounded-basalt-full bg-basalt-success animate-pulse motion-reduce:animate-none"
							/>
							<span>{t("pages.loading.sessionNote")}</span>
						</span>
						<Link
							href="/"
							className="text-basalt-xs font-medium text-basalt-muted-foreground no-underline hover:text-basalt-foreground"
						>
							{t("common.back")}
						</Link>
					</LayerCard.Well>
				</LayerCard>
			</main>
		</div>
	);
}

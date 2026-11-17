import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
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
			<main className="relative w-full max-w-[18rem]">
				<LayerCard padding="xl" className="flex flex-col items-center gap-basalt-card text-center">
					<BasaltLogo className="size-basalt-14 object-contain" sizes="3.5rem" />
					<Loader size={14} label={t("pages.loading.status")} showElapsed={false} />
				</LayerCard>
			</main>
		</div>
	);
}

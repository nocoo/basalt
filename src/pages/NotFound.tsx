import { LinkButton } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useSiteTitle } from "@/hooks/use-site-title";

const AMBIENT_BACKDROP = [
	"radial-gradient(ellipse 70% 55% at 50% 45%,",
	"hsl(var(--basalt-foreground) / 0.04) 0%,",
	"hsl(var(--basalt-foreground) / 0.025) 30%,",
	"hsl(var(--basalt-foreground) / 0.01) 58%,",
	"transparent 100%)",
].join(" ");

export default function NotFound() {
	useSiteTitle("404 Page");

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
			<main className="relative w-full max-w-[22rem]">
				<LayerCard padding="xl" className="flex flex-col items-center gap-basalt-card text-center">
					<p
						aria-hidden="true"
						className="select-none font-basalt-display text-basalt-10xl font-light leading-basalt-tight tracking-tight text-basalt-foreground/15"
					>
						404
					</p>
					<div className="space-y-basalt-space-sm">
						<h1 className="text-basalt-xl font-semibold tracking-tight text-basalt-foreground">
							Page not found
						</h1>
						<p className="max-w-[28ch] text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
							The requested route does not exist or has moved to a new location.
						</p>
					</div>
					<LinkButton href="/" variant="outline" size="sm">
						Back to Homepage
					</LinkButton>
				</LayerCard>
			</main>
		</div>
	);
}

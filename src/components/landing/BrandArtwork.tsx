import type { HTMLAttributes, ReactNode, Ref } from "react";

interface BrandArtworkProps extends HTMLAttributes<HTMLDivElement> {
	artworkRef?: Ref<HTMLDivElement>;
	controls?: ReactNode;
}

/** The original brand master remains visible before JavaScript loads. */
export function BrandArtwork({ artworkRef, controls, ...props }: BrandArtworkProps) {
	return (
		<div ref={artworkRef} className="landing-brand-artwork" {...props}>
			<div className="landing-brand-orbit" aria-hidden="true" />
			<div className="landing-brand-glow" aria-hidden="true" />
			<div className="landing-brand-float">
				<img
					className="landing-brand-mark"
					src="/landing/tower.webp"
					width={1280}
					height={1280}
					alt="The Basalt corner tower, with white marble, blue and green roofs, pink columns, and gold details"
					loading="lazy"
					decoding="async"
					draggable={false}
				/>
			</div>
			{controls}
		</div>
	);
}

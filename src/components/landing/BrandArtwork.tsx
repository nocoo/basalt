import type { HTMLAttributes, ReactNode, Ref } from "react";
import { TOWER_IMAGE_SIZES, towerSrcSet } from "@/lib/landing-images";

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
				<picture>
					<source type="image/avif" srcSet={towerSrcSet("avif")} sizes={TOWER_IMAGE_SIZES} />
					<img
						className="landing-brand-mark"
						src="/landing/tower.webp"
						srcSet={towerSrcSet("webp")}
						sizes={TOWER_IMAGE_SIZES}
						width={1280}
						height={1280}
						alt="The Basalt corner tower, with white marble, blue and green roofs, pink columns, and gold details"
						loading="lazy"
						decoding="async"
						draggable={false}
					/>
				</picture>
			</div>
			{controls}
		</div>
	);
}

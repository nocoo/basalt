import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandArtwork } from "./BrandArtwork";

export function InteractiveBrandArtwork() {
	const artwork = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [playing, setPlaying] = useState(true);

	useEffect(() => {
		const node = artwork.current;
		if (!node) return;
		if (typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
			threshold: 0.1,
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<BrandArtwork
			artworkRef={artwork}
			data-motion={playing && visible ? "running" : "paused"}
			onPointerMove={(event) => {
				if (
					!playing ||
					event.pointerType === "touch" ||
					window.matchMedia("(prefers-reduced-motion: reduce)").matches
				)
					return;
				const bounds = event.currentTarget.getBoundingClientRect();
				const x = (event.clientX - bounds.left) / bounds.width - 0.5;
				const y = (event.clientY - bounds.top) / bounds.height - 0.5;
				event.currentTarget.style.setProperty("--tower-yaw", `${x * 16}deg`);
				event.currentTarget.style.setProperty("--tower-pitch", `${-y * 10}deg`);
				event.currentTarget.style.setProperty("--tower-glow-x", `${x * 28}px`);
				event.currentTarget.style.setProperty("--tower-glow-y", `${y * 20}px`);
			}}
			onPointerLeave={(event) => {
				event.currentTarget.style.removeProperty("--tower-yaw");
				event.currentTarget.style.removeProperty("--tower-pitch");
				event.currentTarget.style.removeProperty("--tower-glow-x");
				event.currentTarget.style.removeProperty("--tower-glow-y");
			}}
			controls={
				<button
					type="button"
					className="landing-brand-motion"
					aria-label={playing ? "Pause tower motion" : "Resume tower motion"}
					onClick={() => setPlaying((current) => !current)}
				>
					{playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
					<span>{playing ? "Pause motion" : "Resume motion"}</span>
				</button>
			}
		/>
	);
}

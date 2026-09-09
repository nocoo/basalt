import { Pause, Play, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandArtwork } from "./BrandArtwork";

type TiltState = "unavailable" | "ready" | "requesting" | "enabled" | "denied";
type PermissionedOrientation = typeof DeviceOrientationEvent & {
	requestPermission?: () => Promise<"granted" | "denied">;
};

function moveArtwork(node: HTMLDivElement, x: number, y: number) {
	const horizontal = Math.max(-0.5, Math.min(0.5, x));
	const vertical = Math.max(-0.5, Math.min(0.5, y));
	node.style.setProperty("--tower-yaw", `${horizontal * 16}deg`);
	node.style.setProperty("--tower-pitch", `${-vertical * 10}deg`);
	node.style.setProperty("--tower-glow-x", `${horizontal * 28}px`);
	node.style.setProperty("--tower-glow-y", `${vertical * 20}px`);
}

function resetArtwork(node: HTMLDivElement) {
	for (const name of ["--tower-yaw", "--tower-pitch", "--tower-glow-x", "--tower-glow-y"]) {
		node.style.removeProperty(name);
	}
}

export function InteractiveBrandArtwork() {
	const artwork = useRef<HTMLDivElement>(null);
	const touchPointer = useRef<number | null>(null);
	const [visible, setVisible] = useState(false);
	const [playing, setPlaying] = useState(true);
	const [motionAllowed, setMotionAllowed] = useState(false);
	const [touchDevice, setTouchDevice] = useState(false);
	const [tilt, setTilt] = useState<TiltState>("unavailable");
	const active = playing && visible && motionAllowed;

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

	useEffect(() => {
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const coarsePointer = window.matchMedia("(any-pointer: coarse)");
		const updateMotion = () => setMotionAllowed(!reducedMotion.matches && !document.hidden);
		const updatePointer = () => setTouchDevice(coarsePointer.matches);
		updateMotion();
		updatePointer();
		if (window.isSecureContext && typeof window.DeviceOrientationEvent !== "undefined") {
			setTilt("ready");
		}
		reducedMotion.addEventListener("change", updateMotion);
		coarsePointer.addEventListener("change", updatePointer);
		document.addEventListener("visibilitychange", updateMotion);
		return () => {
			reducedMotion.removeEventListener("change", updateMotion);
			coarsePointer.removeEventListener("change", updatePointer);
			document.removeEventListener("visibilitychange", updateMotion);
		};
	}, []);

	useEffect(() => {
		const node = artwork.current;
		if (!node) return;
		if (!active) {
			touchPointer.current = null;
			resetArtwork(node);
			return;
		}
		if (tilt !== "enabled" || !touchDevice) return;

		let neutral: { beta: number; gamma: number; angle: number } | null = null;
		let frame = 0;
		let x = 0;
		let y = 0;
		const onOrientation = (event: DeviceOrientationEvent) => {
			const { beta, gamma } = event;
			if (beta === null || gamma === null || !Number.isFinite(beta) || !Number.isFinite(gamma)) {
				return;
			}
			if (touchPointer.current !== null) {
				neutral = null;
				return;
			}
			const angle = window.screen.orientation?.angle ?? window.orientation ?? 0;
			// Start from the visitor's grip, and recalibrate after rotating the screen.
			if (!neutral || neutral.angle !== angle) {
				neutral = { beta, gamma, angle };
				x = 0;
				y = 0;
				resetArtwork(node);
				return;
			}
			const pitch = ((beta - neutral.beta + 540) % 360) - 180;
			const roll = ((gamma - neutral.gamma + 540) % 360) - 180;
			const rotation = (angle * Math.PI) / 180;
			x = (roll * Math.cos(rotation) + pitch * Math.sin(rotation)) / 50;
			y = (pitch * Math.cos(rotation) - roll * Math.sin(rotation)) / 50;
			if (!frame) {
				frame = window.requestAnimationFrame(() => {
					frame = 0;
					if (touchPointer.current === null) moveArtwork(node, x, y);
				});
			}
		};
		window.addEventListener("deviceorientation", onOrientation, { passive: true });
		return () => {
			window.removeEventListener("deviceorientation", onOrientation);
			window.cancelAnimationFrame(frame);
			resetArtwork(node);
		};
	}, [active, tilt, touchDevice]);

	async function toggleTilt() {
		if (tilt === "enabled") {
			setTilt("ready");
			return;
		}
		setTilt("requesting");
		try {
			const orientation = window.DeviceOrientationEvent as PermissionedOrientation;
			// Safari requires this call directly inside the button's click handler.
			const permission = orientation.requestPermission
				? await orientation.requestPermission()
				: "granted";
			setTilt(permission === "granted" ? "enabled" : "denied");
			if (permission === "granted") setPlaying(true);
		} catch {
			setTilt("denied");
		}
	}

	function releasePointer() {
		touchPointer.current = null;
		if (artwork.current) resetArtwork(artwork.current);
	}

	return (
		<BrandArtwork
			artworkRef={artwork}
			data-motion={active ? "running" : "paused"}
			onPointerDown={(event) => {
				if (
					!active ||
					event.pointerType !== "touch" ||
					!event.isPrimary ||
					(event.target instanceof Element && event.target.closest("button"))
				) {
					return;
				}
				touchPointer.current = event.pointerId;
				event.currentTarget.setPointerCapture(event.pointerId);
			}}
			onPointerMove={(event) => {
				if (!active || (event.pointerType === "touch" && touchPointer.current !== event.pointerId))
					return;
				const bounds = event.currentTarget.getBoundingClientRect();
				moveArtwork(
					event.currentTarget,
					(event.clientX - bounds.left) / bounds.width - 0.5,
					(event.clientY - bounds.top) / bounds.height - 0.5,
				);
			}}
			onPointerUp={releasePointer}
			onPointerCancel={releasePointer}
			onLostPointerCapture={releasePointer}
			onPointerLeave={() => {
				if (touchPointer.current === null) releasePointer();
			}}
			controls={
				<div className="landing-brand-controls" role="group" aria-label="Tower motion controls">
					<button
						type="button"
						className="landing-brand-motion"
						aria-label={playing ? "Pause tower motion" : "Resume tower motion"}
						onClick={() => setPlaying((current) => !current)}
					>
						{playing ? (
							<Pause size={13} aria-hidden="true" />
						) : (
							<Play size={13} aria-hidden="true" />
						)}
						<span>{playing ? "Pause motion" : "Resume motion"}</span>
					</button>
					{touchDevice &&
						(tilt === "unavailable" || tilt === "denied" ? (
							<span className="landing-brand-motion-hint" role="status">
								Drag to explore
							</span>
						) : (
							<button
								type="button"
								className="landing-brand-motion"
								aria-pressed={tilt === "enabled"}
								disabled={tilt === "requesting"}
								onClick={toggleTilt}
							>
								<Smartphone size={13} aria-hidden="true" />
								<span>
									{tilt === "enabled"
										? "Tilt on"
										: tilt === "requesting"
											? "Enabling…"
											: "Enable tilt"}
								</span>
							</button>
						))}
				</div>
			}
		/>
	);
}

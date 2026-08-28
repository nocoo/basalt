import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_SETTLE_MS = 150;
const BOTTOM_PX = 8;

function scrollParent(): HTMLElement | null {
	return document.querySelector("[data-doc-scroll]");
}

function pickActiveId(ids: string[], offset: number): string {
	const ordered = ids
		.map((id) => document.getElementById(id))
		.filter((el): el is HTMLElement => el !== null);
	if (ordered.length === 0) {
		return ids[0] ?? "";
	}
	const scroller = scrollParent();
	if (scroller && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - BOTTOM_PX) {
		return ordered[ordered.length - 1].id;
	}
	const line = (scroller?.getBoundingClientRect().top ?? 0) + offset;
	let current = ordered[0].id;
	for (const el of ordered) {
		if (el.getBoundingClientRect().top <= line + 1) {
			current = el.id;
		} else {
			break;
		}
	}
	return current;
}

export function useDocTocActiveId(ids: string[], offset = 48) {
	const [activeId, setActiveId] = useState(ids[0] ?? "");
	const pinned = useRef(false);
	const idsKey = ids.join("\0");

	useEffect(() => {
		const tracked = idsKey.split("\0").filter(Boolean);
		const scroller = scrollParent();
		if (!scroller) {
			return;
		}
		let frame = 0;
		const update = () => {
			if (pinned.current) {
				return;
			}
			const next = pickActiveId(tracked, offset);
			if (next) {
				setActiveId(next);
			}
		};
		const onScroll = () => {
			if (frame) {
				return;
			}
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				update();
			});
		};
		scroller.addEventListener("scroll", onScroll, { passive: true });
		update();
		return () => {
			scroller.removeEventListener("scroll", onScroll);
			if (frame) {
				window.cancelAnimationFrame(frame);
			}
		};
	}, [idsKey, offset]);

	const settleTimer = useRef<number | undefined>(undefined);
	const cancelUnpin = useRef<(() => void) | null>(null);

	const selectSection = useCallback((id: string) => {
		cancelUnpin.current?.();
		pinned.current = true;
		setActiveId(id);
		const scrollTarget: EventTarget = scrollParent() ?? window;
		const arm = () => {
			window.clearTimeout(settleTimer.current);
			settleTimer.current = window.setTimeout(() => {
				cancelUnpin.current?.();
				pinned.current = false;
			}, SCROLL_SETTLE_MS);
		};
		scrollTarget.addEventListener("scroll", arm, { passive: true });
		cancelUnpin.current = () => {
			window.clearTimeout(settleTimer.current);
			scrollTarget.removeEventListener("scroll", arm);
			cancelUnpin.current = null;
		};
		arm();
	}, []);

	useEffect(() => () => cancelUnpin.current?.(), []);

	useEffect(() => {
		const known = new Set(idsKey.split("\0").filter(Boolean));
		const syncHash = () => {
			const id = decodeURIComponent(window.location.hash.slice(1));
			if (id && known.has(id)) {
				selectSection(id);
			}
		};
		syncHash();
		window.addEventListener("hashchange", syncHash);
		return () => window.removeEventListener("hashchange", syncHash);
	}, [idsKey, selectSection]);

	return { activeId, selectSection };
}

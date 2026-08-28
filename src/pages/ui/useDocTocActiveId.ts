import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_SETTLE_MS = 150;
const BOTTOM_PX = 8;

export function useDocTocActiveId(ids: string[], offset = 24) {
	const [activeId, setActiveId] = useState(ids[0] ?? "");
	const [root, setRoot] = useState<Element | null>(null);
	const pinned = useRef(false);
	const idsKey = ids.join("\0");

	useEffect(() => {
		setRoot(document.querySelector("[data-doc-scroll]"));
	}, []);

	useEffect(() => {
		const ordered = idsKey
			.split("\0")
			.filter(Boolean)
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);
		if (ordered.length === 0 || typeof IntersectionObserver === "undefined") {
			return;
		}

		const intersecting = new Set<Element>();

		const pickTopmost = () => {
			if (pinned.current) {
				return;
			}
			const scroller = root;
			if (
				scroller &&
				scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - BOTTOM_PX
			) {
				setActiveId(ordered[ordered.length - 1].id);
				return;
			}
			const first = ordered.find((el) => intersecting.has(el));
			if (first) {
				setActiveId(first.id);
			}
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						intersecting.add(entry.target);
					} else {
						intersecting.delete(entry.target);
					}
				}
				pickTopmost();
			},
			{ root, rootMargin: `-${offset}px 0px 0px 0px`, threshold: [0, 1] },
		);

		for (const el of ordered) {
			observer.observe(el);
		}

		const scroller: EventTarget = root ?? window;
		scroller.addEventListener("scroll", pickTopmost, { passive: true });
		pickTopmost();

		return () => {
			observer.disconnect();
			scroller.removeEventListener("scroll", pickTopmost);
		};
	}, [idsKey, offset, root]);

	const settleTimer = useRef<number | undefined>(undefined);
	const cancelUnpin = useRef<(() => void) | null>(null);

	const selectSection = useCallback(
		(id: string) => {
			cancelUnpin.current?.();
			pinned.current = true;
			setActiveId(id);

			const scrollTarget: EventTarget = root ?? window;
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
		},
		[root],
	);

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

import { type ReactNode, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";
import { scrollToDocSection } from "@/pages/ui/useDocTocActiveId";

export function RouteScrollReset({ children }: { children: ReactNode }) {
	const { pathname, hash } = useLocation();
	const previousPath = useRef<string | null>(null);

	useLayoutEffect(() => {
		const previous = window.history.scrollRestoration;
		window.history.scrollRestoration = "manual";
		return () => {
			window.history.scrollRestoration = previous;
		};
	}, []);

	useLayoutEffect(() => {
		const pageChanged = previousPath.current !== pathname;
		previousPath.current = pathname;
		let id = hash.slice(1);
		try {
			id = decodeURIComponent(id);
		} catch {
			/* Malformed fragments remain literal IDs. */
		}
		if (id && document.getElementById(id)) {
			scrollToDocSection(id, "instant");
		} else if (pageChanged) {
			const options = { top: 0, left: 0, behavior: "instant" } as const;
			document.querySelector<HTMLElement>("[data-doc-scroll]")?.scrollTo(options);
			window.scrollTo(options);
		}
	}, [pathname, hash]);

	return children;
}

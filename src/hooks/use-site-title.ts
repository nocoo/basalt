import { useEffect } from "react";
import { useLocation } from "react-router";
import { canonicalUrl, documentTitle } from "@/lib/site";

export function useSiteTitle(pageName?: string) {
	const { pathname } = useLocation();

	useEffect(() => {
		document.title = documentTitle(pageName);
		let link = document.head.querySelector("link[rel='canonical']");
		if (!link) {
			link = document.createElement("link");
			link.setAttribute("rel", "canonical");
			document.head.appendChild(link);
		}
		link.setAttribute("href", canonicalUrl(pathname));
	}, [pageName, pathname]);
}

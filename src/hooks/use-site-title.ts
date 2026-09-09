import { useEffect } from "react";
import { useLocation } from "react-router";
import { pageMetadata, pageMetaTags } from "@/lib/metadata";
import { canonicalUrl, jsonLdScript } from "@/lib/site";

export function useSiteTitle(pageName?: string) {
	const { pathname } = useLocation();

	useEffect(() => {
		const page = pageMetadata(pathname, pageName);
		document.title = page.title;
		let link = document.head.querySelector("link[rel='canonical']");
		if (!link) {
			link = document.createElement("link");
			link.setAttribute("rel", "canonical");
			document.head.appendChild(link);
		}
		link.setAttribute("href", canonicalUrl(pathname));
		for (const tag of pageMetaTags(page)) {
			let meta = document.head.querySelector(`meta[${tag.attribute}='${tag.key}']`);
			if (!meta) {
				meta = document.createElement("meta");
				meta.setAttribute(tag.attribute, tag.key);
				document.head.appendChild(meta);
			}
			meta.setAttribute("content", tag.content);
		}
		let structured = document.head.querySelector("script[type='application/ld+json']");
		if (!structured) {
			structured = document.createElement("script");
			structured.setAttribute("type", "application/ld+json");
			document.head.appendChild(structured);
		}
		structured.textContent = jsonLdScript(page);
	}, [pageName, pathname]);
}

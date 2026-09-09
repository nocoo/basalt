import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { useSiteTitle } from "@/hooks/use-site-title";
import { SITE } from "@/lib/site";

const initialHead = document.head.innerHTML;
afterEach(() => {
	document.head.innerHTML = initialHead;
});

function MetadataProbe() {
	const { pathname } = useLocation();
	useSiteTitle(pathname === "/ui" ? "Component library" : undefined);
	return (
		<>
			<Link to="/ui?category=chart">Library</Link>
			<Link to="/">Home</Link>
		</>
	);
}

describe("route metadata", () => {
	it("replaces stale homepage metadata on navigation and restores it on return", () => {
		render(
			<MemoryRouter>
				<MetadataProbe />
			</MemoryRouter>,
		);
		expect(document.title).toBe(SITE.homeTitle);
		fireEvent.click(screen.getByRole("link", { name: "Library" }));
		expect(document.title).toBe("Component library · basalt.");
		expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://basaltui.com/ui",
		);
		for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
			expect(document.head.querySelector(selector)).toHaveAttribute("content", document.title);
		}
		const description = document.head
			.querySelector('meta[name="description"]')
			?.getAttribute("content");
		expect(description).not.toBe(SITE.description);
		expect(document.head.querySelector('meta[property="og:description"]')).toHaveAttribute(
			"content",
			description,
		);
		expect(document.head.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
			"content",
			description,
		);
		expect(
			document.head.querySelector('script[type="application/ld+json"]')?.textContent,
		).toContain('"url":"https://basaltui.com/ui"');
		fireEvent.click(screen.getByRole("link", { name: "Home" }));
		expect(document.title).toBe(SITE.homeTitle);
		expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
			"content",
			SITE.description,
		);
		expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
		expect(document.head.querySelectorAll('meta[name="twitter:title"]')).toHaveLength(1);
	});
});

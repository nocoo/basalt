import assert from "node:assert/strict";
import type { Page } from "playwright";
import { LANDING_HEADING } from "../src/lib/landing";
import { SITE, SITE_ORIGIN } from "../src/lib/site";
import { setShowcaseTheme } from "./showcase-theme";

async function assertLandingBounds(page: Page, width: number) {
	const bounds = await page.locator(".landing-main").boundingBox();
	assert.ok(bounds && bounds.x === 0 && bounds.width === width, JSON.stringify(bounds));
	const documentSize = await page.evaluate(() => ({
		width: document.documentElement.scrollWidth,
		height: document.documentElement.scrollHeight,
		viewport: window.innerHeight,
	}));
	assert.equal(documentSize.width, width, "landing must not overflow horizontally");
	assert.ok(documentSize.height > documentSize.viewport, "landing must use document scrolling");
	await page
		.getByRole("navigation", { name: "Related projects", exact: true })
		.scrollIntoViewIfNeeded();
	assert.ok(await page.evaluate(() => window.scrollY > 0), "the footer must be reachable");
}

async function assertDashboardBounds(page: Page, width: number) {
	await page.locator("[data-dashboard-shell] [data-doc-scroll] h1").first().waitFor();
	const bounds = await page.locator("main").boundingBox();
	assert.ok(bounds && Math.abs(bounds.x + bounds.width - width) <= 1, JSON.stringify(bounds));
	assert.ok(bounds.x < (width < 768 ? 1 : 300), "the sidebar must be the only width reservation");
	assert.equal(
		await page.locator("main").evaluate((node) => getComputedStyle(node).maxWidth),
		"none",
	);
	const overflow = await page.evaluate(() => ({
		width: document.documentElement.scrollWidth - window.innerWidth,
		height: document.documentElement.scrollHeight - window.innerHeight,
	}));
	assert.ok(overflow.width <= 1 && overflow.height <= 1, JSON.stringify(overflow));
	const scroll = await page.locator("[data-doc-scroll]").evaluate((node) => {
		node.scrollTop = node.scrollHeight;
		return { top: node.scrollTop, max: node.scrollHeight - node.clientHeight };
	});
	if (scroll.max > 0) assert.ok(scroll.top > 0, "dashboard content must scroll within its island");
}

/** Covers the original global-CSS regression, route transitions, and crawler-visible output. */
export async function assertLandingShowcase(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [320, 390, 768, 1440, 1920]) {
		await page.setViewportSize({ width, height: 900 });
		for (const dark of [false, true]) {
			await page.goto(baseUrl);
			await page
				.locator(".landing-header-actions")
				.getByRole("button", { name: /Toggle theme/ })
				.waitFor();
			await setShowcaseTheme(page, dark);
			await page.waitForFunction((dark) => {
				const img = document.querySelector<HTMLImageElement>(".landing-preview img");
				return (
					img?.complete &&
					img.naturalWidth > 0 &&
					new URL(img.currentSrc).pathname.startsWith(
						`/landing/dashboard-${dark ? "dark" : "light"}`,
					)
				);
			}, dark);
			assert.equal(await page.locator("h1").count(), 1);
			assert.equal((await page.locator("h1").innerText()).replace(/\s+/g, " "), LANDING_HEADING);
			await assertLandingBounds(page, width);
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	}
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await page.locator(".landing-brand-artwork").scrollIntoViewIfNeeded();
	await page.waitForFunction(
		() =>
			document.querySelector(".landing-brand-artwork")?.getAttribute("data-motion") === "running",
	);
	await page.getByRole("button", { name: "Pause tower motion", exact: true }).click();
	assert.equal(
		await page
			.locator(".landing-brand-float")
			.evaluate((node) => getComputedStyle(node).animationPlayState),
		"paused",
	);
	await page.getByRole("button", { name: "Resume tower motion", exact: true }).click();
	await page.emulateMedia({ reducedMotion: "reduce" });
	assert.equal(
		await page
			.locator(".landing-brand-float")
			.evaluate((node) => getComputedStyle(node).animationName),
		"none",
	);
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(baseUrl);
		await page
			.locator(".landing-header-actions")
			.getByRole("button", { name: /Toggle theme/ })
			.waitFor();
		await page.evaluate(() => {
			document.body.dataset.landingSession = "preserved";
		});
		await page.getByRole("link", { name: "Browse components", exact: true }).click();
		await assertDashboardBounds(page, width);
		assert.equal(new URL(page.url()).pathname, "/ui");
		assert.equal(
			await page.locator('meta[name="twitter:title"]').getAttribute("content"),
			await page.title(),
		);
		if (width < 768) {
			await page.getByRole("button", { name: "Open navigation menu", exact: true }).click();
		} else {
			const before = await page.locator("main").boundingBox();
			await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
			await page.waitForFunction(
				(beforeWidth) =>
					(document.querySelector("main")?.getBoundingClientRect().width ?? 0) > beforeWidth,
				before?.width ?? width,
			);
			await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
		}
		const sidebar =
			width < 768 ? page.getByRole("dialog") : page.locator("[data-dashboard-shell] > aside");
		await sidebar.getByRole("link", { name: "Home", exact: true }).click();
		await page
			.locator(".landing-header-actions")
			.getByRole("button", { name: /Toggle theme/ })
			.waitFor();
		assert.equal(
			await page.evaluate(() => document.body.dataset.landingSession),
			"preserved",
			"internal navigation must retain the running app",
		);
		await assertLandingBounds(page, width);
		await page.getByRole("link", { name: "Open dashboard", exact: true }).click();
		await assertDashboardBounds(page, width);
	}

	const browser = page.context().browser();
	assert.ok(browser);
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 1440, height: 900 },
	});
	try {
		const crawler = await context.newPage();
		for (const path of ["/", "/ui", "/ui/button", "/dashboard"]) {
			const response = await crawler.goto(`${baseUrl}${path}`);
			assert.equal(response?.status(), 200);
			assert.equal(await crawler.locator("h1").count(), 1);
			assert.equal(
				await crawler.locator('link[rel="canonical"]').getAttribute("href"),
				`${SITE_ORIGIN}${path}`,
			);
			assert.equal(
				await crawler.locator('meta[name="twitter:title"]').getAttribute("content"),
				await crawler.title(),
			);
			if (path === "/") {
				await assertLandingBounds(crawler, 1440);
				await crawler.locator("details summary").first().click();
				assert.equal(
					await crawler.locator("details[open]").count(),
					1,
					"FAQs must work without JS",
				);
			} else {
				assert.notEqual(await crawler.title(), SITE.homeTitle);
				assert.equal(await crawler.locator("[data-crawl-page]").count(), 1);
			}
		}
	} finally {
		await context.close();
	}
	return { cases, navigation: true, scrolling: true, noJavaScript: true };
}

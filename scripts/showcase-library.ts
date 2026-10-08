import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { CATALOG_CATEGORIES, catalogCategoryPath } from "../src/pages/ui/catalog-categories";
import { setShowcaseTheme } from "./showcase-theme";

async function assertPlots(container: Locator) {
	await container.locator("svg.recharts-surface").first().waitFor({ state: "attached" });
	const sizes = await container.locator("svg.recharts-surface").evaluateAll((nodes) =>
		nodes.map((node) => {
			const box = node.getBoundingClientRect();
			return { width: box.width, height: box.height };
		}),
	);
	assert.ok(sizes.length > 0, "the loaded composition must render real charts");
	for (const size of sizes) assert.ok(size.width > 0 && size.height > 0, JSON.stringify(size));
}

async function assertDocumentInsets(page: Page, baseUrl: string, dark: boolean) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const slug of ["tag-badge", "button"]) {
		await page.goto(`${baseUrl}/ui/${slug}`);
		await setShowcaseTheme(page, dark);
		const hero = page.locator("[data-hero-scenario]");
		await hero.waitFor();
		const disclosure = hero.getByRole("button", { name: "View example code" });
		if (slug === "tag-badge") {
			assert.equal(await disclosure.getAttribute("aria-expanded"), "false");
			await disclosure.focus();
			await page.keyboard.press("Enter");
			await hero.getByRole("region", { name: "Code example" }).waitFor();
		}
		for (const rootSize of [16, 20]) {
			await page.evaluate(
				(size) => (document.documentElement.style.fontSize = `${size}px`),
				rootSize,
			);
			const nav = page.locator('nav[aria-label="On this page"]:visible');
			assert.equal(
				await nav.evaluate((node) => {
					if (!node.parentElement) throw new Error("Missing navigation body");
					return getComputedStyle(node.parentElement).padding;
				}),
				`${rootSize}px`,
			);
			const measure = (container: Locator) =>
				container.evaluate((node) => {
					const preview = node.querySelector("[data-example-preview]");
					const trigger = node.querySelector('[data-slot="card-header"]');
					const code = node.querySelector("[data-basalt-code]");
					const header = code?.querySelector('[data-slot="code-header"]');
					const text = code?.querySelector("code");
					if (!preview || !code || !header || !text) throw new Error("Missing example boundaries");
					return {
						preview: getComputedStyle(preview).paddingLeft,
						trigger: trigger ? getComputedStyle(trigger).padding : null,
						header: getComputedStyle(header).padding,
						code: getComputedStyle(code).padding,
						text: getComputedStyle(text).paddingLeft,
						frame: [getComputedStyle(code).borderLeftWidth, getComputedStyle(code).borderRadius],
						triggerInset: trigger
							? trigger.getBoundingClientRect().left +
								Number.parseFloat(getComputedStyle(trigger).paddingLeft)
							: null,
						textInset:
							text.getBoundingClientRect().left +
							Number.parseFloat(getComputedStyle(text).paddingLeft),
					};
				});
			const geometry = await measure(hero);
			assert.equal(geometry.preview, `${rootSize}px`);
			assert.equal(geometry.text, `${rootSize}px`);
			assert.equal(geometry.header, `${rootSize * 0.75}px ${rootSize}px`);
			assert.equal(geometry.code, "0px");
			assert.deepEqual(geometry.frame, ["0px", "0px"]);
			if (slug === "tag-badge") {
				assert.equal(geometry.trigger, geometry.header);
				assert.ok(Math.abs((geometry.triggerInset ?? 0) - geometry.textInset) < 1);
			}
			const markup = await hero.evaluate((node) => node.innerHTML);
			const standalone = await page.context().newPage();
			try {
				await standalone.setContent(
					`<html class="${dark ? "dark" : ""}" style="font-size:${rootSize}px"><head><style>${css}</style></head><body><div data-test-doc>${markup}</div></body></html>`,
				);
				const isolated = await measure(standalone.locator("[data-test-doc]"));
				assert.deepEqual(
					{ ...isolated, triggerInset: null, textInset: null },
					{ ...geometry, triggerInset: null, textInset: null },
				);
			} finally {
				await standalone.close();
			}
		}
		await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
		if (slug === "tag-badge") {
			await disclosure.focus();
			await page.keyboard.press("Space");
			await hero.getByRole("region", { name: "Code example" }).waitFor({ state: "hidden" });
			assert.equal(await disclosure.getAttribute("aria-expanded"), "false");
		}
	}
}

/** Full compositions, including the transitions users copy into applications. */
export async function assertLibraryShowcases(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.emulateMedia({ reducedMotion: "reduce", colorScheme: dark ? "dark" : "light" });
			for (const category of CATALOG_CATEGORIES) {
				await page.goto(`${baseUrl}${catalogCategoryPath(category.id)}`);
				const overview = page.locator(`[data-category-overview="${category.id}"]`);
				await overview.waitFor();
				await setShowcaseTheme(page, dark);
				const geometry = await overview.evaluate((node) => {
					const island = node.closest("[data-doc-scroll]");
					const inset = island ? Number.parseFloat(getComputedStyle(island).paddingLeft) : 0;
					return {
						template: node.hasAttribute("data-showcase-page"),
						padding: getComputedStyle(node).paddingLeft,
						offset: island
							? node.getBoundingClientRect().left - island.getBoundingClientRect().left
							: -1,
						inset,
						gap: Number.parseFloat(getComputedStyle(node).rowGap),
					};
				});
				assert.ok(geometry.template, "Overview must use the shared page template");
				assert.equal(geometry.padding, "0px", "ContentIsland owns the page inset");
				assert.equal(geometry.inset, width < 768 ? 12 : 16);
				assert.equal(geometry.gap, 24, "Page sections use the large layout tier");
				assert.ok(Math.abs(geometry.offset - geometry.inset) <= 1, JSON.stringify(geometry));
				if (category.id === "card" || category.id === "layout") {
					const preview = overview.locator(`[data-spacing-preview="${category.id}"]`);
					for (const [name, pixels] of [
						["Small - 12px / .75rem", 12],
						["Medium - 16px / 1rem", 16],
						["Large - 24px / 1.5rem", 24],
						["Extra large - 32px / 2rem", 32],
					] as const) {
						await overview.getByRole("combobox", { name: "Spacing tier" }).click();
						await page.getByRole("option", { name, exact: true }).click();
						const computed = await preview.evaluate(
							(node, card) =>
								Number.parseFloat(
									card ? getComputedStyle(node).paddingLeft : getComputedStyle(node).gap,
								),
							category.id === "card",
						);
						assert.equal(computed, pixels, `${category.id}: ${name}`);
					}
				}
				assert.equal(
					await overview.getByRole("heading", { name: "Best practices", exact: true }).count(),
					1,
				);
				assert.equal(
					await overview.getByRole("link", { name: "Design contract", exact: true }).count(),
					1,
				);
				assert.ok(
					await page
						.locator("[data-doc-scroll]")
						.evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
					`${width}/${category.id}: overview overflow`,
				);
			}
			if (width === 390)
				await page.getByRole("button", { name: "Open navigation menu", exact: true }).click();
			const actionOverview = page.getByRole("button", { name: "Actions overview", exact: true });
			await actionOverview.focus();
			await page.keyboard.press("Enter");
			await page.waitForURL(`**${catalogCategoryPath("action")}`);
			await page.locator('[data-category-overview="action"]').waitFor();
			if (width === 390) await page.getByRole("dialog").waitFor({ state: "hidden" });
			else assert.equal(await actionOverview.getAttribute("aria-current"), "page");
			await assertDocumentInsets(page, baseUrl, dark);
			await page.goto(`${baseUrl}/ui/skeleton-line`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			for (const [key, button] of [
				["dashboard", "Show loaded dashboard"],
				["resource-list", "Show loaded list"],
				["resource-detail", "Show loaded detail"],
			]) {
				const scenario = page.locator(`[data-scenario="skeleton-line-${key}"]`);
				const busy = scenario.locator("[aria-busy]");
				const before = await busy.boundingBox();
				assert.ok(before && before.width > 0 && before.height > 0);
				assert.equal(
					await scenario.getByRole("status").count(),
					1,
					"one loading announcement per composition",
				);
				const animations = await scenario
					.locator(".animate-basalt-shimmer")
					.evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).animationName));
				assert.ok(
					animations.length > 0 && animations.every((name) => name === "none"),
					"reduced motion must stop skeleton shimmer",
				);
				await scenario.getByRole("button", { name: button }).click();
				assert.equal(await busy.getAttribute("aria-busy"), "false");
				const after = await busy.boundingBox();
				assert.ok(
					after && Math.abs(after.height - before.height) <= 1,
					`${key} loading/content height shifted: ${before.height} -> ${after?.height}`,
				);
				if (key === "dashboard") await assertPlots(scenario);
				const code = scenario.getByRole("button", { name: "View example code" });
				assert.equal(
					await code.getAttribute("aria-expanded"),
					"false",
					"complex source starts collapsed",
				);
			}
			await page.goto(`${baseUrl}/ui/sparkline`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const compact = page.locator("[data-hero-scenario]");
			await assertPlots(compact);
			const meters = compact.getByRole("progressbar");
			for (const [index, value] of [82, 24, 44, 38].entries()) {
				const meter = meters.nth(index);
				assert.equal(await meter.getAttribute("aria-valuenow"), String(value));
				assert.equal(await meter.locator("[data-filled]").count(), 17);
				assert.equal(
					await meter.locator('[data-filled="true"]').count(),
					Math.round((value / 100) * 17),
				);
			}
			const marks = compact.locator(".recharts-rectangle");
			assert.equal(await marks.count(), 56);
			const chartStyles = await marks.evaluateAll((nodes) =>
				nodes.map((node) => {
					const style = getComputedStyle(node);
					return {
						opacity: style.fillOpacity,
						animation: style.animationName,
						path: node.getAttribute("d"),
					};
				}),
			);
			assert.deepEqual([...new Set(chartStyles.map((style) => style.opacity))].sort(), [
				"0.4",
				"1",
			]);
			assert.ok(
				chartStyles.every(
					(style) => style.animation === "none" && !/NaN|Infinity/.test(style.path ?? ""),
				),
			);
			assert.equal(await compact.locator(".recharts-line").count(), 0);
			await page.goto(`${baseUrl}/tables`);
			const pipeline = page.locator('[data-table-showcase="pipeline"]');
			await assertPlots(pipeline);
			assert.equal(await pipeline.locator("[data-basalt-meter]").count(), 12);
			const overflow = await page
				.locator("[data-doc-scroll]")
				.evaluate((node) => node.scrollWidth - node.clientWidth);
			assert.ok(overflow <= 1, "chart summaries must stay inside the table scroll boundary");
			for (const slug of ["data-table", "table"]) {
				await page.goto(`${baseUrl}/ui/${slug}`);
				const demo = page.locator("[data-hero-scenario] [data-demo]");
				await demo.waitFor();
				await setShowcaseTheme(page, dark);
				const devices = slug === "data-table";
				const table = demo.getByRole("table");
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				assert.equal(await table.locator("tbody tr").count(), 4);
				await assertPlots(demo);
				const header = demo.getByRole("button", {
					name: devices ? "Requests / hour" : "Monthly cost",
					exact: true,
				});
				await header.focus();
				await page.keyboard.press("Enter");
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				assert.ok(
					["ascending", "descending"].includes(
						(await header.locator("..").getAttribute("aria-sort")) ?? "",
					),
				);
				const query = demo.getByRole("textbox", {
					name: devices ? "Search devices" : "Search subscriptions",
				});
				await query.fill("no-such-resource");
				await demo.getByRole("button", { name: "Reset filters" }).waitFor();
				await demo.getByRole("button", { name: "Reset filters" }).click();
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				await demo.getByRole("button", { name: "Error", exact: true }).click();
				await demo.getByRole("alert").waitFor();
				await demo.getByRole("button", { name: "Try again", exact: true }).click();
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				await table.getByRole("checkbox").first().check();
				await demo.getByRole("button", { name: "Next page", exact: true }).click();
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				assert.equal(await table.locator("tbody tr").count(), devices ? 4 : 2);
				await demo
					.getByRole("button", {
						name: devices ? "Resume selected" : "Prepare review",
						exact: true,
					})
					.click();
				await demo
					.getByText(devices ? "1 devices resumed" : "Review prepared for 1 subscriptions", {
						exact: true,
					})
					.waitFor();
				const bounds = await demo.boundingBox();
				assert.ok(bounds && bounds.width < width && bounds.width > (width === 390 ? 250 : 780));
			}
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return {
		cases,
		skeletonCompositions: 3,
		richTables: 2,
		compactCharts: true,
		transitions: true,
		keyboardSort: true,
		reducedMotion: true,
	};
}

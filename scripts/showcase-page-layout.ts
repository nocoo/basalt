import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertPageLayout(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [320, 390, 900, 1440]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const dark of [false, true]) {
			await page.goto(`${baseUrl}/ui/button`);
			await page.locator("[data-hero-scenario]").waitFor();
			await setShowcaseTheme(page, dark);
			await page.evaluate(() => document.fonts.ready);
			for (const rootSize of [16, 32]) {
				await page.evaluate((size) => {
					document.documentElement.style.fontSize = `${size}px`;
				}, rootSize);
				const geometry = await page.locator("[data-showcase-page]").evaluate((node) => {
					const island = node.closest("[data-doc-scroll]") as HTMLElement;
					const header = node.firstElementChild as HTMLElement;
					const title = header.querySelector("h1") as HTMLElement;
					const description = header.querySelector("p") as HTMLElement;
					const box = island.getBoundingClientRect();
					const style = getComputedStyle(island);
					return {
						insetX: Number.parseFloat(style.paddingLeft),
						insetY: Number.parseFloat(style.paddingTop),
						titleX: title.getBoundingClientRect().left - box.left,
						titleY: title.getBoundingClientRect().top - box.top + island.scrollTop,
						titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
						descriptionSize: Number.parseFloat(getComputedStyle(description).fontSize),
						descriptionLine: Number.parseFloat(getComputedStyle(description).lineHeight),
						textGap: description.getBoundingClientRect().top - title.getBoundingClientRect().bottom,
						pageGap: Number.parseFloat(getComputedStyle(node).rowGap),
						overflow: island.scrollWidth - island.clientWidth,
						background: getComputedStyle(header).backgroundImage,
						heading: header.tagName,
					};
				});
				const x = (width < 768 ? 1 : width < 1024 ? 1.5 : 2) * rootSize;
				const y = (width < 768 ? 1 : 1.5) * rootSize;
				assert.equal(geometry.insetX, x);
				assert.equal(geometry.insetY, y);
				assert.ok(Math.abs(geometry.titleX - x) <= 1, JSON.stringify(geometry));
				assert.ok(Math.abs(geometry.titleY - y) <= 1, JSON.stringify(geometry));
				assert.equal(geometry.titleSize, 1.875 * rootSize);
				assert.equal(geometry.descriptionSize, rootSize);
				assert.equal(geometry.descriptionLine, rootSize * 1.5);
				assert.ok(Math.abs(geometry.textGap - rootSize * 0.5) <= 1);
				assert.equal(geometry.pageGap, rootSize * 1.5);
				assert.ok(geometry.overflow <= 1, `${width}/${rootSize}: ${JSON.stringify(geometry)}`);
				assert.equal(geometry.background, "none");
				assert.equal(geometry.heading, "HEADER");
				assert.equal(await page.locator("[data-showcase-header]").count(), 0);
				const actions = await page
					.locator("[data-showcase-page] > header")
					.locator("a, button")
					.evaluateAll((nodes) =>
						nodes.map((node) => {
							const box = node.getBoundingClientRect();
							return { top: box.top, bottom: box.bottom, height: box.height };
						}),
					);
				assert.equal(actions.length, 3);
				for (const action of actions) {
					assert.equal(action.height, actions[0]?.height, "Page actions share their height");
				}
				assert.deepEqual(actions[1], actions[2], "Both copy actions share their vertical bounds");
				cases.push(`${width}/${dark ? "dark" : "light"}/${rootSize}`);
			}
			await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
			const action = page
				.locator("[data-hero-scenario]")
				.getByRole("button", { name: "Default", exact: true });
			assert.equal((await action.boundingBox())?.height, 34);
		}
	}
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
	await page.waitForFunction(() => {
		const island = document.querySelector("[data-doc-scroll]");
		return island && island.getBoundingClientRect().left < 100;
	});
	assert.equal(
		await page.locator("[data-doc-scroll]").evaluate((n) => getComputedStyle(n).paddingLeft),
		"32px",
	);
	const standalone = await page.context().newPage();
	try {
		const markup = await page.locator("[data-showcase-page] > header").evaluate((n) => n.outerHTML);
		const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
		await standalone.setViewportSize({ width: 1440, height: 1000 });
		await standalone.setContent(`<style>${css}</style>${markup}`);
		assert.equal(
			await standalone.locator("h1").evaluate((n) => getComputedStyle(n).fontSize),
			"30px",
		);
	} finally {
		await standalone.close();
	}
	await page.setViewportSize({ width: 390, height: 1000 });
	await page.goto(`${baseUrl}/ui`);
	await page.locator("[data-catalog-card='diff-table']").waitFor();
	await page.evaluate(() => document.fonts.ready);
	assert.ok(
		await page.locator("[data-doc-scroll]").evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
	);
	await page.goto(`${baseUrl}/ui/button/source`);
	await page.locator("[data-basalt-code]").waitFor();
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "32px";
	});
	assert.ok(
		await page.locator("[data-doc-scroll]").evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
		"Long source paths wrap at 200% text size",
	);
	await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	for (const width of [390, 1440]) {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(`${baseUrl}/interactions`);
		await page.locator("[data-interaction-card]").first().waitFor();
		for (const trigger of await page.locator("[data-interaction-card] > button").all()) {
			assert.equal(await trigger.evaluate((node) => getComputedStyle(node).padding), "12px 16px");
		}
		const feedback = page.getByRole("button", { name: /Send Feedback/ });
		await feedback.focus();
		await page.keyboard.press("Enter");
		const dialog = page.getByRole("dialog", { name: "Send Feedback" });
		await dialog.waitFor();
		await dialog.evaluate(async (node) => {
			await Promise.all(node.getAnimations().map((animation) => animation.finished));
		});
		assert.equal(
			await dialog.evaluate((node) => getComputedStyle(node).padding),
			width < 640 ? "16px" : "24px",
		);
		const spacing = await dialog.evaluate((node) => {
			const header = node.firstElementChild as HTMLElement;
			const form = node.querySelector("form") as HTMLElement;
			const fields = [
				form.querySelector("#feedback-name")?.parentElement,
				form.querySelector("#feedback-message")?.parentElement,
			];
			return {
				headerGap: form.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
				fieldGap:
					fields[0] && fields[1]
						? fields[1].getBoundingClientRect().top - fields[0].getBoundingClientRect().bottom
						: -1,
			};
		});
		assert.equal(spacing.headerGap, 16);
		assert.equal(spacing.fieldGap, 16);
		await page.keyboard.press("Escape");
		await dialog.waitFor({ state: "hidden" });
	}
	return { cases, compactActions: 34, standalone: true, collapsedRail: true };
}

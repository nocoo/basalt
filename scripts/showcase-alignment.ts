import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertCompositeAlignment(page: Page, baseUrl: string) {
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(`${baseUrl}/ui/tool-chips`);
		const demo = page.locator("[data-hero-scenario]");
		await demo.getByRole("button", { name: /Read image flavor-chart.png/ }).waitFor();
		const row = demo.getByRole("button", { name: /Rebuild and verify npm run freeze/ });
		const measure = () =>
			row.evaluate((node) => {
				const s = getComputedStyle(node);
				const icons = Array.from(node.querySelectorAll("svg"));
				return {
					padding: s.padding,
					height: node.getBoundingClientRect().height,
					line: s.lineHeight,
					icons: icons.map((icon) => ({
						width: icon.getBoundingClientRect().width,
						rotate: getComputedStyle(icon).rotate,
					})),
				};
			});
		const before = await measure();
		assert.equal(before.padding, "6px 8px");
		assert.equal(before.height, width < 768 ? 52 : 32);
		assert.equal(before.line, "20px");
		assert.equal(before.icons[0].width, 16);
		assert.equal(before.icons[before.icons.length - 1].width, 12);
		await demo.evaluate((node) => (node as HTMLElement).style.setProperty("--spacing", "9px"));
		assert.deepEqual(await measure(), before);
		await row.click();
		await demo.locator("p").filter({ hasText: "34 checks passed" }).waitFor();
		const open = await measure();
		assert.equal(open.icons[0].rotate, "none");
		assert.equal(open.icons[open.icons.length - 1].rotate, "180deg");
		await demo.evaluate((node) =>
			(node as HTMLElement).style.setProperty("--basalt-space-row-x", "14px"),
		);
		assert.equal((await measure()).padding, "6px 14px");
		await page.goto(`${baseUrl}/ui/chat-message`);
		await demo.getByRole("button", { name: "Sources 1" }).waitFor();
		const article = demo.getByRole("article");
		const action = article.getByRole("button", { name: "Copy message" });
		const firstParagraph = article.locator("p").first();
		const left = await firstParagraph.evaluate((node) => node.getBoundingClientRect().left);
		assert.equal(Math.round((await action.boundingBox())?.height ?? 0), 24);
		assert.ok(
			Math.abs(
				(await action.locator("svg").evaluate((node) => node.getBoundingClientRect().left)) - left,
			) < 1,
		);
		await article.getByRole("button", { name: "Sources 1" }).click();
		await article.getByRole("link", { name: /Summer sales report/ }).waitFor();
		assert.equal(await article.locator("[data-basalt-surface]").count(), 0);
		assert.equal(
			await article.getByRole("link").evaluate((node) => getComputedStyle(node).padding),
			"4px 8px",
		);
		await page.goto(`${baseUrl}/ui/context-cards`);
		await demo.getByRole("heading", { name: "Vendor onboarding rule", exact: true }).waitFor();
		const card = demo.locator("[data-basalt-surface]").first();
		const insets = await card.evaluate((node) => {
			const header = node.firstElementChild as HTMLElement;
			const body = node.querySelector("p") as HTMLElement;
			const footer = node.lastElementChild as HTMLElement;
			return [header, body, footer].map((part) => getComputedStyle(part).paddingLeft);
		});
		assert.deepEqual(insets, ["12px", "12px", "12px"]);
		assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
	}
	return {
		viewports: 2,
		rowPadding: [6, 8],
		rowHeight: 32,
		actionSize: 24,
		iconOwnership: true,
		alignedInsets: true,
		sourceDisclosure: true,
	};
}

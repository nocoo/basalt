import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertChatComposerSizing(page: Page, baseUrl: string) {
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(`${baseUrl}/ui/prompt-bar`);
		await page.locator('[data-status="ready"]').waitFor();
		const demo = page.locator("[data-hero-scenario]");
		const input = demo.getByRole("textbox", { name: "Message", exact: true });
		await input.fill("one");
		const first = await input.boundingBox();
		await input.fill("one\ntwo\nthree\nfour\nfive\nsix\nseven\neight");
		const geometry = await input.evaluate((node) => {
			const field = node as HTMLTextAreaElement;
			const css = getComputedStyle(field);
			return {
				height: field.getBoundingClientRect().height,
				line: parseFloat(css.lineHeight),
				padding: parseFloat(css.paddingTop) + parseFloat(css.paddingBottom),
				scroll: field.scrollHeight,
				client: field.clientHeight,
				overflow: css.overflowY,
			};
		});
		assert.ok(first && geometry.height > first.height);
		assert.ok(
			geometry.height <= 5 * geometry.line + geometry.padding + 1,
			JSON.stringify(geometry),
		);
		assert.ok(geometry.scroll > geometry.client);
		assert.equal(geometry.overflow, "auto");
		await input.evaluate((node) => (node.scrollTop = node.scrollHeight));
		assert.ok(await input.evaluate((node) => node.scrollTop > 0));
		await input.fill("");
		const reset = await input.boundingBox();
		assert.ok(reset && Math.abs(reset.height - first.height) < 1);
		await input.fill("Send this");
		await input.press("Enter");
		await page.waitForFunction(
			() =>
				document.querySelector<HTMLTextAreaElement>("[data-hero-scenario] textarea")?.value === "",
		);
	}
	return { viewports: 2, maxLines: 5, nativeSizing: true, overflow: true };
}

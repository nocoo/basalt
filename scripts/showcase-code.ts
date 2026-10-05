import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";

async function assertCodePanel(page: Page, panel: Locator) {
	const pre = panel.locator("pre");
	const source = await pre.locator("code").textContent();
	assert.ok(source);
	const selected = await pre.locator("code").evaluate((node) => {
		const range = document.createRange();
		range.selectNodeContents(node);
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
		const text = selection?.toString();
		selection?.removeAllRanges();
		return text;
	});
	assert.equal(selected, source);
	assert.equal(
		await pre.locator("code").innerText(),
		source,
		"selection must not add blank lines or line numbers",
	);
	const numbers = pre.locator("[data-line-number]");
	assert.equal(await numbers.count(), source.split("\n").length);
	const geometry = await panel.evaluate((node) => {
		const header = node.querySelector('[data-slot="code-header"]') as HTMLElement;
		const code = node.querySelector("code") as HTMLElement;
		const pre = node.querySelector("pre") as HTMLElement;
		return {
			header: header.getBoundingClientRect().height,
			inset: getComputedStyle(header).padding,
			line: getComputedStyle(code).lineHeight,
			scroll: pre.scrollWidth,
			width: pre.clientWidth,
			panelWidth: node.getBoundingClientRect().width,
		};
	});
	assert.equal(geometry.header, 41);
	assert.equal(geometry.inset, "8px 12px");
	assert.equal(geometry.line, "20px");
	assert.ok(geometry.scroll > geometry.width, JSON.stringify(geometry));
	await pre.focus();
	await pre.press("ArrowRight");
	await page.waitForFunction(() => (document.activeElement as HTMLElement)?.scrollLeft > 0);
	await panel.evaluate((node) => {
		(node as HTMLElement).style.maxHeight = "160px";
	});
	await pre.evaluate((node) => {
		node.scrollTop = node.scrollHeight;
	});
	assert.ok(await pre.evaluate((node) => node.scrollTop > 0));
	assert.ok(await panel.locator('[data-slot="code-header"]').isVisible());
	const headerLeft = await panel
		.locator('[data-slot="code-header"]')
		.evaluate((node) => node.getBoundingClientRect().left);
	await pre.evaluate((node) => {
		node.scrollLeft = node.scrollWidth;
	});
	assert.equal(
		await panel
			.locator('[data-slot="code-header"]')
			.evaluate((node) => node.getBoundingClientRect().left),
		headerLeft,
	);
	await panel.getByRole("button", { name: "Copy code", exact: true }).click();
	await panel.getByRole("button", { name: "Copied", exact: true }).waitFor();
	assert.equal(
		await page.evaluate(() => (window as Window & { copiedCode?: string }).copiedCode),
		source,
	);
	await panel.evaluate((node) => {
		(node as HTMLElement).style.setProperty("--spacing", "9px");
	});
	assert.equal(
		await panel
			.locator('[data-slot="code-header"]')
			.evaluate((node) => getComputedStyle(node).padding),
		"8px 12px",
	);
}

export async function assertCodePanels(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	await page.addInitScript(() =>
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: async (text: string) => {
					(window as Window & { copiedCode?: string }).copiedCode = text;
				},
			},
		}),
	);
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(`${baseUrl}/ui/code`);
		const panel = page.locator("[data-hero-scenario] [data-basalt-code]");
		await panel.waitFor();
		await panel.evaluate((node) => {
			(node as HTMLElement).style.width = "260px";
		});
		await assertCodePanel(page, panel);
		await page.goto(`${baseUrl}/ui/code`);
		await panel.waitFor();
		const markup = await panel.evaluate((node) => node.outerHTML);
		await page.setContent(`<style>${css}</style>${markup}`);
		const standalone = page.locator("[data-basalt-code]");
		assert.equal(
			await standalone.locator("code").evaluate((node) => getComputedStyle(node).lineHeight),
			"20px",
		);
		assert.equal(
			await standalone
				.locator("[data-line-number]")
				.first()
				.evaluate((node) => getComputedStyle(node, "::before").content),
			'"1"',
		);
		await page.evaluate(() => document.documentElement.style.setProperty("--spacing", "9px"));
		assert.equal(
			await standalone
				.locator('[data-slot="code-header"]')
				.evaluate((node) => getComputedStyle(node).padding),
			"8px 12px",
		);
	}
	return {
		viewports: 2,
		header: true,
		copy: true,
		lineNumbers: true,
		exactSelection: true,
		horizontalScroll: true,
		standalone: true,
	};
}

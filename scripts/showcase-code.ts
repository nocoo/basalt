import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";

async function assertCodeScrollChaining(page: Page, panel: Locator) {
	await panel.evaluate((node) => {
		const host = document.createElement("div");
		host.dataset.codeScrollTest = "";
		host.style.cssText =
			"position:fixed;z-index:99999;inset:16px auto auto 16px;width:320px;max-width:90vw;height:420px;overflow:auto;scroll-behavior:auto;";
		const before = document.createElement("div");
		before.style.height = "120px";
		const after = document.createElement("div");
		after.style.height = "2000px";
		const clone = node.cloneNode(true) as HTMLElement;
		clone.style.cssText = "width:260px;max-height:none";
		host.append(before, clone, after);
		document.body.append(host);
	});
	const host = page.locator("[data-code-scroll-test]");
	const pre = host.locator("pre");
	const wheel = async (x: number, y: number) => {
		// Aim the wheel at the code surface directly: hover auto-scroll would move the host first.
		const box = await pre.boundingBox();
		assert.ok(box, "the code surface must be visible");
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
		await page.mouse.wheel(x, y);
	};
	try {
		assert.deepEqual(
			await pre.evaluate((node) => ({
				x: getComputedStyle(node).overscrollBehaviorX,
				y: getComputedStyle(node).overscrollBehaviorY,
			})),
			{ x: "contain", y: "auto" },
		);
		assert.ok(await pre.evaluate((node) => node.scrollHeight <= node.clientHeight + 1));
		await wheel(0, 120);
		await page.waitForFunction(
			() => (document.querySelector("[data-code-scroll-test]")?.scrollTop ?? 0) > 0,
		);
		await host.evaluate((node) => {
			node.scrollTop = 0;
			const panel = node.querySelector<HTMLElement>("[data-basalt-code]");
			if (panel) panel.style.maxHeight = "160px";
		});
		await wheel(0, 40);
		await page.waitForFunction(
			() => (document.querySelector("[data-code-scroll-test] pre")?.scrollTop ?? 0) > 0,
		);
		assert.equal(await host.evaluate((node) => node.scrollTop), 0);
		await pre.evaluate((node) => {
			node.scrollTop = node.scrollHeight;
		});
		await wheel(0, 120);
		await page.waitForFunction(
			() => (document.querySelector("[data-code-scroll-test]")?.scrollTop ?? 0) > 0,
		);
		await host.evaluate((node) => {
			node.scrollTop = 80;
		});
		await pre.evaluate((node) => {
			node.scrollTop = 0;
		});
		await wheel(0, -40);
		await page.waitForFunction(
			() => (document.querySelector("[data-code-scroll-test]")?.scrollTop ?? 80) < 80,
		);
		await host.evaluate((node) => {
			node.scrollTop = 0;
		});
		await pre.evaluate((node) => {
			node.scrollLeft = 0;
		});
		await wheel(120, 0);
		await page.waitForFunction(
			() => (document.querySelector("[data-code-scroll-test] pre")?.scrollLeft ?? 0) > 0,
		);
		assert.equal(await host.evaluate((node) => node.scrollTop), 0);
	} finally {
		await host.evaluate((node) => node.remove());
	}
}

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
			font: getComputedStyle(code).fontSize,
			line: getComputedStyle(code).lineHeight,
			scroll: pre.scrollWidth,
			width: pre.clientWidth,
		};
	});
	assert.equal(geometry.header, 57);
	assert.equal(geometry.inset, "12px 16px");
	assert.equal(geometry.font, "12px");
	assert.equal(geometry.line, "20px");
	// A narrow panel must contain its code instead of stretching the page.
	await panel.evaluate((node) => {
		(node as HTMLElement).style.width = "260px";
	});
	const overflow = await panel.evaluate((node) => {
		const pre = node.querySelector("pre") as HTMLElement;
		return { scroll: pre.scrollWidth, width: pre.clientWidth };
	});
	assert.ok(overflow.scroll > overflow.width, JSON.stringify(overflow));
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
		"12px 16px",
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
		const panel = page.locator("[data-hero-scenario] [data-basalt-code]:not([data-code-attached])");
		await panel.waitFor();
		await assertCodePanel(page, panel);
		await assertCodeScrollChaining(page, panel);
		await page.goto(`${baseUrl}/ui/code`);
		await panel.waitFor();
		const markup = await panel.evaluate((node) => node.outerHTML);
		await page.setContent(`<style>${css}</style>${markup}`);
		const standalone = page.locator("[data-basalt-code]");
		assert.equal(
			await standalone.locator("code").evaluate((node) => getComputedStyle(node).fontSize),
			"12px",
		);
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
			"12px 16px",
		);
		await assertCodeScrollChaining(page, standalone);
	}
	return {
		viewports: 2,
		header: true,
		copy: true,
		lineNumbers: true,
		exactSelection: true,
		horizontalScroll: true,
		verticalScrollChaining: true,
		standalone: true,
	};
}

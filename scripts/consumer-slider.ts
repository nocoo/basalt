import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertConsumerSlider(page: Page) {
	await page.waitForFunction(() => Boolean(window.sliderAudit?.mounted));

	// 1. Horizontal multi-value slider with labels
	const hThumbs = page.locator("#slider-h [role=slider]");
	assert.equal(await hThumbs.count(), 2, "horizontal slider should have 2 thumbs");

	const hMin = hThumbs.nth(0);
	const hMax = hThumbs.nth(1);
	assert.equal(await hMin.getAttribute("aria-label"), "Min range");
	assert.equal(await hMax.getAttribute("aria-label"), "Max range");
	assert.equal(await hMin.getAttribute("aria-valuenow"), "20");
	assert.equal(await hMax.getAttribute("aria-valuenow"), "80");

	const hBox0 = await hMin.boundingBox();
	const hBox1 = await hMax.boundingBox();
	assert.ok(hBox0 && hBox1, "thumbs must have bounding boxes");
	assert.ok(hBox0.x < hBox1.x - 40, `horizontal thumbs x order invalid: ${hBox0.x} vs ${hBox1.x}`);

	// 2. Vertical multi-value slider geometry and keyboard
	const vThumbs = page.locator("#slider-v [role=slider]");
	assert.equal(await vThumbs.count(), 2, "vertical slider should have 2 thumbs");

	const vMin = vThumbs.nth(0);
	const vMax = vThumbs.nth(1);
	assert.equal(await vMin.getAttribute("aria-orientation"), "vertical");
	assert.equal(await vMin.getAttribute("aria-valuenow"), "20");
	assert.equal(await vMax.getAttribute("aria-valuenow"), "80");

	const vBox0 = await vMin.boundingBox();
	const vBox1 = await vMax.boundingBox();
	assert.ok(vBox0 && vBox1, "vertical thumbs must have bounding boxes");
	assert.ok(
		vBox0.y > vBox1.y + 40,
		`vertical thumbs y order invalid (min lower than max): ${vBox0.y} vs ${vBox1.y}`,
	);

	// Keyboard interaction: ArrowUp increases vertical slider value
	await vMin.focus();
	await page.keyboard.press("ArrowUp");
	await page.waitForFunction(
		() => document.querySelector("#slider-v [role=slider]")?.getAttribute("aria-valuenow") === "21",
	);
	assert.equal(await vMin.getAttribute("aria-valuenow"), "21");

	return {
		horizontal: { x0: hBox0.x, x1: hBox1.x },
		vertical: { y0: vBox0.y, y1: vBox1.y, valueAfterArrowUp: 21 },
	};
}

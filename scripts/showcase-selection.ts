import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

async function selectedPaint(row: Locator) {
	return row.evaluate((node) => {
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) throw new Error("Canvas context unavailable");
		const rgba = (color: string) => {
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = color;
			context.fillRect(0, 0, 1, 1);
			return [...context.getImageData(0, 0, 1, 1).data];
		};
		const luminance = (channels: number[]) =>
			channels.slice(0, 3).reduce((sum, value, index) => {
				const channel = value / 255;
				const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
				return sum + linear * [0.2126, 0.7152, 0.0722][index];
			}, 0);
		const style = getComputedStyle(node);
		let parent = node.parentElement;
		while (parent && rgba(getComputedStyle(parent).backgroundColor)[3] === 0)
			parent = parent.parentElement;
		const parentRgba = parent ? rgba(getComputedStyle(parent).backgroundColor) : [0, 0, 0, 255];
		const fillRgba = rgba(style.backgroundColor);
		const alpha = fillRgba[3] / 255;
		const compositeRgba = [
			fillRgba[0] * alpha + parentRgba[0] * (1 - alpha),
			fillRgba[1] * alpha + parentRgba[1] * (1 - alpha),
			fillRgba[2] * alpha + parentRgba[2] * (1 - alpha),
		];
		const foreground = luminance(rgba(style.color));
		const background = luminance(compositeRgba);
		return {
			fill: style.backgroundColor,
			opacity: style.opacity,
			brightness: background,
			parentBrightness: parent ? luminance(parentRgba) : 0,
			contrast:
				(Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
			beforeContent: getComputedStyle(node, "::before").content,
			afterContent: getComputedStyle(node, "::after").content,
			borderWidth: style.borderTopWidth,
		};
	});
}

export async function assertSelectionHierarchy(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const dark of [false, true]) {
			for (const slug of ["sidebar"]) {
				await page.goto(`${baseUrl}/ui/${slug}`);
				await page.locator('[data-status="ready"]').waitFor();
				await setShowcaseTheme(page, dark);
				await page.emulateMedia({ reducedMotion: "reduce" });
				const demo = page.locator("[data-hero-scenario]");
				const selected = demo.locator('.basalt-nav-item[data-hover-selected="true"]');
				const other = demo.locator('.basalt-nav-item:not([data-hover-selected="true"])').first();
				const before = await selectedPaint(selected);
				await other.hover();
				await page.evaluate(
					() =>
						new Promise<void>((resolve) =>
							requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
						),
				);
				assert.deepEqual(
					await selectedPaint(selected),
					before,
					"Hover must not erase selected paint",
				);
				if (dark) {
					assert.ok(before.brightness >= before.parentBrightness, JSON.stringify(before));
				} else {
					assert.ok(before.brightness < before.parentBrightness, JSON.stringify(before));
				}
				assert.ok(before.contrast >= 4.5, JSON.stringify(before));
				assert.equal(before.opacity, "1");
				assert.equal(before.beforeContent, "none");
				assert.equal(before.afterContent, "none");
				assert.equal(before.borderWidth, "0px");
				const label = await other.textContent();
				await other.focus();
				await other.press("Enter");
				assert.equal(await selected.textContent(), label);
				assert.equal(
					await selected.evaluate((node) => getComputedStyle(node).outlineOffset),
					"-2px",
				);
				if (slug === "sidebar") {
					const labelStyle = await demo
						.locator('[data-slot="sidebar-group-label"]')
						.evaluate((node) => {
							const style = getComputedStyle(node);
							return {
								transform: style.textTransform,
								font: style.fontSize,
								padding: style.padding,
							};
						});
					assert.deepEqual(labelStyle, {
						transform: "uppercase",
						font: "11px",
						padding: "6px 8px",
					});
				}
				const markup = await demo.evaluate((node) => node.outerHTML);
				await page.setContent(
					`<style>${css}</style><main data-basalt-surface-root>${markup}</main>`,
				);
				await page.evaluate((dark) => {
					document.documentElement.className = dark ? "dark" : "light";
					document.documentElement.dataset.mode = dark ? "dark" : "light";
				}, dark);
				const standalone = await selectedPaint(
					page.locator('.basalt-nav-item[data-hover-selected="true"]'),
				);
				assert.equal(standalone.fill, before.fill);
				assert.equal(standalone.beforeContent, "none");
				assert.equal(standalone.afterContent, "none");
				assert.equal(standalone.borderWidth, "0px");
			}
		}
	}
	return { themes: 2, viewports: 2, cssEntrypoints: 2, persistentSelection: true, keyboard: true };
}

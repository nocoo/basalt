import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

async function sampleAnimation(target: Locator, name: string) {
	const sample = await target.evaluate((node, expected) => {
		const animation = node
			.getAnimations()
			.find((item) => item instanceof CSSAnimation && item.animationName === expected);
		if (!animation?.effect) throw new Error(`Missing ${expected}`);
		animation.pause();
		animation.currentTime = Number(animation.effect.getTiming().duration) / 2;
		const style = getComputedStyle(node);
		const result = {
			opacity: Number(style.opacity),
			scale: Number(style.scale),
			transform: style.transform,
			blur: style.backdropFilter,
		};
		animation.finish();
		return result;
	}, name);
	return sample;
}

export async function assertOverlayMotion(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [390, 1280]) {
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await page.goto(`${baseUrl}/ui/sheet`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const sheetDemo = page.locator("[data-hero-scenario]");
			for (const side of ["right", "left", "top", "bottom"]) {
				const trigger = sheetDemo.getByRole("button", { name: `Open ${side} panel`, exact: true });
				await trigger.click();
				const panel = page.locator("[data-basalt-sheet]");
				const backdrop = page.locator(".basalt-sheet-overlay");
				const entrance = await sampleAnimation(panel, "basalt-sheet-in");
				assert.notEqual(entrance.transform, "matrix(1, 0, 0, 1, 0, 0)");
				const haze = await sampleAnimation(backdrop, "basalt-sheet-backdrop-in");
				assert.ok(haze.opacity > 0 && haze.opacity < 1);
				assert.match(haze.blur, /^blur\(/);
				const box = await panel.boundingBox();
				assert.ok(box && box.width <= width && box.height <= 1000);
				assert.equal(await panel.evaluate((node) => node.contains(document.activeElement)), true);
				await page.keyboard.press("Escape");
				await sampleAnimation(panel, "basalt-sheet-out");
				await sampleAnimation(backdrop, "basalt-sheet-backdrop-out");
				await panel.waitFor({ state: "detached" });
				await backdrop.waitFor({ state: "detached" });
				await page.waitForFunction(
					(node) => node === document.activeElement,
					await trigger.elementHandle(),
				);
			}
			await page.emulateMedia({ reducedMotion: "reduce" });
			await sheetDemo.getByRole("button", { name: "Open right panel", exact: true }).click();
			assert.equal(
				await page
					.locator("[data-basalt-sheet]")
					.evaluate((node) => getComputedStyle(node).animationName),
				"none",
			);
			await page.getByRole("button", { name: "Close panel", exact: true }).click();
			await page.locator("[data-basalt-sheet]").waitFor({ state: "detached" });
			await page.locator(".basalt-sheet-overlay").waitFor({ state: "detached" });

			for (const slug of ["dropdown-menu", "popover", "select", "combobox", "autocomplete"]) {
				await page.goto(`${baseUrl}/ui/${slug}`);
				await page.locator('[data-status="ready"]').waitFor();
				const demo = page.locator("[data-hero-scenario]");
				// Resolve the trigger while the page is reachable: an open modal overlay marks the
				// rest of the document aria-hidden, which hides it from role queries.
				const trigger = await (["select", "combobox", "autocomplete"].includes(slug)
					? demo.getByRole("combobox")
					: demo.getByRole("button")
				)
					.first()
					.elementHandle();
				assert.ok(trigger, `${slug}: trigger`);
				const panel = page.locator('.basalt-floating[data-state="open"]');
				for (const reduce of [false, true]) {
					await page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
					await trigger.click();
					if (slug === "autocomplete") await trigger.fill("ca");
					if (reduce) {
						assert.equal(
							await panel.evaluate((node) => getComputedStyle(node).animationName),
							"none",
						);
					} else {
						const entrance = await sampleAnimation(panel, "basalt-floating-in");
						assert.ok(entrance.opacity > 0 && entrance.opacity < 1);
						assert.ok(entrance.scale > 0.95 && entrance.scale < 1);
					}
					await page.keyboard.press("Escape");
					const closing = page.locator('.basalt-floating[data-state="closed"]');
					if (!reduce) await sampleAnimation(closing, "basalt-floating-out");
					await closing.waitFor({ state: "detached" });
					await page.waitForFunction((node) => node === document.activeElement, trigger);
				}
			}
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	}
	return { cases, directions: 4, floatingControls: 5, exitPresence: true, reducedMotion: true };
}

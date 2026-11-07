import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertTemplateDemos(page: Page, baseUrl: string) {
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto(`${baseUrl}/dashboard`);
		for (const name of ["Book Visit", "Log Vitals", "Add Medication", "Save Check-in"]) {
			const trigger = page.getByRole("button", { name, exact: true });
			for (const dismissal of ["button", "escape", "outside"]) {
				await trigger.scrollIntoViewIfNeeded();
				await trigger.focus();
				await trigger.press("Enter");
				const dialog = page.getByRole("dialog", { name: `${name} — demo only`, exact: true });
				await dialog.waitFor();
				await dialog.evaluate((node) =>
					Promise.all(node.getAnimations().map((animation) => animation.finished)),
				);
				assert.ok((await dialog.textContent()).includes("Nothing is booked, recorded, or sent"));
				if (dismissal === "button")
					await dialog.getByRole("button", { name: "Close", exact: true }).click();
				else if (dismissal === "escape") await page.keyboard.press("Escape");
				else await page.mouse.click(4, 4);
				await dialog.waitFor({ state: "hidden" });
				assert.ok(await trigger.evaluate((node) => node === document.activeElement));
			}
		}
		await page.goto(`${baseUrl}/wearable`);
		await page
			.getByRole("heading", { name: "Wearable performance dashboard", exact: true })
			.waitFor();
		const steps = page.locator('[data-slot="stat-card-value"]').first();
		const initial = await steps.textContent();
		await page.getByRole("button", { name: "Previous day", exact: true }).click();
		assert.notEqual(await steps.textContent(), initial);
		await page.getByRole("button", { name: "Next day", exact: true }).click();
		assert.equal(await steps.textContent(), initial);
		await page.getByRole("button", { name: "Today", exact: true }).click();
		assert.ok(await page.getByRole("button", { name: "Today", exact: true }).isDisabled());
		for (const name of ["Sleep stages", "Heart rate zones"]) {
			const card = page.locator("[data-basalt-surface]").filter({
				has: page.getByRole("heading", { name, exact: true }),
			});
			assert.equal(await card.getByRole("listitem").count(), 4);
		}
		await page.goto(`${baseUrl}/login`);
		for (const dark of [false, true]) {
			await setShowcaseTheme(page, dark);
			for (const fontSize of [16, 32]) {
				await page.evaluate((size) => {
					document.documentElement.style.fontSize = `${size}px`;
				}, fontSize);
				const badge = page.locator("[data-basalt-surface-root]");
				const bounds = await badge.boundingBox();
				assert.ok(
					bounds && bounds.x >= 0 && bounds.x + bounds.width <= width,
					JSON.stringify({ width, fontSize, bounds }),
				);
				const provider = page.getByRole("button", { name: "Continue with Google", exact: true });
				assert.ok(await provider.isDisabled());
				assert.equal(await provider.getAttribute("aria-describedby"), "login-demo-notice");
				assert.ok(
					await page.getByText("Demo template · sign-in is disabled", { exact: true }).isVisible(),
				);
			}
		}
		await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	}
	return {
		widths: [390, 1440],
		quickActions: 4,
		dismissalPaths: 3,
		wearableNavigation: true,
		loginRootFonts: [16, 32],
	};
}

import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertConsumerTemplates(page: Page, url: string) {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto(`${url}/template`);
	await page.getByRole("heading", { name: "Welcome back" }).waitFor();
	const card = page.locator("main [data-basalt-surface]").first();
	assert.equal(await card.evaluate((node) => getComputedStyle(node).maxWidth), "288px");
	await page.getByLabel("Email").fill("visitor@example.com");
	await page.getByLabel("Password").fill("password");
	await page.getByRole("button", { name: "Sign in" }).click();
	await page
		.getByRole("status")
		.getByText(/No credentials were sent/)
		.waitFor();

	await page.goto(`${url}/template?example=agent`);
	await page.getByRole("heading", { name: "Prepare the release" }).waitFor();
	const columns = page.locator("[data-basalt-island] > div").first();
	const boxes = await columns.evaluate((node) =>
		Array.from(node.children, (child) => {
			const rect = child.getBoundingClientRect();
			return { x: rect.x, y: rect.y, width: rect.width };
		}),
	);
	const widths = boxes.map((box) => box.width);
	assert.equal(widths.length, 2);
	assert.ok(
		widths.every((width) => width > 200),
		`agent columns: ${widths}`,
	);
	assert.ok(Math.abs(boxes[0].y - boxes[1].y) <= 2, `agent column rows: ${JSON.stringify(boxes)}`);
	assert.ok(
		boxes[0].x + boxes[0].width <= boxes[1].x,
		`agent column order: ${JSON.stringify(boxes)}`,
	);
	await page.setViewportSize({ width: 768, height: 900 });
	const positions = await columns.evaluate((node) =>
		Array.from(node.children, (child) => child.getBoundingClientRect().top),
	);
	assert.ok(positions[1] > positions[0], `agent tablet layout: ${positions}`);

	await page.setViewportSize({ width: 390, height: 900 });
	for (const [example, title, action] of [
		["agent", "Sessions", "New session"],
		["executive", "Dashboard navigation", "Accounts"],
		["ops", "Operations", "Runbooks"],
		["settings", "Workspace navigation", "Members"],
	] as const) {
		await page.goto(`${url}/template?example=${example}`);
		const menu = page.getByRole("button", { name: "Open navigation" });
		await menu.click();
		const drawer = page.getByRole("dialog", { name: title });
		await drawer.getByRole("button", { name: action }).click();
		await drawer.waitFor({ state: "hidden" });
		if (example === "ops") {
			await page.waitForFunction(() => document.activeElement?.id === "INC-1042-0");
		} else {
			await page.waitForFunction(
				() => document.activeElement?.getAttribute("aria-label") === "Open navigation",
			);
		}
		await menu.click();
		await drawer.waitFor({ state: "visible" });
		await drawer.getByRole("button", { name: "Close navigation" }).focus();
		await page.locator('[role="tooltip"]').waitFor({ state: "detached" });
		await page.keyboard.press("Escape");
		await drawer.waitFor({ state: "hidden" });
		await page.waitForFunction(
			() => document.activeElement?.getAttribute("aria-label") === "Open navigation",
		);
	}
	return {
		nextClientTemplates: 5,
		standaloneLoginWidth: 288,
		desktopAgentColumns: widths,
		tabletAgentStack: true,
		mobileDrawers: 4,
	};
}

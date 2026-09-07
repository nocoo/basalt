import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

async function assertPlots(container: Locator) {
	await container.locator("svg.recharts-surface").first().waitFor({ state: "attached" });
	const sizes = await container.locator("svg.recharts-surface").evaluateAll((nodes) =>
		nodes.map((node) => {
			const box = node.getBoundingClientRect();
			return { width: box.width, height: box.height };
		}),
	);
	assert.ok(sizes.length > 0, "the loaded composition must render real charts");
	for (const size of sizes) assert.ok(size.width > 0 && size.height > 0, JSON.stringify(size));
}

/** Full compositions, including the transitions users copy into applications. */
export async function assertLibraryShowcases(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.emulateMedia({ reducedMotion: "reduce", colorScheme: dark ? "dark" : "light" });
			await page.goto(`${baseUrl}/ui/skeleton-line`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			for (const [key, button] of [
				["dashboard", "Show loaded dashboard"],
				["resource-list", "Show loaded list"],
				["resource-detail", "Show loaded detail"],
			]) {
				const scenario = page.locator(`[data-scenario="skeleton-line-${key}"]`);
				const busy = scenario.locator("[aria-busy]");
				const before = await busy.boundingBox();
				assert.ok(before && before.width > 0 && before.height > 0);
				assert.equal(
					await scenario.getByRole("status").count(),
					1,
					"one loading announcement per composition",
				);
				const animations = await scenario
					.locator(".animate-basalt-shimmer")
					.evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).animationName));
				assert.ok(
					animations.length > 0 && animations.every((name) => name === "none"),
					"reduced motion must stop skeleton shimmer",
				);
				await scenario.getByRole("button", { name: button }).click();
				assert.equal(await busy.getAttribute("aria-busy"), "false");
				const after = await busy.boundingBox();
				assert.ok(
					after && Math.abs(after.height - before.height) <= 1,
					`${key} loading/content height shifted: ${before.height} -> ${after?.height}`,
				);
				if (key === "dashboard") await assertPlots(scenario);
				const code = scenario.locator("details");
				assert.equal(await code.getAttribute("open"), null, "complex source starts collapsed");
			}
			for (const slug of ["data-table", "table"]) {
				await page.goto(`${baseUrl}/ui/${slug}`);
				const demo = page.locator("[data-hero-scenario] [data-demo]");
				await demo.waitFor();
				await setShowcaseTheme(page, dark);
				const devices = slug === "data-table";
				const table = demo.getByRole("table");
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				assert.equal(await table.locator("tbody tr").count(), 4);
				await assertPlots(demo);
				const header = demo.getByRole("button", {
					name: devices ? "Requests / hour" : "Monthly cost",
					exact: true,
				});
				await header.focus();
				await page.keyboard.press("Enter");
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				assert.ok(
					["ascending", "descending"].includes(
						(await header.locator("..").getAttribute("aria-sort")) ?? "",
					),
				);
				const query = demo.getByRole("textbox", {
					name: devices ? "Search devices" : "Search subscriptions",
				});
				await query.fill("no-such-resource");
				await demo.getByRole("button", { name: "Reset filters" }).waitFor();
				await demo.getByRole("button", { name: "Reset filters" }).click();
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				await demo.getByRole("button", { name: "Error", exact: true }).click();
				await demo.getByRole("alert").waitFor();
				await demo.getByRole("button", { name: "Try again", exact: true }).click();
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				await table.locator('input[type="checkbox"]').first().check();
				await demo.getByRole("button", { name: "Next page", exact: true }).click();
				await page.waitForFunction(
					() =>
						document.querySelector("[data-hero-scenario] table")?.getAttribute("aria-busy") !==
						"true",
				);
				assert.equal(await table.locator("tbody tr").count(), devices ? 4 : 2);
				await demo
					.getByRole("button", {
						name: devices ? "Resume selected" : "Prepare review",
						exact: true,
					})
					.click();
				await demo
					.getByText(devices ? "1 devices resumed" : "Review prepared for 1 subscriptions", {
						exact: true,
					})
					.waitFor();
				const bounds = await demo.boundingBox();
				assert.ok(bounds && bounds.width < width && bounds.width > (width === 390 ? 250 : 780));
			}
			cases.push(`${width}/${dark ? "dark" : "light"}`);
		}
	return {
		cases,
		skeletonCompositions: 3,
		richTables: 2,
		transitions: true,
		keyboardSort: true,
		reducedMotion: true,
	};
}

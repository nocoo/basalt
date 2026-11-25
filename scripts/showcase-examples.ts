import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

const ROUTES = [
	"/templates/agent-workspace",
	"/templates/ops-inbox",
	"/templates/workspace-settings",
	"/templates/executive-dashboard",
	"/templates/visitor-login",
	"/templates/document-page",
	"/templates/not-found",
	"/dashboard",
	"/banking",
	"/network",
	"/health",
	"/forms",
	"/tables",
	"/navigation",
	"/dialogs",
	"/palette",
	"/typeface",
	"/layout",
	"/animation",
	"/loading-states",
	"/404",
];

async function settle(page: Page) {
	await page.evaluate(async () => {
		await document.fonts.ready;
		await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
	});
}

async function assertNoDuplicateIds(page: Page, label: string) {
	const duplicates = await page.locator("[id]").evaluateAll((nodes) => {
		const ids = nodes.map((node) => node.id);
		return ids.filter((id, index) => ids.indexOf(id) !== index);
	});
	assert.deepEqual(duplicates, [], `${label}: duplicate IDs`);
}

async function assertPageWidth(page: Page, label: string) {
	const geometry = await page.evaluate(() => {
		const content = document.querySelector<HTMLElement>("[data-doc-scroll]");
		return {
			viewport: innerWidth,
			page: document.documentElement.scrollWidth,
			content: content ? { width: content.clientWidth, scroll: content.scrollWidth } : null,
		};
	});
	assert.ok(
		geometry.page <= geometry.viewport + 1,
		`${label}: page overflow ${JSON.stringify(geometry)}`,
	);
	if (geometry.content)
		assert.ok(
			geometry.content.scroll <= geometry.content.width + 1,
			`${label}: content overflow ${JSON.stringify(geometry)}`,
		);
}

async function assertKeyboardScroll(page: Page, region: Locator) {
	await region.scrollIntoViewIfNeeded();
	await region.focus();
	await region.evaluate((node) => {
		node.scrollLeft = 0;
	});
	await page.keyboard.press("ArrowRight");
	await page.waitForFunction(
		(node) => node !== null && node.scrollLeft > 0,
		await region.elementHandle(),
	);
	assert.equal(await region.evaluate((node) => document.activeElement === node), true);
}

async function assertNetwork(page: Page, baseUrl: string, width: number) {
	await page.goto(`${baseUrl}/network`);
	await page.locator("[data-doc-scroll] h1").waitFor();
	const check = async () => {
		for (const name of [
			"Stacked activity",
			"Stacked engagement",
			"User flow (Sankey)",
			"Capability radar",
		]) {
			const figure = page.getByRole("group", { name, exact: true });
			await figure.locator("svg.recharts-surface").waitFor();
			const box = await figure.locator("svg.recharts-surface").boundingBox();
			assert.ok(box && box.width > 100 && box.height > 100, `${name}: ${JSON.stringify(box)}`);
			const bad = await figure
				.locator("svg rect")
				.evaluateAll(
					(nodes) =>
						nodes.filter(
							(node) =>
								Number(node.getAttribute("height")) < 0 || Number(node.getAttribute("width")) < 0,
						).length,
				);
			assert.equal(bad, 0, `${name}: invalid SVG rectangles`);
		}
	};
	await settle(page);
	await check();
	if (width >= 768) {
		await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
		await settle(page);
		await check();
		await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
		await settle(page);
		await check();
	}
}

async function assertAnalytics(page: Page, route: string, width: number) {
	if (["/health", "/banking", "/network"].includes(route) && width === 390) {
		const cards = page.locator('[data-showcase-page] [data-slot="stat-card"]');
		const [first, second] = await Promise.all([
			cards.nth(0).boundingBox(),
			cards.nth(1).boundingBox(),
		]);
		assert.ok(
			first && second && Math.abs(first.y - second.y) < 1 && second.x > first.x,
			`${route}: metrics must share the first row`,
		);
	}
	if (route === "/health") {
		await page.getByText("Sample day", { exact: true }).waitFor();
		assert.equal(await page.getByRole("button", { name: "Previous day" }).count(), 0);
		assert.equal(await page.getByRole("list", { name: "Daily timeline" }).locator("li").count(), 5);
		await page.getByRole("group", { name: "Weekly steps", exact: true }).waitFor();
		assert.match(
			(await page
				.getByRole("button", { name: /^2026-12-31, Activities:/ })
				.getAttribute("aria-label")) ?? "",
			/: [1-9]/,
		);
		assert.equal(await page.getByRole("button", { name: "Generate insight" }).isDisabled(), true);
		assert.equal(
			await page.getByRole("list", { name: "Insight timeline" }).locator("li").count(),
			4,
		);
	}
	if (route === "/network") {
		assert.equal(
			await page.getByRole("list", { name: "Incident timeline" }).locator("li").count(),
			3,
		);
	}
}

async function assertForms(page: Page, baseUrl: string) {
	await page.goto(`${baseUrl}/forms`);
	const profile = page.getByRole("form", { name: "Profile Form", exact: true });
	await profile.waitFor();
	await profile.getByRole("button", { name: "Save profile" }).click();
	assert.equal(
		(await profile.locator(":invalid").count()) > 0,
		true,
		"empty form must use native validation",
	);
	assert.equal(await profile.getByRole("status").count(), 0);
	await profile.getByLabel("First name", { exact: true }).fill("Morgan");
	await profile.getByLabel("Last name", { exact: true }).fill("Chen");
	await profile.getByLabel("Email", { exact: true }).fill("morgan@example.com");
	await profile.getByRole("button", { name: "Save profile" }).focus();
	await page.keyboard.press("Enter");
	await profile.getByRole("status").filter({ hasText: "Saved locally." }).waitFor();
	await page.getByRole("button", { name: "View details" }).click();
	assert.ok((await page.locator("pre").textContent())?.includes('"firstName": "Morgan"'));
	await page.locator('input[type="file"]').setInputFiles({
		name: "report.pdf",
		mimeType: "application/pdf",
		buffer: Buffer.from("local demo"),
	});
	await page.getByText("report.pdf · 1 KB", { exact: true }).waitFor();
}

async function assertTablesLedger(page: Page, baseUrl: string) {
	await page.goto(`${baseUrl}/tables`);
	const ledger = page.locator('[data-table-showcase="ledger"]');
	const table = ledger.getByRole("table", { name: "Ledger", exact: true });
	await table.waitFor();
	const query = ledger.getByRole("textbox", { name: "Search invoices", exact: true });
	await query.fill("North");
	assert.ok((await table.locator("tbody").textContent())?.includes("Cedar Family Care North"));
	await query.fill("");
	await table.getByRole("button", { name: "Amount", exact: true }).focus();
	await page.keyboard.press("Enter");
	assert.ok((await table.locator("tbody tr").first().textContent())?.includes("Echo Systems"));
	await ledger.getByRole("button", { name: "Next page", exact: true }).click();
	assert.equal(await table.locator("tbody tr").count(), 2);
	await query.fill("Harbor");
	assert.equal(await table.locator("tbody tr").count(), 1);
	assert.equal(
		await ledger.getByRole("button", { name: "Previous page", exact: true }).isDisabled(),
		true,
	);
}

export async function assertExamplePages(page: Page, baseUrl: string) {
	const cases: string[] = [];
	await page.addInitScript(() => {
		localStorage.setItem("theme", sessionStorage.getItem("showcase-theme") ?? "light");
	});
	await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await setShowcaseTheme(page, false);
		await page.goto(`${baseUrl}/ui`);
		await page.locator('[data-status="index"]').waitFor();
		await settle(page);
		await assertPageWidth(page, `${width} library index`);
		cases.push(`${width}:library-index`);
		await page.goto(`${baseUrl}/ui/button/source`);
		await page.locator("[data-doc-scroll] pre code").waitFor();
		await settle(page);
		await assertPageWidth(page, `${width} component source`);
		cases.push(`${width}:component-source`);
		for (const route of ROUTES) {
			console.log(`Example smoke ${width} ${route}`);
			await page.goto(`${baseUrl}${route}`);
			if (route !== "/404") {
				await page.locator("[data-doc-scroll] h1").waitFor();
				const template = page.locator("[data-doc-scroll] [data-showcase-page]");
				assert.equal(await template.count(), 1, `${route}: shared page template`);
				assert.equal(await template.locator("main").count(), 0, `${route}: nested main`);
			} else {
				await page.locator("h1").waitFor();
			}
			await settle(page);
			await assertNoDuplicateIds(page, `${width} ${route}`);
			await assertPageWidth(page, `${width} ${route}`);
			await assertAnalytics(page, route, width);
			assert.ok((await page.locator("#root").textContent())?.trim(), `${route}: empty page`);
			cases.push(`${width}:${route}`);
		}
		await assertNetwork(page, baseUrl, width);
		await assertForms(page, baseUrl);
		await assertTablesLedger(page, baseUrl);
		cases.push(`${width}:light:network/forms/tables`);
		await setShowcaseTheme(page, true);
		await assertNetwork(page, baseUrl, width);
		await assertForms(page, baseUrl);
		await assertTablesLedger(page, baseUrl);
		cases.push(`${width}:dark:network/forms/tables`);
		await setShowcaseTheme(page, false);
	}
	for (const rootFont of [16, 32]) {
		await page.setViewportSize({ width: 320, height: 900 });
		await page.goto(`${baseUrl}/tables`);
		await page.addStyleTag({ content: `html { font-size: ${rootFont}px }` });
		const ledger = page.locator('[data-table-showcase="ledger"]');
		const region = ledger.locator('[tabindex="0"]').first();
		await region.waitFor();
		assert.ok(await region.evaluate((node) => node.scrollWidth > node.clientWidth));
		await assertKeyboardScroll(page, region);
		await assertPageWidth(page, `tables 320/${rootFont}`);
		cases.push(`tables:320/${rootFont}:keyboard-scroll`);
	}
	for (const width of [320, 390, 640]) {
		await page.setViewportSize({ width, height: 900 });
		for (const slug of [
			"page-header",
			"command-palette",
			"date-picker",
			"input",
			"textarea",
			"field",
		]) {
			await page.goto(`${baseUrl}/ui/${slug}`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, width === 390);
			await settle(page);
			await assertNoDuplicateIds(page, `${width}:ui/${slug}`);
			await assertPageWidth(page, `${width}:ui/${slug}`);
			const copy = await page.getByRole("button", { name: "Copy page", exact: true }).boundingBox();
			assert.ok(copy && copy.x >= 0 && copy.x + copy.width <= width, "copy page action is visible");
			if (slug === "date-picker") {
				const apiTable = page.getByRole("region", {
					name: "DatePicker API scrolling table",
					exact: true,
				});
				// The wide API table must scroll by keyboard whenever it overflows its column.
				if (await apiTable.evaluate((node) => node.scrollWidth > node.clientWidth))
					await assertKeyboardScroll(page, apiTable);
				else assert.ok(width >= 640, `API table must stay scrollable at ${width}px`);
				const codes = page.getByRole("region", { name: "Code", exact: true });
				let scrollable: Locator | undefined;
				for (const code of await codes.all())
					if (await code.evaluate((node) => node.scrollWidth > node.clientWidth)) {
						scrollable = code;
						break;
					}
				assert.ok(scrollable, "a long code sample must have local overflow");
				await assertKeyboardScroll(page, scrollable);
			}
			if (slug === "input") {
				const input = page.getByRole("textbox", { name: "Email", exact: true }).nth(1);
				const id = await input.getAttribute("id");
				await page.locator(`label[for="${id}"]`).click();
				assert.equal(await input.evaluate((node) => node === document.activeElement), true);
			}
			cases.push(`${width}:ui/${slug}`);
		}
	}
	return cases;
}

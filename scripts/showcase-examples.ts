import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

const ROUTES = [
	"/",
	"/accounts",
	"/portfolio",
	"/progress-tracking",
	"/flow-comparison",
	"/components",
	"/forms",
	"/navigation",
	"/interactive",
	"/data",
	"/layout",
	"/dialogs",
	"/chat",
	"/settings",
	"/palette",
	"/interactions",
	"/health",
	"/wearable",
	"/banking",
	"/network",
	"/login",
	"/static-page",
	"/loading",
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
	await profile.getByRole("checkbox", { name: "Simulate a failed submission" }).check();
	await profile.getByRole("button", { name: "Save profile" }).focus();
	await page.keyboard.press("Enter");
	await profile.getByRole("alert").waitFor();
	assert.equal(await profile.getByLabel("First name", { exact: true }).inputValue(), "Morgan");
	await profile.getByRole("button", { name: "Retry", exact: true }).click();
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

async function assertSettings(page: Page, baseUrl: string) {
	await page.goto(`${baseUrl}/settings`);
	const profile = page.getByRole("form", { name: "Profile Information", exact: true });
	await profile.waitFor();
	await profile.getByLabel("First name", { exact: true }).fill("Morgan");
	await profile.getByRole("button", { name: "Cancel", exact: true }).click();
	assert.equal(await profile.getByLabel("First name", { exact: true }).inputValue(), "Alex");
	await profile.getByLabel("First name", { exact: true }).fill("Morgan");
	await profile.getByRole("checkbox", { name: "Simulate a failed submission" }).check();
	await profile.getByRole("button", { name: "Save changes", exact: true }).click();
	await profile.getByRole("alert").waitFor();
	await profile.getByRole("button", { name: "Retry", exact: true }).click();
	await profile.getByText("Morgan Johnson", { exact: true }).waitFor();
	await page.getByRole("button", { name: "Appearance", exact: true }).click();
	await page.getByRole("radio", { name: "Dark", exact: true }).focus();
	await page.keyboard.press("Space");
	assert.equal(
		await page.locator("html").evaluate((node) => node.classList.contains("dark")),
		true,
	);
	await page.getByRole("radio", { name: "Dark", exact: true }).focus();
	await page.keyboard.press("ArrowLeft");
	assert.equal(await page.getByRole("radio", { name: "Light", exact: true }).isChecked(), true);
	assert.equal(
		await page.locator("html").evaluate((node) => node.classList.contains("dark")),
		false,
	);
	await page.getByRole("button", { name: "Security", exact: true }).click();
	await page.getByRole("button", { name: "Revoke iPhone 15 — Safari", exact: true }).click();
	assert.equal(await page.getByText("iPhone 15 — Safari", { exact: true }).count(), 0);
	assert.equal(await page.getByText(/^MacBook Pro — Chrome\s*Current$/).count(), 1);
}

async function assertData(page: Page, baseUrl: string) {
	await page.goto(`${baseUrl}/data`);
	const table = page.getByRole("table", { name: "Data Table", exact: true });
	await table.waitFor();
	const query = page.getByRole("textbox", { name: "Search", exact: true });
	await query.fill("no-invoice");
	await page.getByRole("button", { name: "Reset filters", exact: true }).click();
	await page.getByRole("combobox", { name: "Filter", exact: true }).selectOption("Paid");
	assert.equal(await table.locator("tbody tr").count(), 2);
	assert.ok((await table.locator("tbody").textContent())?.includes("Nova Labs"));
	await table.getByRole("button", { name: "Amount", exact: true }).focus();
	await page.keyboard.press("Enter");
	assert.ok((await table.locator("tbody tr").first().textContent())?.includes("Atlas Works"));
	await page.getByRole("combobox", { name: "Filter", exact: true }).selectOption("all");
	await page.getByRole("button", { name: "Next page", exact: true }).click();
	assert.equal(await table.locator("tbody tr").count(), 2);
	await query.fill("Violet");
	assert.equal(await table.locator("tbody tr").count(), 1);
	assert.equal(
		await page.getByRole("button", { name: "Previous page", exact: true }).isDisabled(),
		true,
	);
}

async function assertChat(page: Page, baseUrl: string, mobile: boolean) {
	await page.goto(`${baseUrl}/chat`);
	const push = page.locator('[data-chat-demo="push"]');
	await push.getByRole("textbox", { name: "Message", exact: true }).waitFor();
	const input = push.getByRole("textbox", { name: "Message", exact: true });
	const box = await input.boundingBox();
	assert.ok(box && box.width > 180, "mobile composer must stay usable");
	await input.fill("Explain the last seven days");
	await page.keyboard.press("Enter");
	await push.getByRole("log").getByText("Explain the last seven days", { exact: true }).waitFor();
	await push.getByRole("button", { name: "Stop generating", exact: true }).click();
	await push.getByRole("status").filter({ hasText: "Reply stopped." }).waitFor();
	await push.getByRole("button", { name: "Retry", exact: true }).click();
	await push.getByRole("status").filter({ hasText: "Reply complete." }).waitFor();
	await push.getByRole("checkbox", { name: "Simulate a failed reply" }).check();
	await input.fill("A failed reply keeps my question");
	await page.keyboard.press("Enter");
	await push.getByRole("alert").waitFor();
	await push.getByRole("button", { name: "Retry", exact: true }).click();
	await push.getByRole("status").filter({ hasText: "Reply complete." }).waitFor();
	assert.equal(
		await push.getByText("A failed reply keeps my question", { exact: true }).count(),
		1,
	);
	const inbox = page.locator('[data-chat-demo="inbox"]');
	const quality = inbox.getByRole("button", { name: /Quality/ });
	await quality.click();
	await inbox.getByRole("textbox", { name: "Message", exact: true }).fill("Quality session");
	await page.keyboard.press("Enter");
	await inbox.getByRole("log").getByText("Quality session", { exact: true }).waitFor();
	if (mobile) {
		await inbox.getByRole("button", { name: "Back to inbox", exact: true }).click();
		assert.equal(await quality.evaluate((node) => node === document.activeElement), true);
		assert.equal(
			await inbox.getByRole("textbox").count(),
			0,
			"hidden detail leaves the accessibility tree",
		);
	}
	await inbox.getByRole("button", { name: /Analytics/ }).click();
	assert.equal(
		await inbox.getByRole("log").getByText("Quality session", { exact: true }).count(),
		0,
	);
	await inbox.getByRole("button", { name: "Clear conversation", exact: true }).click();
	await inbox.getByRole("log").getByText("Start a new conversation.", { exact: true }).waitFor();
}

/** All example routes smoke-test real output; key workflows also run with keyboard and reduced motion. */
export async function assertExamplePages(page: Page, baseUrl: string) {
	const cases: string[] = [];
	await page.addInitScript(() => {
		localStorage.setItem("language", "en");
		localStorage.setItem("theme", sessionStorage.getItem("showcase-theme") ?? "light");
	});
	await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await setShowcaseTheme(page, false);
		for (const route of ROUTES) {
			console.log(`Example smoke ${width} ${route}`);
			await page.goto(`${baseUrl}${route}`);
			if (!["/login", "/loading", "/static-page", "/404"].includes(route))
				await page.locator("[data-doc-scroll] h1").waitFor();
			else if (route === "/login") await page.getByRole("button", { name: /Google/ }).waitFor();
			else if (route === "/loading") await page.getByRole("status").waitFor();
			else await page.locator("h1").waitFor();
			await settle(page);
			await assertNoDuplicateIds(page, `${width} ${route}`);
			await assertPageWidth(page, `${width} ${route}`);
			assert.ok((await page.locator("#root").textContent())?.trim(), `${route}: empty page`);
			cases.push(`${width}:${route}`);
		}
		await assertNetwork(page, baseUrl, width);
		await assertForms(page, baseUrl);
		await assertSettings(page, baseUrl);
		await assertData(page, baseUrl);
		await assertChat(page, baseUrl, width < 768);
		cases.push(`${width}:light:network/forms/settings/data/chat`);
		await setShowcaseTheme(page, true);
		await assertNetwork(page, baseUrl, width);
		await assertForms(page, baseUrl);
		await assertSettings(page, baseUrl);
		await assertData(page, baseUrl);
		await assertChat(page, baseUrl, width < 768);
		cases.push(`${width}:dark:network/forms/settings/data/chat`);
		await setShowcaseTheme(page, false);
	}
	for (const width of [320, 390, 640]) {
		await page.setViewportSize({ width, height: 900 });
		for (const slug of [
			"page-header",
			"command-palette",
			"date-picker",
			"input",
			"input-area",
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
				await assertKeyboardScroll(
					page,
					page.getByRole("region", { name: "DatePicker API scrolling table", exact: true }),
				);
				const codes = page.getByRole("region", { name: "Code example", exact: true });
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
	for (const language of ["en", "zh"]) {
		await page.goto(`${baseUrl}/interactive`);
		await page.evaluate((language) => localStorage.setItem("language", language), language);
		// A language control is the real application adapter; reload has an English test default.
		if (language === "zh") await page.getByText("中文", { exact: true }).click();
		await page
			.getByRole("heading", {
				name: language === "zh" ? "交互式组件" : "Interactive components",
				exact: true,
			})
			.waitFor();
		await page
			.getByText(language === "zh" ? "有新版本可用" : "New update available", { exact: true })
			.first()
			.waitFor();
		await page.locator("[data-doc-scroll] h1").waitFor();
		assert.equal(
			/pages\.interactive\.alert\w+/.test(await page.locator("body").innerText()),
			false,
		);
		cases.push(`interactive:${language}`);
	}
	return cases;
}

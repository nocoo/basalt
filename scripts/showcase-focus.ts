import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatComposer } from "../packages/basalt/src/components/chat-composer";
import { InputGroup } from "../packages/basalt/src/components/input-group";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertFocusPaint(
	target: Locator,
	rootSize: number,
	inset: boolean,
	activate = true,
) {
	if (activate) {
		await target.scrollIntoViewIfNeeded();
		const page = target.page();
		const tab = page.context().browser()?.browserType().name() === "webkit" ? "Alt+Tab" : "Tab";
		await page.keyboard.press(tab);
		await target.focus();
	}
	const paint = await target.evaluate((node) => {
		const frame = node.parentElement?.classList.contains("basalt-focus-frame")
			? node.parentElement
			: null;
		const style = getComputedStyle(frame ?? node, frame ? "::after" : null);
		const box = node.getBoundingClientRect();
		const width = Number.parseFloat(style.outlineWidth);
		const offset = Number.parseFloat(style.outlineOffset);
		const outside = Math.max(0, width + offset);
		const probe = document.createElement("span");
		probe.style.color = `hsl(${style.getPropertyValue("--basalt-ring")})`;
		node.parentElement?.append(probe);
		const themeColor = getComputedStyle(probe).color;
		probe.remove();
		const clipped: string[] = [];
		for (let parent = node.parentElement; parent; parent = parent.parentElement) {
			const parentStyle = getComputedStyle(parent);
			const edge = parent.getBoundingClientRect();
			if (
				/(auto|scroll|hidden|clip)/.test(parentStyle.overflowX) &&
				(box.left - outside < edge.left - 1 || box.right + outside > edge.right + 1)
			)
				clipped.push(`${parent.tagName}/${parent.getAttribute("data-slot")}:x`);
			if (
				/(auto|scroll|hidden|clip)/.test(parentStyle.overflowY) &&
				(box.top - outside < edge.top - 1 || box.bottom + outside > edge.bottom + 1)
			)
				clipped.push(`${parent.tagName}/${parent.getAttribute("data-slot")}:y`);
		}
		return {
			visible: node === document.activeElement && node.matches(":focus-visible"),
			width,
			offset,
			color: style.outlineColor,
			themeColor,
			style: style.outlineStyle,
			clipped,
		};
	});
	assert.equal(paint.visible, true, JSON.stringify(paint));
	assert.equal(paint.width, rootSize / 16, JSON.stringify(paint));
	assert.equal(paint.offset, (inset ? -1 : 1) * (rootSize / 8), JSON.stringify(paint));
	assert.equal(paint.style, "solid", JSON.stringify(paint));
	assert.equal(paint.color, paint.themeColor, JSON.stringify(paint));
	assert.deepEqual(paint.clipped, [], JSON.stringify(paint));
}

const CASES = [
	["ui/button", "[data-hero-scenario] button:not([disabled])", false],
	["ui/input", "[data-hero-scenario] input:not([disabled])", false],
	["ui/checkbox", "[data-hero-scenario] [role=checkbox]", false],
	["ui/scroll-area", "[data-hero-scenario] [data-slot=scroll-area-viewport]", true],
	["ui/data-table", "[data-hero-scenario] [role=region]", true],
	["ui/segment-control", "[data-hero-scenario] [data-slot=segment-control-viewport] button", false],
	["ui/sidebar", "[data-hero-scenario] [data-sidebar-row]", true],
	["ui/editable-nav-item", "[data-hero-scenario] button[aria-label='Care library']", true],
	["interactions", "[data-interaction-card] > button", true],
] as const;

async function assertNestedFocus(page: Page) {
	const markup = renderToStaticMarkup(
		createElement(ChatComposer, {
			defaultValue: "Ready to send",
			onSend: () => undefined,
			toolbar: createElement(
				InputGroup,
				null,
				createElement(InputGroup.Input, { "aria-label": "Nested model", "aria-invalid": true }),
				createElement(InputGroup.Button, { variant: "default" }, "Apply model"),
			),
		}),
	);
	await page.evaluate((html) => {
		const fixture = document.createElement("div");
		fixture.dataset.focusNested = "";
		fixture.className = "basalt-ui p-basalt-card";
		fixture.innerHTML = html;
		(document.querySelector("[data-doc-scroll]") ?? document.body).append(fixture);
	}, markup);
	const fixture = page.locator("[data-focus-nested]");
	try {
		const field = fixture.getByRole("textbox", { name: "Nested model" });
		await field.scrollIntoViewIfNeeded();
		const tab = page.context().browser()?.browserType().name() === "webkit" ? "Alt+Tab" : "Tab";
		await page.keyboard.press(tab);
		await field.focus();
		const groups = await fixture.locator(".basalt-focus-group").evaluateAll((nodes) =>
			nodes.map((node) => ({
				style: getComputedStyle(node).outlineStyle,
				width: getComputedStyle(node).outlineWidth,
				offset: getComputedStyle(node).outlineOffset,
				border: getComputedStyle(node).borderColor,
				color: getComputedStyle(node).outlineColor,
			})),
		);
		assert.equal(groups.length, 2);
		assert.equal(groups[0].style, "none", JSON.stringify(groups));
		assert.equal(groups[1].style, "solid", JSON.stringify(groups));
		assert.equal(groups[1].width, "1px", JSON.stringify(groups));
		assert.equal(groups[1].offset, "2px", JSON.stringify(groups));
		assert.notEqual(groups[1].border, groups[1].color, "Invalid border remains independent");
		assert.equal(await field.evaluate((node) => getComputedStyle(node).outlineStyle), "none");
		for (const name of ["Apply model", "Send message"]) {
			await assertFocusPaint(fixture.getByRole("button", { name, exact: true }), 16, false);
			assert.deepEqual(
				await fixture
					.locator(".basalt-focus-group")
					.evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).outlineStyle)),
				["none", "none"],
			);
		}
	} finally {
		await fixture.evaluate((node) => node.remove());
	}
}

async function assertTableFocusPixels(region: Locator) {
	const color = await region.evaluate(
		(node) => getComputedStyle(node.parentElement as Element, "::after").outlineColor,
	);
	const image = (await region.screenshot()).toString("base64");
	const edges = await region.page().evaluate(
		async ({ image, color }) => {
			const bitmap = await createImageBitmap(
				await (await fetch(`data:image/png;base64,${image}`)).blob(),
			);
			const canvas = document.createElement("canvas");
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const context = canvas.getContext("2d", { willReadFrequently: true });
			if (!context) throw new Error("Canvas is required for focus paint evidence");
			context.fillStyle = color;
			context.fillRect(0, 0, 1, 1);
			const expected = [...context.getImageData(0, 0, 1, 1).data];
			context.drawImage(bitmap, 0, 0);
			bitmap.close();
			const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
			const matches = (x: number, y: number) =>
				expected
					.slice(0, 3)
					.every(
						(channel, index) =>
							Math.abs(channel - pixels[(y * canvas.width + x) * 4 + index]) <= 12,
					);
			const counts = { top: 0, right: 0, bottom: 0, left: 0 };
			for (let x = 20; x < canvas.width - 20; x += 1) {
				if ([0, 1, 2, 3].some((y) => matches(x, y))) counts.top += 1;
				if ([1, 2, 3, 4].some((y) => matches(x, canvas.height - y))) counts.bottom += 1;
			}
			for (let y = 20; y < canvas.height - 20; y += 1) {
				if ([0, 1, 2, 3].some((x) => matches(x, y))) counts.left += 1;
				if ([1, 2, 3, 4].some((x) => matches(canvas.width - x, y))) counts.right += 1;
			}
			return { ...counts, width: canvas.width, height: canvas.height };
		},
		{ image, color },
	);
	assert.ok(edges.top > (edges.width - 40) / 2, JSON.stringify(edges));
	assert.ok(edges.bottom > (edges.width - 40) / 2, JSON.stringify(edges));
	assert.ok(edges.left > (edges.height - 40) / 2, JSON.stringify(edges));
	assert.ok(edges.right > (edges.height - 40) / 2, JSON.stringify(edges));
}

export async function assertFocusBoundaries(page: Page, baseUrl: string) {
	const standaloneCss = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	const standalone = await page.context().newPage();
	const cases: string[] = [];
	try {
		for (const width of [390, 1440]) {
			await page.setViewportSize({ width, height: 1000 });
			await standalone.setViewportSize({ width, height: 1000 });
			for (const dark of [false, true]) {
				for (const [route, selector, inset] of CASES) {
					await page.goto(`${baseUrl}/${route}`);
					const target = page.locator(selector).first();
					await target.waitFor();
					if (route === "ui/data-table") {
						await target.getByText("Atlas gateway", { exact: true }).waitFor();
					}
					await setShowcaseTheme(page, dark);
					await page.evaluate(() => document.fonts.ready);
					for (const rootSize of [16, 32]) {
						await page.evaluate((size) => {
							document.documentElement.style.fontSize = `${size}px`;
						}, rootSize);
						await assertFocusPaint(target, rootSize, inset);
					}
					await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
					await target.evaluate((node) => node.setAttribute("data-focus-sample", ""));
					const fixture = await target.evaluate((node) => ({
						markup: node.closest("[data-hero-scenario], [data-interaction-card]")?.outerHTML,
						style: document.documentElement.getAttribute("style") ?? "",
					}));
					assert.ok(fixture.markup);
					await standalone.setContent(
						`<style>${standaloneCss}</style><main class="basalt-ui p-basalt-card" data-basalt-surface-root>${fixture.markup}</main>`,
					);
					await standalone.evaluate(
						({ dark, style }) => {
							document.documentElement.className = dark ? "dark" : "light";
							document.documentElement.dataset.mode = dark ? "dark" : "light";
							document.documentElement.setAttribute("style", style);
						},
						{ dark, style: fixture.style },
					);
					await assertFocusPaint(standalone.locator("[data-focus-sample]"), 16, inset);
					cases.push(`${route}/${width}/${dark ? "dark" : "light"}`);
				}
				await assertNestedFocus(page);
				await assertNestedFocus(standalone);
			}
		}
	} finally {
		await standalone.close();
	}

	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(`${baseUrl}/dashboard`);
	await page.locator("[data-showcase-page]").waitFor();
	const shell = await page.evaluate(() => {
		const actions = document.querySelector("[data-basalt-header-actions]") as HTMLElement;
		const island = document.querySelector("[data-doc-scroll]") as HTMLElement;
		const footer = document.querySelector("[data-slot=sidebar-footer]") as HTMLElement;
		const nav = document.querySelector("[data-slot=sidebar-nav]") as HTMLElement;
		return {
			right: [actions.getBoundingClientRect().right, island.getBoundingClientRect().right],
			footer: getComputedStyle(footer).padding,
			gap: getComputedStyle(nav).rowGap,
		};
	});
	assert.equal(shell.right[0], shell.right[1], JSON.stringify(shell));
	assert.equal(shell.footer, "8px 16px 16px", JSON.stringify(shell));
	assert.equal(shell.gap, "4px", JSON.stringify(shell));
	await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
	await page.waitForFunction(
		() => document.querySelector("aside")?.getBoundingClientRect().width === 68,
	);
	const collapsed = await page.locator("[data-slot=sidebar-footer]").evaluate((node) => {
		const avatar = node.firstElementChild as HTMLElement;
		const box = node.getBoundingClientRect();
		const child = avatar.getBoundingClientRect();
		return { center: child.left + child.width / 2 - box.left, bottom: box.bottom - child.bottom };
	});
	assert.equal(collapsed.center, 34, JSON.stringify(collapsed));
	assert.equal(collapsed.bottom, 16, JSON.stringify(collapsed));

	for (const dark of [false, true]) {
		await page.goto(`${baseUrl}/ui/data-table`);
		const region = page.locator("[data-hero-scenario] [role=region]").first();
		await region.waitFor();
		await region.getByText("Atlas gateway", { exact: true }).waitFor();
		await setShowcaseTheme(page, dark);
		await region.evaluate((node) => {
			(node as HTMLElement).style.maxHeight = "160px";
			const table = node.querySelector("table") as HTMLElement;
			table.style.minWidth = "1400px";
		});
		await assertFocusPaint(region, 16, true);
		await assertTableFocusPixels(region);
		await region.evaluate((node) => node.scrollTo(node.scrollWidth, node.scrollHeight));
		await region.evaluate(async (node) => {
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			if (node.scrollTop === 0 || node.scrollLeft === 0)
				throw new Error("Both table axes must scroll");
		});
		await assertTableFocusPixels(region);
		await region.getByRole("button").first().focus();
		assert.equal(
			await region.evaluate(
				(node) => getComputedStyle(node.parentElement as Element, "::after").content,
			),
			"none",
		);
	}

	await page.goto(`${baseUrl}/ui/segment-control`);
	const segments = page.locator("[data-scenario='segment-control-overflow-disabled']");
	await segments.waitFor();
	const first = segments.getByRole("radio", { name: "Today", exact: true });
	await assertFocusPaint(first, 16, false);
	for (const name of ["7 days", "30 days", "12 months"]) {
		await page.keyboard.press("ArrowRight");
		await page.waitForFunction((label) => document.activeElement?.textContent === label, name);
	}
	const last = segments.getByRole("radio", { name: "12 months", exact: true });
	assert.equal(await last.evaluate((node) => node === document.activeElement), true);
	await assertFocusPaint(last, 16, false, false);
	const viewport = segments.locator("[data-slot=segment-control-viewport]");
	assert.equal(await viewport.evaluate((node) => getComputedStyle(node).padding), "4px");
	assert.ok(await viewport.evaluate((node) => node.scrollLeft > 0));

	if (page.context().browser()?.browserType().name() === "chromium") {
		await page.emulateMedia({ forcedColors: "active" });
		try {
			await first.focus();
			const forced = await first.evaluate((node) => ({
				width: getComputedStyle(node).outlineWidth,
				style: getComputedStyle(node).outlineStyle,
			}));
			assert.deepEqual(forced, { width: "2px", style: "solid" });
		} finally {
			await page.emulateMedia({ forcedColors: "none" });
		}
	}
	return { cases, cssEntrypoints: 2, rootSizes: [16, 32], shell, collapsed };
}

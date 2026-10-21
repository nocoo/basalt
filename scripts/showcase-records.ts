import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

async function remPx(page: Page, rem: number) {
	return page.evaluate(
		(units) => units * Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
		rem,
	);
}

async function inlinePad(locator: Locator) {
	return locator.evaluate((node) => {
		const style = getComputedStyle(node);
		return {
			start: Number.parseFloat(style.paddingInlineStart),
			end: Number.parseFloat(style.paddingInlineEnd),
		};
	});
}

async function boxPad(locator: Locator) {
	return locator.evaluate((node) => {
		const style = getComputedStyle(node);
		return {
			start: Number.parseFloat(style.paddingInlineStart),
			end: Number.parseFloat(style.paddingInlineEnd),
			blockStart: Number.parseFloat(style.paddingBlockStart),
			blockEnd: Number.parseFloat(style.paddingBlockEnd),
			marginBlockStart: Number.parseFloat(style.marginBlockStart),
			marginBlockEnd: Number.parseFloat(style.marginBlockEnd),
			textAlign: style.textAlign,
			fontSize: style.fontSize,
			width: node.getBoundingClientRect().width,
		};
	});
}

type TextRail = { start: number; end: number };

function assertStandaloneTableCss(css: string) {
	for (const token of [
		".ps-basalt-table-edge",
		".pe-basalt-table-edge",
		".text-start",
		".text-end",
	]) {
		assert.ok(css.includes(token), `standalone.css missing ${token}`);
	}
}

async function textRail(root: Locator): Promise<TextRail> {
	return root.evaluate((node) => {
		const rtl = node.closest("[dir='rtl']") != null || getComputedStyle(node).direction === "rtl";
		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		while (walker.nextNode()) {
			const text = walker.currentNode;
			if (!text.textContent?.trim()) continue;
			const parent = text.parentElement;
			if (!parent || parent.closest("svg, .sr-only, [aria-hidden='true']")) continue;
			const range = document.createRange();
			range.selectNodeContents(text);
			const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
			if (rects.length === 0) continue;
			const first = rects[0];
			const last = rects[rects.length - 1];
			if (!first || !last) continue;
			return {
				start: rtl ? first.right : first.left,
				end: rtl ? last.left : last.right,
			};
		}
		throw new Error("No visible text rail");
	});
}

async function headerCellPair(table: Locator, headerName: string) {
	const header = table.getByRole("columnheader", { name: headerName, exact: true });
	const index = await header.evaluate((node) => {
		const row = node.parentElement;
		if (!row) throw new Error("Missing header row");
		return [...row.children].indexOf(node);
	});
	const cell = table.locator("tbody tr").first().locator("td").nth(index);
	return { header, cell };
}

async function assertHeaderValueRail(
	table: Locator,
	headerName: string,
	align: "start" | "end",
	label: string,
) {
	const { header, cell } = await headerCellPair(table, headerName);
	const button = header.getByRole("button", { name: headerName, exact: true });
	const headerRail = await textRail(button);
	const cellRail = await textRail(cell);
	assert.ok(
		Math.abs(headerRail[align] - cellRail[align]) < 1,
		`${label}: ${JSON.stringify({ headerRail, cellRail, align })}`,
	);
}

async function assertRailsAcrossSorts(
	table: Locator,
	headerName: string,
	otherHeader: string,
	align: "start" | "end",
) {
	const button = table.getByRole("button", { name: headerName, exact: true });
	const other = table.getByRole("button", { name: otherHeader, exact: true });
	const th = button.locator("xpath=ancestor::th");
	for (const dir of ["ltr", "rtl"] as const) {
		await table.evaluate((node, value) => {
			if (value === "ltr") node.removeAttribute("dir");
			else node.setAttribute("dir", value);
		}, dir);
		await other.click();
		assert.equal(await th.getAttribute("aria-sort"), "none", `${headerName} ${dir} unsorted`);
		await assertHeaderValueRail(table, headerName, align, `${headerName} ${dir} none`);
		await button.click();
		assert.equal(await th.getAttribute("aria-sort"), "ascending", `${headerName} ${dir} asc`);
		await assertHeaderValueRail(table, headerName, align, `${headerName} ${dir} asc`);
		await button.click();
		assert.equal(await th.getAttribute("aria-sort"), "descending", `${headerName} ${dir} desc`);
		await assertHeaderValueRail(table, headerName, align, `${headerName} ${dir} desc`);
	}
	await table.evaluate((node) => node.removeAttribute("dir"));
}

async function assertLedgerPanelInsets(page: Page, table: Locator) {
	const caption = table.locator("caption");
	const selectHead = table.getByRole("columnheader", { name: "Select", exact: true });
	const actionsHead = table.getByRole("columnheader", { name: "Actions", exact: true });
	const firstCell = table.locator("tbody tr").first().locator("td").first();
	const lastCell = table.locator("tbody tr").first().locator("td").last();
	const measure = async (dir: "ltr" | "rtl") => {
		await table.evaluate((node, value) => {
			if (value === "ltr") node.removeAttribute("dir");
			else node.setAttribute("dir", value);
		}, dir);
		const edge = await remPx(page, 1);
		const panelY = await remPx(page, 0.75);
		const slot = await remPx(page, 2.75);
		const cap = await boxPad(caption);
		const select = await boxPad(selectHead);
		assert.equal(cap.start, edge, `${dir} caption start ${JSON.stringify(cap)}`);
		assert.equal(cap.end, edge, `${dir} caption end`);
		assert.equal(cap.blockStart, panelY, `${dir} caption block start`);
		assert.equal(cap.blockEnd, panelY, `${dir} caption block end`);
		assert.equal(cap.marginBlockStart, 0, `${dir} caption margin start`);
		assert.equal(cap.marginBlockEnd, 0, `${dir} caption margin end`);
		assert.ok(
			cap.textAlign === "-webkit-center" || cap.textAlign === "center",
			`${dir} caption align ${cap.textAlign}`,
		);
		assert.equal(cap.fontSize, `${await remPx(page, 0.875)}px`, `${dir} caption font`);
		assert.equal((await inlinePad(selectHead)).start, edge, `${dir} select head`);
		assert.equal((await inlinePad(actionsHead)).end, edge, `${dir} actions head`);
		assert.equal((await inlinePad(firstCell)).start, edge, `${dir} first cell`);
		assert.equal((await inlinePad(lastCell)).end, edge, `${dir} last cell`);
		assert.ok(Math.abs(select.width - slot) < 1, `${dir} select slot ${select.width} vs ${slot}`);
	};
	await measure("ltr");
	await measure("rtl");
	await table.evaluate((node) => node.removeAttribute("dir"));
	try {
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "32px";
		});
		await measure("ltr");
	} finally {
		await page.evaluate(() => {
			document.documentElement.style.removeProperty("font-size");
		});
	}
}

async function assertStandaloneMarkupParity(
	page: Page,
	table: Locator,
	headerName: string,
	align: "start" | "end",
) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	assertStandaloneTableCss(css);
	const html = await table.evaluate((node) => node.outerHTML);
	const isolated = await page.context().newPage();
	try {
		await isolated.setContent(
			`<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`,
		);
		const clone = isolated.locator("table").first();
		await assertHeaderValueRail(clone, headerName, align, `${headerName} standalone`);
	} finally {
		await isolated.close();
	}
}

export async function assertRecordGeometry(page: Page, baseUrl: string) {
	for (const width of [390, 1280])
		for (const dark of [false, true]) {
			await page.setViewportSize({ width, height: 1000 });
			await page.goto(`${baseUrl}/ui/data-table`);
			await page.locator('[data-status="ready"]').waitFor();
			await setShowcaseTheme(page, dark);
			const demo = page.locator('[data-scenario="data-table-records"]');
			await demo.scrollIntoViewIfNeeded();
			const table = demo.getByRole("table");
			assert.deepEqual(await demo.locator("[data-row-number]").allTextContents(), [
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
			]);
			assert.equal(
				await demo.getByRole("img", { name: "Alpine Clinic — Zurich" }).innerText(),
				"AC",
			);

			const region = demo.getByRole("region", { name: "Medical provider records scroll area" });
			const geometry = await table.evaluate((node) => ({
				rows: Array.from(node.querySelectorAll("tbody tr")).map(
					(row) => row.getBoundingClientRect().height,
				),
				heads: Array.from(node.querySelectorAll("th")).map((head) => ({
					width: head.getBoundingClientRect().width,
					whiteSpace: getComputedStyle(head).whiteSpace,
				})),
				scroll: node.parentElement?.scrollWidth ?? 0,
				client: node.parentElement?.clientWidth ?? 0,
			}));
			await page.evaluate(() => document.documentElement.style.setProperty("--spacing", "9px"));
			const foreignRows = await table
				.locator("tbody tr")
				.evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
			assert.deepEqual(foreignRows, [41, 41, 41, 41, 41, 40]);
			await page.evaluate(() => document.documentElement.style.removeProperty("--spacing"));
			assert.deepEqual(geometry.rows, foreignRows);
			assert.ok(geometry.heads.every((head) => head.whiteSpace === "nowrap"));
			assert.ok(geometry.heads[2].width >= 240 && geometry.heads[3].width >= 240);
			assert.ok(geometry.scroll > geometry.client);
			await region.evaluate((node) => {
				node.style.maxHeight = "140px";
				node.scrollTop = node.scrollHeight;
			});
			const sticky = await region.evaluate((node) => ({
				top: node.getBoundingClientRect().top,
				head: node.querySelector("th")?.getBoundingClientRect().top,
				last: node.querySelector("tbody tr:last-child")?.getBoundingClientRect().bottom,
				bottom: node.getBoundingClientRect().bottom,
			}));
			assert.ok(Math.abs((sticky.head ?? 0) - sticky.top) < 1, JSON.stringify(sticky));
			assert.ok((sticky.last ?? Infinity) <= sticky.bottom + 1);
			await region.evaluate((node) => {
				node.scrollTop = 0;
			});
			await table.getByRole("checkbox").first().check();
			assert.equal(await table.locator('tbody tr[aria-selected="true"]').count(), 1);
			const heading = table.getByRole("button", { name: "Care provider", exact: true });
			await heading.click();
			assert.equal(
				await heading.locator("xpath=ancestor::th").getAttribute("aria-sort"),
				"descending",
			);
			assert.equal(await heading.locator("svg").count(), 1);
			await region.focus();
			assert.equal(
				await region.evaluate((node) => document.activeElement === node),
				true,
				"named region must take focus before keyboard return",
			);
			await page.keyboard.press("Tab");
			assert.equal(
				await region.evaluate((node) => document.activeElement === node),
				false,
				"Tab must leave the named region",
			);
			await page.keyboard.press("Shift+Tab");
			const focusState = await region.evaluate((node) => ({
				active: document.activeElement === node,
				focusVisible: node.matches(":focus-visible"),
			}));
			assert.equal(focusState.active, true, JSON.stringify(focusState));
			assert.equal(focusState.focusVisible, true, JSON.stringify(focusState));
			const focusPaint = await region.evaluate((node) => {
				const frame = node.parentElement?.classList.contains("basalt-focus-frame")
					? node.parentElement
					: null;
				const style = getComputedStyle(frame ?? node, frame ? "::after" : null);
				const box = node.getBoundingClientRect();
				const tableBox = node.querySelector("table")?.getBoundingClientRect();
				const offset = Number.parseFloat(style.outlineOffset);
				const width = Number.parseFloat(style.outlineWidth);
				return {
					offset: style.outlineOffset,
					width: style.outlineWidth,
					style: style.outlineStyle,
					overContent: offset < 0 && width > 0 && (tableBox?.top ?? 0) >= box.top,
					inside: offset + width <= 0,
				};
			});
			assert.equal(focusPaint.offset, "-2px", JSON.stringify(focusPaint));
			assert.equal(focusPaint.width, "1px", JSON.stringify(focusPaint));
			assert.notEqual(focusPaint.style, "none", JSON.stringify(focusPaint));
			assert.equal(focusPaint.overContent, true, JSON.stringify(focusPaint));
			assert.equal(focusPaint.inside, true, JSON.stringify(focusPaint));
			assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
		}

	await page.setViewportSize({ width: 1280, height: 1000 });
	await page.goto(`${baseUrl}/data`);
	const invoices = page.getByRole("table", { name: "Data Table", exact: true });
	await invoices.waitFor();
	await assertRailsAcrossSorts(invoices, "Invoice", "Amount", "start");
	await assertRailsAcrossSorts(invoices, "Amount", "Invoice", "end");
	await assertStandaloneMarkupParity(page, invoices, "Amount", "end");

	await page.goto(`${baseUrl}/ui/table`);
	await page.locator('[data-status="ready"]').waitFor();
	const ledger = page.locator('[data-scenario="table-subscriptions"]');
	await ledger.scrollIntoViewIfNeeded();
	const ledgerTable = ledger.getByRole("table", { name: "Health plan ledger" });
	await assertRailsAcrossSorts(ledgerTable, "Health plan", "Monthly cost", "start");
	await assertRailsAcrossSorts(ledgerTable, "Monthly cost", "Health plan", "end");
	await assertStandaloneMarkupParity(page, ledgerTable, "Monthly cost", "end");
	await assertLedgerPanelInsets(page, ledgerTable);

	const spanDemo = page.locator('[data-scenario="table-selected-row"]');
	await spanDemo.scrollIntoViewIfNeeded();
	const spanTable = spanDemo.getByRole("table", { name: "Direct card with spanning cells" });
	const alpha = await textRail(spanTable.getByRole("cell", { name: "Alpha" }));
	const beta = await textRail(spanTable.getByRole("cell", { name: "Beta" }));
	assert.ok(Math.abs(alpha.start - beta.start) < 1, JSON.stringify({ alpha, beta }));
	const edge = await remPx(page, 1);
	const gutter = await remPx(page, 0.75);
	assert.equal((await inlinePad(spanTable.getByRole("cell", { name: "North" }))).start, edge);
	assert.equal((await inlinePad(spanTable.getByRole("cell", { name: "Beta" }))).start, gutter);
	const nested = spanDemo.getByRole("table", { name: "Nested inset" }).getByRole("cell");
	const nestedPad = await inlinePad(nested);
	assert.equal(nestedPad.start, gutter, JSON.stringify(nestedPad));
	assert.equal(nestedPad.end, gutter, JSON.stringify(nestedPad));

	return {
		rowHeight: 40,
		headerIcons: 12,
		widthsPreserved: true,
		scroll: true,
		selection: true,
		focusInset: true,
		rails: true,
		rtl: true,
		nested: true,
		span: true,
		standalone: true,
	};
}

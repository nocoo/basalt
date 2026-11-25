import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

async function settleOverlay(target: Locator) {
	await target.evaluate(async (node) => {
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
		await Promise.allSettled(
			node.getAnimations({ subtree: true }).map((animation) => animation.finished),
		);
	});
}

async function assertFormDialogSpacing(
	page: Page,
	baseUrl: string,
	rootSize: number,
	options: { trap?: boolean } = {},
) {
	const compact = (8 * rootSize) / 16;
	const layout = (16 * rootSize) / 16;
	await page.goto(`${baseUrl}/forms`);
	await page.evaluate((size) => {
		document.documentElement.style.fontSize = `${size}px`;
	}, rootSize);
	await page.getByRole("form", { name: "Profile Form" }).waitFor();
	const formGaps = await page.evaluate(() => {
		const sections = Array.from(
			document.querySelectorAll<HTMLElement>("[data-showcase-page] > .grid > section"),
		);
		const sectionBounds = sections.map((section) => {
			const card = section.querySelector<HTMLElement>(":scope > [data-basalt-surface]");
			if (!card) throw new Error("Missing form LayerCard");
			return {
				top: section.getBoundingClientRect().top,
				bottom: section.getBoundingClientRect().bottom,
				cardBottom: card.getBoundingClientRect().bottom,
			};
		});
		const first = document.querySelector("#profile-first") as HTMLElement;
		const firstLabel = document.querySelector('label[for="profile-first"]') as HTMLElement;
		const email = document.querySelector("#profile-email") as HTMLElement;
		const emailLabel = document.querySelector('label[for="profile-email"]') as HTMLElement;
		const firstField = first.closest("[data-field]") as HTMLElement;
		const emailField = email.closest("[data-field]") as HTMLElement;
		const names = firstField.parentElement as HTMLElement;
		const island = document.querySelector("[data-doc-scroll]");
		return {
			sectionBounds,
			labelControl: Math.round(
				first.getBoundingClientRect().top - firstLabel.getBoundingClientRect().bottom,
			),
			emailLabelControl: Math.round(
				email.getBoundingClientRect().top - emailLabel.getBoundingClientRect().bottom,
			),
			group: Math.round(
				emailField.getBoundingClientRect().top - names.getBoundingClientRect().bottom,
			),
			overflow: island ? island.scrollWidth - island.clientWidth : 0,
		};
	});
	assert.equal(formGaps.sectionBounds.length, 5, JSON.stringify(formGaps.sectionBounds));
	for (const section of formGaps.sectionBounds) {
		assert.ok(section.cardBottom <= section.bottom + 1, JSON.stringify(section));
	}
	for (let index = 0; index < formGaps.sectionBounds.length; index += 1) {
		const current = formGaps.sectionBounds[index];
		if (!current) continue;
		const nextRow = formGaps.sectionBounds
			.slice(index + 1)
			.find((section) => section.top > current.top + 1);
		if (!nextRow) continue;
		const rowBottom = Math.max(
			...formGaps.sectionBounds
				.filter((section) => Math.abs(section.top - current.top) <= 1)
				.map((section) => section.cardBottom),
		);
		assert.ok(nextRow.top >= rowBottom - 1, JSON.stringify({ nextRow, rowBottom }));
	}
	assert.equal(formGaps.labelControl, compact);
	assert.equal(formGaps.emailLabelControl, compact);
	assert.equal(formGaps.group, layout);
	if (options.trap) assert.ok(formGaps.overflow <= 1, JSON.stringify(formGaps));
	await page.goto(`${baseUrl}/dialogs`);
	await page.evaluate((size) => {
		document.documentElement.style.fontSize = `${size}px`;
	}, rootSize);
	const trigger = page.getByRole("button", { name: "Open contribution" });
	const handle = options.trap ? await trigger.elementHandle() : null;
	await trigger.click();
	const contribution = page.getByRole("dialog");
	await contribution.waitFor();
	await settleOverlay(contribution);
	const dialogGaps = await contribution.evaluate((node) => {
		const title = node.querySelector("h2") as HTMLElement;
		const heading = title.parentElement as HTMLElement;
		const fields = node.querySelector("[data-dialog-fields]") as HTMLElement;
		const fieldNodes = Array.from(fields.children) as HTMLElement[];
		const footer = fields.nextElementSibling as HTMLElement;
		return {
			headerGap: Math.round(
				fields.getBoundingClientRect().top - heading.getBoundingClientRect().bottom,
			),
			fieldGap: Math.round(
				fieldNodes[1].getBoundingClientRect().top - fieldNodes[0].getBoundingClientRect().bottom,
			),
			footerGap: Math.round(
				footer.getBoundingClientRect().top - fields.getBoundingClientRect().bottom,
			),
			fieldPad: getComputedStyle(fieldNodes[0]).rowGap,
			overflow: node.scrollWidth - node.clientWidth,
			titleOverflow: title.scrollWidth - title.clientWidth,
			pageOverflow: document.documentElement.scrollWidth - innerWidth,
		};
	});
	assert.equal(dialogGaps.headerGap, layout);
	assert.equal(dialogGaps.fieldGap, layout);
	assert.equal(dialogGaps.footerGap, layout);
	assert.equal(dialogGaps.fieldPad, `${compact}px`);
	if (options.trap) {
		assert.ok(dialogGaps.overflow <= 1, JSON.stringify(dialogGaps));
		assert.ok(dialogGaps.titleOverflow <= 1, JSON.stringify(dialogGaps));
		assert.ok(dialogGaps.pageOverflow <= 1, JSON.stringify(dialogGaps));
		assert.equal(
			await contribution.evaluate((node) => node.contains(document.activeElement)),
			true,
		);
		for (let step = 0; step < 8; step += 1) {
			await page.keyboard.press("Tab");
			assert.equal(
				await contribution.evaluate((node) => node.contains(document.activeElement)),
				true,
				`tab ${step}`,
			);
		}
		assert.ok(handle);
		await page.keyboard.press("Escape");
		await contribution.waitFor({ state: "hidden" });
		await page.waitForFunction((node) => node === document.activeElement, handle);
		await page.getByRole("button", { name: "Open unit editor" }).click();
		const unit = page.getByRole("dialog");
		await unit.waitFor();
		await settleOverlay(unit);
		const unitOverflow = await unit.evaluate((node) => {
			const grid = node.querySelector("[data-dialog-fields] > .grid") as HTMLElement | null;
			const history = Array.from(node.querySelectorAll(".ms-auto.tabular-nums"), (amount) => {
				const row = amount.parentElement as HTMLElement;
				return row.scrollWidth - row.clientWidth;
			});
			return {
				client: node.clientWidth,
				overflow: node.scrollWidth - node.clientWidth,
				pageOverflow: document.documentElement.scrollWidth - innerWidth,
				gridClass: grid?.className ?? "",
				track: grid ? Number.parseFloat(getComputedStyle(grid).gridTemplateColumns) : 0,
				history,
			};
		});
		assert.ok(unitOverflow.overflow <= 1, JSON.stringify(unitOverflow));
		assert.ok(unitOverflow.pageOverflow <= 1, JSON.stringify(unitOverflow));
		assert.match(unitOverflow.gridClass, /\bgrid-cols-1\b/);
		assert.ok(
			unitOverflow.track > 0 && unitOverflow.track <= unitOverflow.client,
			JSON.stringify(unitOverflow),
		);
		assert.ok(
			unitOverflow.history.every((overflow) => overflow <= 1),
			JSON.stringify(unitOverflow),
		);
		await page.keyboard.press("Escape");
		await unit.waitFor({ state: "hidden" });
	}
}

export async function assertPageLayout(page: Page, baseUrl: string) {
	const cases: string[] = [];
	for (const width of [320, 390, 900, 1440]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const dark of [false, true]) {
			await page.goto(`${baseUrl}/ui/button`);
			await page.locator("[data-hero-scenario]").waitFor();
			await setShowcaseTheme(page, dark);
			await page.evaluate(() => document.fonts.ready);
			for (const rootSize of [16, 32]) {
				await page.evaluate((size) => {
					document.documentElement.style.fontSize = `${size}px`;
				}, rootSize);
				const geometry = await page.locator("[data-showcase-page]").evaluate((node) => {
					const island = node.closest("[data-doc-scroll]") as HTMLElement;
					const header = node.firstElementChild as HTMLElement;
					const title = header.querySelector("h1") as HTMLElement;
					const description = header.querySelector("p") as HTMLElement;
					const box = island.getBoundingClientRect();
					const style = getComputedStyle(island);
					return {
						insetX: Number.parseFloat(style.paddingLeft),
						insetY: Number.parseFloat(style.paddingTop),
						titleX: title.getBoundingClientRect().left - box.left,
						titleY: title.getBoundingClientRect().top - box.top + island.scrollTop,
						titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
						descriptionSize: Number.parseFloat(getComputedStyle(description).fontSize),
						descriptionLine: Number.parseFloat(getComputedStyle(description).lineHeight),
						textGap: description.getBoundingClientRect().top - title.getBoundingClientRect().bottom,
						pageGap: Number.parseFloat(getComputedStyle(node).rowGap),
						overflow: island.scrollWidth - island.clientWidth,
						background: getComputedStyle(header).backgroundImage,
						heading: header.tagName,
					};
				});
				const x = (width < 768 ? 1 : width < 1024 ? 1.5 : 2) * rootSize;
				const y = (width < 768 ? 1 : 1.5) * rootSize;
				assert.equal(geometry.insetX, x);
				assert.equal(geometry.insetY, y);
				assert.ok(Math.abs(geometry.titleX - x) <= 1, JSON.stringify(geometry));
				assert.ok(Math.abs(geometry.titleY - y) <= 1, JSON.stringify(geometry));
				assert.equal(geometry.titleSize, 1.5 * rootSize);
				assert.equal(geometry.descriptionSize, 0.875 * rootSize);
				assert.equal(geometry.descriptionLine, rootSize * 0.875 * 1.5);
				assert.ok(Math.abs(geometry.textGap - rootSize * 0.5) <= 1);
				assert.equal(geometry.pageGap, rootSize * 1.5);
				const sectionGaps = await page
					.locator("[data-showcase-page] article > *")
					.evaluateAll((nodes) =>
						nodes
							.slice(1)
							.map(
								(node, index) =>
									node.getBoundingClientRect().top - nodes[index].getBoundingClientRect().bottom,
							),
					);
				assert.ok(sectionGaps.length > 1, "documentation needs real sections to measure");
				assert.deepEqual(
					sectionGaps.map((gap) => Math.round(gap)),
					sectionGaps.map(() => rootSize * 1.5),
					"Document sections inside the article keep the shared page rhythm",
				);
				assert.ok(geometry.overflow <= 1, `${width}/${rootSize}: ${JSON.stringify(geometry)}`);
				assert.equal(geometry.background, "none");
				assert.equal(geometry.heading, "HEADER");
				assert.equal(await page.locator("[data-showcase-header]").count(), 0);
				const actions = await page
					.locator("[data-showcase-page] > header")
					.locator("a, button")
					.evaluateAll((nodes) =>
						nodes.map((node) => {
							const box = node.getBoundingClientRect();
							return { top: box.top, bottom: box.bottom, height: box.height };
						}),
					);
				assert.equal(actions.length, 3);
				for (const action of actions) {
					assert.equal(action.height, actions[0]?.height, "Page actions share their height");
				}
				assert.deepEqual(actions[1], actions[2], "Both copy actions share their vertical bounds");
				cases.push(`${width}/${dark ? "dark" : "light"}/${rootSize}`);
			}
			await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
			const action = page
				.locator("[data-hero-scenario]")
				.getByRole("button", { name: "Default", exact: true });
			assert.equal((await action.boundingBox())?.height, 34);
		}
	}
	await page.setViewportSize({ width: 1440, height: 1000 });
	const expandedRail = await page.evaluate(() => {
		const aside = document.querySelector("aside");
		if (!aside) return { logoX: -1, rowHeight: 0, rowPadding: "" };
		const box = aside.getBoundingClientRect();
		const logo = aside.querySelector('a[href="/"] img');
		const row = aside.querySelector<HTMLElement>("[data-sidebar-row]");
		return {
			logoX: logo ? Math.round(logo.getBoundingClientRect().left - box.left) : -1,
			rowHeight: row ? row.getBoundingClientRect().height : 0,
			rowPadding: row ? getComputedStyle(row).padding : "",
		};
	});
	assert.equal(expandedRail.rowHeight, 34, JSON.stringify(expandedRail));
	assert.equal(expandedRail.rowPadding, "6px 8px");
	assert.equal(expandedRail.logoX, 22);
	await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
	await page.waitForFunction(() => {
		const island = document.querySelector("[data-doc-scroll]");
		return island && island.getBoundingClientRect().left < 100;
	});
	assert.equal(
		await page.locator("[data-doc-scroll]").evaluate((n) => getComputedStyle(n).paddingLeft),
		"32px",
	);
	const collapsedRail = await page.evaluate(() => {
		const aside = document.querySelector("aside");
		if (!aside) return { logoX: -1, centers: [] as number[] };
		const box = aside.getBoundingClientRect();
		const logo = aside.querySelector('a[href="/"] img');
		return {
			logoX: logo ? Math.round(logo.getBoundingClientRect().left - box.left) : -1,
			centers: Array.from(aside.querySelectorAll("nav [data-sidebar-row] svg"), (icon) => {
				const rect = icon.getBoundingClientRect();
				return rect.x + rect.width / 2 - box.x;
			}),
		};
	});
	assert.equal(collapsedRail.logoX, expandedRail.logoX, JSON.stringify(collapsedRail));
	assert.ok(
		collapsedRail.centers.every((center) => Math.abs(center - 34) < 1),
		JSON.stringify(collapsedRail),
	);
	const standalone = await page.context().newPage();
	try {
		const markup = await page.locator("[data-showcase-page] > header").evaluate((n) => n.outerHTML);
		const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
		await standalone.setViewportSize({ width: 1440, height: 1000 });
		await standalone.setContent(`<style>${css}</style>${markup}`);
		assert.equal(
			await standalone.locator("h1").evaluate((n) => getComputedStyle(n).fontSize),
			"24px",
		);
	} finally {
		await standalone.close();
	}
	await page.setViewportSize({ width: 390, height: 1000 });
	await page.goto(`${baseUrl}/ui`);
	await page.locator("[data-catalog-card='table']").waitFor();
	await page.evaluate(() => document.fonts.ready);
	assert.ok(
		await page.locator("[data-doc-scroll]").evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
	);
	await page.goto(`${baseUrl}/ui/button/source`);
	await page.locator("[data-basalt-code]").waitFor();
	await page.evaluate(() => {
		document.documentElement.style.fontSize = "32px";
	});
	assert.ok(
		await page.locator("[data-doc-scroll]").evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
		"Long source paths wrap at 200% text size",
	);
	await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	for (const width of [390, 1440]) {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.setViewportSize({ width, height: 1000 });
		await page.goto(`${baseUrl}/dialogs`);
		const contribution = page.getByRole("button", { name: "Open contribution", exact: true });
		await contribution.waitFor();
		await contribution.focus();
		await page.keyboard.press("Enter");
		const dialog = page.getByRole("dialog", { name: "Log contribution" });
		await dialog.waitFor();
		await settleOverlay(dialog);
		assert.equal(
			await dialog.evaluate((node) => getComputedStyle(node).padding),
			width < 640 ? "16px" : "24px",
		);
		const spacing = await dialog.evaluate((node) => {
			const header = node.querySelector('[data-slot="dialog-header"]') ?? node.firstElementChild;
			const fieldsWrap = node.querySelector("[data-dialog-fields]");
			const fields = Array.from(fieldsWrap?.children ?? []) as HTMLElement[];
			const footer = node.querySelector('[data-slot="dialog-footer"]') as HTMLElement | null;
			return {
				headerGap:
					header && fieldsWrap
						? Math.round(
								fieldsWrap.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
							)
						: -1,
				fieldGap:
					fields[0] && fields[1]
						? Math.round(
								fields[1].getBoundingClientRect().top - fields[0].getBoundingClientRect().bottom,
							)
						: -1,
				footerGap:
					fields[1] && footer
						? Math.round(
								footer.getBoundingClientRect().top - fields[1].getBoundingClientRect().bottom,
							)
						: -1,
			};
		});
		assert.equal(spacing.headerGap, 16, JSON.stringify(spacing));
		assert.equal(spacing.fieldGap, 16, JSON.stringify(spacing));
		assert.equal(spacing.footerGap, 16, JSON.stringify(spacing));
		await page.keyboard.press("Escape");
		await dialog.waitFor({ state: "hidden" });
	}
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(`${baseUrl}/ui`);
	await page.locator("[data-catalog-card='table']").waitFor();
	await page.evaluate(() => document.fonts.ready);
	const gallery = await page.evaluate(() => {
		const card = document.querySelector("[data-catalog-card='table']") as HTMLElement | null;
		const preview = card?.querySelector("[data-gallery-preview]") as HTMLElement | null;
		const section = card?.closest("section");
		return {
			span: card?.dataset.gallerySpan,
			previewWidth: preview?.clientWidth ?? 0,
			previewPad: preview ? getComputedStyle(preview).padding : "",
			headers: section?.querySelectorAll("[data-slot='card-header']").length ?? 0,
			dataTableSpan: document
				.querySelector("[data-catalog-card='data-table']")
				?.getAttribute("data-gallery-span"),
			pagerSpan: document
				.querySelector("[data-catalog-card='table-pager']")
				?.getAttribute("data-gallery-span"),
		};
	});
	assert.equal(gallery.span, "full");
	assert.equal(gallery.dataTableSpan, "full");
	assert.equal(gallery.pagerSpan, "compact");
	assert.equal(gallery.previewPad, "8px");
	assert.equal(gallery.headers, 1);
	assert.ok(gallery.previewWidth >= 800, JSON.stringify(gallery));
	await assertFormDialogSpacing(page, baseUrl, 16);
	await page.setViewportSize({ width: 390, height: 1000 });
	await assertFormDialogSpacing(page, baseUrl, 32, { trap: true });
	await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	await assertNestedSurfaces(page, baseUrl);
	await assertTypefacePage(page, baseUrl);
	return { cases, compactActions: 34, standalone: true, collapsedRail: true };
}

function rgbLuminance(color: string): number {
	const match = /rgba?\(([^)]+)\)/.exec(color);
	if (!match?.[1]) throw new Error(`Expected rgb()/rgba() color, got ${color}`);
	const [r, g, b] = match[1].split(",").slice(0, 3).map(Number);
	const linear = [r, g, b].map((channel) => {
		const c = channel / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

async function assertNestedSurfaces(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 1440, height: 1000 });
	for (const dark of [false, true]) {
		await page.goto(`${baseUrl}/layout`);
		await page.getByRole("heading", { name: "Nested surfaces" }).waitFor();
		await setShowcaseTheme(page, dark);
		const layout = await page.evaluate(() => {
			const sectionByTitle = (title: string) => {
				const section = Array.from(document.querySelectorAll<HTMLElement>("section")).find(
					(node) => node.querySelector("h2")?.textContent?.trim() === title,
				);
				if (!section) throw new Error(`Missing section: ${title}`);
				return section;
			};
			const shell = document.querySelector<HTMLElement>("[data-basalt-shell]");
			const island = document.querySelector<HTMLElement>("[data-basalt-surface-root]");
			if (!shell || !island) throw new Error("Missing shell or ContentIsland");
			const stack = sectionByTitle("The stack");
			const l2Card = stack.querySelector<HTMLElement>(":scope > [data-basalt-surface]");
			const l2Header = l2Card?.querySelector<HTMLElement>(':scope > [data-slot="card-header"]');
			const l3Well = l2Card?.querySelector<HTMLElement>(':scope > [data-slot="card-well"]');
			const l3Plus = l3Well?.querySelector<HTMLElement>(":scope > [data-basalt-surface]");
			if (!l2Card || !l2Header || !l3Well || !l3Plus) throw new Error("Missing stack slots");

			const compare = sectionByTitle("Body vs Well");
			const compareCards = Array.from(
				compare.querySelectorAll<HTMLElement>(".grid > [data-basalt-surface]"),
			);
			const leftCard = compareCards[0];
			const rightCard = compareCards[1];
			const leftHeader = leftCard?.querySelector<HTMLElement>(':scope > [data-slot="card-header"]');
			const leftBody = leftCard?.querySelector<HTMLElement>(':scope > [data-slot="card-body"]');
			const rightHeader = rightCard?.querySelector<HTMLElement>(
				':scope > [data-slot="card-header"]',
			);
			const rightWell = rightCard?.querySelector<HTMLElement>(':scope > [data-slot="card-well"]');
			if (!leftCard || !rightCard || !leftHeader || !leftBody || !rightHeader || !rightWell) {
				throw new Error("Missing Body vs Well slots");
			}

			const dashboard = sectionByTitle("Dashboard Composition");
			const rows = Array.from(dashboard.querySelectorAll<HTMLElement>(".grid"));
			const row1Box = rows[0]?.getBoundingClientRect();
			const row2Box = rows[1]?.getBoundingClientRect();
			const row2Cards = Array.from(
				rows[1]?.querySelectorAll<HTMLElement>(":scope > [data-basalt-surface]") ?? [],
			);
			const mainCard = row2Cards[0];
			const sidebarCard = row2Cards[1];
			const mainHeader = mainCard?.querySelector<HTMLElement>(':scope > [data-slot="card-header"]');
			const mainWell = mainCard?.querySelector<HTMLElement>(':scope > [data-slot="card-well"]');
			const sidebarHeader = sidebarCard?.querySelector<HTMLElement>(
				':scope > [data-slot="card-header"]',
			);
			if (
				!row1Box ||
				!row2Box ||
				!mainCard ||
				!sidebarCard ||
				!mainHeader ||
				!mainWell ||
				!sidebarHeader
			) {
				throw new Error("Missing Dashboard Composition slots");
			}
			const leftCardBox = leftCard.getBoundingClientRect();
			const rightCardBox = rightCard.getBoundingClientRect();
			const leftBodyBox = leftBody.getBoundingClientRect();
			const rightWellBox = rightWell.getBoundingClientRect();
			const mainCardBox = mainCard.getBoundingClientRect();
			const sidebarCardBox = sidebarCard.getBoundingClientRect();
			return {
				l0Bg: getComputedStyle(shell).backgroundColor,
				l1Bg: getComputedStyle(island).backgroundColor,
				l2Bg: getComputedStyle(l2Card).backgroundColor,
				l3Bg: getComputedStyle(l3Well).backgroundColor,
				l2HeaderPadBottom: getComputedStyle(l2Header).paddingBottom,
				l3WellBorderTop: getComputedStyle(l3Well).borderTopWidth,
				l3PlusBg: getComputedStyle(l3Plus).backgroundColor,
				l3PlusShadow: getComputedStyle(l3Plus).boxShadow,
				compareTopDiff: Math.abs(leftCardBox.top - rightCardBox.top),
				compareBottomDiff: Math.abs(leftCardBox.bottom - rightCardBox.bottom),
				compareHeaderTopDiff: Math.abs(
					leftHeader.getBoundingClientRect().top - rightHeader.getBoundingClientRect().top,
				),
				compareBodyWellTopDiff: Math.abs(
					leftBodyBox.top +
						Number.parseFloat(getComputedStyle(leftBody).paddingTop) -
						rightWellBox.top,
				),
				compareWellBottomDiff: Math.abs(rightWellBox.bottom - rightCardBox.bottom),
				dashboardRowGap: row2Box.top - row1Box.bottom,
				dashboardHeaderTopDiff: Math.abs(
					mainHeader.getBoundingClientRect().top - sidebarHeader.getBoundingClientRect().top,
				),
				dashboardHeaderFontMatch:
					getComputedStyle(mainHeader).fontSize === getComputedStyle(sidebarHeader).fontSize,
				dashboardWellBottomDiff: Math.abs(
					mainWell.getBoundingClientRect().bottom - mainCardBox.bottom,
				),
				dashboardCardsBottomDiff: Math.abs(mainCardBox.bottom - sidebarCardBox.bottom),
			};
		});
		const l0Lum = rgbLuminance(layout.l0Bg);
		const l1Lum = rgbLuminance(layout.l1Bg);
		const l2Lum = rgbLuminance(layout.l2Bg);
		const l3Lum = rgbLuminance(layout.l3Bg);
		assert.ok(l0Lum < l1Lum && l1Lum < l2Lum, JSON.stringify({ dark, layout }));
		assert.ok(l3Lum < l2Lum, JSON.stringify({ dark, layout }));
		assert.equal(layout.l3Bg, layout.l1Bg, JSON.stringify({ dark, layout }));
		if (!dark) assert.equal(layout.l2Bg, "rgb(255, 255, 255)");
		assert.equal(layout.l2HeaderPadBottom, "12px");
		assert.equal(layout.l3WellBorderTop, "1px");
		assert.equal(layout.l3PlusBg, "rgba(0, 0, 0, 0)");
		assert.equal(layout.l3PlusShadow, "none");
		assert.ok(layout.compareTopDiff <= 1, JSON.stringify(layout));
		assert.ok(layout.compareBottomDiff <= 1, JSON.stringify(layout));
		assert.ok(layout.compareHeaderTopDiff <= 1, JSON.stringify(layout));
		assert.ok(layout.compareBodyWellTopDiff <= 1, JSON.stringify(layout));
		assert.ok(layout.compareWellBottomDiff <= 1, JSON.stringify(layout));
		assert.ok(Math.abs(layout.dashboardRowGap - 16) <= 1, JSON.stringify(layout));
		assert.ok(layout.dashboardHeaderTopDiff <= 1, JSON.stringify(layout));
		assert.equal(layout.dashboardHeaderFontMatch, true, JSON.stringify(layout));
		assert.ok(layout.dashboardWellBottomDiff <= 1, JSON.stringify(layout));
		assert.ok(layout.dashboardCardsBottomDiff <= 1, JSON.stringify(layout));

		await page.goto(`${baseUrl}/view/document-page`);
		await page.locator("#doc-footer").waitFor();
		await setShowcaseTheme(page, dark);
		const docFooter = await page.evaluate(() => {
			const footer = document.querySelector<HTMLElement>("#doc-footer");
			const card = footer?.closest<HTMLElement>("[data-basalt-surface]");
			if (!card || !footer) throw new Error("Missing document footer card geometry");
			const cardBox = card.getBoundingClientRect();
			const footerBox = footer.getBoundingClientRect();
			return {
				bottomDiff: Math.abs(footerBox.bottom - cardBox.bottom),
				widthDiff: Math.abs(footerBox.width - cardBox.width),
			};
		});
		assert.ok(docFooter.bottomDiff <= 1, JSON.stringify(docFooter));
		assert.ok(docFooter.widthDiff <= 2, JSON.stringify(docFooter));
	}
}

async function assertTypefacePage(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(`${baseUrl}/typeface`);
	await page.getByRole("heading", { level: 1, name: "Typeface" }).waitFor();
	await page.evaluate(() => document.fonts.ready);
	const report = await page.evaluate(() => {
		const island = document.querySelector<HTMLElement>("[data-doc-scroll]");
		const tiers = ["3xl", "xl", "lg", "base", "md", "sm", "xs"].map((id) => {
			const node = document.querySelector<HTMLElement>(`[data-typeface-tier="${id}"]`);
			if (!node) throw new Error(`Missing typeface tier specimen: ${id}`);
			return [id, getComputedStyle(node).fontSize] as const;
		});
		return {
			sizes: Object.fromEntries(tiers),
			pageOverflow: document.documentElement.scrollWidth - innerWidth,
			islandOverflow: island ? island.scrollWidth - island.clientWidth : 0,
		};
	});
	assert.deepEqual(report.sizes, {
		"3xl": "24px",
		xl: "18px",
		lg: "15px",
		base: "14px",
		md: "13px",
		sm: "12px",
		xs: "11px",
	});
	assert.ok(report.pageOverflow <= 1, JSON.stringify(report));
	assert.ok(report.islandOverflow <= 1, JSON.stringify(report));
}

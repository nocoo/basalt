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
		const first = document.querySelector("#profile-first") as HTMLElement;
		const firstLabel = document.querySelector('label[for="profile-first"]') as HTMLElement;
		const email = document.querySelector("#profile-email") as HTMLElement;
		const emailLabel = document.querySelector('label[for="profile-email"]') as HTMLElement;
		const firstField = first.closest("[data-field]") as HTMLElement;
		const emailField = email.closest("[data-field]") as HTMLElement;
		const names = firstField.parentElement as HTMLElement;
		const island = document.querySelector("[data-doc-scroll]");
		return {
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
				assert.equal(geometry.titleSize, 1.875 * rootSize);
				assert.equal(geometry.descriptionSize, rootSize);
				assert.equal(geometry.descriptionLine, rootSize * 1.5);
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
	assert.equal(expandedRail.rowHeight, 38, JSON.stringify(expandedRail));
	assert.equal(expandedRail.rowPadding, "8px");
	assert.equal(expandedRail.logoX, 20);
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
			"30px",
		);
	} finally {
		await standalone.close();
	}
	await page.setViewportSize({ width: 390, height: 1000 });
	await page.goto(`${baseUrl}/ui`);
	await page.locator("[data-catalog-card='diff-table']").waitFor();
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
		await page.goto(`${baseUrl}/interactions`);
		await page.locator("[data-interaction-card]").first().waitFor();
		for (const trigger of await page.locator("[data-interaction-card] > button").all()) {
			assert.equal(await trigger.evaluate((node) => getComputedStyle(node).padding), "12px 16px");
		}
		const feedback = page.getByRole("button", { name: /Send Feedback/ });
		await feedback.focus();
		await page.keyboard.press("Enter");
		const dialog = page.getByRole("dialog", { name: "Send Feedback" });
		await dialog.waitFor();
		await settleOverlay(dialog);
		assert.equal(
			await dialog.evaluate((node) => getComputedStyle(node).padding),
			width < 640 ? "16px" : "24px",
		);
		const spacing = await dialog.evaluate((node) => {
			const header = node.firstElementChild as HTMLElement;
			const form = node.querySelector("form") as HTMLElement;
			const fields = [
				form.querySelector("#feedback-name")?.parentElement,
				form.querySelector("#feedback-message")?.parentElement,
			];
			const footer = form.lastElementChild as HTMLElement;
			return {
				headerGap: form.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
				fieldGap:
					fields[0] && fields[1]
						? fields[1].getBoundingClientRect().top - fields[0].getBoundingClientRect().bottom
						: -1,
				footerGap:
					fields[1] && footer
						? Math.round(
								footer.getBoundingClientRect().top - fields[1].getBoundingClientRect().bottom,
							)
						: -1,
			};
		});
		assert.equal(spacing.headerGap, 16);
		assert.equal(spacing.fieldGap, 16);
		assert.equal(spacing.footerGap, 16, JSON.stringify(spacing));
		await page.keyboard.press("Escape");
		await dialog.waitFor({ state: "hidden" });
		// Pre-existing: this controlled demo has no DialogTrigger, so Escape restores BODY.
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
			diffSpan: document
				.querySelector("[data-catalog-card='diff-table']")
				?.getAttribute("data-gallery-span"),
			pagerSpan: document
				.querySelector("[data-catalog-card='table-pager']")
				?.getAttribute("data-gallery-span"),
		};
	});
	assert.equal(gallery.span, "full");
	assert.equal(gallery.dataTableSpan, "full");
	assert.equal(gallery.diffSpan, "full");
	assert.equal(gallery.pagerSpan, "compact");
	assert.equal(gallery.previewPad, "8px");
	assert.equal(gallery.headers, 1);
	assert.ok(gallery.previewWidth >= 800, JSON.stringify(gallery));
	await assertFormDialogSpacing(page, baseUrl, 16);
	await page.setViewportSize({ width: 390, height: 1000 });
	await assertFormDialogSpacing(page, baseUrl, 32, { trap: true });
	await page.evaluate(() => document.documentElement.style.removeProperty("font-size"));
	return { cases, compactActions: 34, standalone: true, collapsedRail: true };
}
